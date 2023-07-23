

function Event(
    contractId, txId, description, date, title, link, price, id, attending
) {
    this.contractId = contractId;
    this.transactionId = txId;
    this.description = description;
    this.date = date;
    this.title = title;
    this.link = link;
    this.price = price;
    this.id = id;
    this.attending = attending;
}

const starknetEvents = [
    new Event(
        '0x03ac40e59f0e43b41c949462a676a178a2da6f29dca342117c43b275759c64ed',
        null,
        "Mark your calendar for the week following ETHCC & StarknetCC as we present the next Starknet London meet-up, proudly hosted by Argent and Nethermind ​​🇬🇧",
        'July 26, 2023 ',
        "Starknet London Meetup #6: Unveiling StarknetCC Highlights",
        'https://www.meetup.com/starknet-london/events/294803596/',
        '0.2 ETH',
        'starknet-event-1',
        false,

    ),
    new Event(
        '0x04ea3d803c5e8eb1d4ed60cbf9ddce8d927bad1277fb9066c5c046f74cc5a029',
        null,
        "Join the ETHGlobal Hackathon in Paris! Bring your laptop and let&apos;s code!",
        'July 21-23, 2023 ',
        "ETHGlobal Paris",
        'https://ethglobal.com/events/paris2023',
        '0.5 ETH',
        'starknet-event-2',
        false
    ),
    new Event(
        '0x062a091ecedc5b557883c6e199b136f715315c71d63a0774c0b99bc16326540d',
        null,
        "Join us on a summer evening for the first Starknet workshop in Amsterdam! ZK-rollups like Starknet create huge amounts of data as they grow. Enter Apibara, an open-source web3 platform to stream and combine on-chain data.",
        'July 6, 2023 ',
        "Data Analytics on Starknet with Apibara: StarknetNL Workshop #1",
        'https://www.meetup.com/starknet-amsterdam/events/294390075/',
        '0.1 ETH',
        'starknet-event-3',
        false,
    ),
]

export { starknetEvents };
