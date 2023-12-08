import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { BetaD3Chart } from '@/components/BetaD3Chart'
import { parseEther, parseUnits, UserRejectedRequestError } from 'viem'
import { InputWithButton } from '@/components/InputWithButton'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { CapsuleCard } from '@/components/dialogs/CapsuleCard'
import { FetcherContext } from '@/contexts/FetcherContext'
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
import Stepper from 'awesome-react-stepper'
import { Spinner } from '@/components/Spinner'
import { useAccount } from 'wagmi'
import { ERROR_SIGN_REJECTED, ERROR_SYSTEM } from '@/config/error'
import { handleError } from '@/utils/error'
import { useSimulationUserBalance } from '@/hooks/useSimulationUserBalance'

export const SimulationBuyDialog = ({ open, onChange, selected }: { open: boolean; onChange: any; selected: any }) => {
  const { address } = useAccount()
  const ref = useRef<HTMLDivElement>(null)
  const { balance: collateralBalance } = useSimulationUserBalance(address)
  console.log(collateralBalance)
  const [amount, setAmount] = useState('1')
  const [o, setO] = useState(false)

  const signer = useEthersSigner()
  const [loading, setLoading] = useState(false)
  const [wrongMsg, setWrongMsg] = useState('')
  const maxAmount = selected?.order?.remainingQuantity ?? 0
  useEffect(() => setAmount(maxAmount.toFixed() ?? '1'), [selected])

  const canBuy =
    collateralBalance >= (parseEther(amount as `${number}`) * parseEther(selected?.max)) / 10n ** 36n && Number(amount) <= maxAmount

  const fillSellOrder = async () => {
    try {
      if (Number(amount) <= 0) {
        toast.error("Amount can't be less than or equal to 0")
        return
      }
      if (!signer) return
      const seaport = new Seaport(signer, {
        overrides: { contractAddress: SEAPORT_ADDRESS[getCurrentChainId()] },
        conduitKeyToConduit: CONDUIT_KEYS_TO_CONDUIT,
      })
      setO(true)
      const order = selected?.order
      const csd = order?.entry?.parameters?.consideration
      const startAmount = csd?.reduce((amount: string, cv: any) => (BigInt(cv?.startAmount) + BigInt(amount)).toString(), '0')
      const endAmount = csd?.reduce((amount: string, cv: any) => (BigInt(cv?.endAmount) + BigInt(amount)).toString(), '0')
      const startOfferAmount = startAmount * (Number(amount) / selected?.count)
      const offerAmount = endAmount * (Number(amount) / selected?.count)
      const itemAmount = order?.entry?.parameters?.offer?.[0].startAmount * (Number(amount) / selected?.count)
      const takerOrder = {
        zone: '0x0000000000000000000000000000000000000000',
        zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        salt: '0x0000000000000000000000000000000000000000000000006a663532ba6095f5',
        offerer: address as `0x${string}`,
        counter: '0',
        orderType: 0,
        totalOriginalConsiderationItems: 1,
        conduitKey: CONDUIT_KEY[getCurrentChainId()],
        startTime: Math.floor(new Date().getTime() / 1000).toString(),
        endTime: Math.floor(new Date().getTime() / 1000 + 60 * 60).toString(),
        offer: [
          {
            amount: startOfferAmount.toString(),
            startAmount: startOfferAmount.toString(),
            endAmount: offerAmount.toString(),
            token: ERC20_ADDRESS[getCurrentChainId()],
            recipient: address as `0x${string}`,
            itemType: ItemType.ERC20,
            identifierOrCriteria: '0',
          },
        ],
        consideration: [
          {
            itemType: ItemType.ERC1155,
            token: NFTContractAddress[getCurrentChainId()],
            identifier: TokenId?.toString(),
            identifierOrCriteria: TokenId?.toString(),
            recipient: address as `0x${string}`,
            amount: itemAmount.toString(),
            startAmount: itemAmount.toString(),
            endAmount: itemAmount.toString(),
          },
        ],
      }

      let entry = { ...order?.entry }
      entry.extraData = '0x'
      entry.numerator = Number(amount)
      entry.denominator = selected?.count

      // const { executeAllActions } = await seaport.createOrder(takerOrder, address)
      // const fo = await executeAllActions()
      const fo = {
        parameters: takerOrder,
        signature: '',
      }
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

      modeOrderFulfillments.push({
        offerComponents: [{ orderIndex: 1, itemIndex: 0 }],
        considerationComponents: [{ orderIndex: 0, itemIndex: 1 }],
      })

      await sleep(2000)
      ref?.current?.click()
      const res = await fetch('https://sme-demo.mcglobal.ai/mock-task/fillOrder', {
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
        const r2 = await fetch('https://sme-demo.mcglobal.ai/mock-task/findByRequestId/' + res.data.data.requestId).then((r) => r.json())
        if (r2?.data?.status === 'matched') {
          clearInterval(itr)
          ref?.current?.click()
        }
      }, 5000)
    } catch (e: any) {
      setO(false)
      handleError(e)
    }

    setLoading(false)
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onChange}>
        <Dialog.Portal>
          <Dialog.Overlay className='dialog-overlay' />
          <Dialog.Content className='dialog-content w-[660px]' onPointerDownOutside={(e) => e.preventDefault()}>
            <div className='flex items-center justify-between mb-6'>
              <div className='dialog-title'>Buy</div>
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
              <div>{displayBalance((parseEther(amount as `${number}`) * parseEther(selected?.max)) / 10n ** 18n)} USDC</div>
            </div>
            <div className='my-3 text-gray-400 pl-4 text-sm flex justify-between'>
              <div className={'text-white'}>
                Authorization required for {displayBalance((parseEther(amount as `${number}`) * parseEther(selected?.max)) / 10n ** 18n)}{' '}
                USDC
              </div>
              USDC Balance: {collateralBalance}
            </div>
            <div className='flex justify-center mb-4 mt-6'>
              <button className={'btn-primary w-[170px]'} onClick={fillSellOrder} disabled={!canBuy}>
                {canBuy ? 'Buy' : 'Not enough'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={o} onOpenChange={() => setO(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className={'dialog-overlay'} />
          <Dialog.Content className={'dialog-content'} onPointerDownOutside={(e) => e.preventDefault()}>
            <div className='text-right'>
              <Dialog.Close asChild>
                <button className='IconButton' aria-label='Close'>
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>
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
