use starknet::ContractAddress;
// use array::ArrayTrait;
use erc20::IERC20Dispatcher;
use erc20::IERC20DispatcherTrait;

#[starknet::interface]
trait MyIERC20Trait<T> {
    fn name(self: @T, _contract_address: ContractAddress) -> felt252;
// fn transfer(self: T, recipient: ContractAddress, amount: u256);
}

trait IEventTrait<T> {
    fn donate(ref self: T, amount: u128);
    fn get_balance(self: @T) -> u128;
}

#[starknet::contract]
mod StarkPassEvent {
    use super::MyIERC20Trait;
    use super::MyIERC20TraitDispatcher;
    use super::IEventTrait;
    use super::ContractAddress;
    use super::IERC20Dispatcher;
    use super::IERC20DispatcherTrait;


    #[storage]
    struct Storage {
        balance: u128, 
    // attendants: Array::<>
    }

    #[constructor]
    fn constructor(ref self: ContractState) {}

    // #[derive(Drop)]
    // struct EventAttendant {
    //     attendant: u256
    // }

    #[external(v0)]
    impl ERC20Impl of MyIERC20Trait<ContractState> {
        // Get token name of ETH_ERC20
        fn name(self: @ContractState, _contract_address: ContractAddress) -> felt252 {
            IERC20Dispatcher { contract_address: _contract_address }.name()
        }
    }

    #[external(v0)]
    impl EventImpl of IEventTrait<ContractState> {
        // Get balance
        fn get_balance(self: @ContractState) -> u128 {
            return self.balance.read();
        }

        // Donate
        fn donate(ref self: ContractState, amount: u128) {
            self.balance.write(self.balance.read() + amount);
        }
    }
}
