import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { NFTContractAddress } from '../config/contract'
import { ERC1155ABI } from '../config/abi/ERC1155'
import { parseUnits } from 'viem'

export const useMint = (amount: string, enabled: boolean, onSuccess: any) => {
  const { config } = usePrepareContractWrite({
    address: NFTContractAddress,
    abi: ERC1155ABI,
    functionName: 'mint',
    args: [0n, parseUnits(amount as `${number}`, 0)],
    enabled: enabled,
  })
  const { write, data: tx, isLoading: isPreLoading } = useContractWrite(config)
  const { isLoading: isLoading } = useWaitForTransaction({ hash: tx?.hash, onSuccess: onSuccess })

  return { mint: write, isMintLoading: isPreLoading || isLoading }
}
