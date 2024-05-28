import { BetaD3Chart3 } from '@/components/BetaD3Chart3'
import { CapsuleCard } from '@/components/dialogs/CapsuleCard'
import { NFTContractAddress, TokenId, getCurrentChainId } from '@/config/contract'
import { ERC20_ADDRESS } from '@/config/erc20'
import { CONDUIT_KEY } from '@/config/key'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useSimulationUserBalance } from '@/hooks/useSimulationUserBalance'
import { handleError } from '@/utils/error'
import { sleep } from '@/utils/sleep'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import { MatchOrdersFulfillment } from '@opensea/seaport-js/lib/types'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useRef, useState } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { TxStatus, getPriceType, useTxStatus } from '../TxStatus'
import { getOrderPerMinMax } from '@/utils/order'
import { displayBalance } from '@/utils/display'
import { AuthBalanceFee } from '../AuthBalanceFee'
import { genURL } from '@/config/api'

export const SimulationPrivilegeTrade = ({ open, onChange, maxCount }: { open: boolean; onChange: any; maxCount: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { address } = useAccount()
  const { quantity: availableAmount } = useSimulationUserBalance(address)
  const signer = useEthersSigner()
  const [amount, setAmount] = useState('1')
  const [wrongMsg, setWrongMsg] = useState('')
  const [o, setO] = useState(false)

  const enabled = Number(amount) <= Math.min(availableAmount, maxCount)
  const { txsOpen, txsProps, setTxsOpen, setTypeStep } = useTxStatus(() => fillBidOrder())
  const fillBidOrder = async () => {
    try {
      if (!signer) return
      setTxsOpen(true)
      const takerOrder = {
        zone: '0x0000000000000000000000000000000000000000',
        zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        salt: '0x000000000000000000000000000000000000000000000000f14af04e1d2fc643',
        totalOriginalConsiderationItems: 1,
        orderType: 0,
        offerer: address as `0x${string}`,
        conduitKey: CONDUIT_KEY[getCurrentChainId()],
        startTime: Math.floor(new Date().getTime() / 1000 - 60 * 60).toString(),
        endTime: Math.floor(new Date().getTime() / 1000 + 60 * 60).toString(),
        counter: '0',
        consideration: [
          {
            amount: '0',
            startAmount: '0',
            endAmount: (parseEther('1010') * BigInt(amount)).toString(),
            token: ERC20_ADDRESS[getCurrentChainId()],
            recipient: address as `0x${string}`,
            itemType: ItemType.ERC20,
            identifierOrCriteria: '0',
          },
        ],
        offer: [
          {
            itemType: ItemType.ERC1155,
            token: NFTContractAddress[getCurrentChainId()],
            identifier: TokenId.toString(),
            identifierOrCriteria: TokenId.toString(),
            amount: amount,
            startAmount: amount,
            endAmount: amount,
          },
        ],
      }

      const order = {
        parameters: takerOrder,
        signature: '',
      }
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

      const res = await fetch(genURL('/mock-task/fillOrder'), {
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
        setTypeStep({ type: 'fail' })
        setWrongMsg(res?.data?.data)
        return
      }
      const [min, max] = getOrderPerMinMax(order)
      setTypeStep({ type: 'step', step: { step: 0, min, max } })
      const itr = setInterval(async () => {
        const r2 = await fetch(genURL('/mock-task/findByRequestId/') + res.data.requestId).then((r) => r.json())
        if (r2?.data?.status === 'requested random number') {
          setTypeStep({ type: 'step', step: { step: 1, min, max } })
        }
        if (r2?.data?.status === 'matched') {
          clearInterval(itr)
          setTypeStep({
            type: 'step',
            step: {
              step: 2,
              min,
              max,
              txHash: r2?.data?.txHash,
              price: displayBalance(parseEther(r2?.data?.price || '0')),
              priceType: getPriceType(r2?.data?.price || '0'),
            },
          })
        }
        if (r2?.data?.status && (r2?.data?.status as string).startsWith('processing response error')) {
          clearInterval(itr)
          setTypeStep({ type: 'fail' })
        }
      }, 5000)
    } catch (e) {
      setTypeStep({ type: 'fail' })
      handleError(e)
    }
  }

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
          <BetaD3Chart3 />
          <AuthBalanceFee maximum={1010n * BigInt(amount) * 10n ** 18n} />
          <div className='flex justify-center mb-4 mt-6'>
            <button className={'btn-primary w-[100px]'} onClick={fillBidOrder} disabled={!enabled}>
              Sell
            </button>
          </div>

          {txsOpen && <TxStatus {...txsProps} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
