import { BetaD3Chart3 } from '@/components/BetaD3Chart3'
import { InputWithButton } from '@/components/InputWithButton'
import { Spinner } from '@/components/Spinner'
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
import Stepper from 'awesome-react-stepper'
import { useRef, useState } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'

export const SimulationPrivilegeTrade = ({ open, onChange, maxCount }: { open: boolean; onChange: any; maxCount: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { address } = useAccount()
  const { quantity: availableAmount } = useSimulationUserBalance(address)
  const signer = useEthersSigner()
  const [amount, setAmount] = useState('1')
  const [wrongMsg, setWrongMsg] = useState('')
  const [o, setO] = useState(false)

  const enabled = Number(amount) <= Math.min(availableAmount, maxCount)

  const fillBidOrder = async () => {
    try {
      if (!signer) return
      setO(true)
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
      ref?.current?.click()
      const res = await fetch('https://sme-demo.mcglobal.ai/mock-task/fillOrder', {
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
        const r2 = await fetch('https://sme-demo.mcglobal.ai/mock-task/findByRequestId/' + res.data.requestId).then((r) => r.json())
        if (r2?.data?.status === 'matched') {
          clearInterval(itr)
          ref?.current?.click()
        }
      }, 5000)
    } catch (e) {
      console.error(e)
      handleError(e)
      setO(false)
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
            <div className='my-3 text-gray-400 pl-4 text-sm flex justify-between'>
              <div className={'text-white'}>Total price maximum: {1010 * Number(amount)} USDC</div>
              Transaction fees: 0.5%
            </div>
          </div>
          <div className='flex justify-center mb-4 mt-6'>
            <button className={'btn-primary w-[100px]'} onClick={fillBidOrder} disabled={!enabled}>
              Trade
            </button>
          </div>

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
                  <div className={'mt-10 flex items-center gap-2 justify-center w-[360px]'}>
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
