use core::traits::Into;
use starknet::ContractAddress;
// use array::ArrayTrait;

#[starknet::interface]
trait IEventTrait<T> {
    fn get_name(self: @T) -> felt252;
    fn get_balance_of_contract(self: @T //, _contract_address: ContractAddress
    ) -> u256;
    fn get_attendant(self: @T, attendant: ContractAddress) -> bool;
    fn get_ticket_price(self: @T) -> u256;
    fn get_allowance_per_address(self: @T, adrs: ContractAddress) -> u256;
    fn approve(ref self: T, spender: ContractAddress, amount: u256);
    fn transfer_balance_to_organizer(ref self: T);
    fn transfer(ref self: T, recipient: ContractAddress, amount: u256);
    fn transfer_from(
        ref self: T, sender: ContractAddress, recipient: ContractAddress, amount: u256
    ); // DEBUGGING
    fn transfer_from_user_to_contract(ref self: T, amount: u256);
    fn buy_ticket(ref self: T);
}

#[starknet::contract]
mod StarkPassEvent {
    // use super::MyIERC20Trait;
    // use super::MyIERC20TraitDispatcher;
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
        organizer: ContractAddress,
        ticket_price: u256,
        attendees: LegacyMap<ContractAddress, bool>
    }

    const ETH_ERC20: felt252 = 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7;

    #[constructor]
    fn constructor(ref self: ContractState, _organizer: ContractAddress, _ticket_price: u256) {
        self.organizer.write(_organizer); // TODO: add an admin function to change the organizer
        self
            .ticket_price
            .write(_ticket_price); // TODO add an admin function to change the ticket price
    }

    #[external(v0)]
    impl EventImpl of IEventTrait<ContractState> {
        // ##### GET FUNCTIONS #####

        // Get token name of ETH_ERC20
        fn get_name(self: @ContractState) -> felt252 {
            let contract_address: ContractAddress = ETH_ERC20.try_into().unwrap();
            IERC20Dispatcher { contract_address: contract_address }.name()
        }
        // Get balance of ETH_ERC20 for an account
        fn get_balance_of_contract(self: @ContractState) -> u256 {
            let contract_address: ContractAddress = ETH_ERC20.try_into().unwrap();
            IERC20Dispatcher {
                contract_address: contract_address
            }.balanceOf(get_contract_address())
        }

        fn get_attendant(self: @ContractState, attendant: ContractAddress) -> bool {
            self.attendees.read(attendant)
        }

        // add get ticket price
        fn get_ticket_price(self: @ContractState) -> u256 {
            self.ticket_price.read()
        }

        fn get_allowance_per_address(self: @ContractState, adrs: ContractAddress) -> u256 {
            let contract_address: ContractAddress = ETH_ERC20.try_into().unwrap();
            let owner = get_caller_address();
            let spender = get_contract_address();
            IERC20Dispatcher { contract_address: contract_address }.allowance(owner, spender)
        }

        // ##### ERC20 ACTIVE FUNCTIONS #####

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256, ) {
            let contract_address: ContractAddress = ETH_ERC20.try_into().unwrap();
            IERC20Dispatcher { contract_address: contract_address }.approve(spender, amount);
        // TODO: Emit an event here --> @Ilya
        }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            let contract_address: ContractAddress = ETH_ERC20.try_into().unwrap();
            IERC20Dispatcher { contract_address: contract_address }.transfer(recipient, amount);
        // TODO: Emit an event here --> @Ilya
        }

        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256
        ) {
            let contract_address: ContractAddress = ETH_ERC20.try_into().unwrap();
            IERC20Dispatcher {
                contract_address: contract_address
            }.transferFrom(sender, recipient, amount);
        }

        // show allowances

        fn transfer_from_user_to_contract(ref self: ContractState, amount: u256) {
            let contract_address: ContractAddress = ETH_ERC20.try_into().unwrap();
            let sender = get_caller_address();
            let recipient = get_contract_address();
            IERC20Dispatcher {
                contract_address: contract_address
            }.transferFrom(sender, recipient, amount);
        }

        fn transfer_balance_to_organizer(ref self: ContractState) {
            let organizer = self.organizer.read();
            assert(get_caller_address() == organizer, 'CALLER_IS_NOT_ORGANIZER');
            let amount = self.get_balance_of_contract();
            self.transfer(organizer, amount);
        // TODO: Emit an event here --> @Ilya
        }

        // ##### TICKET FUNCTIONS #####

        fn buy_ticket(ref self: ContractState) {
            let ticket_price = self.ticket_price.read();
            let spender = get_caller_address();
            // Approve eth erc20
            // Remember to pass 2 params. If there's a bug, change back to u128 transfer from user to contract
            self.approve(spender, ticket_price);
            // Transfer from user to contract
            self.transfer_from_user_to_contract(ticket_price);
        // create ticket
        // self.attendees.write(spender, true);
        }
    }
}
