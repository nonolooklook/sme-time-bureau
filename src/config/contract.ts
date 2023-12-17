import { arbitrum, sepolia,arbitrumSepolia  } from 'viem/chains'

export const NFTContractAddress = {
  [arbitrumSepolia.id]: '0xBCACAFEdBe097EDeFF396de5328f683481E051E5',
  [arbitrum.id]: '0xdD0BC7f52aE221fB488B9a965C0E2Df948749Daf',
  [sepolia.id]: '0xD3Be6f86846B1949aA32F0c655fDd7D8c14feAdE',
}

export const TokenId = 1n

// export const isProd = process.env.
export const getCurrentChainId = () => {
  return arbitrumSepolia.id
}

export const getCurrentExploerUrl = () => {
  const chainId = getCurrentChainId()
  let url = ''
  // @ts-ignore
  if (chainId == arbitrum.id) {
    url = arbitrum.blockExplorers.default.url
  }
  if (chainId == arbitrumSepolia.id) {
    url = "https://sepolia.arbiscan.io"
  }

  return url.endsWith('/') ? url.slice(0, url.length - 1) : url
}
