import { http, createConfig, cookieStorage, createStorage } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Get a project ID from https://cloud.reown.com
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || ''

export const networks = [baseSepolia, base] as const

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: false,
  projectId,
  networks,
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
})

export const config = wagmiAdapter.wagmiConfig

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
