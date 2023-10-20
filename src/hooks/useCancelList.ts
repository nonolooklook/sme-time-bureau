import { useCallback, useState } from 'react'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { Seaport } from '@opensea/seaport-js'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { sepolia } from 'viem/chains'
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
        const seaport = new Seaport(signer, { overrides: { contractAddress: SEAPORT_ADDRESS[sepolia.id] } })
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

      fetch('https://sme-demo.mcglobal.ai/order/' + order?.hash, {
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
