import { genURL } from '@/config/api'
import { memoPrivilege } from '@/utils/order'
import { useEffect } from 'react'
import useSWR from 'swr'

const fetcher = async ({ url }: any) => {
  let res = await fetch(genURL(`/order/initial/owner`))
  return await res.json()
}

export const useOfficialAddress = (): { officialAddress: string; mutate: any; isLoading: boolean } => {
  const { data, mutate, error, isLoading } = useSWR('/official_address', fetcher)
  useEffect(() => {
    if (data?.data) memoPrivilege.privilegeOfferer = data?.data
  })
  return {
    officialAddress: data?.data,
    mutate,
    isLoading,
  }
}
