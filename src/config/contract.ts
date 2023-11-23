import { arbitrum, sepolia } from 'viem/chains'

export const NFTContractAddress = {
  [arbitrum.id]: '0xdD0BC7f52aE221fB488B9a965C0E2Df948749Daf',
  [sepolia.id]: '0xD3Be6f86846B1949aA32F0c655fDd7D8c14feAdE',
}

export const TokenId = 1n

export const getCurrentChainId = () => {
  return sepolia.id
}
