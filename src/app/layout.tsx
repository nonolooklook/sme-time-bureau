import { Providers } from './providers'
import { Montserrat, Exo_2 } from 'next/font/google'
import './global.css'
import { Toaster } from 'sonner'
import { ReactNode } from 'react'
import Script from 'next/script'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '600', '400', '300'] })

export const metadata = {
  title: 'Scratch',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <Script id='google-analytics'>
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-PWV6NH6J');
        `}
      </Script>
      <body className={montserrat.className}>
        <Script id={'no-script'}>
          {`
          <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PWV6NH6J"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        `}
        </Script>
        <Toaster position={'top-right'} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
