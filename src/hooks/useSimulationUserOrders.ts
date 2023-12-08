import useSWR from 'swr'

const fetcher = async ({ url, isBid, address }: any) => {
  let res = await fetch(`https://sme-demo.mcglobal.ai/mock-order?type=${isBid ? 1 : 2}&offerer=${address}`)
  return await res.json()
}

export const useSimulationUserOrders = (isBid: boolean, address: string) => {
  const url = `/mock-orders/user?type=${isBid ? 1 : 2}`
  const { data, mutate, error, isLoading } = useSWR({ url, isBid: isBid, address: address }, fetcher)

  return {
    orders: data?.data,
    mutate,
    isLoading,
  }
}