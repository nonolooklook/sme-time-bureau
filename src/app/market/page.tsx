'use client'

import { Header } from '@/components/Header'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { useMint } from '@/hooks/useMint'
import * as Dialog from '@radix-ui/react-dialog'
import { Spinner } from '@/components/Spinner'
import { Address, useAccount, useContractReads } from 'wagmi'
import { NFTContractAddress } from '@/config/contract'
import { ERC1155ABI } from '@/config/abi/ERC1155'
import * as Checkbox from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import Stepper from 'awesome-react-stepper'
import { Seaport } from '@opensea/seaport-js'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { sepolia } from 'viem/chains'
import { CONDUIT_KEYS_TO_CONDUIT } from '@/config/key'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import { parseEther, parseUnits } from 'viem'
import { ERC20_ADDRESS } from '@/config/erc20'
import { displayBalance } from '@/utils/display'
import { calculateMidPrice } from '@/utils/price'
import { MatchOrdersFulfillment } from '@opensea/seaport-js/lib/types'

export default function Market() {
  const ref = useRef<HTMLDivElement>(null)
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
  const [lists, setLists] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  const [checkedLists, setCheckedLists] = useState<boolean[]>()
  const [checkedBids, setCheckedBids] = useState<boolean[]>()

  useEffect(() => {
    const q = async () => {
      fetch('https://sme-demo.mcglobal.ai/order?type=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((r) => r.json())
        .then((r) => {
          setLists(r?.data)
          setCheckedLists(Array(r?.data?.length).fill(false))
        })
        .catch((e) => console.error(e))

      fetch('https://sme-demo.mcglobal.ai/order?type=2', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((r) => r.json())
        .then((r) => {
          setBids(r?.data)
          setCheckedBids(Array(r?.data?.length).fill(false))
        })
        .catch((e) => console.error(e))
    }
    q()
  }, [])
  console.log(bids)
  console.log(lists)
  const signer = useEthersSigner()
  const [loading, setLoading] = useState(false)

  const fillBidOrder = async () => {
    if (!signer) return
    setOpen(true)
    const finalMakerOrders = lists?.filter((l, i) => checkedLists?.[i])
    const offerAmount = finalMakerOrders?.reduce(
      (acc, cv, i) => acc + parseUnits(cv?.entry?.parameters?.consideration?.[0].endAmount, 0),
      0n,
    )
    const itemAmount = finalMakerOrders?.reduce((acc, cv, i) => acc + parseUnits(cv?.entry?.parameters?.offer?.[0].startAmount, 0), 0n)
    const seaport = new Seaport(signer, {
      overrides: { contractAddress: SEAPORT_ADDRESS[sepolia.id] },
      conduitKeyToConduit: CONDUIT_KEYS_TO_CONDUIT,
    })
    const takerOrder = {
      zone: '0x0000000000000000000000000000000000000000',
      conduitKey: '0x28c73a60ccf8c66c14eba8935984e616df2926e3aaaaaaaaaaaaaaaaaaaaaa00',
      startTime: Math.floor(new Date().getTime() / 1000).toString(),
      endTime: Math.floor(new Date().getTime() / 1000 + 60 * 60).toString(),
      offer: [
        {
          amount: offerAmount.toString(),
          endAmount: offerAmount.toString(),
          token: ERC20_ADDRESS[sepolia.id],
          recipient: address,
        },
      ],
      consideration: [
        {
          itemType: ItemType.ERC1155,
          token: NFTContractAddress,
          identifier: '0',
          amount: itemAmount.toString(),
        },
      ],
    }

    console.log(takerOrder)
    // const takerOrder = {
    //   zone: '0x0000000000000000000000000000000000000000',
    //   conduitKey: '0x28c73a60ccf8c66c14eba8935984e616df2926e3aaaaaaaaaaaaaaaaaaaaaa00',
    //   startTime: Math.floor(new Date().getTime() / 1000).toString(),
    //   endTime: Math.floor(new Date().getTime() / 1000 + 60 * 60).toString(),
    //   offer: [
    //     {
    //       itemType: ItemType.ERC1155,
    //       token: NFTContractAddress,
    //       identifier: '0',
    //       amount: '1',
    //     },
    //   ],
    //   consideration: [
    //     {
    //       amount: ((parseEther('2' as `${number}`) * 9n) / 10n).toString(),
    //       endAmount: ((parseEther('2.3' as `${number}`) * 9n) / 10n).toString(),
    //       token: ERC20_ADDRESS[sepolia.id],
    //       recipient: address,
    //     },
    //   ],
    // }
    const { executeAllActions } = await seaport.createOrder(takerOrder, address)

    const order = await executeAllActions()
    console.log(order)
    const modeOrderFulfillments: MatchOrdersFulfillment[] = []
    modeOrderFulfillments.push({
      offerComponents: [
        {
          orderIndex: 0,
          itemIndex: 0,
        },
        {
          orderIndex: 1,
          itemIndex: 0,
        },
      ],
      considerationComponents: [
        {
          orderIndex: 2,
          itemIndex: 0,
        },
      ],
    })

    modeOrderFulfillments.push({
      offerComponents: [
        {
          orderIndex: 2,
          itemIndex: 0,
        },
      ],
      considerationComponents: [
        {
          orderIndex: 0,
          itemIndex: 0,
        },
        {
          orderIndex: 1,
          itemIndex: 0,
        },
      ],
    })
    console.log(2222222222)
    try {
      const res = await fetch('https://sme-demo.mcglobal.ai/task/fillOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          randomNumberCount: finalMakerOrders?.length,
          randomStrategy: 0,
          takerOrders: [takerOrder],
          makerOrders: finalMakerOrders,
          modeOrderFulfillments: modeOrderFulfillments,
        }),
      }).then((r) => r.json())
      ref?.current?.click()
      console.log(res)
    } catch (e) {
      console.error(e)
    }

    setLoading(false)
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
                <Spinner />
                <h1>Transaction in progress.</h1>
              </div>
              <div className={'mt-10'}>
                <h1>Transaction successful</h1>
              </div>
            </Stepper>
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
            <div className={'flex flex-col gap-3 max-h-[550px] overflow-y-scroll'}>
              {bids?.map((bid, i) => (
                <div className='flex' key={i}>
                  <div className='w-1/4'>8.93</div>
                  <div className='w-1/4'>10%</div>
                  <div className='w-1/4'>{bid?.entry?.parameters?.consideration?.[0]?.startAmount}</div>
                  <div className='w-1/4'>
                    <Checkbox.Root
                      checked={checkedBids?.[i]}
                      onCheckedChange={(e) => {
                        console.log(e)
                        if (checkedBids) {
                          let list = [...checkedBids]
                          list[i] = Boolean(e)
                          setCheckedBids(list)
                        }
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
              <button className={'btn btn-primary mt-10'} onClick={fillBidOrder}>
                Fill the order
              </button>
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
            <div className={'flex flex-col gap-3 max-h-[550px] overflow-y-scroll'}>
              {lists?.map((list, i) => (
                <div className='flex' key={i}>
                  <div className='w-1/4'>
                    {displayBalance(
                      calculateMidPrice(
                        list?.entry?.parameters?.consideration?.[0]?.startAmount,
                        list?.entry?.parameters?.consideration?.[0]?.endAmount,
                      ),
                    )}
                  </div>
                  <div className='w-1/4'>10%</div>
                  <div className='w-1/4'>{list?.entry?.parameters?.offer?.[0]?.startAmount}</div>
                  <div className='w-1/4'>
                    <Checkbox.Root
                      checked={checkedLists?.[i]}
                      onCheckedChange={(e) => {
                        console.log(e)
                        if (checkedLists) {
                          let list = [...checkedLists]
                          list[i] = Boolean(e)
                          setCheckedLists(list)
                        }
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
              <button className={'btn btn-primary mt-10'} onClick={fillBidOrder} disabled={loading}>
                {loading && <Spinner />}
                Fill the order
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
