import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { baseSepolia } from 'wagmi/chains'

const BASE_MAINNET_CHAIN_ID = 8453
const BASE_SEPOLIA_CHAIN_ID = 84532

// E2E test mock: set window.__E2E_WALLET_MOCK__ to override wallet state in tests
interface E2EWalletMock {
  address: string
  isConnected: boolean
  chainId: number
}

declare global {
  interface Window {
    __E2E_WALLET_MOCK__?: E2EWalletMock
  }
}

function getE2EMock(): E2EWalletMock | undefined {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    return window.__E2E_WALLET_MOCK__
  }
  return undefined
}

export function useWeb3() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const { open } = useAppKit()

  const mock = getE2EMock()

  const effectiveAddress = mock?.address ?? address ?? null
  const effectiveConnected = mock?.isConnected ?? isConnected
  const effectiveChainId = mock?.chainId ?? chain?.id ?? null

  const isCorrectNetwork = effectiveChainId === BASE_MAINNET_CHAIN_ID || effectiveChainId === BASE_SEPOLIA_CHAIN_ID

  const connectWallet = async () => {
    try {
      await open()
    } catch (err) {
      console.error('Failed to open wallet modal:', err)
    }
  }

  const switchToBase = async () => {
    try {
      await switchChainAsync({ chainId: baseSepolia.id })
    } catch (err) {
      console.error('Failed to switch network:', err)
    }
  }

  return {
    userAddress: effectiveAddress as `0x${string}` | null,
    isConnected: effectiveConnected,
    isCorrectNetwork,
    chainId: effectiveChainId,
    connectWallet,
    switchToBase,
    disconnect,
  }
}
