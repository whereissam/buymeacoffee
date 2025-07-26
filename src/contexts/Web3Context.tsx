import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';

export interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  userAddress: string | null;
  network: ethers.Network | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  switchToBase: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const BASE_MAINNET_CHAIN_ID = 8453;
const BASE_SEPOLIA_CHAIN_ID = 84532;

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<ethers.Network | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNetwork = (chainId: bigint) => {
    return chainId === BigInt(BASE_MAINNET_CHAIN_ID) || chainId === BigInt(BASE_SEPOLIA_CHAIN_ID);
  };

  const connectWallet = async () => {
    try {
      setError(null);
      console.log('Attempting to connect wallet...');
      
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Clear any existing connection state first
      setProvider(null);
      setSigner(null);
      setUserAddress(null);
      setNetwork(null);
      setIsConnected(false);
      setIsCorrectNetwork(false);

      console.log('Requesting accounts from MetaMask...');
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      
      // Force MetaMask popup by requesting accounts
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      console.log('Accounts received:', accounts);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect at least one account in MetaMask.');
      }
      
      const web3Signer = await web3Provider.getSigner();
      const address = await web3Signer.getAddress();
      const net = await web3Provider.getNetwork();

      console.log('Connected to address:', address);
      console.log('Network:', net.name, net.chainId);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setUserAddress(address);
      setNetwork(net);
      setIsConnected(true);
      setIsCorrectNetwork(checkNetwork(net.chainId));

    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      setError(err.message);
      // Reset state on error
      setProvider(null);
      setSigner(null);
      setUserAddress(null);
      setNetwork(null);
      setIsConnected(false);
      setIsCorrectNetwork(false);
    }
  };

  const switchToBase = async () => {
    try {
      setError(null);
      
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: 'Base Sepolia',
              rpcUrls: ['https://sepolia.base.org'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.basescan.org'],
            }],
          });
        } catch (addError: any) {
          setError('Failed to add Base Sepolia network');
          console.error('Failed to add network:', addError);
        }
      } else {
        setError('Failed to switch to Base network');
        console.error('Failed to switch network:', switchError);
      }
    }
  };

  const disconnect = () => {
    console.log('Disconnecting wallet...');
    setProvider(null);
    setSigner(null);
    setUserAddress(null);
    setNetwork(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
    setError(null);
    console.log('Wallet disconnected');
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          console.log('Auto-check found accounts:', accounts);
          if (accounts.length > 0 && !isConnected) {
            console.log('Auto-connecting to existing account...');
            await connectWallet();
          }
        } catch (err) {
          console.error('Failed to check existing connection:', err);
        }
      }
    };

    checkConnection();
  }, []);

  const value: Web3ContextType = {
    provider,
    signer,
    userAddress,
    network,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    switchToBase,
    disconnect,
    error,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}