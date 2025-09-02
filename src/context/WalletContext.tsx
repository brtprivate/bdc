import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Address } from 'viem';
import { dwcContractInteractions } from '../services/contractService';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isRegistered: boolean;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToCorrectNetwork: () => Promise<boolean>;
  refreshRegistrationStatus: () => Promise<boolean>;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  isConnected: false,
  isRegistered: false,
  isCorrectNetwork: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchToCorrectNetwork: async () => false,
  refreshRegistrationStatus: async () => false,
  loading: false,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { address, isConnected, chain } = useAccount();
  const { open, close } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // BSC Testnet chain id is 97
  const isCorrectNetwork = chain?.id === 97;

  const connectWallet = async () => {
    try {
      console.log('Opening wallet connection...');
      // For mobile devices, add a small delay to ensure proper modal rendering
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log('Mobile device detected, optimizing connection...');
        setTimeout(() => {
          open();
        }, 100);
      } else {
        open();
      }
    } catch (error) {
      console.error('Error opening wallet modal:', error);
    }
  };

  const disconnectWallet = () => {
    try {
      console.log('Disconnecting wallet...');
      disconnect();
      close(); // Close Web3Modal
      setIsRegistered(false);
      setLoading(false);
      // Clear any cached data
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.cache');
      // Force a small delay to ensure state updates
      setTimeout(() => {
        console.log('Wallet disconnected successfully');
      }, 100);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const switchToCorrectNetwork = async (): Promise<boolean> => {
    if (!isCorrectNetwork && switchChainAsync) {
      try {
        await switchChainAsync({ chainId: 97 });
        return true;
      } catch (error) {
        console.error('Error switching network:', error);
        return false;
      }
    }
    return isCorrectNetwork;
  };

  const refreshRegistrationStatus = async (): Promise<boolean> => {
    if (!address) return false;
    setLoading(true);
    try {
      const registered = await dwcContractInteractions.isUserExists(address as Address);
      setIsRegistered(registered);
      return registered;
    } catch (error) {
      console.error('Error refreshing registration status:', error);
      setIsRegistered(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Auto-check registration status when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      refreshRegistrationStatus();
    } else {
      setIsRegistered(false);
    }
  }, [isConnected, address]);

  return (
    <WalletContext.Provider
      value={{
        account: address ?? null,
        isConnected,
        isRegistered,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
        switchToCorrectNetwork,
        refreshRegistrationStatus,
        loading
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
