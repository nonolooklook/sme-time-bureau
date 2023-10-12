import Image from 'next/image'
import { ConnectKitButton } from 'connectkit'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const Header = () => {
  const pathname = usePathname()
  return (
    <header>
      <div className='container mx-auto py-8 flex items-center'>
        <div className={'text-xl font-bold flex items-center gap-2'}>
          <Image src={'/logo.png'} alt={'logo'} width={36} height={36} />
          SCRATCH TICKET
        </div>

        <div className={'flex items-center gap-10 ml-24'}>
          <Link className={`nav-item ${pathname === '/' ? 'active' : ''}`} href={'/'}>
            Launchpad
          </Link>
          <Link className={`nav-item ${pathname === '/scratch' ? 'active' : ''}`} href={'/scratch'}>
            Scratch
          </Link>
          <Link className={`nav-item ${pathname === '/market' ? 'active' : ''}`} href={'/market'}>
            Market
          </Link>
          <Link className={`nav-item ${pathname === '/portfolio' ? 'active' : ''}`} href={'/portfolio'}>
            My portfolio
          </Link>
        </div>
        <div className='ml-auto'>
          <ConnectKitButton />
        </div>
      </div>
    </header>
  )
}
