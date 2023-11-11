'use client'

import { ConnectKitProvider } from 'connectkit'
import * as React from 'react'
import { WagmiConfig } from 'wagmi'

import { config } from '../wagmi'
import { FetcherContextProvider } from '@/contexts/FetcherContext'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <FetcherContextProvider>{mounted && children}</FetcherContextProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}
