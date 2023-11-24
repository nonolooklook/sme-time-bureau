'use client'

import { Header } from '@/components/Header'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Bebas_Neue } from 'next/font/google'
import Image from 'next/image'
import { InputWithButton } from '@/components/InputWithButton'
import { Dot } from '@/components/icons/dot'
import { useTops } from '@/hooks/useTops'
import { displayBalance, ellipseAddress } from '@/utils/display'
import { CircleProgress } from '@/components/CircleProgress'
import { useCountdown } from '@/hooks/useCountdown'
import { Address, parseEther, parseUnits } from 'viem'
import { FetcherContext } from '@/contexts/FetcherContext'
import { useMint } from '@/hooks/useMint'
import { Spinner } from '@/components/Spinner'
import { toast } from 'sonner'
import { useApprove } from '@/hooks/useApprove'
import Link from 'next/link'
import { useQuantity } from '@/hooks/useQuantity'
import { useAvailableAmount } from '@/hooks/useAvailableAmount'
import { useOfficialAddress } from '@/hooks/useOfficialAddress'
import { ERC20_ADDRESS } from '@/config/erc20'
import { getCurrentChainId } from '@/config/contract'
import { erc20ABI, useContractRead } from 'wagmi'

export default function Page() {
  const { collateralBalance, totalMintedCount, mintedCount, allowance4nft, nftBalance, listedCount } = useContext(FetcherContext)
  const [amount, setAmount] = useState('1')
  const [scrollPosition, setScrollPosition] = useState(0)
  const { total, used } = useQuantity()

  const handleScroll = () => setScrollPosition(window.pageYOffset)
  const scrollTo = useCallback((i: number) => window.scrollTo({ left: 0, top: i === 0 ? 0 : i === 1 ? 660 : 1600, behavior: 'smooth' }), [])
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const index = scrollPosition < 660 ? 0 : scrollPosition > 1100 ? 2 : 1

  const { tops } = useTops()
  const [days, hours, minutes, seconds] = useCountdown(1701130328000)
  const { mint, isMintLoading } = useMint(amount, true, () => toast.success('Mint successfully'))
  const shouldApprove = allowance4nft < parseEther(amount as `${number}`) * 10n
  const { approve, isApproveLoading } = useApprove(() => {})
  const canMint = !!mint && !isMintLoading && mintedCount < 5

  console.log('You had minted: ', mintedCount, collateralBalance)

  const { availableAmount } = useAvailableAmount()

  const { remaining } = useQuantity()
  const { officialAddress } = useOfficialAddress()

  const { data: officialBalance } = useContractRead({
    address: ERC20_ADDRESS[getCurrentChainId()] as Address,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [officialAddress as Address],
    enabled: !!officialAddress,
  })

  return (
    <div
      className={'relative min-h-screen bg-no-repeat'}
      style={{ background: 'url(/capsule-bg.png)', backgroundSize: '100% 100%', backgroundPosition: 'center center' }}
    >
      <Header />
      <div className={'container mx-auto text-white pt-40 pb-36'}>
        <div className={'-mx-24'}>
          <div className='flex gap-10 mb-44'>
            <Image src={'/capsule-1.png'} alt={'capsule'} width={320} height={520} />
            <div>
              <div className={'capsule-title mb-3'}>Schrödinger`s Time Capsules</div>
              <div className={'capsule-desc mb-10'}>
                Schrödinger`s Time Capsule cost 10 USDC to mint. Each address can mint to 5 Time Capsules. Each time capsule can earn up to
                $1010 in Time-Weaving Privilege Trade. After Mint Schrödinger’s Time Capsule, you can sell Schrödinger’s Time Capsule to
                Stochastic Universe Time Management. You can also wait for the last Time Reset Trade. Alternatively, you can choose to trade
                with a co-builder on the Stochastic Universe trading market.
              </div>
              <div className={'grid grid-cols-2 gap-6 text-sm'}>
                <div>
                  <div className={'text-gray-200 mb-3'}>• Public mint</div>
                  <div className='flex gap-2 items-center mb-3'>
                    <Image src={'/timer.svg'} alt={'timer'} width={20} height={20} />
                    <div className='flex items-center'>
                      Start on: &nbsp; 18 <div className={'w-[1px] h-[8px] bg-gray-400 mx-2'} /> 10{' '}
                      <div className={'w-[1px] h-[8px] bg-gray-400 mx-2'} /> 2023
                      <div className={'w-[1px] h-[8px] bg-gray-400 mx-2'} />
                      8:00 (UTC)
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Image src={'/usdc.svg'} alt={'timer'} width={20} height={20} />
                    <div>Price: 10</div>
                  </div>
                </div>
                <div>
                  <div className={'text-gray-200 text-sm mb-3'}>• End countdown</div>
                  <div className={'flex gap-2'}>
                    <CircleProgress ratio={days / 30}>
                      <div className={'flex flex-col items-center justify-center h-full'}>
                        <div className={'text-lg -mb-1'}>{days}</div>
                        <div className={'text-xs text-gray-400'}>DAYS</div>
                      </div>
                    </CircleProgress>
                    <div className={'text-2xl mx-1 mt-3'}>:</div>
                    <CircleProgress ratio={hours / 24}>
                      <div className={'flex flex-col items-center justify-center h-full'}>
                        <div className={'text-lg -mb-1'}>{hours}</div>
                        <div className={'text-xs text-gray-400'}>HRS</div>
                      </div>
                    </CircleProgress>
                    <div className={'text-2xl mx-1 mt-3'}>:</div>
                    <CircleProgress ratio={minutes / 60}>
                      <div className={'flex flex-col items-center justify-center h-full'}>
                        <div className={'text-lg -mb-1'}>{minutes}</div>
                        <div className={'text-xs text-gray-400'}>MINS</div>
                      </div>
                    </CircleProgress>
                    <div className={'text-2xl mx-1 mt-3'}>:</div>
                    <CircleProgress ratio={seconds / 60}>
                      <div className={'flex flex-col items-center justify-center h-full'}>
                        <div className={'text-lg -mb-1'}>{seconds}</div>
                        <div className={'text-xs text-gray-400'}>SECS</div>
                      </div>
                    </CircleProgress>
                  </div>
                </div>
              </div>
              <div className={'text-gray-200 mb-3 mt-10'}>• Minted: {totalMintedCount} / 1000</div>
              <div className='border border-gray-400 rounded-full h-[24px] relative mb-8'>
                <div
                  className={`bg-gradient-to-r from-[#FFAC03aa] to-[#FFAC03ff] h-[22px] rounded-l-full`}
                  style={{ width: `${(totalMintedCount / total) * 100}%` }}
                ></div>
                <div
                  className={`w-[4px] rounded-full h-[36px] bg-primary absolute -top-2`}
                  style={{ left: `${(totalMintedCount / total) * 100}%` }}
                />
              </div>
              <div className='flex gap-10'>
                <InputWithButton amount={amount} setAmount={setAmount} />
                {shouldApprove && (
                  <button className={'btn-primary w-[140px]'} onClick={approve} disabled={!approve || isApproveLoading}>
                    {isApproveLoading && <Spinner />}
                    Approve
                  </button>
                )}
                {!shouldApprove && (
                  <button className={'btn-primary w-[140px]'} onClick={mint} disabled={!canMint}>
                    {isMintLoading && <Spinner />}
                    Mint
                  </button>
                )}
              </div>
            </div>
            <div className={'w-[260px] grow shrink-0 pl-14'}>
              <div className='fixed'>
                <div className={'w-[1px] h-[520px] bg-white -mt-20 absolute'}></div>
                <div className={`sidebar-item ${index === 0 ? 'active' : ''} mb-16`} onClick={() => scrollTo(0)}>
                  <div className='flex items-center'>
                    <Dot />
                    <div className={'bar'} />
                  </div>
                  <div className={'ml-2'}>
                    <div className={'mb-3'}>Mint Time Capsules</div>
                    <div>Start on</div>
                    <div>18/11/2023 8:00(UTC)</div>
                  </div>
                </div>

                <div className={`sidebar-item mb-16 ${index === 1 ? 'active' : ''}`} onClick={() => scrollTo(1)}>
                  <div className='flex items-center'>
                    <Dot />
                    <div className={'bar'} />
                  </div>
                  <div className={'ml-2'}>
                    <div className={'mb-3'}>Time-Weaving Privilege Trade</div>
                    <div>Start on</div>
                    <div>18/10/2023 8:00(UTC)</div>
                  </div>
                </div>

                <div className={`sidebar-item ${index === 2 ? 'active' : ''}`} onClick={() => scrollTo(2)}>
                  <div className='flex items-center'>
                    <Dot />
                    <div className={'w-[60px] h-[1px] -ml-6 bg-gradient-to-r from-[#ffffff22] to-[#fff]'}></div>
                  </div>
                  <div className={'ml-2'}>
                    <div className={'mb-3'}>Time Reset Trade</div>
                    <div>Start on</div>
                    <div>18/10/2023 8:00(UTC)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex mb-40 gap-10'>
            <div>
              <div className={'capsule-title mb-8'}>Time-Weaving Privilege Trade (Not started yet)</div>
              <div className={'capsule-desc mb-8'}>
                After the event, Stochastic Universe will retrieve all Schrödinger`s Time Capsules at a fixed price, i.e. Time Reset Trade.
              </div>
              <div className={'text-gray-200 text-sm mb-3'}>• End countdown</div>
              <div className={'flex gap-2'}>
                <CircleProgress ratio={0.3}>
                  <div className={'flex flex-col items-center justify-center h-full'}>
                    <div className={'text-lg -mb-1'}>03</div>
                    <div className={'text-xs text-gray-400'}>DAYS</div>
                  </div>
                </CircleProgress>
                <div className={'text-2xl mx-1 mt-3'}>:</div>
                <CircleProgress ratio={10 / 24}>
                  <div className={'flex flex-col items-center justify-center h-full'}>
                    <div className={'text-lg -mb-1'}>10</div>
                    <div className={'text-xs text-gray-400'}>HRS</div>
                  </div>
                </CircleProgress>
                <div className={'text-2xl mx-1 mt-3'}>:</div>
                <CircleProgress ratio={42 / 60}>
                  <div className={'flex flex-col items-center justify-center h-full'}>
                    <div className={'text-lg -mb-1'}>42</div>
                    <div className={'text-xs text-gray-400'}>MINS</div>
                  </div>
                </CircleProgress>
                <div className={'text-2xl mx-1 mt-3'}>:</div>
                <CircleProgress ratio={18 / 60}>
                  <div className={'flex flex-col items-center justify-center h-full'}>
                    <div className={'text-lg -mb-1'}>18</div>
                    <div className={'text-xs text-gray-400'}>SECS</div>
                  </div>
                </CircleProgress>
              </div>
              <div className={'text-gray-200 mb-3 mt-10'}>
                • Used: {used} / {total}
              </div>
              <div className='border border-gray-400 rounded-full h-[24px] relative mb-8'>
                <div
                  className={`bg-gradient-to-r from-[#FFAC03aa] to-[#FFAC03ff] h-[22px] rounded-l-full`}
                  style={{ width: `${(used / total) * 100}%` }}
                ></div>
                <div className={`w-[4px] rounded-full h-[36px] bg-primary absolute -top-2`} style={{ left: `${(used / total) * 100}%` }} />
              </div>
              <div className='flex gap-10 items-center'>
                <Link
                  href={'/trade?type=privilege'}
                  className={
                    'bg-primary flex items-center justify-center rounded-full w-[160px] text-2xl text-center shadow shadow-amber-400 shadow-2xl h-[48px] font-semibold'
                  }
                >
                  TRADE
                </Link>
                <div className={'bg-white bg-opacity-30 rounded-full flex items-center justify-center px-6 h-[30px] text-gray-300'}>
                  You have {availableAmount} capsules
                </div>
              </div>
            </div>

            <div
              className={'w-[350px] grow shrink-0 bg-no-repeat p-[1px]'}
              style={{ backgroundImage: 'url(/capsule-2.png)', backgroundSize: '100% 100%' }}
            >
              <div className={'bg-black bg-opacity-70 px-6 py-4 rounded-2xl'}>
                <div className={'text-[20px] mb-4'}>Top 10 winnings</div>
                <div className='flex flex-col gap-2'>
                  {tops?.map((top) => (
                    <div className={'bg-white bg-opacity-10 px-3 py-1 flex items-center justify-between'} key={top.orderHash}>
                      {ellipseAddress(top?.orderHash, 6)}
                      <div className={'text-primary'}>${Number(top?.price)?.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={'w-[260px] grow shrink-0'}></div>
          </div>

          <div className='flex gap-2'>
            <div className={'w-[460px]'}>
              <Image src={'/capsule-1.png'} alt={'capsule'} width={320} height={520} className={'-rotate-90'} />
            </div>
            <div>
              <div className={'text-[38px] w-[540px] mb-8'}>Time Reset Trade (Not started yet)</div>
              <div className={'text-sm text-gray-400 mb-8'}>Time-Weaving Privilege Trade will be followed by a Time Reset Trade.</div>
              <div className={'text-gray-200 mb-3 mt-10 flex flex-col gap-2'}>
                <div className='flex items-center'>
                  • Fund pool:
                  <Image src={'/usdc.svg'} alt={'timer'} width={20} height={20} className={'mx-2'} />
                  <div className={'text-xl text-white'}>{displayBalance(officialBalance)}</div>
                </div>
                <div className='flex items-center'>
                  • Unused capsules:
                  <div className={'text-xl text-white ml-2'}>{remaining}</div>
                </div>
                <div className='flex items-center'>
                  • Real-price:
                  <Image src={'/usdc.svg'} alt={'timer'} width={20} height={20} className={'mx-2'} />
                  <div className={'text-xl text-white'}>
                    {!!officialBalance && !!remaining ? displayBalance(officialBalance / BigInt(remaining)) : '0.00'}
                  </div>
                </div>
              </div>
              <div className='flex gap-10 mt-12 items-center'>
                <button
                  className={
                    'bg-primary rounded-full w-[160px] text-2xl text-center shadow shadow-amber-400 shadow-2xl h-[48px] font-semibold'
                  }
                >
                  SELL
                </button>
                <div className={'bg-white bg-opacity-30 rounded-full flex items-center justify-center px-6 h-[30px] text-gray-300'}>
                  You have {availableAmount} capsules
                </div>
              </div>
            </div>
            <div className={'w-[260px] grow shrink-0'} />
          </div>
        </div>
      </div>
    </div>
  )
}
