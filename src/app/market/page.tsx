'use client'

import { Header } from '@/components/Header'
import Image from 'next/image'
import { useState } from 'react'
import { useMint } from '@/hooks/useMint'
import * as Dialog from '@radix-ui/react-dialog'
import { Spinner } from '@/components/Spinner'
import { Address, useAccount, useContractReads } from 'wagmi'
import { NFTContractAddress } from '@/config/contract'
import { ERC1155ABI } from '@/config/abi/ERC1155'
import * as Checkbox from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

export function Page() {
  const { address } = useAccount()
  const [amount, setAmount] = useState('1')
  const { mint, isMintLoading } = useMint(amount, () => {
    setOpen(true)
  })
  const [open, setOpen] = useState(false)
  const [bidList, setBidList] = useState<boolean[]>(Array.from(Array(25)).fill(false))
  console.log(bidList)

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

      <div className='container mx-auto mt-10'>
        <div className='flex justify-between mb-4'>
          <Link href={'/bid'} className={'btn btn-outline'}>
            <Image src={'/bid.png'} alt={'bid'} width={24} height={24} />
            Place a bid
          </Link>
          <Link href={'/list'} className={'btn btn-outline'}>
            <Image src={'/list.png'} alt={'bid'} width={24} height={24} />
            List for sell
          </Link>
        </div>
        <div className={'bg-white shadow shadow-2xl shadow-gray-300 p-6 rounded-xl text-sm gap-4 flex flex-col mb-10'}>
          <div className='flex justify-between'>
            <div>USDT Balance: $2000</div>
            <div>You have 100 scratch tickets</div>
          </div>
          <img src={'/demo-2.png'} alt={'demo'} width={'100%'} height={'auto'} />
        </div>

        <div className='grid grid-cols-3 gap-6 pb-28'>
          <div className='col-span-1 text-gray-600 text-sm'>
            <div className='text-xl'>Buy Orders</div>
            <div className='divider' />
            <div className='flex mb-3'>
              <div className='w-1/4'>Expected Price</div>
              <div className='w-1/4'>Deviation</div>
              <div className='w-1/4'>Quantity</div>
            </div>
            <div className={'flex flex-col gap-3 h-[550px] overflow-y-scroll'}>
              {Array.from(Array(25)).map((a, i) => (
                <div className='flex' key={i}>
                  <div className='w-1/4'>8.93</div>
                  <div className='w-1/4'>10%</div>
                  <div className='w-1/4'>3</div>
                  <div className='w-1/4'>
                    <Checkbox.Root
                      checked={bidList[i]}
                      onCheckedChange={(e) => {
                        console.log(e)
                        let list = [...bidList]
                        list[i] = Boolean(e)
                        setBidList(list)
                      }}
                      className='CheckboxRoot'
                      defaultChecked
                      id='c1'
                    >
                      <Checkbox.Indicator className='CheckboxIndicator'>
                        <CheckIcon />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                  </div>
                </div>
              ))}
            </div>
            <div className={'flex justify-end'}>
              <button className={'btn btn-primary mt-10'}>Fill the order</button>
            </div>
          </div>
          <div className='col-span-1 pt-10 flex flex-col items-center'>
            <button className={'btn btn-primary mb-6'}>Unscratched NFTs can be freely traded here</button>
            <Image src={'/demo-1.png'} alt={'demo'} width={300} height={600} />
            <div className={'my-4 text-gray-500'}>Real-time Fair Price</div>
            <div className='flex items-center gap-2 font-semibold text-xl'>
              <Image src={'/bid.png'} alt={'bid'} width={30} height={30} />
              9.32
            </div>
          </div>
          <div className='col-span-1 text-gray-600 text-sm'>
            <div className='text-xl'>Sell Orders</div>
            <div className='divider' />
            <div className='flex mb-3'>
              <div className='w-1/4'>Expected Price</div>
              <div className='w-1/4'>Deviation</div>
              <div className='w-1/4'>Quantity</div>
            </div>
            <div className={'flex flex-col gap-3 h-[550px] overflow-y-scroll'}>
              {Array.from(Array(25)).map((a, i) => (
                <div className='flex' key={i}>
                  <div className='w-1/4'>8.93</div>
                  <div className='w-1/4'>10%</div>
                  <div className='w-1/4'>3</div>
                  <div className='w-1/4'>
                    <Checkbox.Root
                      checked={bidList[i]}
                      onCheckedChange={(e) => {
                        console.log(e)
                        let list = [...bidList]
                        list[i] = Boolean(e)
                        setBidList(list)
                      }}
                      className='CheckboxRoot'
                      defaultChecked
                      id='c1'
                    >
                      <Checkbox.Indicator className='CheckboxIndicator'>
                        <CheckIcon />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                  </div>
                </div>
              ))}
            </div>
            <div className={'flex justify-end'}>
              <button className={'btn btn-primary mt-10'}>Fill the order</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
