import { genURL } from '@/config/api'
import useSWR from 'swr'

const fetcher = async ({ url }: any) => {
  let res = await fetch(genURL(`/order/orderDistribution?precision=0.1&pointSize=25`))
  return await res.json()
}
export const useOrderDistribution = (): {
  orders: { listExpectationList: any[]; bidExpectationList: any[]; maxPrice: number; minPrice: number }
  mutate: any
  isLoading: any
} => {
  const url = `/order/orderDistribution`
  const { data, mutate, error, isLoading } = useSWR({ url }, fetcher)

  return {
    orders: data?.data,
    mutate,
    isLoading,
  }
}
