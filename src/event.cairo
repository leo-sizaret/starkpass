use starknet::ContractAddress;
use StarkPassEvent::Attendee;

#[starknet::interface]
trait IEventTrait<TContractState> {
    fn get_balance_of_contract(self: @TContractState) -> u256;
    fn get_attendee(self: @TContractState, attendee_address: ContractAddress) -> Attendee;
    fn get_ticket_price(self: @TContractState) -> u256;
    fn change_organizer(ref self: TContractState, new_owner: ContractAddress);
    fn transfer_balance_to_organizer(ref self: TContractState);
    fn buy_ticket(ref self: TContractState);
    fn redistribute_stake(ref self: TContractState);
    // fn check_into_event(ref self: TContractState, attendee_address: ContractAddress);
    fn send_tip(ref self: TContractState, tip: u256);
}

#[starknet::contract]
mod StarkPassEvent {
    use super::IEventTrait;
    use erc20::IERC20Dispatcher;
    use erc20::IERC20DispatcherTrait;
    use super::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use core::traits::Into;
    use traits::TryInto;
    use option::OptionTrait;

    // #### STORAGE ####
    #[storage]
    struct Storage {
        event_id: felt252,
        organizer: ContractAddress,
        ticket_price: u256,
        staking_factor: u256,
        total_stake: u256,
        staked_amount_is_redistributed_after_check_in: bool,
        address_to_attendee: LegacyMap<ContractAddress, Attendee>,
        attendees_num_to_address: LegacyMap<u256, ContractAddress>,
        num_attendees: u256
    }

