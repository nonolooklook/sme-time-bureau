import { genURL } from '@/config/api'
import useSWR from 'swr'

const fetcher = async ({ url, isBid }: any) => {
  let res = await fetch(genURL(`/mock-order?type=${isBid ? 1 : 2}`))
  return await res.json()
}

export const useSimulationOrders = (isBid: boolean): { orders: any[]; mutate: any; isLoading: boolean } => {
  const url = `/mock-orders?type=${isBid ? 1 : 2}`
  const { data, mutate, error, isLoading } = useSWR({ url, isBid: isBid }, fetcher)

  let orders = data?.data
  if (!orders) return { orders: [], mutate, isLoading }

  return {
    orders: isBid ? orders : [...orders]?.reverse(),
    mutate,
    isLoading,
  }
}
