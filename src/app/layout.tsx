import { Montserrat } from 'next/font/google'
import Script from 'next/script'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import './global.css'
import { Providers } from './providers'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '600', '400', '300'] })

export const metadata = {
  title: 'Scratch',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // const mid = 'GTM-PWV6NH6J'
  const mid = 'G-714WJX6HK5'
  // const mid = 'G-46NJNM8TCB'
  return (
    <html lang='en'>
      <Script async src='https://www.googletagmanager.com/gtag/js?id=G-714WJX6HK5'></Script>
      <Script id={'google2'}>
        {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-714WJX6HK5');
      `}
      </Script>
      <body className={montserrat.className}>
        <Toaster position={'top-right'} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
