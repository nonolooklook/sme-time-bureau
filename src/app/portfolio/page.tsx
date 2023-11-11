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
    <div
      className={'relative min-h-screen bg-no-repeat'}
      style={{ background: 'url(/trade-bg.png)', backgroundSize: '100%', backgroundPosition: 'center center' }}
    >
      <Header />

      <div className='container mx-auto text-white pt-32 pb-24'>
        <div className='flex gap-8'>
          <div
            className={`cursor-pointer px-6 rounded-full border py-2 ${
              type === 0 ? 'text-primary border-primary' : 'text-white border-white'
            }`}
            onClick={() => setType(0)}
          >
            Available for listing ({nftBalance?.toString()})
          </div>
          <div
            className={`cursor-pointer px-6 rounded-full border py-2 ${
              type === 1 ? 'text-primary border-primary' : 'text-white border-white'
            }`}
            onClick={() => setType(1)}
          >
            Listed ({lo?.length})
          </div>
          <div
            className={`cursor-pointer px-6 rounded-full border py-2 ${
              type === 2 ? 'text-primary border-primary' : 'text-white border-white'
            }`}
            onClick={() => setType(2)}
          >
            My bidding ({bo?.length})
          </div>
        </div>
        <div className={`pt-8 ${type === 0 ? 'rounded-tl-sm' : ''}`}>
          {type === 0 && <PortfolioAvailable balance={nftBalance ?? 0n} />}
          {type === 1 && <PortfolioListed isBid={false} />}
          {type === 2 && <PortfolioListed isBid={true} />}
        </div>
      </div>
    </div>
  )
}
