import { erc20ABI, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { NFTContractAddress } from '../config/contract'
import { ERC1155ABI } from '../config/abi/ERC1155'
import { parseEther, parseUnits } from 'viem'
import { sepolia } from 'viem/chains'
import { ERC20_ADDRESS } from '@/config/erc20'

export const useApprove = (onSuccess: any) => {
  const { config } = usePrepareContractWrite({
    address: ERC20_ADDRESS[sepolia.id] as `0x${string}`,
    abi: erc20ABI,
    functionName: 'approve',
    args: [NFTContractAddress, parseEther('10000000000000000')],
  })
  const { write, data: tx, isLoading: isPreLoading } = useContractWrite(config)
  const { isLoading: isLoading } = useWaitForTransaction({ hash: tx?.hash, onSuccess: onSuccess })

  return { approve: write, isApproveLoading: isPreLoading || isLoading }
}
