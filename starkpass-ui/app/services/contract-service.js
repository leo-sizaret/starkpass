import { getStarknet } from '@argent/get-starknet'
import { Provider, Contract, Account, constants } from 'starknet'

import { abi } from '../abi/contractAbi';


export const buyTicket = async (
  accountAddress,
) => {
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    const contractAddress = '0x02973ae12f33c976ddcc7703e64abe0f7eaaae499910950359d441f0d8cb5cec'
    const privateKey0 = '';
    const account0 = new Account(provider, accountAddress, privateKey0);

    if (!starknet.isConnected) {
        throw Error("starknet wallet not connected")
    }

    const ourContract = new Contract(abi, contractAddress, provider);
    ourContract.connect(account0);
    
    const call = ourContract.populate("mock_buy_ticket");
    const res = await ourContract.mock_buy_ticket();
    const tx = await provider.waitForTransaction(res.transaction_hash);

    console.log('buy transaction: ', tx)
    return tx
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