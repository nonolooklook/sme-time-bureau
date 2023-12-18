import { parseUnits } from 'viem'
import { displayBalance } from '@/utils/display'
import { privilegeExpectPrice } from '@/config/privilege'

export const getBidOrderMinPrice = (order: any) => {
  const minP = order?.entry?.parameters?.offer?.[0]?.startAmount
  const count = parseUnits(order?.entry?.parameters?.consideration?.[0]?.startAmount, 0)
  return Number(displayBalance(BigInt(minP) / count).replace(',', ''))
}

export const getBidOrderMaxPrice = (order: any) => {
  const maxP = order?.entry?.parameters?.offer?.[0]?.endAmount
  const count = parseUnits(order?.entry?.parameters?.consideration?.[0]?.startAmount, 0)
  return Number(displayBalance(BigInt(maxP) / count).replace(',', ''))
}

export const getListOrderMinPrice = (order: any) => {
  const minP = order?.entry?.parameters?.consideration?.[0]?.startAmount
  const count = parseUnits(order?.entry?.parameters?.offer?.[0]?.startAmount, 0)
  return Number(displayBalance(BigInt(minP) / count).replace(',', ''))
}

export const getListOrderMaxPrice = (order: any) => {
  const maxP = order?.entry?.parameters?.consideration?.[0]?.endAmount
  const count = parseUnits(order?.entry?.parameters?.offer?.[0]?.startAmount, 0)
  return Number(displayBalance(BigInt(maxP) / count).replace(',', ''))
}

const getFraction = (num: number, den: number, value: bigint): bigint => {
  return (BigInt(num) * value) / BigInt(den)
}

export const getOrderMinMaxBigint = (order: any) => {
  const num = order?.numerator || 1
  const den = order?.denominator || 1
  const ops: any[] = order.parameters.offer[0]?.itemType == 1 ? order?.parameters.offer : order?.parameters.consideration
  let min = 0n,
    max = 0n
  ops.forEach((op) => {
    min += BigInt(op.startAmount)
    max += BigInt(op.endAmount)
  })
  return [getFraction(num, den, min), getFraction(num, den, max)]
}

export const getOrderMinMax = (order: any) => {
  return getOrderMinMaxBigint(order).map(displayBalance)
}

export const getOrderPerMinMaxBigint = (order: any) => {
  const ops: any[] = order.parameters.offer[0]?.itemType == 1 ? order?.parameters.offer : order?.parameters.consideration
  let min = 0n,
    max = 0n
  ops.forEach((op) => {
    min += BigInt(op.startAmount)
    max += BigInt(op.endAmount)
  })
  const nft = order.parameters.offer[0]?.itemType == 1 ? order?.parameters.consideration[0] : order?.parameters.offer[0]
  const count = BigInt(nft.startAmount)
  return [min / count, max / count]
}

export const getOrderPerMinMax = (order: any) => {
  return getOrderPerMinMaxBigint(order).map(displayBalance)
}

export function getExpectPrice(min: bigint, max: bigint) {
  return (min + max) / 2n
}

export function getOrderEPbigint(order: any) {
  const [min, max] = getOrderPerMinMaxBigint(order)
  if (isPrivilegeOrder(order)) return privilegeExpectPrice
  return getExpectPrice(min, max)
}

export function getOrderEP(order: any) {
  return displayBalance(getOrderEPbigint(order))
}

export const memoPrivilege = {
  privilegeOfferer: '',
}

export function isPrivilegeOrder(order: any) {
  const [min, max] = getOrderPerMinMaxBigint(order)
  return (order.type == '3' && min !== max) || (min !== max && order.parameters.offerer == memoPrivilege.privilegeOfferer)
}
