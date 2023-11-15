import Image from 'next/image'
import React, { useContext } from 'react'
import { FetcherContext } from '@/contexts/FetcherContext'

export const CapsuleCard = () => {
  const { currentPrice } = useContext(FetcherContext)
  return (
    <div className='flex bg-[#282828] rounded-xl px-8 py-4 gap-4'>
      <Image src={'/capsule-1.png'} alt={'capsule'} width={46} height={70} />
      <div className={'w-full'}>
        <div className={'text-lg font-light flex items-center justify-between mb-1'}>
          Schrödinger`s time capsules
          <div className='flex text-2xl font-semibold ml-auto gap-1'>
            <Image src={'/usdc.svg'} alt={'usdc'} width={28} height={28} />
            {currentPrice}
          </div>
        </div>
        <div className={'text-lg font-light flex items-center justify-between'}>
          Stochastic Universe
          <div>Market price</div>
        </div>
      </div>
    </div>
  )
}
