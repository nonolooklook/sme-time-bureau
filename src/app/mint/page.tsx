'use client'

import { Header } from '@/components/Header'
import Image from 'next/image'
import { useState } from 'react'
import { useMint } from '@/hooks/useMint'
import * as Dialog from '@radix-ui/react-dialog'
import { Spinner } from '@/components/Spinner'
import { InputWithButton } from '@/components/InputWithButton'
import Link from 'next/link'
import { erc20ABI, useAccount, useContractRead, useContractReads } from 'wagmi'
import { NFTContractAddress } from '@/config/contract'
import { ERC1155ABI } from '@/config/abi/ERC1155'
import { displayBalance } from '@/utils/display'
import { useApprove } from '@/hooks/useApprove'
import { ERC20_ADDRESS } from '@/config/erc20'
import { sepolia } from 'viem/chains'
import { parseEther, parseUnits } from 'viem'

export default function Page() {
  const { address } = useAccount()
  const [amount, setAmount] = useState('1')

  const { data } = useContractReads({
    contracts: [
      {
        address: NFTContractAddress,
        abi: ERC1155ABI,
        functionName: 'totalSupply',
      },
      {
        address: ERC20_ADDRESS[sepolia.id] as `0x${string}`,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, NFTContractAddress],
      },
    ],
    watch: true,
  })

  const totalSupply = data?.[0]?.result
  const allowance = data?.[1]?.result ?? 0n
  const shouldApprove = allowance < parseEther(amount as `${number}`) * 10n

  const { mint, isMintLoading } = useMint(amount, !shouldApprove, () => setOpen(true))
  const { approve, isApproveLoading } = useApprove(() => {})

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
              <Link href={'/scratch'} className='btn btn-outline'>
                Scratch Now
              </Link>
              <Link href={'/portfolio'} className='btn btn-primary'>
                Check In My Portfolio
              </Link>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className='container mx-auto mt-32'>
        <div className={'rounded-xl bg-[#040914] bg-opacity-5 p-8 flex items-start gap-10'}>
          <Image src={'/demo-1.png'} alt={'demo'} width={350} height={700} className={'-mt-20'} />
          <div>
            <div className={'font-bold text-4xl mb-4'}>SCRATCH TICKET</div>
            <div className={'text-base text-[#040914] font-light mb-4'}>
              Unlock potential treasures with our scratch-off NFT! For just 10 USDT, dive into an exhilarating experience. Remember, each
              address can claim up to 5 chances. Scratch it, and you could win up to $100!
            </div>
            <div className={'font-semibold text-lg'}>Public Mint:</div>
            <div className={'text-lg font-light'}>Start on 18/10/2023 8:00(UTC)</div>
            <div className={'text-lg font-light mb-6'}>Price: 10 USDT</div>

            <div className={'text-lg font-light'}>Minted: {totalSupply?.toString()}/1000</div>
            <InputWithButton amount={amount} setAmount={setAmount} />

            {shouldApprove ? (
              <button
                className={'text-xl mt-6 btn btn-primary btn-large w-[220px]'}
                onClick={approve}
                disabled={!approve || isApproveLoading}
              >
                {isApproveLoading && <Spinner />}
                Approve
              </button>
            ) : (
              <button className={'text-xl mt-6 btn btn-primary btn-large w-[220px]'} onClick={mint} disabled={!mint || isMintLoading}>
                {isMintLoading && <Spinner />}
                Mint
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
