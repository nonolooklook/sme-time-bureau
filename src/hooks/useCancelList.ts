import { genURL } from '@/config/api'
import { getCurrentChainId } from '@/config/contract'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { Seaport } from '@opensea/seaport-js'
import { useCallback, useState } from 'react'
import { useAccount } from 'wagmi'

export const useCancelList = (order: any, onSuccess?: any) => {
  const { address } = useAccount()
  const [isCancelLoading, setIsCancelLoading] = useState(false)
  const signer = useEthersSigner()

  const cancelList = useCallback(
    async (hash: string) => {
      try {
        console.log(hash)
        setIsCancelLoading(true)
        if (!signer || !address || !order) return
        const seaport = new Seaport(signer, { overrides: { contractAddress: SEAPORT_ADDRESS[getCurrentChainId()] } })
        console.log(seaport)
        console.log(order)
        const { transact } = seaport.cancelOrders([order?.entry?.parameters], address)
        const res = await transact()
        await res.wait()
        setTimeout(() => onSuccess?.(), 3000)
      } catch (e) {
        console.error(e)
      }
      setIsCancelLoading(false)

      fetch(genURL('/order/') + order?.hash, {
        method: 'DELETE',
      })
        .then((r) => r.json())
        .then((res) => {
          setIsCancelLoading(false)
          // window.location.reload()
        })
        .catch((e) => {
          console.error(e)
          setIsCancelLoading(false)
        })
    },
    [signer, order, address],
  )

  return { cancelList, isCancelLoading }
}
