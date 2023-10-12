import Image from 'next/image'
import { InputWithButton } from '@/components/InputWithButton'
import { BetaD3Chart } from '@/components/BetaD3Chart'
import { PriceInput } from '@/components/PriceInput'
import { useState } from 'react'

export const PlaceBid = () => {
  const [min, setMin] = useState('0.96')
  const [max, setMax] = useState('1.2')
  const [amount, setAmount] = useState('1')

  return (
    <>
      <div className='flex items-start gap-10 card-shadow rounded-xl'>
        <div className='w-[520px] bg-primary bg-opacity-5 rounded-l-xl grow shrink-0'>
          <Image src={'/demo-1.png'} alt={'demo'} width={260} height={420} className={'mt-10 mx-auto mb-6'} />
          <div className='flex justify-center gap-14'>
            <div>
              <div className={'text-gray-600 mb-6 text-center'}>Real-time Fair Price</div>
              <div className={'text-4xl font-semibold text-center'}>$ 9.32</div>
            </div>
            <div>
              <div className={'text-gray-600 mb-6 text-center'}>Set the quantity you want</div>
              <InputWithButton amount={amount} setAmount={setAmount} />
            </div>
          </div>

          <button className={'btn btn-outline mx-auto mt-12 mb-10'}>Duration continues until the end of the event</button>
        </div>

        <div className={'px-10 py-8 w-full'}>
          <div className='text-2xl'>Set the price range per NFT</div>
          <BetaD3Chart minPrice={1n} expectedPrice={2n} maxPrice={3n} />

          <div className={'grid grid-cols-2 gap-4'}>
            <div className='col-span-1'>
              <PriceInput title={'Min'} value={min} setValue={setMin} minimum={'0'} maximum={max} />
            </div>

            <div className='col-span-1'>
              <PriceInput title={'Max'} value={max} setValue={setMax} minimum={min} maximum={'10000000000000'} />
            </div>
          </div>

          <div className={'text-center font-semibold my-8'}>Authorization required for $22.7</div>
          <button className={'btn btn-primary w-full'}>Place a bid</button>
        </div>
      </div>
    </>
  )
}
