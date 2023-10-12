import { Providers } from './providers'
import {Exo_2} from 'next/font/google'
import './global.css'

const exo2 = Exo_2({subsets: ['latin', 'latin-ext'], weight: ['700', '600', '400', '300', '200']})
export const metadata = {
  title: 'wagmi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={exo2.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
