import { parseUnits } from 'viem'
import { displayBalance } from '@/utils/display'

export const getBidOrderMinPrice = (order: any) => {
  const minP = order?.entry?.parameters?.offer?.[0]?.startAmount
  const count = parseUnits(order?.entry?.parameters?.consideration?.[0]?.startAmount, 0)
  return Number(displayBalance(parseUnits(minP, 0) / count).replace(',', ''))
}

export const getBidOrderMaxPrice = (order: any) => {
  const maxP = order?.entry?.parameters?.offer?.[0]?.endAmount
  const count = parseUnits(order?.entry?.parameters?.consideration?.[0]?.startAmount, 0)
  return Number(displayBalance(parseUnits(maxP, 0) / count).replace(',', ''))
}

export const getListOrderMinPrice = (order: any) => {
  const minP = order?.entry?.parameters?.consideration?.[0]?.startAmount
  const count = parseUnits(order?.entry?.parameters?.offer?.[0]?.startAmount, 0)
  return Number(displayBalance(parseUnits(minP, 0) / count).replace(',', ''))
}

export const getListOrderMaxPrice = (order: any) => {
  const maxP = order?.entry?.parameters?.consideration?.[0]?.endAmount
  const count = parseUnits(order?.entry?.parameters?.offer?.[0]?.startAmount, 0)
  return Number(displayBalance(parseUnits(maxP, 0) / count).replace(',', ''))
}
