import { MinusIcon, PlusIcon } from '@radix-ui/react-icons'

export const InputWithButton = ({ amount, setAmount }: { amount: string; setAmount: any }) => {
  return (
    <div className='flex items-center gap-2'>
      <div
        className={'w-[46px] h-[46px] flex items-center justify-center border border-gray-400 border-dotted rounded-full cursor-pointer'}
        onClick={() => setAmount((Number(amount) - 1).toString())}
      >
        <MinusIcon />
      </div>

      <input
        type='text'
        value={amount}
        className={'w-[80px] bg-transparent outline-0 text-center text-3xl font-semibold'}
        onChange={(e) => setAmount(e.target.value)}
      />

      <div
        className={'w-[46px] h-[46px] flex items-center justify-center border border-gray-400 border-dotted rounded-full cursor-pointer'}
        onClick={() => setAmount((Number(amount) + 1).toString())}
      >
        <PlusIcon />
      </div>
    </div>
  )
}
