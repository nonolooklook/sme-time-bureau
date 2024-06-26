import { genURL } from '@/config/api'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

const fetcher = async ({ url, address }: any) => {
  let res = await fetch(genURL(`/order/balanceOf/${address}`))
  return await res.json()
}

export const useAvailableAmount = (): { availableAmount: number; mutate: any; isLoading: boolean } => {
  const { address } = useAccount()
  const { data, mutate, error, isLoading } = useSWR(address ? { url: '/available_amount', address: address } : null, fetcher)

  return {
    availableAmount: data?.data ?? 0,
    mutate,
    isLoading,
  }
}
