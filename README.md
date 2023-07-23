# 👨‍🚀 StarkPass

![StarkPass](./starkpass-ui/public/main.png)

StarkPass brings Starknet IRL by letting you buy tickets for your favourite events directly on-chain, using Starknet L2, Argent and Sismo. 

### For users

Starknet makes buying event tickets cheap, convenient and verifiable.
- ✅ Pay for the ticket that you want, not the high gas fees
- ✅ Register for global events without worrying about incompatible international banking systems
- ✅ On-chain and privacy-preserving evidence of your ticket via Sismo
- ✅ Support event organizers by leaving tips

### For organizers

Create an on-chain ticketing system for your events.
- ⭐ Deploy a "ticket contract" for your new event
- ⭐ Withdraw revenue from ticket sales to your wallet
- ⭐ Define "ticket logic" to receive donations, ask users to lock up a stake, redistribute stake after the event

## 🔨 How was it made?

The project revolves around Starknet and the new Cairo 1.0 contracts. This creates and manages the "ticket contracts" that are defined by the event organizer and let customers buy event tickets. 

The dApp interface was built with Next.js and integrates Argent X. We also use Sismo Connect's Zero-Knowledge Proofs to provide provable purchase confirmations that preserve user privacy. This setup lets us offer a secure, private, and efficient ticketing system.

## ⚙️ Technologies

The combination of Cairo contracts deployed on Starknet, Argent X, and Sismo's ZK proofs resulted in a system that is cost-effective, secure, and flexible.

To tie this together, we use JavaScript (Node.js) for the backend and the Web3.js library for interacting with Starknet (starknet.js and @argent/get-starknet) and Sismo (@sismo-core libraries).

## 👷 Build

To build the front-end part of the project, please follow the instructions described [here](/starkpass-ui/README.md).

The back-end part is basically all on-chain, represented as cairo contracts for Starknet. To build the main contract you should have [`starkli`](https://github.com/xJonathanLEI/starkli) and [`scarb`](https://github.com/software-mansion/scarb) CLI tools. After the setup you can follow these instructions:

```sh
scarb build
```

```sh
starkli declare ./target/dev/contracts_StarkPassEvent.sierra.json --network=goerli-1 --compiler-version=2.0.1
```

```sh
starkli deploy <CLASS_HASH> <EVENT_ORGANIZER> <TICKET_PRICE_PART1_u128> <TICKET_PRICE_PART2_u128> <EVENT_NAME> --network=goerli-1
```

## LICENSE

[MIT](https://opensource.org/license/mit/)
