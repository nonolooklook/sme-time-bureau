import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import Image from 'next/image'
import { BetaD3Chart } from '@/components/BetaD3Chart'
import { parseEther } from 'viem'
import { InputWithButton } from '@/components/InputWithButton'
import { useEffect, useState } from 'react'
import { CapsuleCard } from '@/components/dialogs/CapsuleCard'

export const SaleDialog = ({ open, onChange, selected }: { open: boolean; onChange: any; selected: any }) => {
  const [amount, setAmount] = useState('1')
  useEffect(() => setAmount(selected?.count?.toString()), [selected])

  return (
    <Dialog.Root open={open} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content w-[660px]'>
          <div className='flex items-center justify-between mb-6'>
            <div className='dialog-title'>Approve sale</div>
            <Dialog.Close asChild>
              <button className='IconButton' aria-label='Close'>
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>
          <CapsuleCard />

          <div className={'-mt-6'}>
            <BetaD3Chart
              minPrice={parseEther(selected?.min)}
              expectedPrice={parseEther(selected?.mid)}
              maxPrice={parseEther(selected?.max)}
            />
          </div>
          <div className='flex justify-center mb-6'>
            <div className='w-[120px] h-[48px] rounded-full bg-white bg-opacity-5 flex items-center justify-center text-xl'>
              {selected?.mid}
            </div>
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
          <div className='flex justify-center mb-4 mt-6'>
            <button className={'btn-primary w-[100px]'}>Accept</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
