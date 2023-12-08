import useSWR from 'swr'

const fetcher = async ({ url, isBid, address }: any) => {
  let res = await fetch(`https://sme-demo.mcglobal.ai/user-account/balanceOf/${address}`)
  return await res.json()
}

export const useSimulationUserBalance = (address: string | undefined) => {
  const url = `/user-account/balanceOf/${address}`
  const { data, mutate, error, isLoading } = useSWR(address ? { url, address: address } : null, fetcher)

  return {
    balance: data?.data?.balance ?? 0,
    quantity: data?.data?.quantity ?? 0,
    mutate,
    isLoading,
  }
}
