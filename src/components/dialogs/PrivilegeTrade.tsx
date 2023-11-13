import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import Image from 'next/image'
import { BetaD3Chart } from '@/components/BetaD3Chart'
import { parseEther } from 'viem'
import { InputWithButton } from '@/components/InputWithButton'
import React, { useContext, useRef, useState } from 'react'
import { Seaport } from '@opensea/seaport-js'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { sepolia } from 'viem/chains'
import { CONDUIT_KEYS_TO_CONDUIT } from '@/config/key'
import { ERC20_ADDRESS } from '@/config/erc20'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import { NFTContractAddress } from '@/config/contract'
import { MatchOrdersFulfillment } from '@opensea/seaport-js/lib/types'
import { sleep } from '@/utils/sleep'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useAccount } from 'wagmi'
import Stepper from 'awesome-react-stepper'
import { Spinner } from '@/components/Spinner'
import { CapsuleCard } from '@/components/dialogs/CapsuleCard'
import { FetcherContext } from '@/contexts/FetcherContext'
import { displayBalance } from '@/utils/display'

export const PrivilegeTrade = ({ open, onChange }: { open: boolean; onChange: any }) => {
  const { collateralBalance } = useContext(FetcherContext)
  const ref = useRef<HTMLDivElement>(null)
  const { address } = useAccount()
  const signer = useEthersSigner()
  const [amount, setAmount] = useState('1')
  const [wrongMsg, setWrongMsg] = useState('')
  const [o, setO] = useState(false)

  const fillBidOrder = async () => {
    if (!signer) return
    setO(true)
    const seaport = new Seaport(signer, {
      overrides: { contractAddress: SEAPORT_ADDRESS[sepolia.id] },
      conduitKeyToConduit: CONDUIT_KEYS_TO_CONDUIT,
    })
    const takerOrder = {
      zone: '0x0000000000000000000000000000000000000000',
      conduitKey: '0x28c73a60ccf8c66c14eba8935984e616df2926e3aaaaaaaaaaaaaaaaaaaaaa00',
      startTime: Math.floor(new Date().getTime() / 1000 - 60 * 60).toString(),
      endTime: Math.floor(new Date().getTime() / 1000 + 60 * 60).toString(),
      consideration: [
        {
          amount: '1000000000000000000',
          endAmount: '100000000000000000000',
          token: ERC20_ADDRESS[sepolia.id],
          recipient: address,
        },
      ],
      offer: [
        {
          itemType: ItemType.ERC1155,
          token: NFTContractAddress,
          identifier: '0',
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
    // ref?.current?.click()

    try {
      const res = await fetch('https://sme-demo.mcglobal.ai/task/fillOrder', {
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
        // ref?.current?.click()
        // setWrongMsg(res?.data?.data)
        return
      }

      const itr = setInterval(async () => {
        const r2 = await fetch('https://sme-demo.mcglobal.ai/task/findByRequestId/' + res.data.data.requestId).then((r) => r.json())
        if (r2?.data?.status === 'matched') {
          clearInterval(itr)
          // ref?.current?.click()
        }
      }, 5000)
    } catch (e) {
      console.error(e)
    }

    // setLoading(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content w-[660px]'>
          <div className='flex items-center justify-between mb-4'>
            <div className='dialog-title'>Time-Weaving Privilege Trade</div>
            <Dialog.Close asChild>
              <button className='IconButton' aria-label='Close'>
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>
          <CapsuleCard />
          <div className={'mt-6 mb-4'}>Get rewards from Time-Weaving</div>
          <div className='flex flex-col gap-4'>
            <div className='border border-gray-600 rounded-2xl p-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className={'text-2xl'}>Common</div>
                  <div className={'flex items-center'}>
                    Probability：<div className={'text-2xl'}>99.98%</div>
                  </div>
                </div>
                <Image src={'/tp-1.png'} alt={'tp'} width={240} height={100} />
              </div>
            </div>
            <div className='border border-gray-600 rounded-2xl p-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className={'text-2xl'}>Epic</div>
                  <div className={'flex items-center'}>
                    Probability：<div className={'text-2xl'}>0.1%</div>
                  </div>
                </div>
                <Image src={'/tp-2.png'} alt={'tp'} width={240} height={100} />
              </div>
            </div>
            <div className='border border-gray-600 rounded-2xl p-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className={'text-2xl'}>Legendary</div>
                  <div className={'flex items-center'}>
                    Probability：<div className={'text-2xl'}>0.01%</div>
                  </div>
                </div>
                <Image src={'/tp-3.png'} alt={'tp'} width={240} height={100} />
              </div>
            </div>
          </div>
          <div className='px-10'>
            <div className='flex text-2xl font-light bg-white bg-opacity-5 rounded-2xl h-[64px] justify-between flex items-center px-6 mt-6'>
              <div>Quantity</div>
              <InputWithButton amount={amount} setAmount={setAmount} />
              <div>20 USDC</div>
            </div>
            <div className='my-3 text-gray-400 pl-4 text-sm flex justify-between'>
              <div className={'text-white'}>Total price maximum: 2020 USDC</div>
              Transaction fees: 0.5%
            </div>
          </div>
          <div className='flex justify-center mb-4 mt-6'>
            <button className={'btn-primary w-[100px]'} onClick={fillBidOrder} disabled={false}>
              Trade
            </button>
          </div>

          <Dialog.Root open={o} onOpenChange={() => setO(false)}>
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
                  fillStroke={'#FFAC03'}
                  activeColor={'#FFAC03'}
                  activeProgressBorder={'#FFAC03'}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
