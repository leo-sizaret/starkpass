

function Event(
    contactId, description, date, title, link, price, id
) {
    this.contactId = contactId;
    this.description = description;
    this.date = date;
    this.title = title;
    this.link = link;
    this.price = price;
    this.id = id;
}

const starknetEvents = [
    new Event(
        '0x000',
        "Mark your calendar for the week following ETHCC & StarknetCC as we present the next Starknet London meet-up, proudly hosted by Argent and Nethermind ​​🇬🇧",
        'July 26, 2023 ',
        "Starknet London Meetup #6: Unveiling StarknetCC Highlights",
        'https://www.meetup.com/starknet-london/events/294803596/',
        '0.2 ETH',
        '1',
    ),
    new Event(
        '0x001',
        "Join the ETHGlobal Hackathon in Paris! Bring your laptop and let&apos;s code!",
        'July 21-23, 2023 ',
        "ETHGlobal Paris",
        'https://ethglobal.com/events/paris2023',
        '0.5 ETH',
        '2',
    ),
    new Event(
        '0x002',
        "Join us on a summer evening for the first Starknet workshop in Amsterdam! ZK-rollups like Starknet create huge amounts of data as they grow. Enter Apibara, an open-source web3 platform to stream and combine on-chain data.",
        'July 6, 2023 ',
        "Data Analytics on Starknet with Apibara: StarknetNL Workshop #1",
        'https://www.meetup.com/starknet-amsterdam/events/294390075/',
        '0.1 ETH',
        '3',
    ),
]

export { starknetEvents };
