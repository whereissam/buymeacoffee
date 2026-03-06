import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { baseSepolia } from 'wagmi/chains'

const BASE_MAINNET_CHAIN_ID = 8453
const BASE_SEPOLIA_CHAIN_ID = 84532

export function useWeb3() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const { open } = useAppKit()

  const isCorrectNetwork = chain?.id === BASE_MAINNET_CHAIN_ID || chain?.id === BASE_SEPOLIA_CHAIN_ID

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
    userAddress: address ?? null,
    isConnected,
    isCorrectNetwork,
    chainId: chain?.id ?? null,
    connectWallet,
    switchToBase,
    disconnect,
  }
}
