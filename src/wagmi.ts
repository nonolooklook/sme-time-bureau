import { getDefaultConfig } from 'connectkit'
import { createConfig } from 'wagmi'
import { arbitrumSepolia } from 'viem/chains'

const walletConnectProjectId = '2222222'

export const config = createConfig(
  getDefaultConfig({
    autoConnect: true,
    appName: 'Scratch',
    chains: [arbitrumSepolia],
    walletConnectProjectId,
  }),
)
