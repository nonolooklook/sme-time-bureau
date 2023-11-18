import { arbitrum, sepolia } from 'viem/chains'

export const NFTContractAddress = {
  [arbitrum.id]: '0xdD0BC7f52aE221fB488B9a965C0E2Df948749Daf',
  [sepolia.id]: '0x9757d65C985F3bbB010d8Cba739e0eA2E14a8393',
}

export const TokenId = 1n

export const getCurrentChainId = () => {
  return sepolia.id
}
