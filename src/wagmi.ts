import { getDefaultConfig } from 'connectkit'
import { createConfig, sepolia } from 'wagmi'

const walletConnectProjectId = '2222222'

export const config = createConfig(
  getDefaultConfig({
    autoConnect: true,
    appName: 'My wagmi + ConnectKit App',
    chains: [sepolia],
    walletConnectProjectId,
  })
)
