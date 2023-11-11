import React, { useState } from 'react'
import { PrivilegeTrade } from '@/components/dialogs/PrivilegeTrade'

const data = Array.from(Array(30)).map((n, i) => ({
  price: i / 10 + 8,
  bidAmount: 30 - i,
  listAmount: i + 2,
}))

export const PriceChart = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <PrivilegeTrade open={open} onChange={setOpen} />
      <div className='flex'>
        <div className={'w-[60px] flex flex-col justify-between pb-6 text-gray-400'}>
          <div>60.00</div>
          <div>50.00</div>
          <div>40.00</div>
          <div>30.00</div>
          <div>20.00</div>
          <div>10.00</div>
          <div>0.0</div>
        </div>
        <div className={'grow'}>
          <div className='flex'>
            {data?.map((d, i) => (
              <div className={'w-[3.3%] grid grid-cols-2'} key={i}>
                <div className={'flex gap-1 flex-col-reverse cursor-pointer'} onClick={() => setOpen(true)}>
                  {Array.from(Array(d.bidAmount)).map((i) => (
                    <div className={'h-[3px] w-full bg-green-400'} key={i} />
                  ))}
                </div>
                <div className={'flex flex-col-reverse gap-1 cursor-pointer'}>
                  {Array.from(Array(d.listAmount)).map((i) => (
                    <div className={'h-[2px] w-full bg-red-400'} key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className='flex mt-2'>
            {data?.map((d, i) => (
              <div className={'w-[3.3%] text-center text-gray-400'} key={i}>
                {d.price}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
