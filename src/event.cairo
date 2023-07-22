use core::traits::Into;
use starknet::ContractAddress;

#[starknet::interface]
trait IEventTrait<T> {
    fn get_name(self: @T) -> felt252;
    fn get_balance_of_contract(self: @T) -> u256;
    fn get_attendant(self: @T, attendant: ContractAddress) -> bool;
    fn get_ticket_price(self: @T) -> u256;
    fn transfer_balance_to_organizer(ref self: T);
    fn mock_buy_ticket(ref self: T);
    fn buy_ticket(ref self: T);
}

#[starknet::contract]
mod StarkPassEvent {
    use super::IEventTrait;
    use super::ContractAddress;
    use erc20::IERC20Dispatcher;
    use erc20::IERC20DispatcherTrait;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use starknet::contract_address::contract_address_const;
    use traits::TryInto;
    use option::OptionTrait;

    #[storage]
    struct Storage {
        event_id: felt252,
        organizer: ContractAddress,
        ticket_price: u256,
        attendees: LegacyMap<ContractAddress, bool>
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        #[key]
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    }

    const ETH_ERC20: felt252 = 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7;

    // Remember to pass 2 params for u256
    #[constructor]
    fn constructor(
        ref self: ContractState,
        _organizer: ContractAddress,
        _ticket_price: u256,
        _event_id: felt252
    ) {
        self.organizer.write(_organizer);
        self.ticket_price.write(_ticket_price);
        self.event_id.write(_event_id);
    }

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

        fn get_attendant(self: @ContractState, attendant: ContractAddress) -> bool {
            self.attendees.read(attendant)
        }

        fn get_ticket_price(self: @ContractState) -> u256 {
            self.ticket_price.read()
        }

        // ##### ERC20 ACTIVE FUNCTIONS #####

        fn transfer_balance_to_organizer(ref self: ContractState) {
            let organizer = self.organizer.read();
            assert(get_caller_address() == organizer, 'CALLER_IS_NOT_ORGANIZER');
            let amount = self.get_balance_of_contract();
            self.transfer(organizer, amount);
        }

        fn mock_buy_ticket(ref self: ContractState) {
            let sender = get_caller_address();
            self.attendees.write(sender, true);
        }

        fn buy_ticket(ref self: ContractState) {
            let ticket_price = self.ticket_price.read();
            let sender = get_caller_address();

            self.create_erc20_dispatcher().transferFrom(
                get_caller_address(),
                get_contract_address(),
                ticket_price
            );
            self.attendees.write(sender, true);
        }
    }


    #[generate_trait]
    impl PrivateTraitImpl of PrivateTrait {
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
            self.emit(Event::Transfer(
                Transfer { sender: sender, recipient: recipient, amount: amount }
            ));
        }
    }
}
