use starknet::ContractAddress;
// use array::ArrayTrait;

#[starknet::interface]
trait MyIERC20Trait<T> {
    fn get_name(self: @T, _contract_address: ContractAddress) -> felt252;
    fn get_balance_of(
        self: @T, account: ContractAddress, _contract_address: ContractAddress
    ) -> u256;
    fn approve(self: T, spender: ContractAddress, amount: u256, _contract_address: ContractAddress);
    fn withdraw_balance(ref self: T);
    // fn transfer(self: T, recipient: ContractAddress, amount: u256);
}

#[starknet::contract]
mod StarkPassEvent {
    use super::MyIERC20Trait;
    use super::MyIERC20TraitDispatcher;
    use super::IEventTrait;
    use super::ContractAddress;
    use erc20::IERC20Dispatcher;
    use erc20::IERC20DispatcherTrait;

    // TODO: Define constant for the Etherium erc20

    #[storage]
    struct Storage {
        organizer: ContractAddress,
        attendees: LegacyMap<ContractAddress, EventAttendant>
    }

    #[derive(Drop)]
    struct EventAttendant {
        attendant: ContractAddress,
        ticket: u128
    }

    #[constructor]
    fn constructor(ref self: ContractState, organizer: ContractAddress) {
        self.organizer.write(organizer);
    }

    #[external(v0)]
    impl EventImpl of IEventTrait<ContractState> {
        // Get token name of ETH_ERC20
        fn get_name(self: @ContractState, _contract_address: ContractAddress) -> felt252 {
            IERC20Dispatcher { contract_address: _contract_address }.name()
        }
        // Get balance of ETH_ERC20 for an account
        fn get_balance_of(
            self: @ContractState, account: ContractAddress, _contract_address: ContractAddress
        ) -> u256 {
            IERC20Dispatcher { contract_address: _contract_address }.balanceOf(account)
        }

        fn approve(
            self: ContractState,
            spender: ContractAddress,
            amount: u256,
            _contract_address: ContractAddress
        ) {
            IERC20Dispatcher { contract_address: _contract_address }.approve(spender, amount);
            // TODO: Emit an event here --> @Ilya
        }

        fn withdraw_balance(ref self: T) {
            let recepient = self.organizer.read();
            // TODO: Send eth to the recepient from the current address
        }
    }
}
