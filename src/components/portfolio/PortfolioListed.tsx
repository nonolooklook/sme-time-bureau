import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { displayBalance } from '@/utils/display'
import { parseUnits } from 'viem'
import exp from 'constants'
import { useCancelList } from '@/hooks/useCancelList'
import { PortfolioListItem } from '@/components/portfolio/PortfolioListItem'
import { useUserOrders } from '@/hooks/useUserOrders'

export const PortfolioListed = ({ isBid }: { isBid: boolean }) => {
  const { address } = useAccount()
  const { mutate, orders, isLoading } = useUserOrders(isBid, address ?? '')

  return (
    <div className={'trade-card'}>
      <div className='flex w-full text-gray-400 mb-4'>
        <div className='w-1/6'></div>
        <div className='w-1/6'></div>
        <div className='w-[37%] -ml-1'>
          <div className={'text-center mb-2 text-xs'}>List Price</div>
          <div className='flex items-center'>
            <div className={'w-[4px] h-[4px] rounded-full bg-gray-400'} />
            <div className={'h-[1px] bg-gray-400 w-full'} />
            <div className={'w-[4px] h-[4px] rounded-full bg-gray-400'} />
          </div>
        </div>
      </div>
      <div className='flex w-full text-gray-400 mb-8'>
        <div className='w-1/6'>Order</div>
        <div className='w-1/6'>Quantity</div>
        <div className='w-1/6'>Min</div>
        <div className='w-1/6'>Expected</div>
        <div className='w-1/6'>Max</div>
      </div>
      <div className={'flex flex-col gap-6'}>
        {orders?.map((l: any, i: number) => (
          <PortfolioListItem showDivider={i !== orders.length - 1} mutate={mutate} isBid={isBid} order={l} i={i} key={i} />
        ))}
      </div>
    </div>
  )
}
