import * as chians from 'viem/chains'

export const SEAPORT_ADDRESS = {
  //@ts-ignore
  [chians[process.env.NEXT_PUBLIC_NETWORK].id]: process.env.NEXT_PUBLIC_SEAPORT_ADDRESS as string,
}
