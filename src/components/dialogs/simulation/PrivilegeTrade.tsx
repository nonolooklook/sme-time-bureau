import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { InputWithButton } from '@/components/InputWithButton'
import React, { useContext, useMemo, useRef, useState } from 'react'
import { CONDUIT_KEY } from '@/config/key'
import { ERC20_ADDRESS } from '@/config/erc20'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import { getCurrentChainId, NFTContractAddress, TokenId } from '@/config/contract'
import { MatchOrdersFulfillment } from '@opensea/seaport-js/lib/types'
import { sleep } from '@/utils/sleep'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useAccount } from 'wagmi'
import Stepper from 'awesome-react-stepper'
import { Spinner } from '@/components/Spinner'
import { CapsuleCard } from '@/components/dialogs/CapsuleCard'
import { FetcherContext } from '@/contexts/FetcherContext'
import { handleError } from '@/utils/error'
import { parseEther } from 'viem'
import { useSimulationUserBalance } from '@/hooks/useSimulationUserBalance'
import { BetaD3Chart3 } from '@/components/BetaD3Chart3'
import { calculateFirstBetaFunction, calculateSecondBetaFunction } from '@/utils/beta'
import { displayBalance } from '@/utils/display'

const d1 = calculateFirstBetaFunction(2, 3)
const d2 = calculateSecondBetaFunction(3, 3)
const d3 = calculateSecondBetaFunction(3, 3)
const data1 = d1.map((t) => (t.x === 0 && t.y === 0 ? { name: 'b', x: 0, y: 0 } : t))
const data2 = d2.map((t) => (t.x === 0 && t.y === 0 ? { name: 'b', x: 0, y: 0 } : t))
const data3 = d3.map((t) => (t.x === 0 && t.y === 0 ? { name: 'b', x: 0, y: 0 } : t))
console.log(data1)

export const SimulationPrivilegeTrade = ({ open, onChange, maxCount }: { open: boolean; onChange: any; maxCount: number }) => {
  const { nftBalance, listedCount, currentMaxPrice } = useContext(FetcherContext)
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

  const [outCx, setOutCX] = useState(0n)
  const [outX, setOutX] = useState(0)
  const [outRealX, setOutRealX] = useState(0)
  const [index, setIndex] = useState(0)
  console.log(outCx, outX, index)

  const r = useMemo(() => {
    if (index === 0 && outX < 1) {
      return (outX * 98) / 100
    }
    if (index === 0 && outX > 1 && outX < 1.5) {
      return 0.9989
    }

    if (index === 1 && outX < 1) {
      return 0.9989 + outX * 0.0001
    }
    if (index === 1 && outX > 1) {
      return 0.9999
    }
    if (index === 2 && outX < 1) {
      return 0.9999 + outX * 0.0001
    }
    if (index === 2 && outX > 1) {
      return 1
    }

    return 0.9999
  }, [outX, index])

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
          <div className={'h-[80px] -mb-16 pt-4'}>
            {outX > 0 && outX <= 1.6 && (
              <div className={'flex justify-between'}>
                <div className=' text-xs flex flex-col items-center'>
                  Random Price &lt; {displayBalance(outCx, 2)}
                  <div className={'px-3 mt-1 py-1 text-xs rounded-full border border-white'}>{(r * 100).toFixed(5)}%</div>
                </div>

                <div className='text-xs flex flex-col items-center'>
                  Random Price &gt; {displayBalance(outCx, 2)}
                  <div className={'px-3 mt-1 py-1 text-xs rounded-full border-white border'}>{((1 - r) * 100).toFixed(5)}%</div>
                </div>
              </div>
            )}
          </div>
          <div className='relative'>
            {outX > 0 && outX < 1.6 && (
              <div
                className={'absolute bottom-0 text-xs'}
                style={{
                  left: index > 1 ? outRealX + 370 : index > 0 ? outRealX + 170 : outRealX,
                  bottom: '40px',
                  marginLeft: '10px',
                }}
              >
                {displayBalance(outCx)}
              </div>
            )}
            <div className='grid-cols-3 grid'>
              <div className='col-span-1'>
                <BetaD3Chart3
                  setOutX={setOutX}
                  setOutCX={setOutCX}
                  setOutRealX={setOutRealX}
                  ratio={1}
                  index={0}
                  setIndex={setIndex}
                  data={data1}
                  maxPrice={parseEther('20')}
                  minPrice={0n}
                  expectedPrice={parseEther('10')}
                  margin={{ top: 60, bottom: 20, left: 30, right: 0 }}
                />
              </div>
              <div className='col-span-1 flex items-end'>
                <BetaD3Chart3
                  setOutX={setOutX}
                  setOutCX={setOutCX}
                  setOutRealX={setOutRealX}
                  ratio={1.8}
                  index={1}
                  setIndex={setIndex}
                  data={data2}
                  minPrice={parseEther('190')}
                  expectedPrice={parseEther('200')}
                  maxPrice={parseEther('210')}
                  margin={{ top: 60, bottom: 20, left: 0, right: 0 }}
                />
              </div>
              <div className='col-span-1 flex items-end'>
                <BetaD3Chart3
                  setOutX={setOutX}
                  setOutCX={setOutCX}
                  setOutRealX={setOutRealX}
                  ratio={2.2}
                  index={2}
                  setIndex={setIndex}
                  data={data3}
                  minPrice={parseEther('990')}
                  expectedPrice={parseEther('1000')}
                  maxPrice={parseEther('1100')}
                  margin={{ top: 60, bottom: 20, left: 0, right: 30 }}
                />
              </div>
            </div>
          </div>
          <div className={'mt-6 mb-4'}>Get rewards from Time-Weaving</div>
          <div className='flex flex-col gap-4 hidden'>
            <div className='border border-gray-600 rounded-2xl p-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className={'text-2xl'}>Common</div>
                  <div className={'flex items-center'}>
                    Probability：<div className={'text-2xl'}>99.89%</div>
                  </div>
                </div>
                <div className={'w-[280px] flex justify-center'}>
                  <img src={'/tp-1.png'} alt={'tp'} width={246} height={100} />
                </div>
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
                <div className={'w-[280px] flex justify-center'}>
                  <img src={'/tp-2.png'} alt={'tp'} width={260} height={102} />
                </div>
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
                <div className={'w-[280px] flex justify-center'}>
                  <img src={'/tp-3.png'} alt={'tp'} width={280} height={100} />
                </div>
              </div>
            </div>
          </div>
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
