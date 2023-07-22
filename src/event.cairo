use starknet::ContractAddress;
// use array::ArrayTrait;

#[starknet::interface]
trait MyIERC20Trait<T> {
    fn get_name(self: @T, _contract_address: ContractAddress) -> felt252;
    fn get_balance_of(
        self: @T, account: ContractAddress, _contract_address: ContractAddress
    ) -> u256;
    fn approve(self: T, spender: ContractAddress, amount: u256, _contract_address: ContractAddress);
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
    use erc20::IERC20Dispatcher;
    use erc20::IERC20DispatcherTrait;


    #[storage]
    struct Storage {
        balance: u128, 
    // erc20_eth: IERC20Dispatcher
    }

    #[constructor]
    fn constructor(
        ref self: ContractState, _contract_address: ContractAddress
    ) { // self.erc20_eth = IERC20Dispatcher { contract_address: _contract_address };
    }

    #[derive(Drop)]
    struct EventAttendant {
        attendant: ContractAddress,
        ticket: u128
    }


    #[external(v0)]
    impl ERC20Impl of MyIERC20Trait<ContractState> {
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
