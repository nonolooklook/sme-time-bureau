import useSWR from 'swr'

const fetcher = async ({ url }: any) => {
  let res = await fetch(`https://sme-demo.mcglobal.ai/order/initial/quantity`)
  return await res.json()
}

export const useQuantity = (): { total: number; used: number; remaining: number; mutate: any; isLoading: boolean } => {
  const { data, mutate, error, isLoading } = useSWR('/quantity', fetcher)

  return {
    total: data?.data?.totalQuantity,
    used: data?.data?.usedQuantity,
    remaining: data?.data?.remainingQuantity,
    mutate,
    isLoading,
  }
}
