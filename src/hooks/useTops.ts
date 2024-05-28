import { genURL } from '@/config/api'
import useSWR from 'swr'

const fetcher = async ({ url }: any) => {
  let res = await fetch(genURL(`/transaction/topWinnings`))
  return await res.json()
}

export const useTops = (): { tops: any[]; mutate: any; isLoading: boolean } => {
  const { data, mutate, error, isLoading } = useSWR('/tops', fetcher)

  return {
    tops: data?.data,
    mutate,
    isLoading,
  }
}
