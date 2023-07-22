import { getStarknet } from '@argent/get-starknet'
import { Provider, Contract, constants } from 'starknet'


export const buyTicket = async (
  accountAddress,
) => {
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    const contractAddress = '0x02f8dae6191b2c6584d772019a901feed6f1bcd86f3cc437781c145284c761c8'

    const { abi: contractAbi } = await provider.getClassAt(contractAddress);
    console.log(contractAbi)
    // const starknet = getStarknet()
    if (!starknet.isConnected) {
        throw Error("starknet wallet not connected")
    }

    const ourContract = new Contract(contractAbi, contractAddress, provider);

    console.log(ourContract)

    // TBD
    // return ourContract.buyTicket(
    //     contractAddress,
    //     parseInputAmountToUint256(transferAmount),
    // )
    const balance = await ourContract.get_balance()
    console.log('AAAAAAAAAA ======')
    console.log(balance)
    return balance
}

export const getEvents = async () => {
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    // Get all created events stored in a factory contract
    const factoryContractAddress = 'TBA'

    // const { abi: factoryContractAbi } = await provider.getClassAt(factoryContractAddress);
    // const starknet = getStarknet()
    if (!starknet.isConnected) {
        throw Error("starknet wallet not connected")
    }

    // const factoryContract = new Contract(factoryContractAbi, factoryContractAddress, provider);
    // const createdEvents = factoryContract.get_events()
    const createdEvents = ['0x0788229687a4db6916f2ced01c3514c53281257ab4d45515dd700f2042cf370b', '0x05e59d617a88c10b2994fd27ccac700339f816f05715944935ec744085c69abc']

    const getEventInfo = async eventContractAddress => {
        const { abi: eventAbi } = await provider.getClassAt(eventContractAddress);
        const eventContract = new Contract(eventAbi, eventContractAddress, provider);
        const name = await eventContract.get_name()
        return {
            name,
            description: 'some',
            date: 'tba',
            price: '0.000001', // TODO format as Ether
        }
    };

    const eventPromises = [];
    (createdEvents || []).forEach(eventContractAddress => {
        eventPromises.push(getEventInfo(eventContractAddress))
    });

    await Promise.all(eventPromises).then(events => console.log(events)).catch(err => { throw Error(err) });

    // TBD
    // return ourContract.buyTicket(
    //     contractAddress,
    //     parseInputAmountToUint256(transferAmount),
    // )
    const balance = await ourContract.get_balance()
    console.log('AAAAAAAAAA ======')
    console.log(balance)
    return balance
}