use starknet::ContractAddress;
use StarkPassEvent::Attendee;

#[starknet::interface]
trait IEventTrait<TContractState> {
    fn get_name(self: @TContractState) -> felt252;
    fn get_balance_of_contract(self: @TContractState) -> u256;
    fn get_attendee(self: @TContractState, attendee_address: ContractAddress) -> Attendee;
    fn get_ticket_price(self: @TContractState) -> u256;
    fn change_organizer(ref self: TContractState, new_owner: ContractAddress);
    fn transfer_balance_to_organizer(ref self: TContractState);
    fn buy_ticket(ref self: TContractState);
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
        attendees: LegacyMap<ContractAddress, Attendee>
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
        _event_id: felt252
    ) {
        assert(_ticket_price >= 0, 'Negative ticket price');
        assert(_staking_factor >= 0 && _staking_factor <= 1, 'Staking must be >= 0 and <= 1');
        self.ticket_price.write(_ticket_price);
        self.organizer.write(_organizer);
        self.event_id.write(_event_id);
    }

    // Public methods
    #[external(v0)]
    impl EventImpl of IEventTrait<ContractState> {
        // ##### GET FUNCTIONS #####

        // Get token name of ETH_ERC20
        fn get_name(self: @ContractState) -> felt252 {
            self.create_erc20_dispatcher().name()
        }

        // Get balance of ETH_ERC20 for the contract
        fn get_balance_of_contract(self: @ContractState) -> u256 {
            self.create_erc20_dispatcher().balanceOf(get_contract_address())
        }

        fn get_attendee(self: @ContractState, attendee_address: ContractAddress) -> Attendee {
            self.attendees.read(attendee_address)
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
            // TODO: this will change if/when tickets become tokens and 1 attendee can own multiple tickets
            assert(
                self.attendees.read(attendee_address).has_ticket == false,
                'Attendee already has ticket'
            );

            // Pay in ERC20 if the ticket price is positive i.e., if the event isn't free
            if ticket_price > 0 {
                self.transfer_from(attendee_address, get_contract_address(), ticket_price);
            }

            // Add staking_factor
            let staking_amount = self.staking_factor.read() * ticket_price;

            // Create a  ticket
            self
                .create_ticket(
                    attendee_address: attendee_address,
                    has_ticket: true,
                    checked_in: false,
                    stake: staking_amount
                );
        }

        fn send_tip(ref self: ContractState, tip: u256) {
            let sender = get_caller_address();
            self.transfer_from(get_caller_address(), get_contract_address(), tip);
        }
    }

    // TODO: add ability for organizer to redistribute a share of ticket sales to users who staked

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
            self.attendees.write(attendee_address, Attendee { has_ticket, checked_in, stake });

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
