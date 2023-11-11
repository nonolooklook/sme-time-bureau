import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import Image from 'next/image'
import { BetaD3Chart } from '@/components/BetaD3Chart'
import { parseEther } from 'viem'
import { InputWithButton } from '@/components/InputWithButton'
import { useState } from 'react'

export const SaleDialog = ({ open, onChange }: { open: boolean; onChange: any }) => {
  const [min, setMin] = useState<`${number}`>('8')
  const [max, setMax] = useState<`${number}`>('10')

  const [amount, setAmount] = useState('1')
  return (
    <Dialog.Root open={open} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content'>
          <div className='flex items-center justify-between mb-6'>
            <div className='dialog-title'>Approve sale</div>
            <Dialog.Close asChild>
              <button className='IconButton' aria-label='Close'>
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>
          <div className='flex bg-[#282828] rounded-xl px-8 py-4 gap-4'>
            <Image src={'/capsule-1.png'} alt={'capsule'} width={50} height={100} />
            <div className={'w-full text-gray-300'}>
              <div className={'text-lg font-light flex items-center justify-between mb-2'}>
                Schrödinger`s time capsules
                <div className='flex text-2xl font-semibold ml-auto gap-1'>
                  <Image src={'/usdc.svg'} alt={'usdc'} width={28} height={28} />
                  9.32
                </div>
              </div>
              <div className={'text-lg font-light flex items-center justify-between'}>
                Stochastic Universe
                <div>Market price</div>
              </div>
            </div>
          </div>

          <div className={'-mt-6'}>
            <BetaD3Chart minPrice={parseEther(min)} expectedPrice={parseEther('9')} maxPrice={parseEther(max)} />
          </div>
          <div className='flex justify-center mb-6'>
            <div className='w-[120px] h-[48px] rounded-full bg-white bg-opacity-5 flex items-center justify-center text-xl'>9</div>
          </div>
          <div className='flex text-2xl font-light bg-white bg-opacity-5 rounded-2xl h-[64px] justify-between flex items-center px-6'>
            <div>Quantity</div>
            <InputWithButton amount={amount} setAmount={setAmount} />
            <div>20 USDC</div>
          </div>
          <div className='my-3 text-gray-400 pl-4 text-sm flex justify-between'>
            <div className={'text-white'}>Total price maximum: 20 USDC</div>
            Transaction fees：0.5%
          </div>
          <div className='flex justify-center'>
            <button className={'btn-primary w-[100px]'}>Accept</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
