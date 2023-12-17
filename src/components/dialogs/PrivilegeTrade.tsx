import { InputWithButton } from '@/components/InputWithButton'
import { CapsuleCard } from '@/components/dialogs/CapsuleCard'
import { NFTContractAddress, TokenId, getCurrentChainId } from '@/config/contract'
import { ERC20_ADDRESS } from '@/config/erc20'
import { CONDUIT_KEY, CONDUIT_KEYS_TO_CONDUIT } from '@/config/key'
import { privilegeExpectPrice } from '@/config/privilege'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { useAvailableAmount } from '@/hooks/useAvailableAmount'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useRequestMatchOrder } from '@/hooks/useRequestMatchOrder'
import { handleError } from '@/utils/error'
import { getExpectPrice, getOrderPerMinMax, getOrderPerMinMaxBigint } from '@/utils/order'
import { sleep } from '@/utils/sleep'
import { Seaport } from '@opensea/seaport-js'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import { MatchOrdersFulfillment } from '@opensea/seaport-js/lib/types'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useMemo, useState } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { BetaD3Chart } from '../BetaD3Chart'
import { BetaD3Chart3 } from '../BetaD3Chart3'
import { AuthBalanceFee } from './AuthBalanceFee'
import { TxStatus, getPriceType, useTxStatus } from './TxStatus'

export const PrivilegeTrade = ({
  open,
  onChange,
  maxCount,
  order,
  type = '3',
}: {
  open: boolean
  onChange: any
  maxCount: number
  order: any
  type?: '3' | '1'
}) => {
  const { availableAmount } = useAvailableAmount()
  const { address } = useAccount()
  const signer = useEthersSigner()
  const [amount, setAmount] = useState('1')
  const [wrongMsg, setWrongMsg] = useState('')

  const reqMatchOrder = useRequestMatchOrder()
  const enabled = Number(amount) <= Math.min(availableAmount, maxCount)
  const makerOrder = order
  const [min, max, ep] = useMemo(() => {
    console.info('order:', order)
    const [min, max] = getOrderPerMinMaxBigint(order.entry)
    const ep = getExpectPrice(min, max)
    if (type === '3') return [min, max, privilegeExpectPrice]
    return [min, max, ep]
  }, [order])
  const { txsOpen, txsProps, setTxsOpen, setTypeStep } = useTxStatus(() => fillBidOrder())
  const fillBidOrder = async () => {
    try {
      if (!signer || !makerOrder) return
      setTypeStep({ type: 'loading' })
      setTxsOpen(true)
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
            amount: '0',
            endAmount: (parseEther('1010') * BigInt(amount)).toString(),
            token: ERC20_ADDRESS[getCurrentChainId()],
            recipient: address,
          },
        ],
        offer: [
          {
            itemType: ItemType.ERC1155,
            token: NFTContractAddress[getCurrentChainId()],
            identifier: TokenId.toString(),
            amount: amount,
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

      if (!res?.data?.status) {
        setTypeStep({ type: 'fail' })
        setWrongMsg(res?.data?.data)
        return
      }
      // do request match order
      const makerHash = seaport.getOrderHash(makerOrder?.entry?.parameters)
      const takerHash = seaport.getOrderHash(order.parameters)
      const hashes = [makerHash, takerHash] as any
      await reqMatchOrder({ args: [hashes] })
      const [min, max] = getOrderPerMinMax(order)
      setTypeStep({ type: 'step', step: { step: 0, min, max } })
      const itr = setInterval(async () => {
        const r2 = await fetch('https://sme-demo.mcglobal.ai/task/findByRequestId/' + res.data.data.requestId).then((r) => r.json())
        if (r2?.data?.status === 'requested random number') {
          setTypeStep({ type: 'step', step: { step: 1, min, max } })
        }
        if (r2?.data?.status === 'matched') {
          clearInterval(itr)
          setTypeStep({ type: 'step', step: { step: 2, min, max, price: r2?.data?.price, priceType: getPriceType(r2?.data?.price) } })
        }
        if (r2?.data?.status && (r2?.data?.status as string).startsWith('processing response error')) {
          clearInterval(itr)
          setTypeStep({ type: 'fail' })
        }
      }, 5000)
    } catch (e) {
      console.error(e)
      handleError(e)
      setTypeStep({ type: 'fail' })
    }
  }
  // const midPrice = (parseEther(order?.minPrice) + parseEther(order?.maxPrice))/2n
  return (
    <Dialog.Root open={open} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content w-[660px]' onPointerDownOutside={(e) => e.preventDefault()}>
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
          {type === '3' && <BetaD3Chart3 />}
          {type === '1' && <BetaD3Chart minPrice={min} expectedPrice={ep} maxPrice={max} defaultValue={70} showType='right' />}
          {type === '1' && (
            <div className='px-10'>
              <div className='flex text-2xl font-light bg-white bg-opacity-5 rounded-2xl h-[64px] justify-between flex items-center px-6 mt-6'>
                <div>Quantity</div>
                <InputWithButton amount={amount} setAmount={setAmount} />
                <div
                  className={'cursor-pointer'}
                  onClick={() => {
                    setAmount(availableAmount <= 0 ? '1' : availableAmount.toFixed())
                  }}
                >
                  Max({Math.min(maxCount, availableAmount)})
                </div>
              </div>
            </div>
          )}
          <AuthBalanceFee maximum={1010n * BigInt(amount) * 10n ** 18n} fee />
          <div className='flex justify-center mb-4 mt-6'>
            <button className={'btn-primary w-[100px]'} onClick={fillBidOrder} disabled={!enabled}>
              Trade
            </button>
          </div>
          {txsOpen && <TxStatus {...txsProps} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
