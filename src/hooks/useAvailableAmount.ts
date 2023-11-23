import useSWR from 'swr'
import { useAccount } from 'wagmi'

const fetcher = async ({ url, address }: any) => {
  let res = await fetch(`https://sme-demo.mcglobal.ai/order/balanceOf/${address}`)
  return await res.json()
}

export const useAvailableAmount = (): { availableAmount: number; mutate: any; isLoading: boolean } => {
  const { address } = useAccount()
  const { data, mutate, error, isLoading } = useSWR({ url: '/available_amount', address: address }, fetcher)

  return {
    availableAmount: data?.data,
    mutate,
    isLoading,
  }
}
