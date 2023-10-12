import Image from 'next/image'

export const PortfolioAvailable = () => {
  return (
    <div className={'flex gap-10'}>
      <Image src={'/demo-1.png'} alt={'demo'} width={300} height={400} />
      <div className={'flex flex-col'}>
        <div className='flex text-2xl gap-2 mb-4'>
          <Image src={'/list.png'} alt={'list'} width={32} height={32} className={'rounded-full'} />8
        </div>
        <div className={'text-gray-600'}>Quantity</div>
        <div className='divider' />
        <div className='flex text-2xl gap-2 mb-4'>
          <Image src={'/bid.png'} alt={'list'} width={32} height={32} className={'rounded-full'} />
          9.32
        </div>
        <div className={'text-gray-600'}>Real-time Fair Price</div>
        <button className={'btn btn-primary w-[200px] mt-auto'}>List for sell</button>
      </div>
    </div>
  )
}
