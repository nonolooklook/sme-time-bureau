import SmeGasManager from '@/config/abi/SmeGasManager'
import { SME_GAS_MANAGER } from '@/config/key'
import { FetcherContext } from '@/contexts/FetcherContext'
import { useContext } from 'react'
import { Address, useContractWrite } from 'wagmi'
import { getCurrentChainId } from '../config/contract'

export const useRequestMatchOrder = () => {
  const { gasFee } = useContext(FetcherContext)
  const { writeAsync } = useContractWrite({
    address: SME_GAS_MANAGER[getCurrentChainId()] as Address,
    abi: SmeGasManager,
    functionName: 'requestMatchOrder',
    value: gasFee,
  })
  return writeAsync
}
