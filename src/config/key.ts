import { arbitrum, arbitrumGoerli, sepolia } from 'viem/chains'

export const CONDUIT_KEY = {
  [sepolia.id]: '0xFE18Aa1EFa652660F36Ab84F122CD36108f903B6aaaaaaaaaaaaaaaaaaaaaaaa',
  [arbitrum.id]: '0xFE18Aa1EFa652660F36Ab84F122CD36108f903B6aaaaaaaaaaaaaaaaaaaaaaaa',
  [arbitrumGoerli.id]: '0xFE18Aa1EFa652660F36Ab84F122CD36108f903B6aaaaaaaaaaaaaaaaaaaaaaaa',
}

export const CONDUIT_KEYS_TO_CONDUIT = {
  [CONDUIT_KEY[arbitrumGoerli.id]]: '0x8D82cc4A3dCd2036C7fa691B7F919050E18cE1B6',
  // [CONDUIT_KEY[arbitrum.id]]: '0x63b7B0846f06BF4DA9a80598af41EA1f83881900',
}

export const FEE_ADDRESS = '0xb888488186C59A5Bb905cb883f15fC802eF3D588'
