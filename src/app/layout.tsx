import { Providers } from './providers'
import { Montserrat, Exo_2 } from 'next/font/google'
import './global.css'
import { Toaster } from 'sonner'
import { ReactNode } from 'react'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '600', '400', '300'] })

export const metadata = {
  title: 'Scratch',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className={montserrat.className}>
        <Toaster position={'top-right'} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
