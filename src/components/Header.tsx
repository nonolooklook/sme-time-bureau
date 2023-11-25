import { ConnectKitButton } from 'connectkit'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { usePathname } from 'next/navigation'

export const Header = () => {
  const { address } = useAccount()
  const pathname = usePathname()
  return (
    <header className={'z-10 bg-black bg-opacity-40 text-white border-b border-b-[#DED1B630] fixed top-0 w-full'}>
      <div className='container mx-auto flex items-center py-5 justify-between'>
        <Link className='flex items-center gap-2' href={'/'}>
          <div className={'text-[24px] font-semibold'}>SME</div>
        </Link>
        <div className={'flex gap-12 items-center text-[14px]'}>
          <Link className={`${pathname === '/' ? 'active' : ''} item`} href={'/'}>
            Home
          </Link>
          <Link className={`${pathname === '/capsule' ? 'active' : ''} item`} href={'/capsule'}>
            Schrödinger`s Time Capsule
          </Link>
          <Link className={`${pathname === '/trade' ? 'active' : ''} item`} href={'/trade'}>
            Trade
          </Link>
          {address && (
            <Link className={`${pathname === '/portfolio' ? 'active' : ''} item`} href={'/portfolio'}>
              Portfolio
            </Link>
          )}
        </div>
        <ConnectKitButton />
      </div>
    </header>
  )
}
