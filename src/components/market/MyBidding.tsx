import Image from 'next/image'
import { InputWithButton } from '@/components/InputWithButton'
import { BetaD3Chart } from '@/components/BetaD3Chart'
import { PriceInput } from '@/components/PriceInput'
import { useState } from 'react'

export const MyBidding = () => {
  const [min, setMin] = useState('0.96')
  const [max, setMax] = useState('1.2')
  const [amount, setAmount] = useState('1')

  return (
    <>
      <div className='gap-10 card-shadow rounded-xl p-8'>
        <div className='flex w-full text-gray-500 mb-8'>
          <div className='w-1/6'>Order</div>
          <div className='w-1/6'>Quantity</div>
          <div className='w-1/6'>Min</div>
          <div className='w-1/6'>Expected</div>
          <div className='w-1/6'>Max</div>
        </div>
        <div className={'flex flex-col gap-6'}>
          {Array.from(Array(3)).map((_, i) => (
            <div key={i}>
              <div className='flex w-full text-gray-900'>
                <div className='w-1/6'>{i + 1}</div>
                <div className='w-1/6'>3</div>
                <div className='w-1/6'>$9.23</div>
                <div className='w-1/6'>$10.23</div>
                <div className='w-1/6'>$11.23</div>
                <div>
                  <button className={'btn btn-primary'}>Cancel</button>
                </div>
              </div>
              <div className='divider' />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
