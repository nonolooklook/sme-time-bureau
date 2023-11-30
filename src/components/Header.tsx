import { ConnectKitButton } from 'connectkit'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

export const Header = () => {
  const { address } = useAccount()
  const pathname = usePathname()
  return (
    <header className={'z-10 bg-black bg-opacity-40 text-white border-b border-b-[#DED1B630] fixed top-0 w-full'}>
      <Script async src='https://www.googletagmanager.com/gtag/js?id=G-46NJNM8TCB'></Script>
      <Script id={'google'}>
        {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-46NJNM8TCB');
        `}
      </Script>
      <div className='container mx-auto flex items-center justify-between'>
        <Link className='flex items-center gap-2' href={'/'}>
          <div className={'text-[24px] font-semibold'}>SSE</div>
        </Link>
        <div className={'flex gap-10 items-center text-[14px]'}>
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
