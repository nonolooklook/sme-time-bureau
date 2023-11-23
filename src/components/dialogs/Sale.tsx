import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { BetaD3Chart } from '@/components/BetaD3Chart'
import { parseEther, parseUnits } from 'viem'
import { InputWithButton } from '@/components/InputWithButton'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { CapsuleCard } from '@/components/dialogs/CapsuleCard'
import { displayBalance } from '@/utils/display'
import { Seaport } from '@opensea/seaport-js'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { arbitrumGoerli } from 'viem/chains'
import { CONDUIT_KEY, CONDUIT_KEYS_TO_CONDUIT } from '@/config/key'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import { getCurrentChainId, NFTContractAddress, TokenId } from '@/config/contract'
import { ERC20_ADDRESS } from '@/config/erc20'
import { MatchOrdersFulfillment } from '@opensea/seaport-js/lib/types'
import { sleep } from '@/utils/sleep'
import { toast } from 'sonner'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useAccount } from 'wagmi'
import Stepper from 'awesome-react-stepper'
import { Spinner } from '@/components/Spinner'
import { FetcherContext } from '@/contexts/FetcherContext'

export const SaleDialog = ({ open, onChange, selected }: { open: boolean; onChange: any; selected: any }) => {
  const { nftBalance, listedCount } = useContext(FetcherContext)
  const ref = useRef<HTMLDivElement>(null)
  const { address } = useAccount()
  const signer = useEthersSigner()

  const [loading, setLoading] = useState(false)
  const [wrongMsg, setWrongMsg] = useState('')
  const [amount, setAmount] = useState('1')
  const [o, setO] = useState(false)

  const canAccept = nftBalance - listedCount >= Number(amount)

  useEffect(() => setAmount(selected?.count?.toString()), [selected])
  const fillBidOrder = async () => {
    try {
      if (!signer) return
      setO(true)
      const seaport = new Seaport(signer, {
        overrides: { contractAddress: SEAPORT_ADDRESS[getCurrentChainId()] },
        conduitKeyToConduit: CONDUIT_KEYS_TO_CONDUIT,
      })
      console.log(seaport)
      const order = selected?.order
      const offerAmount = order.entry?.parameters?.consideration?.[0].endAmount * (Number(amount) / selected?.count)
      const startItemAmount = order.entry?.parameters?.offer?.[0].startAmount * (Number(amount) / selected?.count)
      const endItemAmount = order?.entry?.parameters?.offer?.[0].endAmount * (Number(amount) / selected?.count)

      const takerOrder = {
        zone: '0x0000000000000000000000000000000000000000',
        conduitKey: CONDUIT_KEY[getCurrentChainId()],
        startTime: Math.floor(new Date().getTime() / 1000).toString(),
        endTime: Math.floor(new Date().getTime() / 1000 + 60 * 60).toString(),
        offer: [
          {
            itemType: ItemType.ERC1155,
            token: NFTContractAddress[getCurrentChainId()],
            identifier: TokenId?.toString(),
            amount: offerAmount.toString(),
          },
        ],
        consideration: [
          {
            amount: startItemAmount.toString(),
            endAmount: endItemAmount.toString(),
            token: ERC20_ADDRESS[getCurrentChainId()],
            recipient: address,
          },
        ],
      }

      let entry = { ...order?.entry }
      entry.extraData = '0x'
      entry.numerator = Number(amount)
      entry.denominator = selected?.count

      const { executeAllActions } = await seaport.createOrder(takerOrder, address)

      const fo = await executeAllActions()
      let finalOrder = { ...fo }
      // @ts-ignore
      finalOrder.extraData = '0x'
      // @ts-ignore
      finalOrder.numerator = 1
      // @ts-ignore
      finalOrder.denominator = 1

      const modeOrderFulfillments: MatchOrdersFulfillment[] = []
      for (let i = 0; i < 1; i++) {
        modeOrderFulfillments.push({
          offerComponents: [{ orderIndex: i, itemIndex: 0 }],
          considerationComponents: [{ orderIndex: 1, itemIndex: 0 }],
        })
      }

      for (let i = 0; i < 1; i++) {
        modeOrderFulfillments.push({
          offerComponents: [{ orderIndex: 1, itemIndex: 0 }],
          considerationComponents: [{ orderIndex: i, itemIndex: 0 }],
        })
      }

      await sleep(2000)
      ref?.current?.click()
      const res = await fetch('https://sme-demo.mcglobal.ai/task/fillOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          randomNumberCount: 1,
          randomStrategy: 0,
          takerOrders: [finalOrder],
          makerOrders: [entry],
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
        const r2 = await fetch('https://sme-demo.mcglobal.ai/task/findByRequestId/' + res.data.data.requestId).then((r) => r.json())
        if (r2?.data?.status === 'matched') {
          clearInterval(itr)
          ref?.current?.click()
        }
      }, 5000)
    } catch (e: any) {
      console.error(e)
      toast.error(e.toString())
      setO(false)
    }

    setLoading(false)
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onChange}>
        <Dialog.Portal>
          <Dialog.Overlay className='dialog-overlay' />
          <Dialog.Content className='dialog-content w-[660px]'>
            <div className='flex items-center justify-between mb-6'>
              <div className='dialog-title'>Approve sale</div>
              <Dialog.Close asChild>
                <button className='IconButton' aria-label='Close'>
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>
            <CapsuleCard />

            <div className={'-mt-6'}>
              <BetaD3Chart
                minPrice={parseEther(selected?.min)}
                expectedPrice={parseEther(selected?.mid)}
                maxPrice={parseEther(selected?.max)}
              />
            </div>
            <div className='flex justify-center mb-6'>
              <div className='w-[120px] h-[48px] rounded-full bg-white bg-opacity-5 flex items-center justify-center text-xl'>
                {selected?.mid}
              </div>
            </div>
            <div className='flex text-2xl font-light bg-white bg-opacity-5 rounded-2xl h-[64px] justify-between flex items-center px-6'>
              <div>Quantity</div>
              <InputWithButton amount={amount} setAmount={setAmount} />
              <div>Max({nftBalance - listedCount})</div>
            </div>
            <div className='my-3 text-gray-400 pl-4 text-sm flex justify-between'>
              <div className={'text-white'}>
                Total price maximum: {displayBalance(parseUnits(amount as `${number}`, 0) * parseEther(selected?.max))} USDC
              </div>
              Transaction fees：0.5%
            </div>
            <div className='flex justify-center mb-4 mt-6'>
              <button className={'btn-primary w-[100px]'} onClick={fillBidOrder} disabled={!canAccept}>
                Accept
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
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
              <div className={'w-[370px] mt-10 flex items-center gap-2 justify-center'}>
                <h1>{wrongMsg !== '' ? wrongMsg : 'Transaction successful.'}</h1>
              </div>
            </Stepper>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
