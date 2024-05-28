import * as chains from 'viem/chains'

export const NFTContractAddress = {
  //@ts-ignore
  [chains[process.env.NEXT_PUBLIC_NETWORK].id]: process.env.NEXT_PUBLIC_NFT as string,
}
//@ts-ignore
export const TokenId = BigInt(process.env.NEXT_PUBLIC_NFT_ID)

// export const isProd = process.env.
export const getCurrentChainId = () => {
  // @ts-ignore
  return chains[process.env.NEXT_PUBLIC_NETWORK].id
}

export const getCurrentExploerUrl = () => {
  // @ts-ignore
  let url = chains[process.env.NEXT_PUBLIC_NETWORK].blockExplorers.default.url
  return url.endsWith('/') ? url.slice(0, url.length - 1) : url
}
