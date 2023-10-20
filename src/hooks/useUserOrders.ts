import useSWR from 'swr'

const fetcher = async ({ url, isBid, address }: any) => {
  let res = await fetch(`https://sme-demo.mcglobal.ai/order?type=${isBid ? 2 : 1}&offerer=${address}`)
  return await res.json()
}
export const useUserOrders = (isBid: boolean, address: string) => {
  const url = `/orders/user?type=${isBid ? 2 : 1}`
  const { data, mutate, error, isLoading } = useSWR({ url, isBid: isBid, address: address }, fetcher)

  return {
    orders: data?.data,
    mutate,
    isLoading,
  }
}
