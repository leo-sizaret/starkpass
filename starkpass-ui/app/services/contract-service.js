import { Provider, Contract } from 'starknet'
import { abi } from '../abi/contractAbi';

import { getConnectedWallet } from './wallet-service';

export const buyTicket = async (
  contractAddress,
) => {
    const starknet = await getConnectedWallet();
    if (!starknet.isConnected) throw Error("starknet wallet not connected");

    const eventContract = new Contract(
        abi,
        contractAddress,
        starknet.account,
    );
    
    const res = await eventContract.mock_buy_ticket();

    console.log('buy transaction: ', res.transaction_hash)
    return tx.transaction_hash;
}

export const getEvents = async () => {
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    // Get all created events stored in a factory contract
    const factoryContractAddress = 'TBA'
    if (!starknet.isConnected) {
        throw Error("starknet wallet not connected")
    }

    // const factoryContract = new Contract(factoryContractAbi, factoryContractAddress, provider);
    // const createdEvents = factoryContract.get_events()
    const createdEvents = ['0x0788229687a4db6916f2ced01c3514c53281257ab4d45515dd700f2042cf370b', '0x05e59d617a88c10b2994fd27ccac700339f816f05715944935ec744085c69abc']

    const getEventInfo = async eventContractAddress => {
        const eventContract = new Contract(abi, eventContractAddress, provider);
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
}