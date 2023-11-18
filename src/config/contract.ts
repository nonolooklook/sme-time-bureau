// export const NFTContractAddress = '0x560B65205dEA9E14bB169c91650915503c41928C'
// export const NFTContractAddress = '0x6E6267A4D7196Cf98c8094723772c755eb4dC108'
import { arbitrum } from 'viem/chains'

export const NFTContractAddress = { [arbitrum.id]: '0xdD0BC7f52aE221fB488B9a965C0E2Df948749Daf' }

export const TokenId = 1n

export const getCurrentChainId = () => {
  return arbitrum.id
}
