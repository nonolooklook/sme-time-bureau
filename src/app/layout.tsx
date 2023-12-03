import { Providers } from './providers'
import { Montserrat, Exo_2 } from 'next/font/google'
import './global.css'
import { Toaster } from 'sonner'
import { ReactNode } from 'react'
import Script from 'next/script'
import Head from 'next/head'

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
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${mid}`}></Script>
      <Script id={'google'}>
        {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', ${mid});
        `}
      </Script>
      <body className={montserrat.className}>
        <Toaster position={'top-right'} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
