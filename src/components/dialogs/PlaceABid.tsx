import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import Image from 'next/image'
import { BetaD3Chart } from '@/components/BetaD3Chart'
import { parseEther, parseUnits } from 'viem'
import { InputWithButton } from '@/components/InputWithButton'
import React, { useCallback, useContext, useState } from 'react'
import { calculateMidPriceFromBigInt } from '@/utils/price'
import { displayBalance } from '@/utils/display'
import { FetcherContext } from '@/contexts/FetcherContext'
import { Seaport } from '@opensea/seaport-js'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { arbitrumGoerli } from 'viem/chains'
import { CONDUIT_KEY, CONDUIT_KEYS_TO_CONDUIT } from '@/config/key'
import { ERC20_ADDRESS } from '@/config/erc20'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import { getCurrentChainId, NFTContractAddress, TokenId } from '@/config/contract'
import { toast } from 'sonner'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useAccount } from 'wagmi'
import { Spinner } from '@/components/Spinner'
import { CapsuleCard } from '@/components/dialogs/CapsuleCard'

export const PlaceABid = ({ open, onChange, mutate }: { open: boolean; onChange: any; mutate: any }) => {
  const signer = useEthersSigner()
  const { collateralBalance } = useContext(FetcherContext)
  const { address } = useAccount()
  const [min, setMin] = useState<`${number}`>('8')
  const [max, setMax] = useState<`${number}`>('10')
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('1')

  const createOrder = useCallback(async () => {
    if (!signer) return
    setLoading(true)
    try {
      const seaport = new Seaport(signer, {
        overrides: { contractAddress: SEAPORT_ADDRESS[getCurrentChainId()] },
        conduitKeyToConduit: CONDUIT_KEYS_TO_CONDUIT,
      })

      const makerOrder = {
        zone: '0x0000000000000000000000000000000000000000',
        conduitKey: CONDUIT_KEY[getCurrentChainId()],
        startTime: Math.floor(new Date().getTime() / 1000).toString(),
        endTime: Math.floor(new Date().getTime() / 1000 + 2 * 30 * 24 * 60 * 60).toString(),
        offer: [
          {
            amount: (parseEther(min as `${number}`) * parseUnits(amount as `${number}`, 0)).toString(),
            endAmount: (parseEther(max as `${number}`) * parseUnits(amount as `${number}`, 0)).toString(),
            token: ERC20_ADDRESS[getCurrentChainId()],
            recipient: address,
          },
        ],
        consideration: [
          {
            itemType: ItemType.ERC1155,
            token: NFTContractAddress[getCurrentChainId()],
            identifier: TokenId.toString(),
            amount: amount,
          },
        ],
        allowPartialFills: Number(amount) > 1,
      }
      const { executeAllActions } = await seaport.createOrder(makerOrder, address)

      const order = await executeAllActions()
      const hash = seaport.getOrderHash(order.parameters)
      console.log(hash)
      await fetch('https://sme-demo.mcglobal.ai/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash: hash,
          entry: order,
          type: 1,
        }),
      })
      toast.success('Place a bid successfully')
      mutate?.()
      onChange?.(false)
    } catch (e) {
      console.error(e)
      toast.error(e?.toString())
    }
    setLoading(false)
  }, [signer, min, max, amount])

  return (
    <Dialog.Root open={open} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content w-[660px]'>
          <div className='flex items-center justify-between mb-4'>
            <div className='dialog-title'>Place a bid</div>
            <Dialog.Close asChild>
              <button className='cursor-pointer' aria-label='Close'>
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>
          <CapsuleCard />
          <div className={'-mt-6'}>
            <BetaD3Chart minPrice={parseEther(min)} expectedPrice={parseEther('9')} maxPrice={parseEther(max)} />
          </div>
          <div className='flex justify-center mb-6 justify-between'>
            <div className='px-6 h-[48px] rounded-full bg-white bg-opacity-5 flex items-center justify-center text-sm'>
              <div>Min</div>
              <input
                type='number'
                value={min}
                className={'w-[90px] bg-transparent outline-0 text-center text-3xl font-semibold'}
                onChange={(e) => setMin(e.target.value as `${number}`)}
              />
              <Image src={'/usdc.svg'} alt={'usdc'} width={20} height={20} />
            </div>
            <div className='w-[120px] h-[48px] rounded-full bg-white bg-opacity-5 flex items-center justify-center text-xl'>
              {displayBalance(calculateMidPriceFromBigInt(parseEther(min as `${number}`), parseEther(max as `${number}`)))}
            </div>
            <div className='px-6 h-[48px] rounded-full bg-white bg-opacity-5 flex items-center justify-center text-sm'>
              <div>Max</div>
              <input
                type='number'
                value={max}
                className={'w-[90px] bg-transparent outline-0 text-center text-3xl font-semibold'}
                onChange={(e) => setMax(e.target.value as `${number}`)}
              />
              <Image src={'/usdc.svg'} alt={'usdc'} width={20} height={20} />
            </div>
          </div>
          <div className='flex text-2xl font-light bg-white bg-opacity-5 rounded-2xl h-[64px] justify-between flex items-center px-6'>
            <div>Quantity</div>
            <InputWithButton amount={amount} setAmount={setAmount} />
            <div>{displayBalance(parseUnits(max as `${number}`, 0) * parseEther(amount as `${number}`))} USDC</div>
          </div>
          <div className='my-3 text-gray-400 pl-4 text-sm'>USDC Balance: {displayBalance(collateralBalance)}</div>
          <div className='flex justify-center my-4'>
            <button className={'btn-primary w-[100px]'} disabled={loading} onClick={createOrder}>
              {loading && <Spinner />}
              Bid
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
