import { genURL } from '@/config/api'
import useSWR from 'swr'

const fetcher = async ({ url, isBid }: any) => {
  let res = await fetch(genURL(`/order?type=${isBid ? 1 : 2}`))
  return await res.json()
}

export const useOrders = (isBid: boolean): { orders: any[]; mutate: any; isLoading: boolean } => {
  const url = `/orders?type=${isBid ? 1 : 2}`
  const { data, mutate, error, isLoading } = useSWR({ url, isBid: isBid }, fetcher)

  let orders = data?.data
  if (!orders) return { orders: [], mutate, isLoading }

  return {
    orders: isBid ? orders : [...orders]?.reverse(),
    mutate,
    isLoading,
  }
}
