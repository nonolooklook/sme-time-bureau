import { getDefaultConfig } from 'connectkit'
import { createConfig } from 'wagmi'
import * as chians from 'viem/chains'

const walletConnectProjectId = '2222222'

export const config = createConfig(
  getDefaultConfig({
    autoConnect: true,
    appName: 'Scratch',
    // @ts-ignore
    chains: [chians[process.env.NEXT_PUBLIC_NETWORK]],
    walletConnectProjectId,
  }),
)
