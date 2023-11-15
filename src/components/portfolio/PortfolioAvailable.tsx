import Image from 'next/image'
import { Address, useAccount, useContractReads } from 'wagmi'
import { NFTContractAddress } from '@/config/contract'
import { ERC1155ABI } from '@/config/abi/ERC1155'
import Link from 'next/link'
import { useContext, useState } from 'react'
import { FetcherContext } from '@/contexts/FetcherContext'
import { useOrderDistribution } from '@/hooks/useOrderDistribution'

export const PortfolioAvailable = () => {
  const { nftBalance, listedCount, currentPrice } = useContext(FetcherContext)

  return (
    <div>
      <div
        className={'w-[360px] max-w-full gap-10 px-10 py-6 border border-gray-700 rounded-2xl bg-gray-700 bg-opacity-20 backdrop-blur-md'}
      >
        <div className='flex justify-center'>
          <Image src={'/capsule-1.png'} alt={'demo'} width={240} height={220} />
        </div>
        <div className='grid grid-cols-2 gap-4 mt-6'>
          <div>
            <div className={'h-[46px] bg-gray-700 bg-opacity-80 rounded-full flex items-center justify-center text-2xl'}>
              {nftBalance - listedCount}
            </div>
            <div className={'text-gray-400 text-center mt-2'}>Quantity</div>
          </div>
          <div>
            <div className={'h-[46px] bg-gray-700 bg-opacity-80 rounded-full flex items-center justify-center text-2xl'}>
              ${currentPrice}
            </div>
            <div className={'text-gray-400 text-center mt-2'}>Real Price</div>
          </div>
        </div>
        <div className={'flex justify-center mt-4'}>
          <Link href={'/trade?type=list'} className={'btn-primary block mt-2'}>
            List for sell
          </Link>
        </div>
      </div>
    </div>
  )
}
