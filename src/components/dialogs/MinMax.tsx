import { displayBalance } from '@/utils/display'
import { calculateMidPriceFromBigInt } from '@/utils/price'
import { parseEther } from 'viem'

function checkInput(value: any) {
  if (value == undefined || value == null) return false
  try {
    parseEther(value)
  } catch (e) {
    return false
  }
  return true
}

export function MinMax({
  min,
  max,
  onChange,
  disableInput,
}: {
  min: `${number}`
  max: `${number}`
  onChange?: (min: `${number}`, max: `${number}`) => void
  disableInput?: boolean
}) {
  return (
    <div className='flex mb-6 justify-between'>
      <div className='px-6 h-[48px] rounded-full bg-white bg-opacity-5 flex items-center justify-center text-sm'>
        <div>Min</div>
        <input
          disabled={disableInput}
          type='text'
          value={min}
          className={'w-[90px] bg-transparent outline-0 text-center text-3xl font-semibold'}
          onChange={(e) => checkInput(e.target.value) && onChange && onChange(e.target.value as `${number}`, max)}
        />
        {/* <Image src={'/usdc.svg'} alt={'usdc'} width={20} height={20} /> */}
      </div>
      <div className='w-[120px] h-[48px] rounded-full bg-white bg-opacity-5 flex items-center justify-center text-xl'>
        {displayBalance(calculateMidPriceFromBigInt(parseEther(min || '0'), parseEther(max || '0')))}
      </div>
      <div className='px-6 h-[48px] rounded-full bg-white bg-opacity-5 flex items-center justify-center text-sm'>
        <div>Max</div>
        <input
          disabled={disableInput}
          type='text'
          value={max}
          className={'w-[90px] bg-transparent outline-0 text-center text-3xl font-semibold'}
          onChange={(e) => checkInput(e.target.value) && onChange && onChange(min, e.target.value as `${number}`)}
        />
        {/* <Image src={'/usdc.svg'} alt={'usdc'} width={20} height={20} /> */}
      </div>
    </div>
  )
}
