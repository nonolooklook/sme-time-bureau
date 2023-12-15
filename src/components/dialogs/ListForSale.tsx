import { BetaD3Chart } from '@/components/BetaD3Chart'
import { InputWithButton } from '@/components/InputWithButton'
import { Spinner } from '@/components/Spinner'
import { CapsuleCard } from '@/components/dialogs/CapsuleCard'
import { NFTContractAddress, TokenId, getCurrentChainId } from '@/config/contract'
import { ERC20_ADDRESS } from '@/config/erc20'
import { ERROR_MIN_MAX_WRONG_PRICE } from '@/config/error'
import { CONDUIT_KEY, CONDUIT_KEYS_TO_CONDUIT, FEE_ADDRESS } from '@/config/key'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { useAvailableAmount } from '@/hooks/useAvailableAmount'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { handleError } from '@/utils/error'
import { Seaport } from '@opensea/seaport-js'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { parseEther, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { AuthBalanceFee } from './AuthBalanceFee'
import { MinMax } from './MinMax'

export const ListForSale = ({ open, onChange, mutate }: { open: boolean; onChange: any; mutate: any }) => {
  const { availableAmount } = useAvailableAmount()
  const signer = useEthersSigner()
  const { address } = useAccount()
  const [[min, max], setMinMax] = useState<[`${number}`, `${number}`]>(['8', '10'])
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('1')

  const enabled = Number(amount) <= availableAmount

  const createOrder = useCallback(async () => {
    try {
      if (Number(amount) <= 0) {
        toast.error("Amount can't be less than or equal to 0")
        return
      }
      if (parseEther(min) > parseEther(max)) {
        toast.error(ERROR_MIN_MAX_WRONG_PRICE)
        return
      }
      if (!signer) return
      setLoading(true)

      const seaport = new Seaport(signer, {
        overrides: { contractAddress: SEAPORT_ADDRESS[getCurrentChainId()] },
        conduitKeyToConduit: CONDUIT_KEYS_TO_CONDUIT,
      })

      const startAmount = parseEther(min as `${number}`) * parseUnits(amount as `${number}`, 0)
      const endAmount = parseEther(max as `${number}`) * parseUnits(amount as `${number}`, 0)

      const makerOrder = {
        zone: '0x0000000000000000000000000000000000000000',
        conduitKey: CONDUIT_KEY[getCurrentChainId()],
        startTime: Math.floor(new Date().getTime() / 1000).toString(),
        endTime: Math.floor(new Date().getTime() / 1000 + 2 * 30 * 24 * 60 * 60).toString(),
        offer: [
          {
            itemType: ItemType.ERC1155,
            token: NFTContractAddress[getCurrentChainId()],
            identifier: TokenId?.toString(),
            amount: amount,
          },
        ],
        consideration: [
          {
            amount: ((BigInt(startAmount) * 995n) / 1000n).toString(),
            endAmount: ((BigInt(endAmount) * 995n) / 1000n).toString(),
            token: ERC20_ADDRESS[getCurrentChainId()],
            recipient: address,
          },
          {
            amount: ((BigInt(startAmount) * 5n) / 1000n).toString(),
            endAmount: ((BigInt(endAmount) * 5n) / 1000n).toString(),
            token: ERC20_ADDRESS[getCurrentChainId()],
            recipient: FEE_ADDRESS,
          },
        ],
        allowPartialFills: Number(amount) > 1,
      }
      const { executeAllActions } = await seaport.createOrder(makerOrder, address)

      const order = await executeAllActions()
      const hash = seaport.getOrderHash(order.parameters)
      await fetch('https://sme-demo.mcglobal.ai/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash: hash,
          entry: order,
          type: 2,
        }),
      }).catch((e) => console.error(e))
      toast.success('List successfully')
      mutate?.()
      onChange?.(false)
    } catch (e: any) {
      console.error(e)
      handleError(e)
    }
    setLoading(false)
  }, [signer, min, max, amount])

  return (
    <Dialog.Root open={open} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content w-[660px]' onPointerDownOutside={(e) => e.preventDefault()}>
          <div className='flex items-center justify-between mb-6'>
            <div className='dialog-title'>List NFT</div>
            <Dialog.Close asChild>
              <button className='IconButton cursor-pointer' aria-label='Close'>
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>
          <CapsuleCard />

          <div className={'-mt-6'}>
            <BetaD3Chart
              minPrice={parseEther(min)}
              expectedPrice={parseEther('9')}
              maxPrice={parseEther(max)}
              defaultValue={70}
              showType='right'
            />
          </div>
          <MinMax min={min} max={max} onChange={(min, max) => setMinMax([min, max])} />
          <div className='flex text-2xl font-light bg-white bg-opacity-5 rounded-2xl h-[64px] justify-between flex items-center px-6'>
            <div>Quantity</div>
            <InputWithButton amount={amount} setAmount={setAmount} />
            <div
              className={'cursor-pointer'}
              onClick={() => {
                setAmount(availableAmount <= 0 ? '1' : availableAmount.toFixed())
              }}
            >
              Max({availableAmount})
            </div>
          </div>
          <AuthBalanceFee fee />
          <div className='flex justify-center my-4'>
            <button className={'btn-primary w-[100px]'} disabled={loading || !enabled} onClick={createOrder}>
              {loading && <Spinner />}
              List
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
