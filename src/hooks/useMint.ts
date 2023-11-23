import { Address, useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { getCurrentChainId, NFTContractAddress } from '../config/contract'
import { parseUnits } from 'viem'
import { TimeNFT } from '@/config/abi/TimeNFT'

export const useMint = (amount: string, enabled: boolean, onSuccess: any) => {
  const { address } = useAccount()
  const { config } = usePrepareContractWrite({
    address: NFTContractAddress[getCurrentChainId()] as Address,
    abi: TimeNFT,
    functionName: 'mint',
    args: [parseUnits(amount as `${number}`, 0), address as Address],
    enabled: enabled,
    onError: (e) => {
      console.log(e)
    },
  })
  const { write, data: tx, isLoading: isPreLoading } = useContractWrite(config)
  const { isLoading: isLoading } = useWaitForTransaction({ hash: tx?.hash, onSuccess: onSuccess })

  return { mint: write, isMintLoading: isPreLoading || isLoading }
}
