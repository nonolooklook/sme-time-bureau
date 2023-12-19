import { BetaD3Chart } from '@/components/BetaD3Chart'
import { CapsuleCard } from '@/components/dialogs/CapsuleCard'
import { InputWithButton } from '@/components/InputWithButton'
import { getCurrentChainId, NFTContractAddress, TokenId } from '@/config/contract'
import { ERC20_ADDRESS } from '@/config/erc20'
import { CONDUIT_KEY, CONDUIT_KEYS_TO_CONDUIT } from '@/config/key'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { FetcherContext } from '@/contexts/FetcherContext'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useRequestMatchOrder } from '@/hooks/useRequestMatchOrder'
import { displayBalance } from '@/utils/display'
import { handleError } from '@/utils/error'
import { getOrderMinMax, getOrderPerMinMax } from '@/utils/order'
import { sleep } from '@/utils/sleep'
import { Seaport } from '@opensea/seaport-js'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import { MatchOrdersFulfillment } from '@opensea/seaport-js/lib/types'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { AuthBalanceFee } from './AuthBalanceFee'
import { MinMax } from './MinMax'
import { TxStatus, useTxStatus } from './TxStatus'

export const BuyDialog = ({ open, onChange, selected }: { open: boolean; onChange: any; selected: any }) => {
  const { address } = useAccount()
  const { collateralBalance } = useContext(FetcherContext)
  const [amount, setAmount] = useState('1')
  const signer = useEthersSigner()
  const [loading, setLoading] = useState(false)
  const [wrongMsg, setWrongMsg] = useState('')
  const maxAmount = selected?.order?.remainingQuantity ?? 0
  useEffect(() => setAmount(maxAmount.toFixed() ?? '1'), [selected])
  const reqMatchOrder = useRequestMatchOrder()
  const { txsOpen, txsProps, setTxsOpen, setTypeStep } = useTxStatus(() => fillSellOrder())
  const canBuy =
    collateralBalance >= (parseEther(amount as `${number}`) * parseEther(selected?.max)) / 10n ** 18n && Number(amount) <= maxAmount

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
      setTypeStep({ type: 'loading' })
      setTxsOpen(true)
      const order = selected?.order
      const csd = order?.entry?.parameters?.consideration
      const startAmount = csd?.reduce((amount: string, cv: any) => (BigInt(cv?.startAmount) + BigInt(amount)).toString(), '0')
      const endAmount = csd?.reduce((amount: string, cv: any) => (BigInt(cv?.endAmount) + BigInt(amount)).toString(), '0')
      const startOfferAmount = startAmount * (Number(amount) / selected?.count)
      const offerAmount = endAmount * (Number(amount) / selected?.count)
      const itemAmount = order?.entry?.parameters?.offer?.[0].startAmount * (Number(amount) / selected?.count)
      const takerOrder = {
        zone: '0x0000000000000000000000000000000000000000',
        conduitKey: CONDUIT_KEY[getCurrentChainId()],
        startTime: Math.floor(new Date().getTime() / 1000).toString(),
        endTime: Math.floor(new Date().getTime() / 1000 + 60 * 60).toString(),
        offer: [
          {
            amount: startOfferAmount.toString(),
            endAmount: offerAmount.toString(),
            token: ERC20_ADDRESS[getCurrentChainId()],
            recipient: address,
          },
        ],
        consideration: [
          {
            itemType: ItemType.ERC1155,
            token: NFTContractAddress[getCurrentChainId()],
            identifier: TokenId?.toString(),
            amount: itemAmount.toString(),
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

      modeOrderFulfillments.push({
        offerComponents: [{ orderIndex: 1, itemIndex: 0 }],
        considerationComponents: [{ orderIndex: 0, itemIndex: 1 }],
      })

      await sleep(2000)
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
        setTypeStep({ type: 'fail' })
        setWrongMsg(res?.data?.data)
        return
      }

      // do request match order;
      const makerHash = seaport.getOrderHash(order?.entry?.parameters)
      const takerHash = seaport.getOrderHash(fo.parameters)
      const hashes = [makerHash, takerHash] as any
      await reqMatchOrder({ args: [hashes] })

      const [min, max] = getOrderPerMinMax(entry)
      setTypeStep({ type: 'step', step: { step: 0, min, max } })

      const itr = setInterval(async () => {
        const r2 = await fetch('https://sme-demo.mcglobal.ai/task/findByRequestId/' + res.data.data.requestId).then((r) => r.json())
        if (r2?.data?.status === 'requested random number') {
          setTypeStep({ type: 'step', step: { step: 1, min, max } })
        }
        if (r2?.data?.status === 'matched') {
          clearInterval(itr)
          setTypeStep({
            type: 'step',
            step: { step: 2, min, max, txHash: r2?.data?.txHash, price: displayBalance(parseEther(r2?.data?.price)) },
          })
        }
        if (r2?.data?.status && (r2?.data?.status as string).startsWith('processing response error')) {
          clearInterval(itr)
          setTypeStep({ type: 'fail' })
        }
      }, 5000)
    } catch (e: any) {
      setTypeStep({ type: 'fail' })
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

            <BetaD3Chart
              minPrice={parseEther(selected?.min)}
              expectedPrice={parseEther(selected?.mid)}
              maxPrice={parseEther(selected?.max)}
              showType='left'
              defaultValue={30}
            />

            <MinMax min={selected?.min as any} max={selected?.max as any} disableInput={true} />
            <div className='flex text-2xl font-light bg-white bg-opacity-5 rounded-2xl h-[64px] justify-between flex items-center px-6'>
              <div>Quantity</div>
              <InputWithButton amount={amount} setAmount={setAmount} />
              <div>{displayBalance((parseEther(amount as `${number}`) * parseEther(selected?.max)) / 10n ** 18n)} USDC</div>
            </div>
            <AuthBalanceFee auth={(parseEther(amount as `${number}`) * parseEther(selected?.max)) / 10n ** 18n} balance />
            <div className='flex justify-center mb-4 mt-6'>
              <button className={'btn-primary w-[170px]'} onClick={fillSellOrder} disabled={!canBuy}>
                {canBuy ? 'Buy' : 'Not enough'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {txsOpen && <TxStatus {...txsProps} />}
    </>
  )
}
