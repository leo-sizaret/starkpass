import { getStarknet } from '@argent/get-starknet'
import { Provider, Contract, constants } from 'starknet'

import sierraProgram from '../abi/starkpass.json'

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

    console.log(sierraProgram)

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