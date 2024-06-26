'use client'

import { Header } from '@/components/Header'
import { Spinner } from '@/components/Spinner'
import { ERC1155ABI } from '@/config/abi/ERC1155'
import { genURL } from '@/config/api'
import { NFTContractAddress, getCurrentChainId } from '@/config/contract'
import { ERC20_ADDRESS } from '@/config/erc20'
import { CONDUIT_KEY, CONDUIT_KEYS_TO_CONDUIT } from '@/config/key'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { displayBalance, ellipseAddress } from '@/utils/display'
import { sleep } from '@/utils/sleep'
import { Seaport } from '@opensea/seaport-js'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import { MatchOrdersFulfillment } from '@opensea/seaport-js/lib/types'
import * as Dialog from '@radix-ui/react-dialog'
import Stepper from 'awesome-react-stepper'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { parseUnits } from 'viem'
import { Address, erc20ABI, useAccount, useContractReads } from 'wagmi'

export default function Scratch() {
  const ref = useRef<HTMLDivElement>(null)
  const { address } = useAccount()
  const [open, setOpen] = useState(false)
  const [wrongMsg, setWrongMsg] = useState('')
  const [remaining, setRemaining] = useState(0)
  const [tops, setTops] = useState<any[]>([])

  const { data } = useContractReads({
    contracts: [
      {
        address: NFTContractAddress[getCurrentChainId()] as Address,
        abi: ERC1155ABI,
        functionName: 'balanceOf',
        args: [address as Address, 0n],
      },
      {
        address: ERC20_ADDRESS[getCurrentChainId()] as Address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: ['0x28c73A60ccF8c66c14EbA8935984e616Df2926e3'],
      },
    ],
    watch: true,
  })

  const nftBalance = data?.[0]?.result
  const luckyPoolValue = data?.[1]?.result ?? 0n
  const price = remaining > 0 ? luckyPoolValue / parseUnits(remaining?.toFixed() as `${number}`, 0) : 0n

  useEffect(() => {
    fetch(genURL('/transaction/topWinnings'))
      .then((r) => r.json())
      .then((r) => {
        setTops(r?.data)
      })
      .catch((e) => console.error(e))
  }, [])

  useEffect(() => {
    fetch(genURL('/order/remainingNft'))
      .then((r) => r.json())
      .then((r) => {
        setRemaining(r.data)
      })
      .catch((e) => console.error(e))
  }, [])

  const signer = useEthersSigner()

  const fillBidOrder = async () => {
    if (!signer) return
    setOpen(true)
    const seaport = new Seaport(signer, {
      overrides: { contractAddress: SEAPORT_ADDRESS[getCurrentChainId()] },
      conduitKeyToConduit: CONDUIT_KEYS_TO_CONDUIT,
    })
    const takerOrder = {
      zone: '0x0000000000000000000000000000000000000000',
      conduitKey: CONDUIT_KEY[getCurrentChainId()],
      startTime: Math.floor(new Date().getTime() / 1000 - 60 * 60).toString(),
      endTime: Math.floor(new Date().getTime() / 1000 + 60 * 60).toString(),
      consideration: [
        {
          amount: '1000000000000000000',
          endAmount: '100000000000000000000',
          token: ERC20_ADDRESS[getCurrentChainId()],
          recipient: address,
        },
      ],
      offer: [
        {
          itemType: ItemType.ERC1155,
          token: NFTContractAddress[getCurrentChainId()],
          identifier: '1',
          amount: '1',
        },
      ],
    }

    const { executeAllActions } = await seaport.createOrder(takerOrder, address)

    const order = await executeAllActions()
    const modeOrderFulfillments: MatchOrdersFulfillment[] = []
    modeOrderFulfillments.push({
      offerComponents: [{ orderIndex: 0, itemIndex: 0 }],
      considerationComponents: [{ orderIndex: 1, itemIndex: 0 }],
    })

    modeOrderFulfillments.push({
      offerComponents: [{ orderIndex: 1, itemIndex: 0 }],
      considerationComponents: [{ orderIndex: 0, itemIndex: 0 }],
    })

    await sleep(2000)
    ref?.current?.click()

    try {
      const res = await fetch(genURL('/task/fillOrder'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          randomNumberCount: 1,
          randomStrategy: 1,
          takerOrders: [order],
          makerOrders: [],
          modeOrderFulfillments: modeOrderFulfillments,
        }),
      }).then((r) => r.json())
      console.log(res)
      if (!res?.data?.status) {
        ref?.current?.click()
        setWrongMsg(res?.data?.data)
        return
      }

      const itr = setInterval(async () => {
        const r2 = await fetch(genURL('/task/findByRequestId/') + res.data.data.requestId).then((r) => r.json())
        if (r2?.data?.status === 'matched') {
          clearInterval(itr)
          ref?.current?.click()
        }
      }, 5000)
    } catch (e) {
      console.error(e)
    }

    // setLoading(false)
  }

  return (
    <>
      <Header />
      <Dialog.Root open={open} onOpenChange={() => setOpen(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className={'dialog-overlay'} />
          <Dialog.Content className={'dialog-content'}>
            <div
              onClick={() => {
                if (ref.current) {
                  ref.current.click()
                }
              }}
            />
            <div className={'py-10'} />
            <Stepper
              allowClickControl={false}
              backBtn={<></>}
              continueBtn={<div ref={ref} />}
              submitBtn={<></>}
              fillStroke={'#000'}
              activeColor={'#000'}
              activeProgressBorder={'#000'}
              contentBoxClassName={'text-sm text-center mb-10'}
            >
              <div className={'mt-10 flex items-center gap-2 justify-center'}>
                <Spinner />
                <h1>Initiating random number request to Chainlink.</h1>
              </div>
              <div className={'mt-10 flex items-center gap-2 justify-center'}>
                <Spinner />
                <h1>Waiting for Chainlink to return a random number</h1>
              </div>
              <div className={'mt-10 flex items-center gap-2 justify-center'}>
                <h1>{wrongMsg !== '' ? wrongMsg : 'Transaction successful.'}</h1>
              </div>
            </Stepper>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className='container mx-auto mt-20'>
        <div className='flex items-start gap-10'>
          <Image src={'/demo-1.png'} alt={'demo'} width={260} height={420} className={'mt-10'} />
          <div className={'w-[400px] pt-10'}>
            <div className='flex justify-between'>
              <div>
                <div className='text-3xl mb-3'>${displayBalance(luckyPoolValue)}</div>
                <div className={'text-sm text-gray-500'}>Lucky pool</div>
              </div>
              <div>
                <div className='text-3xl mb-3'>{remaining}</div>
                <div className={'text-sm text-gray-500'}>NFT Remaining</div>
              </div>
            </div>
            <div className={'divider'} />
            <div>
              <div className='text-3xl mb-3'>${displayBalance(price)}</div>
              <div className={'text-sm text-gray-500'}>Real-time fair price</div>
            </div>
            <div className={'divider'} />
            <div className={'text-sm mb-12 mt-2'}>Unscratched NFTs will equally share the remaining funds after the event</div>
            <button className={'text-xl text-blue-400 btn btn-primary btn-large w-[220px]'} onClick={fillBidOrder} disabled={false}>
              Scratch Now!
            </button>
            <div className={'w-[220px] text-gray-500 text-sm text-center mt-6'}>You have {nftBalance?.toString()} scratch NFTs</div>
          </div>

          <div className={'w-[400px] ml-auto'}>
            <div className={'text-xl font-semibold mb-6'}>Top 10 winnings</div>
            <div className={'bg-white shadow shadow-2xl shadow-gray-300 p-6 rounded-xl text-sm gap-4 flex flex-col'}>
              {tops?.map((top) => (
                <div className='flex justify-between' key={top?.orderHash}>
                  <div>{ellipseAddress(top?.orderHash, 6)}</div>
                  <div>${top?.price}</div>
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
