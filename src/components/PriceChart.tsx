import React, { useMemo, useState } from 'react'
import { PrivilegeTrade } from '@/components/dialogs/PrivilegeTrade'
import { useOrderDistribution } from '@/hooks/useOrderDistribution'

export const PriceChart = ({
  selectedPrice,
  selectedIsBid,
  setSelectedIsBid,
  setSelectedPrice,
}: {
  selectedPrice: number
  selectedIsBid: boolean
  setSelectedIsBid: any
  setSelectedPrice: any
}) => {
  const { orders } = useOrderDistribution()
  const [open, setOpen] = useState(false)

  const lists: any[] = orders?.listExpectationList
  const bids: any[] = orders?.bidExpectationList
  const minPrice = orders?.minPrice ?? 0
  const maxPrice = orders?.maxPrice ?? 0

  const bidMaxY = !!bids
    ? bids?.reduce((max: number, cv: { expectation: number }) => (cv?.expectation > max ? cv?.expectation : max), 0)
    : 0
  const listMaxY = !!lists
    ? lists?.reduce((max: number, cv: { expectation: number }) => (cv?.expectation > max ? cv?.expectation : max), 0)
    : 0

  const maxValue = bidMaxY > listMaxY ? bidMaxY : listMaxY

  const data: any[] = []
  if (maxPrice !== 0) {
    for (let i = minPrice; i <= maxPrice; i = parseFloat((i + 0.1).toFixed(1))) {
      // @ts-ignore
      const bp = bids?.find((l: any) => l.price === i)?.expectation ?? 0
      // @ts-ignore
      const lp = lists?.find((l: any) => l.price === i)?.expectation ?? 0
      data.push({
        price: i,
        bidAmount: Math.floor((bp * 30) / bidMaxY),
        listAmount: Math.floor((lp * 30) / listMaxY),
      })
    }
  }

  const step = maxValue / 5
  const values = useMemo(() => Array.from({ length: 6 }, (_, index) => Math.round(index * step * 100) / 100).reverse(), [step])
  console.log(values)

  return (
    <>
      <div className='flex'>
        <div className={'w-[36px] flex flex-col justify-between pb-6 text-gray-400 text-xs'}>
          {values?.map((v, i) => <div key={i}>{v}</div>)}
        </div>
        <div className={'grow'}>
          <div className='flex'>
            {data?.map((d, i) => (
              <div className={'w-[3.3%] grid grid-cols-2'} key={i}>
                <div
                  className={`flex gap-1 flex-col-reverse cursor-pointer`}
                  onClick={() => {
                    setSelectedPrice(d.price)
                    setSelectedIsBid(true)
                  }}
                >
                  {d.bidAmount > 0 &&
                    Array.from(Array(d.bidAmount)).map((i) => (
                      <div className={`h-[3px] w-full ${selectedPrice === d.price ? 'bg-white' : 'bg-green-400'}`} key={i} />
                    ))}
                </div>
                <div
                  className={'flex flex-col-reverse gap-1 cursor-pointer'}
                  onClick={() => {
                    setSelectedPrice(d.price)
                    setSelectedIsBid(false)
                  }}
                >
                  {d.listAmount > 0 &&
                    Array.from(Array(d.listAmount)).map((i) => (
                      <div className={`h-[2px] w-full ${selectedPrice === d.price ? 'bg-white' : 'bg-red-400'}`} key={i} />
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className='flex mt-2'>
            {data?.map((d, i) => (
              <div className={'w-[2%] text-center text-[10px] text-gray-400'} key={i}>
                {d.price}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
