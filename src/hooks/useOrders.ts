import useSWR from 'swr'

const fetcher = async ({ url, isBid }: any) => {
  let res = await fetch(`https://sme-demo.mcglobal.ai/order?type=${isBid ? 2 : 1}`)
  return await res.json()
}

export const useOrders = (isBid: boolean): { orders: any[]; mutate: any; isLoading: boolean } => {
  const url = `/orders?type=${isBid ? 2 : 1}`
  const { data, mutate, error, isLoading } = useSWR({ url, isBid: isBid }, fetcher)

  return {
    orders: data?.data,
    mutate,
    isLoading,
  }
}
