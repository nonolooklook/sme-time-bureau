'use client'

import { Header } from '@/components/Header'
import { PriceChart } from '@/components/PriceChart'
import { BuyDialog } from '@/components/dialogs/Buy'
import { ListForSale } from '@/components/dialogs/ListForSale'
import { PlaceABid } from '@/components/dialogs/PlaceABid'
import { PrivilegeTrade } from '@/components/dialogs/PrivilegeTrade'
import { SaleDialog } from '@/components/dialogs/Sale'
import { ERROR_FILL_SELF_ORDER } from '@/config/error'
import { FetcherContext } from '@/contexts/FetcherContext'
import { useOrders } from '@/hooks/useOrders'
import { displayBalance } from '@/utils/display'
import {
  getBidOrderMaxPrice,
  getBidOrderMinPrice,
  getExpectPrice,
  getListOrderMaxPrice,
  getListOrderMinPrice,
  getOrderPerMinMaxBigint,
  isPrivilegeOrder,
  isSelfMaker,
} from '@/utils/order'
import { calculateMidPrice, displayTradePrice } from '@/utils/price'
import * as HoverCard from '@radix-ui/react-hover-card'
import { Cross2Icon } from '@radix-ui/react-icons'
import classNames from 'classnames'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContext, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'ts-cookies'
import { useInterval } from 'usehooks-ts'

