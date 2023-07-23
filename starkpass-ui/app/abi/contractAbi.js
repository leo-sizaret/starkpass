export const abi = [
  {
    "name": "get_name",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "type": "core::felt252"
      }
    ],
    "state_mutability": "view"
  },
  {
    "name": "get_balance_of_contract",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "type": "core::integer::u256"
      }
    ],
    "state_mutability": "view"
  },
  {
    "name": "get_attendant",
    "type": "function",
    "inputs": [
      {
        "name": "attendant",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ],
    "outputs": [
      {
        "type": "core::bool"
      }
    ],
    "state_mutability": "view"
  },
  {
    "name": "get_ticket_price",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "type": "core::integer::u256"
      }
    ],
    "state_mutability": "view"
  },
  {
    "name": "approve",
    "type": "function",
    "inputs": [
      {
        "name": "sender",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "amount",
        "type": "core::integer::u256"
      }
    ],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "name": "transfer_balance_to_organizer",
    "type": "function",
    "inputs": [],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "name": "mock_buy_ticket",
    "type": "function",
    "inputs": [],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "name": "buy_ticket",
    "type": "function",
    "inputs": [],
    "outputs": [],
    "state_mutability": "external"
  }
]