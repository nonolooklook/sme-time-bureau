import * as chains from 'viem/chains'

export const CONDUIT_KEY = {
  // @ts-ignore
  [chains[process.env.NEXT_PUBLIC_NETWORK].id]: process.env.NEXT_PUBLIC_CONDUIT_KEY as string,
}

export const CONDUIT_KEYS_TO_CONDUIT = {
  // @ts-ignore
  [CONDUIT_KEY[chains[process.env.NEXT_PUBLIC_NETWORK].id]]: process.env.NEXT_PUBLIC_CONDUIT as string,
}

export const FEE_ADDRESS: string = process.env.NEXT_PUBLIC_FEE_ADDRESS as any

export const SME_GAS_MANAGER = {
  // @ts-ignore
  [chains[process.env.NEXT_PUBLIC_NETWORK].id]: process.env.NEXT_PUBLIC_SME_GAS_MANAGER as string,
}