    // #### EVENTS ####
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        OwnershipTransfer: OwnershipTransfer,
        CreateTicket: CreateTicket
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        #[key]
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransfer {
        #[key]
        prev_owner: ContractAddress,
        #[key]
        new_owner: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct CreateTicket {
        #[key]
        ticket_recipient: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct CheckIntoEvent {
        #[key]
        attendee: ContractAddress,
        event: ContractAddress
    }

    // #### STRUCTS ####    
    #[derive(Drop, storage_access::StorageAccess, Serde)]
    struct Attendee {
        has_ticket: bool,
        checked_in: bool,
        stake: u256
    }

    // #### CONSTANTS ####
    const ETH_ERC20: felt252 = 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7;

    // Remember to pass 2 params for u256
    #[constructor]
    fn constructor(
        ref self: ContractState,
        _organizer: ContractAddress,
        _ticket_price: u256,
        _staking_factor: u256,
        _staked_amount_is_redistributed_after_check_in: bool,
        _event_id: felt252
    ) {
        assert(_ticket_price >= 0, 'Negative ticket price');
        assert(_staking_factor >= 0 && _staking_factor <= 1, 'Staking must be >= 0 and <= 1');
        self
            .staked_amount_is_redistributed_after_check_in
            .write(_staked_amount_is_redistributed_after_check_in);
        self.ticket_price.write(_ticket_price);
        self.organizer.write(_organizer);
        self.event_id.write(_event_id);
    }

    // Public methods
    #[external(v0)]
    impl EventImpl of IEventTrait<ContractState> {
        // Get token name of ETH_ERC20

        // Get balance of ETH_ERC20 for the contract
        fn get_balance_of_contract(self: @ContractState) -> u256 {
            self.create_erc20_dispatcher().balanceOf(get_contract_address())
        }

        fn get_attendee(self: @ContractState, attendee_address: ContractAddress) -> Attendee {
            self.address_to_attendee.read(attendee_address)
        }

        fn get_ticket_price(self: @ContractState) -> u256 {
            self.ticket_price.read()
        }

        fn change_organizer(ref self: ContractState, new_owner: ContractAddress) {
            // Only the current organizer can assign a new organizer
            self.only_owner();

            // Change the owner
            self.organizer.write(new_owner);

            // Emit OwnershipTransfer event
            self
                .emit(
                    Event::OwnershipTransfer(
                        OwnershipTransfer {
                            prev_owner: self.organizer.read(), new_owner: new_owner
                        }
                    )
                );
        }

        fn transfer_balance_to_organizer(ref self: ContractState) {
            // Only the current owner can withdraw the contract balance
            self.only_owner();
            let organizer = self.organizer.read();
            let amount = self.get_balance_of_contract();

            // Withdraw the contract's balance to the organizer's address
            self.transfer(organizer, amount);
        }

        fn buy_ticket(ref self: ContractState) {
            let attendee_address = get_caller_address();
            let ticket_price = self.ticket_price.read();
            let staking_factor = self.staking_factor.read();

            // Check that the attendee hasn't already purchased a ticket
            assert(
                self.address_to_attendee.read(attendee_address).has_ticket == false,
                'Attendee already has ticket'
            );

            // Pay in ERC20 if the ticket price is positive i.e., if the event isn't free
            if ticket_price > 0 {
                self.transfer_from(attendee_address, get_contract_address(), ticket_price);
            }

            // Increase the total amount staked
            let staking_amount = self.staking_factor.read() * ticket_price;
            self.total_stake.write(self.total_stake.read() + staking_amount);

            // Create a  ticket and record the amount staked
            self
                .create_ticket(
                    attendee_address: attendee_address,
                    has_ticket: true,
                    checked_in: false,
                    stake: staking_amount
                );

            // Increase the coun of attendees
            let current_attendee_num = self.num_attendees.read();
            self.attendees_num_to_address.write(current_attendee_num, attendee_address);
            self.num_attendees.write(current_attendee_num + 1);
        }

        fn redistribute_stake(ref self: ContractState) {
            let sender = get_contract_address();
            assert(
                self.address_to_attendee.read(sender).has_ticket == true, 'Attendee has no ticket'
            );
            assert(
                self.address_to_attendee.read(sender).checked_in == true, 'Attendee not checked in'
            );

            let mut i: u256 = 0;

            loop {
                // Check breaking conditions for the loop
                if (i > self.num_attendees.read() - 1) || (self.total_stake.read() <= 0) {
                    break;
                }

                // Stop transfer if there's not enough stake
                let attendee_address = self.attendees_num_to_address.read(i);
                let attendee_stake = self.address_to_attendee.read(attendee_address).stake;
                if (self.total_stake.read() - attendee_stake < 0) {
                    break;
                }

                // Transfer stake back
                self
                    .address_to_attendee
                    .write(sender, Attendee { has_ticket: true, checked_in: true, stake: 0 });
                self.total_stake.write(self.total_stake.read() - attendee_stake);
                self.transfer_from(sender, attendee_address, attendee_stake);
                // Increment counter
                i += 1;
            }
        }

        // TODO: add a mechanism to control who can unstake (e.g., only owner can call this function, or users can call this function after timestamp T where T is set by the owner)
        // fn check_into_event(ref self: ContractState, attendee_address: ContractAddress) {
        //     let Attendee{has_ticket, checked_in, stake } = self
        //         .address_to_attendee
        //         .read(attendee_address);

        //     // Check in the attendee
        //     self
        //         .address_to_attendee
        //         .write(attendee_address, Attendee { has_ticket, checked_in: true, stake: 0 });

        //     // Redistribute stake if staked_amount_is_redistributed_after_check_in == true
        //     if self.staked_amount_is_redistributed_after_check_in.read() {
        //         self.transfer_from(get_contract_address(), attendee_address, stake);
        //     }
        // }

        fn send_tip(ref self: ContractState, tip: u256) {
            let sender = get_caller_address();
            self.transfer_from(get_caller_address(), get_contract_address(), tip);
        }
    }

    // Private methods
    #[generate_trait]
    impl PrivateTraitImpl of PrivateTrait {
        fn create_ticket(
            ref self: ContractState,
            attendee_address: ContractAddress,
            has_ticket: bool,
            checked_in: bool,
            stake: u256
        ) {
            // Create a ticket
            self
                .address_to_attendee
                .write(attendee_address, Attendee { has_ticket, checked_in, stake });

            // Emit CreateTicket event to signal the purchase of a ticket
            self.emit(Event::CreateTicket(CreateTicket { ticket_recipient: attendee_address }))
        }

        fn create_erc20_dispatcher(self: @ContractState) -> IERC20Dispatcher {
            let contract_address: ContractAddress = ETH_ERC20.try_into().unwrap();
            IERC20Dispatcher { contract_address: contract_address }
        }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self.transfer_from(get_caller_address(), recipient, amount);
        }

        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256
        ) {
            self.create_erc20_dispatcher().transferFrom(sender, recipient, amount);
            self
                .emit(
                    Event::Transfer(
                        Transfer { sender: sender, recipient: recipient, amount: amount }
                    )
                );
        }

        fn only_owner(self: @ContractState) {
            let current_owner = self.organizer.read();
            assert(get_caller_address() == current_owner, 'Caller is not owner');
        }
    }
}
