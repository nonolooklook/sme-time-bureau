import Image from 'next/image'
import { Address, useAccount, useContractReads } from 'wagmi'
import { NFTContractAddress } from '@/config/contract'
import { ERC1155ABI } from '@/config/abi/ERC1155'
import Link from 'next/link'

export const PortfolioAvailable = () => {
  const { address } = useAccount()
  const { data } = useContractReads({
    contracts: [
      {
        address: NFTContractAddress,
        abi: ERC1155ABI,
        functionName: 'balanceOf',
        args: [address as Address, 0n],
      },
    ],
    watch: true,
  })

  const nftBalance = data?.[0]?.result

  return (
    <div className={'flex gap-10'}>
      <Image src={'/demo-1.png'} alt={'demo'} width={300} height={400} />
      <div className={'flex flex-col'}>
        <div className='flex text-2xl gap-2 mb-4'>
          <Image src={'/list.png'} alt={'list'} width={32} height={32} className={'rounded-full'} /> {nftBalance?.toString()}
        </div>
        <div className={'text-gray-600'}>Quantity</div>
        <div className='divider' />
        <div className='flex text-2xl gap-2 mb-4'>
          <Image src={'/bid.png'} alt={'list'} width={32} height={32} className={'rounded-full'} />
          9.32
        </div>
        <div className={'text-gray-600'}>Real-time Fair Price</div>
        <Link href={'/list'} className={'btn btn-primary w-[200px] mt-auto'}>
          List for sell
        </Link>
      </div>
    </div>
  )
}
