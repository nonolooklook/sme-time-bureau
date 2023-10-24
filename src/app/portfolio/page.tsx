'use client'

import { Header } from '@/components/Header'
import Image from 'next/image'
import { useState } from 'react'
import { useMint } from '@/hooks/useMint'
import * as Dialog from '@radix-ui/react-dialog'
import { Spinner } from '@/components/Spinner'
import { InputWithButton } from '@/components/InputWithButton'
import { PortfolioListed } from '@/components/portfolio/PortfolioListed'
import { PortfolioAvailable } from '@/components/portfolio/PortfolioAvailable'
import { Address, useAccount, useContractReads } from 'wagmi'
import { NFTContractAddress } from '@/config/contract'
import { ERC1155ABI } from '@/config/abi/ERC1155'
import { displayBalance } from '@/utils/display'
import { useUserOrders } from '@/hooks/useUserOrders'

export default function Portfolio() {
  const [type, setType] = useState(0)
  const { address } = useAccount()
  const { data } = useContractReads({
    contracts: [
      {
        address: NFTContractAddress,
        abi: ERC1155ABI,
        functionName: 'balanceOf',
        args: [address as Address, 0n],
      },
    ],
    watch: true,
  })

  const nftBalance = data?.[0]?.result

  const { orders: lo } = useUserOrders(false, address ?? '')
  const { orders: bo } = useUserOrders(true, address ?? '')

  return (
    <>
      <Header />

      <div className='container mx-auto mt-10 pb-10'>
        <div className='flex'>
          <div
            className={`cursor-pointer px-6 rounded-t-lg py-2 ${type === 0 ? 'text-gray-900 bg-primary bg-opacity-5' : ''}`}
            onClick={() => setType(0)}
          >
            Available for listing ({nftBalance?.toString()})
          </div>
          <div
            className={`cursor-pointer px-6 rounded-t-lg py-2 ${type === 1 ? 'text-gray-900 bg-primary bg-opacity-5' : ''}`}
            onClick={() => setType(1)}
          >
            Listed ({lo?.length})
          </div>
          <div
            className={`cursor-pointer px-6 rounded-t-lg py-2 ${type === 2 ? 'text-gray-900 bg-primary bg-opacity-5' : ''}`}
            onClick={() => setType(2)}
          >
            My bidding ({bo?.length})
          </div>
        </div>
        <div className={`bg-primary bg-opacity-5 px-8 pt-8 rounded-2xl ${type === 0 ? 'rounded-tl-sm' : ''}`}>
          {type === 0 && <PortfolioAvailable balance={nftBalance ?? 0n} />}
          {type === 1 && <PortfolioListed isBid={false} />}
          {type === 2 && <PortfolioListed isBid={true} />}
        </div>
      </div>
    </>
  )
}
