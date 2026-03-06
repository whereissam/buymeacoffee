import React, { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { config, projectId, wagmiAdapter, networks } from '../config/wagmi'

const queryClient = new QueryClient()

const metadata = {
  name: 'Give Me Coffee',
  description: 'A lightweight tipping widget for Base-native creator support',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: [],
}

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: false,
  },
})

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
