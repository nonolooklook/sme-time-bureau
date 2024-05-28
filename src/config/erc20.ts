import * as chains from 'viem/chains'

export const ERC20_ADDRESS = {
    //@ts-ignore
  [chains[process.env.NEXT_PUBLIC_NETWORK].id]: process.env.NEXT_PUBLIC_ERC20 as string,
}
