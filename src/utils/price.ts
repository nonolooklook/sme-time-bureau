import { parseEther, parseUnits } from 'viem'

export const calculateMidPrice = (min: string, max: string) => {
  return parseUnits(min as `${number}`, 0) / 2n + parseUnits(max as `${number}`, 0) / 2n
}
