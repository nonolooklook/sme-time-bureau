'use client'

import { Header } from '@/components/Header'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useMint } from '@/hooks/useMint'
import * as Dialog from '@radix-ui/react-dialog'
import { Spinner } from '@/components/Spinner'
import { Address, useAccount, useContractReads } from 'wagmi'
import { NFTContractAddress } from '@/config/contract'
import { ERC1155ABI } from '@/config/abi/ERC1155'

export default function Scratch() {
  const { address } = useAccount()
  const [amount, setAmount] = useState('1')
  const { mint, isMintLoading } = useMint(amount, () => {
    setOpen(true)
  })
  const [open, setOpen] = useState(false)

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

  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    fetch('https://sme-demo.mcglobal.ai/order/remainingNft')
      .then((r) => r.json())
      .then((r) => {
        setRemaining(r.data)
      })
      .catch((e) => console.error(e))
  }, [])

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

      <div className='container mx-auto mt-20'>
        <div className='flex items-start gap-10'>
          <Image src={'/demo-1.png'} alt={'demo'} width={260} height={420} className={'mt-10'} />
          <div className={'w-[400px] pt-10'}>
            <div className='flex justify-between'>
              <div>
                <div className='text-3xl mb-3'>$8743.32</div>
                <div className={'text-sm text-gray-500'}>Lucky pool</div>
              </div>
              <div>
                <div className='text-3xl mb-3'>{remaining}</div>
                <div className={'text-sm text-gray-500'}>NFT Remaining</div>
              </div>
            </div>
            <div className={'divider'} />
            <div>
              <div className='text-3xl mb-3'>$12.32</div>
              <div className={'text-sm text-gray-500'}>Real-time fair price</div>
            </div>
            <div className={'divider'} />
            <div className={'text-sm mb-12 mt-2'}>Unscratched NFTs will equally share the remaining funds after the event</div>
            <button
              className={'text-xl text-blue-400 btn btn-primary btn-large w-[220px]'}
              onClick={mint}
              disabled={!mint || isMintLoading}
            >
              {isMintLoading && <Spinner />}
              Scratch Now!
            </button>
            <div className={'w-[220px] text-gray-500 text-sm text-center mt-6'}>You have {nftBalance?.toString()} scratch NFTs</div>
          </div>

          <div className={'w-[400px] ml-auto'}>
            <div className={'text-xl font-semibold mb-6'}>Top 10 winnings</div>
            <div className={'bg-white shadow shadow-2xl shadow-gray-300 p-6 rounded-xl text-sm gap-4 flex flex-col'}>
              {Array.from(Array(10)).map((i) => (
                <div className='flex justify-between' key={i}>
                  <div>0xsefd83...7yu6</div>
                  <div>$23.45</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='text-xl mt-10 mb-6'>Note</div>
        <div className='bg-primary rounded-xl bg-opacity-5 p-6 text-gray-600'>
          <div className='flex gap-3'>
            <div className={'flex font-bold text-gray-900'}>•&nbsp; 01</div>
            Scratching the NFT reveals a prize ranging from $0 to $100.
          </div>
          <div className='flex gap-3'>
            <div className={'flex font-bold text-gray-900'}>•&nbsp; 02</div>
            The event lasts for ten days. However, if the total pool drops below $1000, the event will conclude early.
          </div>
          <div className='flex gap-3'>
            <div className={'flex font-bold text-gray-900'}>•&nbsp; 03</div>
            At the end of the event, any unscratched NFTs will equally share the remaining funds in the lucky pool.
          </div>
          <div className='flex gap-3'>
            <div className={'flex font-bold text-gray-900'}>•&nbsp; 04</div>
            Unscratched NFTs can be freely traded in the Market. Trade Now
          </div>
        </div>
      </div>
    </>
  )
}
