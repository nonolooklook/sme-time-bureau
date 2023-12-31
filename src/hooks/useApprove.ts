import { ERC20_ADDRESS } from '@/config/erc20'
import { parseEther } from 'viem'
import { Address, erc20ABI, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { NFTContractAddress, getCurrentChainId } from '../config/contract'

export const useApprove = (onSuccess: any) => {
  const { config } = usePrepareContractWrite({
    address: ERC20_ADDRESS[getCurrentChainId()] as `0x${string}`,
    abi: erc20ABI,
    functionName: 'approve',
    args: [NFTContractAddress[getCurrentChainId()] as Address, parseEther('10000000000000000')],
  })
  const { write, data: tx, isLoading: isPreLoading } = useContractWrite(config)
  const { isLoading: isLoading } = useWaitForTransaction({ hash: tx?.hash, onSuccess: onSuccess })

  return { approve: write, isApproveLoading: isPreLoading || isLoading }
}
