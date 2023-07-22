import { getStarknet } from '@argent/get-starknet'
import { Provider, Contract, constants } from 'starknet'

import sierraProgram from '../abi/starkpass.json'

export const buyTicket = async (
  accountAddress,
) => {
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    const contractAddress = '0x00495882dfebc3fc2411661f1dad74c4d604f91e112ba902e13f7f1ebe2ba3f8'

    const { abi: testAbi } = await provider.getClassAt(contractAddress);
    console.log(testAbi)
    // const starknet = getStarknet()
    if (!starknet.isConnected) {
        throw Error("starknet wallet not connected")
    }

    console.log(sierraProgram)

    const ourContract = new Contract(testAbi, contractAddress, provider);

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