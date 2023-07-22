import { encode } from "starknet"

export const formatAddress = address =>
  encode.addHexPrefix(encode.removeHexPrefix(address).padStart(64, "0"))

export const truncateAddress = address => {
  return truncateHex(formatAddress(address))
}

export const truncateHex = value => {
  const hex = value.slice(0, 2)
  const start = value.slice(2, 6)
  const end = value.slice(-4)
  return `${hex}${start}…${end}`
}