import React from 'react'
import { Address, erc20ABI, useAccount, useContractReads } from 'wagmi'
import { ERC20_ADDRESS } from '@/config/erc20'
import { arbitrumGoerli } from 'viem/chains'
import { getCurrentChainId, NFTContractAddress, TokenId } from '@/config/contract'
import { ERC1155ABI } from '@/config/abi/ERC1155'
import { useUserOrders } from '@/hooks/useUserOrders'
import { useOrderDistribution } from '@/hooks/useOrderDistribution'
import { TimeNFT } from '@/config/abi/TimeNFT'
import { useInterval } from 'usehooks-ts'

interface FetcherContextArgs {
  collateralBalance: bigint
  nftBalance: number
  listedCount: number
  bidCount: number
  totalMintedCount: number
  mintedCount: number
  allowance4nft: bigint
  currentPrice: number
  currentMaxPrice: number
}

const FetcherContext = React.createContext<FetcherContextArgs>({
  collateralBalance: 0n,
  nftBalance: 0,
  listedCount: 0,
  bidCount: 0,
  totalMintedCount: 0,
  mintedCount: 0,
  allowance4nft: 0n,
  currentPrice: 0,
  currentMaxPrice: 0,
})

// This context maintain 2 counters that can be used as a dependencies on other hooks to force a periodic refresh
const FetcherContextProvider = ({ children }: any) => {
  const { address } = useAccount()

  const { orders: listOrders } = useUserOrders(false, address ?? '')
  const { orders: bidOrders } = useUserOrders(true, address ?? '')

  const listedCount = listOrders?.reduce((count: number, cv: any) => Number(cv?.entry.parameters?.offer?.[0]?.startAmount) + count, 0)
  const bidCount = bidOrders?.reduce((count: number, cv: any) => Number(cv?.entry.parameters?.consideration?.[0]?.startAmount) + count, 0)

  const { orders, mutate: mutateOrders } = useOrderDistribution()

  useInterval(() => {
    mutateOrders?.()
  }, 1500)

  const minPrice = orders?.minPrice ?? 0
  const maxPrice = orders?.maxPrice ?? 0
  const mid = Math.round((minPrice + maxPrice) * 50) / 100

  const { data } = useContractReads({
    contracts: [
      {
        address: ERC20_ADDRESS[getCurrentChainId()] as Address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [address as Address],
      },
      {
        address: NFTContractAddress[getCurrentChainId()] as Address,
        abi: ERC1155ABI,
        functionName: 'balanceOf',
        args: [address as Address, TokenId],
      },
      {
        address: NFTContractAddress[getCurrentChainId()] as Address,
        abi: TimeNFT,
        functionName: 'getMintInfo',
      },
      {
        address: ERC20_ADDRESS[getCurrentChainId()] as `0x${string}`,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, NFTContractAddress[getCurrentChainId()] as Address],
      },
      {
        address: NFTContractAddress[getCurrentChainId()] as Address,
        abi: TimeNFT,
        functionName: 'minted',
        args: [address as Address],
      },
    ],
    watch: true,
  })

  return (
    <FetcherContext.Provider
      value={{
        collateralBalance: data?.[0]?.result ?? 0n,
        nftBalance: Number(data?.[1]?.result) ?? 0,
        listedCount: listedCount,
        bidCount: bidCount,
        totalMintedCount: Number(data?.[2]?.result?.total) ?? 0,
        mintedCount: Number(data?.[4]?.result) ?? 0,
        allowance4nft: data?.[3]?.result ?? 0n,
        currentPrice: mid,
        currentMaxPrice: maxPrice,
      }}
    >
      {children}
    </FetcherContext.Provider>
  )
}

export { FetcherContext, FetcherContextProvider }
