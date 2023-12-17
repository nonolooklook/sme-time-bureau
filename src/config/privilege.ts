import { parseEther } from "viem"

export const privilegeOrderRange: [number, number][] = [
  [0, 20],
  [90, 110],
  [990, 1010],
]

export const privilegeExpectPrice = parseEther('20') * BigInt(5000) / BigInt(9989) 