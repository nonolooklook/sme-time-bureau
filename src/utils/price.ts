import { parseEther, parseUnits } from 'viem'

export const calculateMidPrice = (min: string, max: string) => {
  const hmin = !!min ? min : '0'
  const hmax = !!max ? max : '0'
  return BigInt(hmin) / 2n + BigInt(hmax) / 2n
}

export const calculateMidPriceFromBigInt = (min: bigint, max: bigint) => {
  return min / 2n + max / 2n
}
