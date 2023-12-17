import { arbitrum, arbitrumSepolia, sepolia } from 'viem/chains'

export const CONDUIT_KEY = {
  [sepolia.id]: '0xFE18Aa1EFa652660F36Ab84F122CD36108f903B6aaaaaaaaaaaaaaaaaaaaaaaa',
  [arbitrum.id]: '0xFE18Aa1EFa652660F36Ab84F122CD36108f903B6aaaaaaaaaaaaaaaaaaaaaaaa',
  [arbitrumSepolia.id]: '0xFE18Aa1EFa652660F36Ab84F122CD36108f903B6aaaaaaaaaaaaaaaaaaaaaaaa',
}

export const CONDUIT_KEYS_TO_CONDUIT = {
  [CONDUIT_KEY[arbitrumSepolia.id]]: '0x8D82cc4A3dCd2036C7fa691B7F919050E18cE1B6',
  [CONDUIT_KEY[arbitrum.id]]: '0x8D82cc4A3dCd2036C7fa691B7F919050E18cE1B6',
}

export const FEE_ADDRESS = '0xB888488186c59A5bB905cb883f15FC802eF3D588'

export const SME_GAS_MANAGER = {
  [arbitrumSepolia.id]: '0xC2CB6F8570365aa4760fB40127973bf524dbBB3A',
}
