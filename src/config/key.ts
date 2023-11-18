import { arbitrum, arbitrumGoerli } from 'viem/chains'

export const CONDUIT_KEY = {
  [arbitrum.id]: '0xFE18Aa1EFa652660F36Ab84F122CD36108f903B6aaaaaaaaaaaaaaaaaaaaaaaa',
  [arbitrumGoerli.id]: '0xd445b75f9b129e90d8eca89df86fe8a27b805460aaaaaaaaaaaaaaaaaaaaaaaa',
}

export const CONDUIT_KEYS_TO_CONDUIT = {
  [CONDUIT_KEY[arbitrumGoerli.id]]: '0xdbD024e0c6b9141A156E215D15A72B88538baA83',
  [CONDUIT_KEY[arbitrum.id]]: '0x63b7B0846f06BF4DA9a80598af41EA1f83881900',
}
