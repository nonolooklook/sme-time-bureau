import useSWR from 'swr'

const fetcher = async ({ url }: any) => {
  let res = await fetch(`https://sme-demo.mcglobal.ai/order/initial/owner`)
  return await res.json()
}

export const useOfficialAddress = (): { officialAddress: string; mutate: any; isLoading: boolean } => {
  const { data, mutate, error, isLoading } = useSWR('/official_address', fetcher)

  return {
    officialAddress: data?.data,
    mutate,
    isLoading,
  }
}
