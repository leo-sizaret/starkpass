use starknet::ContractAddress;
// use array::ArrayTrait;

#[starknet::interface]
trait IEventTrait<T> {
    fn get_name(self: @T) -> felt252;
    fn get_balance_of_contract(self: @T //, _contract_address: ContractAddress
    ) -> u256;
    fn approve(ref self: T, spender: ContractAddress, amount: u256);
    fn transfer_balance_to_organizer(ref self: T);
    fn transfer(ref self: T, recipient: ContractAddress, amount: u256);
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
        attendees: LegacyMap<ContractAddress, u128>
    }

    const ETH_ERC20: felt252 = 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7;

    #[constructor]
    fn constructor(ref self: ContractState, organizer: ContractAddress) {
        self.organizer.write(organizer); // TODO: add an admin function to change the organizer
    }

    #[external(v0)]
    impl EventImpl of IEventTrait<ContractState> {
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
        fn transfer_balance_to_organizer(ref self: ContractState) {
            let organizer = self.organizer.read();
            assert(get_caller_address() == organizer, 'CALLER_IS_NOT_ORGANIZER');
            let amount = self.get_balance_of_contract();
            self.transfer(organizer, amount);
        // TODO: Emit an event here --> @Ilya
        }
    }
}