export default function Page() {
  const { currentPrice } = useContext(FetcherContext)
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const [privilege, setPrivilege] = useState<{ order: any; count: number; type?: '1' | '3' } | undefined>()
  const [openBid, setOpenBid] = useState(false)
  const [openList, setOpenList] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState(0)
  const [selectedIsBid, setSelectedIsBid] = useState(true)

  const [openBuy, setOpenBuy] = useState(false)
  const [openSale, setOpenSale] = useState(false)
  const [selected, setSelected] = useState<any>({ min: '8', max: '10', mid: '9', count: 1 })

  const { orders: listOrders, mutate: mutateList } = useOrders(false)
  const { orders: bidOrders, mutate: mutateBid } = useOrders(true)
  const [index, setIndex] = useState(0)

  const finalBidOrders =
    selectedPrice > 0
      ? bidOrders.filter((o: any) => getBidOrderMinPrice(o) < selectedPrice && getBidOrderMaxPrice(o) > selectedPrice)
      : bidOrders
  const finalListOrders =
    selectedPrice > 0
      ? listOrders.filter((o: any) => getListOrderMinPrice(o) < selectedPrice && getListOrderMaxPrice(o) > selectedPrice)
      : listOrders

  useInterval(() => {
    if (type === 'privilege1') {
      const privilegeOrder = bidOrders?.find((item) => {
        const [min, max] = getOrderPerMinMaxBigint(item.entry)
        return item.type === '3' && min == max
      })
      if (privilegeOrder && !privilege) {
        const [min, max] = getOrderPerMinMaxBigint(privilegeOrder.entry)
        const count = privilegeOrder?.entry?.parameters?.consideration?.[0]?.startAmount
        setOpenSale(true)
        setSelected({
          min: displayBalance(min),
          max: displayBalance(max),
          mid: displayBalance(getExpectPrice(min, max)),
          count: count?.toString(),
          order: privilegeOrder,
        })
        router.push('/trade')
      }
    }
    if (type === 'privilege') {
      const privilegeOrder = bidOrders?.find((item) => {
        const [min, max] = getOrderPerMinMaxBigint(item.entry)
        return item.type === '3' && min != max
      })
      if (privilegeOrder && !privilege) {
        setPrivilege({ order: privilegeOrder, count: privilegeOrder.remainingQuantity })
        router.push('/trade')
      }
    }
  }, 500)

  return (
    <div
      className={'relative min-h-screen'}
      style={{
        background: 'url(/trade-bg.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <Header />
      <BuyDialog open={openBuy} onChange={setOpenBuy} selected={selected} />
      <SaleDialog open={openSale} onChange={setOpenSale} selected={selected} />

      <div className={'container mx-auto text-white pt-40 pb-36'}>
        <div className='flex items-center'>
          <Image src={'/capsule-1.png'} alt={'capsule'} width={88} height={120} />
          <div className={'text-[38px] font-semibold ml-8 text-gray-200 uppercase'}>Schrödinger`s Time Capsules / USDC</div>
          <div className='flex items-center text-2xl gap-2 ml-auto'>
            {/* <Image src={'/usdc.svg'} alt={'usdc'} width={24} height={24} /> */}
            {'$ ' + currentPrice}
          </div>
        </div>
        <div className='grid grid-cols-2 gap-8 mt-10'>
          <div>
            <div className='flex gap-2 text-xl font-semibold mb-4'>
              <Image src={'/bid-icon.svg'} alt={'capsule'} width={24} height={24} />
              BIDS
            </div>
            <div className='trade-card'>
              <div className='grid grid-cols-4 text-gray-400'>
                <div>Quantity</div>
                <div className={'text-center'}>Max Price</div>
                <div className={'text-center'}>Min Price</div>
                <div className={'text-right'}>Expected Price</div>
              </div>
              <div className={'h-[1px] w-full bg-gray-500 my-6'} />
              <div className='flex flex-col gap-4 h-[424px] overflow-y-auto'>
                {finalBidOrders?.map((order) => {
                  const minP = order?.entry?.parameters?.offer?.[0]?.startAmount
                  const maxP = order?.entry?.parameters?.offer?.[0]?.endAmount

                  const mid = calculateMidPrice(minP, maxP)

                  let count = BigInt(order?.entry?.parameters?.consideration?.[0]?.startAmount)
                  count = count === 0n ? 1n : count
                  const realMid = mid / count
                  const wc = `${50 * order?.remainingQuantity}px`
                  const isPrivilege = isPrivilegeOrder(order.entry)
                  const isSelf = isSelfMaker(order?.entry)

                  return (
                    <HoverCard.Root data-side={'right'} data-align={'end'} openDelay={200} key={order?.hash}>
                      <HoverCard.Trigger asChild>
                        <div
                          className={'relative py-1 cursor-pointer'}
                          key={order?.hash}
                          onClick={() => {
                            if (isSelf) return toast.error(ERROR_FILL_SELF_ORDER)
                            if (isPrivilege) {
                              setPrivilege({ order, count: order?.remainingQuantity })
                              return
                            }
                            setOpenSale(true)
                            setSelected({
                              min: displayBalance(BigInt(minP) / count),
                              max: displayBalance(BigInt(maxP) / count),
                              mid: displayBalance(realMid),
                              count: count?.toString(),
                              order: order,
                            })
                          }}
                        >
                          <div className={classNames('grid grid-cols-4', isSelf ? 'text-orange-300' : 'text-gray-200')}>
                            <div className='whitespace-nowrap'>
                              {order?.remainingQuantity}{' '}
                              {isPrivilege && <span className=' bg-red-500 text-white rounded-full px-2 scale-75 inline-block'>Official</span>}
                            </div>
                            <div className={'text-center'}>{displayTradePrice(BigInt(maxP) / count)}</div>
                            <div className={'text-center'}>{displayTradePrice(BigInt(minP) / count)}</div>
                            <div className={'text-right pr-2'}>{isPrivilege ? '$8.19' : displayTradePrice(realMid)}</div>
                          </div>
                          <div className={`absolute h-[28px] bg-green-400 bg-opacity-30 top-0 right-0 -z-[1]`} style={{ width: wc }} />
                        </div>
                      </HoverCard.Trigger>
                      <HoverCard.Portal>
                        <HoverCard.Content
                          className={`bg-white p-4 rounded-2xl ${Cookies.get('trade-tutorial') === 'true' ? 'hidden' : ''}`}
                        >
                          <HoverCard.Arrow />
                          <div className={'text-center'}>Click on the order to trade</div>
                          <div
                            className={'text-center underline cursor-pointer'}
                            onClick={() => {
                              Cookies.set('trade-tutorial', 'true')
                              setIndex(index + 1)
                            }}
                          >
                            Got it
                          </div>
                        </HoverCard.Content>
                      </HoverCard.Portal>
                    </HoverCard.Root>
                  )
                })}
              </div>
              <div className='flex justify-center'>
                <button className={'btn-primary mt-8 w-[160px] opacity-90 cursor-pointer'} onClick={() => setOpenBid(true)}>
                  Place a bid
                </button>
                <PlaceABid open={openBid} onChange={setOpenBid} mutate={mutateBid} />
              </div>
            </div>
          </div>
          <div>
            <div className='flex gap-2 text-xl font-semibold mb-4'>
              <Image src={'/list-icon.svg'} alt={'capsule'} width={24} height={24} />
              LISTING
            </div>
            <div className='trade-card'>
              <div className='grid grid-cols-4 text-gray-400'>
                <div>Expected Price</div>
                <div className={'text-center'}>Min Price</div>
                <div className={'text-center'}>Max Price</div>
                <div className={'text-right'}>Quantity</div>
              </div>
              <div className={'h-[1px] w-full bg-gray-500 my-6'} />
              <div className='flex flex-col gap-4 h-[424px] overflow-y-auto'>
                {finalListOrders?.map((order) => {
                  const csd = order?.entry?.parameters?.consideration
                  const minp = csd?.reduce((amount: string, cv: any) => (BigInt(cv?.startAmount) + BigInt(amount)).toString(), '0')
                  const maxp = csd?.reduce((amount: string, cv: any) => (BigInt(cv?.endAmount) + BigInt(amount)).toString(), '0')
                  const mid = calculateMidPrice(minp, maxp)
                  let count = BigInt(order?.entry?.parameters?.offer?.[0]?.startAmount)
                  count = count === 0n ? 1n : count
                  const realMid = mid / count
                  const wc = `${50 * order?.remainingQuantity}px`
                  const isSelf = isSelfMaker(order?.entry)
                  return (
                    <HoverCard.Root data-side={'right'} data-align={'end'} openDelay={200} key={order?.hash}>
                      <HoverCard.Trigger asChild>
                        <div
                          className={'relative py-1 cursor-pointer'}
                          onClick={() => {
                            if (isSelf) return toast.error(ERROR_FILL_SELF_ORDER)
                            if (order?.type === '3') {
                              return
                            }
                            setOpenBuy(true)
                            setSelected({
                              min: displayBalance(BigInt(minp) / count),
                              max: displayBalance(BigInt(maxp) / count),
                              mid: displayBalance(realMid),
                              count: count?.toString(),
                              order: order,
                            })
                          }}
                          key={order?.hash}
                        >
                          <div className={classNames('grid grid-cols-4', isSelf ? 'text-orange-300' : 'text-gray-200')}>
                            <div className={'pl-2'}>{displayTradePrice(realMid)}</div>
                            <div className={'text-center'}>{displayTradePrice(BigInt(minp) / count)}</div>
                            <div className={'text-center'}>{displayTradePrice(BigInt(maxp) / count)}</div>
                            <div className={'text-right'}>{order?.remainingQuantity}</div>
                          </div>
                          <div className='absolute -z-[1] h-[28px] bg-red-400 bg-opacity-30 top-0 left-0' style={{ width: wc }} />
                        </div>
                      </HoverCard.Trigger>
                      <HoverCard.Portal>
                        <HoverCard.Content
                          className={`bg-white p-4 rounded-2xl ${Cookies.get('trade-tutorial') === 'true' ? 'hidden' : ''}`}
                        >
                          <HoverCard.Arrow />
                          <div className={'text-center'}>Click on the order to trade</div>
                          <div
                            className={'text-center underline cursor-pointer'}
                            onClick={() => {
                              Cookies.set('trade-tutorial', 'true')
                              setIndex(index + 1)
                            }}
                          >
                            Got it
                          </div>
                        </HoverCard.Content>
                      </HoverCard.Portal>
                    </HoverCard.Root>
                  )
                })}
              </div>
              <div className='flex justify-center'>
                <button className={'btn-primary mt-8 w-[160px] opacity-90 cursor-pointer'} onClick={() => setOpenList(true)}>
                  List for sale
                </button>
                <ListForSale open={openList} onChange={setOpenList} mutate={mutateList} />
              </div>
            </div>
          </div>
        </div>
        <div className='trade-card mt-8'>
          <div className='flex justify-between'>
            <div className={'border border-green-400 px-4 flex items-center font-semibold text-green-400 h-[28px] rounded-full'}>Bids</div>
            {selectedPrice > 0 && (
              <div className={'rounded-full px-6 bg-gray-700 flex items-center font-semibold gap-2 text-base'}>
                <svg width='20' height='21' viewBox='0 0 20 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M9.37476 8.46118V10.0612C8.77476 9.91119 8.37476 9.56951 8.37476 9.26118C8.37476 8.94451 8.77476 8.60285 9.37476 8.46118Z'
                    fill='white'
                  />
                  <path
                    d='M11.625 12.2629C11.625 12.5712 11.225 12.9129 10.625 13.0629V11.4629C11.225 11.6046 11.625 11.9462 11.625 12.2629Z'
                    fill='white'
                  />
                  <path
                    d='M15.7417 5.00918C14.2083 3.47496 12.1667 2.63281 10 2.63281C7.83333 2.63281 5.79167 3.47496 4.25833 5.00918C2.71667 6.5434 1.875 8.58624 1.875 10.7625C1.875 11.8298 2.08333 12.8804 2.49167 13.8726C2.9 14.8649 3.5 15.7487 4.25833 16.5075C5.00833 17.2662 5.9 17.8582 6.89167 18.2668C7.88333 18.6837 8.925 18.8922 10 18.8922C11.075 18.8922 12.1167 18.6837 13.1083 18.2668C14.1 17.8582 14.9917 17.2662 15.7417 16.5075C16.5 15.7487 17.1 14.8649 17.5083 13.8726C17.9167 12.8804 18.125 11.8298 18.125 10.7625C18.125 8.58624 17.2833 6.5434 15.7417 5.00918ZM10.625 14.3396V14.5147C10.625 14.8565 10.3417 15.14 10 15.14C9.65833 15.14 9.375 14.8565 9.375 14.5147V14.3312C8.64167 14.2145 7.99167 13.8976 7.575 13.4224C7.39167 13.2056 7.375 12.8887 7.54167 12.6552C7.70833 12.4134 8.00833 12.3301 8.275 12.4301L9.375 12.847V11.3295C8.075 11.1294 7.125 10.2872 7.125 9.26163C7.125 8.2277 8.075 7.39389 9.375 7.18543V7.01033C9.375 6.66013 9.65833 6.38497 10 6.38497C10.3417 6.38497 10.625 6.66013 10.625 7.01033V7.18543C11.3583 7.3105 12.0083 7.62736 12.425 8.09429C12.6083 8.31108 12.625 8.62793 12.4583 8.86974C12.3417 9.0365 12.15 9.13656 11.95 9.13656C11.875 9.13656 11.8 9.11988 11.725 9.09487L10.625 8.66962V10.1872C11.925 10.3873 12.875 11.2294 12.875 12.2634C12.875 13.2973 11.925 14.1311 10.625 14.3396Z'
                    fill='white'
                  />
                </svg>
                Price: {selectedPrice}{' '}
                <Cross2Icon
                  className={'cursor-pointer'}
                  onClick={() => {
                    setSelectedPrice(0)
                  }}
                />
              </div>
            )}
            <div className={'border border-red-400 px-4 flex items-center font-semibold text-red-400 h-[28px] rounded-full'}>Listing</div>
          </div>
          <div className={'mt-6'}>
            <PriceChart
              selectedPrice={selectedPrice}
              selectedIsBid={selectedIsBid}
              setSelectedIsBid={setSelectedIsBid}
              setSelectedPrice={setSelectedPrice}
            />
          </div>
        </div>
        {privilege && (
          <PrivilegeTrade
            type={privilege.type}
            order={privilege.order}
            open={true}
            onChange={(open: boolean) => !open && setPrivilege(undefined)}
            maxCount={privilege.count}
          />
        )}
      </div>
    </div>
  )
}
