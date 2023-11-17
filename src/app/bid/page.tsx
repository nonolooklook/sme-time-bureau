'use client'

import { Header } from '@/components/Header'
import Image from 'next/image'
import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useAccount } from 'wagmi'
import { ChevronLeftIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { PlaceBid } from '@/components/market/PlaceBid'
import { MyBidding } from '@/components/market/MyBidding'

export default function Bid() {
  const [type, setType] = useState(0)
  const { address } = useAccount()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Header />
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={'dialog-overlay'} />
          <Dialog.Content className={'dialog-content'}>
            <div className='flex items-center gap-1'>
              <Image src={'/success.png'} alt={'success'} width={160} height={160} />
              <div className={'text-2xl font-semibold'}>Mint Successful</div>
            </div>
            <div className='flex gap-6 justify-center mt-2'>
              <div className='btn btn-outline'>Scratch Now</div>
              <div className='btn btn-primary'>Check In My Portfolio</div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className='container mx-auto mt-10 pb-10'>
        <div className='flex mb-8 items-center gap-8 text-gray-400'>
          <Link className={'w-[32px] h-[32px] bg-white rounded-full flex items-center justify-center cursor-pointer'} href={'/market'}>
            <ChevronLeftIcon />
          </Link>
          <div className={`cursor-pointer ${type === 0 ? 'text-gray-900' : ''}`} onClick={() => setType(0)}>
            Place a bid
          </div>
          <div className={`cursor-pointer ${type === 1 ? 'text-gray-900' : ''}`} onClick={() => setType(1)}>
            My bidding
          </div>
        </div>

        {type === 0 && <PlaceBid />}
        {type === 1 && <MyBidding />}
      </div>
    </>
  )
}
