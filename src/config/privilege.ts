import { parseEther } from 'viem'

export type OrderRange = {
  min: number
  max: number
  a: number // alpha
  b: number // beta
}

export const privilegeOrderRange: OrderRange[] = [
  { min: 0, max: 20, a: 2, b: 3 },
  { min: 90, max: 110, a: 3, b: 3 },
  { min: 990, max: 1010, a: 3, b: 3 },
]

export const privilegeExpectPrice = parseEther('8.19')
