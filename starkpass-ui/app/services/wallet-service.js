import { connect } from "@argent/get-starknet"
import { constants, shortString } from "starknet"

let windowStarknet = null;

export const getConnectedWallet = async () => {
  return windowStarknet;
}

export const connectWallet = async () => {
  windowStarknet = await connect({
    include: ["argentX"],
  })
  await windowStarknet.enable({ starknetVersion: "v4" })
  return windowStarknet
}

export const walletAddress = async () => {
  const starknet = windowStarknet
  if (!starknet || !starknet.isConnected) {
    return
  }
  return starknet.selectedAddress
}

export const networkId = () => {
  const starknet = windowStarknet
  if (!starknet || !starknet.isConnected) {
    return
  }
  try {
    const { chainId } = starknet.provider
    if (chainId === constants.StarknetChainId.MAINNET) {
      return "mainnet-alpha"
    } else if (chainId === constants.StarknetChainId.TESTNET) {
      return "goerli-alpha"
    } else {
      return "localhost"
    }
  } catch {}
}

export const getExplorerBaseUrl = () => {
  const network = networkId()
  if (network === "mainnet-alpha") {
    return "https://voyager.online"
  } else if (network === "goerli-alpha") {
    return "https://goerli.voyager.online"
  }
}

export const chainId = () => {
  const starknet = windowStarknet
  if (!starknet || !starknet.isConnected) {
    return
  }
  try {
    return shortString.decodeShortString(starknet.provider.chainId)
  } catch {}
}

export const signMessage = async (message) => {
  const starknet = windowStarknet
  if (!starknet || !starknet.isConnected) throw Error("starknet wallet not connected")
  if (!shortString.isShortString(message)) {
    throw Error("message must be a short string")
  }

  return starknet.account.signMessage({
    domain: {
      name: "Starkpass",
      chainId: networkId() === "mainnet-alpha" ? "SN_MAIN" : "SN_GOERLI",
      version: "0.0.1",
    },
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "chainId", type: "felt" },
        { name: "version", type: "felt" },
      ],
      Message: [{ name: "message", type: "felt" }],
    },
    primaryType: "Message",
    message: {
      message,
    },
  })
}

export const waitForTransaction = async (hash) => {
  const starknet = windowStarknet
  if (!starknet || !starknet.isConnected) {
    return
  }
  return starknet.provider.waitForTransaction(hash)
}

export const addWalletChangeListener = async handleEvent => {
  const starknet = windowStarknet
  if (!starknet || !starknet.isConnected) {
    return
  }
  starknet.on("accountsChanged", handleEvent)
}

export const removeWalletChangeListener = async handleEvent => {
  const starknet = windowStarknet
  if (!starknet || !starknet.isConnected) {
    return
  }
  starknet.off("accountsChanged", handleEvent)
}

export const declare = async (contract, classHash) => {
  const starknet = windowStarknet
  if (!starknet || !starknet.isConnected) {
    throw Error("starknet wallet not connected")
  }

  return starknet.account.declare({
    contract,
    classHash,
  })
}