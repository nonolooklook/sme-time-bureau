import { genURL } from '@/config/api'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

const fetcher = async (key: string) => {
  let res = await fetch(genURL(`/${key}`))
  return await res.json()
}

export const useHistory = (): { history: any[]; mutate: any; isLoading: boolean } => {
  const { address } = useAccount()
  const { data, mutate, error, isLoading } = useSWR(address ? `fill-order/trade/${address}` : null, fetcher)
  return {
    history: (data?.data as any) || [],
    mutate,
    isLoading,
  }
}
