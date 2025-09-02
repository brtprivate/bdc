import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { config } from '../config/web3modal';
import {
  dwcContractInteractions,
  DWC_CONTRACT_ADDRESS,
  DWC_ABI,
  TESTNET_CHAIN_ID
} from '../services/contractService';
import { formatEther, parseEther } from 'viem';

interface MLMContextType {
  address: string | null;
  isConnected: boolean;
  isMLMRegistered: boolean;
  isLoading: boolean;
  isCorrectNetwork: boolean;
  registerMLM: (referrerAddress?: string) => Promise<boolean>;
  checkMLMRegistration: () => Promise<boolean>;
  getDirectReferrals: () => Promise<string[]>;
  getDirectReferralCount: () => Promise<number>;
  getReferrer: () => Promise<string>;
  getTotalRegistered: () => Promise<number>;
}

const MLMContext = createContext<MLMContextType | undefined>(undefined);

interface MLMProviderProps {
  children: ReactNode;
}

export const MLMProvider: React.FC<MLMProviderProps> = ({ children }) => {
  const { address, isConnected, chain } = useAccount();
  const [isMLMRegistered, setIsMLMRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // BSC Testnet chain id is 97
  const isCorrectNetwork = chain?.id === 97;

  // Check MLM registration status using contractService
  const checkMLMRegistration = async (): Promise<boolean> => {
    if (!address || !isCorrectNetwork) {
      console.log('checkMLMRegistration: No address or wrong network');
      setIsMLMRegistered(false);
      return false;
    }

    try {
      setIsLoading(true);
      console.log('checkMLMRegistration: Checking user existence for', address);
      // Use contractService's isUserExists function to check registration status
      const registered = await dwcContractInteractions.isUserExists(address as `0x${string}`);
      console.log('checkMLMRegistration: User exists result:', registered);
      setIsMLMRegistered(registered);
      return registered;
    } catch (error: any) {
      console.error('checkMLMRegistration: Error checking MLM registration:', error);
      console.error('checkMLMRegistration: Error details:', {
        message: error.message,
        code: error.code,
        data: error.data
      });
      // If there's an error, assume user is not registered
      setIsMLMRegistered(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register user with proper error handling using contractService
  const handleRegisterMLM = async (referrerAddress?: string): Promise<boolean> => {
    if (!address || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network. Please connect your wallet and switch to BSC Testnet.');
    }

    // Use default referrer if none provided, matching MLMDashboard.tsx
    const refAddress = referrerAddress || '0x1922C8333021F85326c14EC667C06E893C0CFf07';
    
    // Validate referrer address format
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(refAddress)) {
      throw new Error('Invalid referrer address format. Please provide a valid Ethereum address.');
    }

    try {
      setIsLoading(true);
      console.log('Starting registration process with referrer:', refAddress);

      // Register user via contractService
      const hash = await dwcContractInteractions.register(refAddress as `0x${string}`, address as `0x${string}`);
      console.log('Registration transaction submitted. Hash:', hash);

      // Wait for transaction confirmation and then check registration status
      setTimeout(async () => {
        try {
          await checkMLMRegistration();
          console.log('Registration status checked after transaction');
        } catch (checkError) {
          console.error('Error checking registration status after transaction:', checkError);
        }
      }, 5000); // Increased wait time for blockchain confirmation

      return true;
    } catch (error: any) {
      console.error('Error registering MLM:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        data: error.data,
        shortMessage: error.shortMessage,
        details: error.details
      });
      
      // Provide more specific error messages
      if (error.message?.includes('user rejected')) {
        throw new Error('Transaction was rejected by user. Please approve the transaction to complete registration.');
      } else if (error.message?.includes('insufficient')) {
        throw new Error('Insufficient funds for gas fees. Ensure you have enough balance.');
      } else if (error.message?.includes('already registered')) {
        throw new Error('This wallet address is already registered in the system.');
      } else {
        throw new Error(`Registration failed: ${error.message || 'Unknown error occurred. Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get direct referrals - Note: contractService doesn't have direct referral methods
  // This would need to be implemented differently or removed
  const handleGetDirectReferrals = async (): Promise<string[]> => {
    if (!address || !isCorrectNetwork) return [];

    try {
      // For now, return empty array as contractService doesn't provide direct referral methods
      console.log('Direct referrals not available in contractService');
      return [];
    } catch (error) {
      console.error('Error getting direct referrals:', error);
      return [];
    }
  };

  // Get direct referral count
  const handleGetDirectReferralCount = async (): Promise<number> => {
    if (!address || !isCorrectNetwork) return 0;

    try {
      // For now, return 0 as contractService doesn't provide direct referral count
      console.log('Direct referral count not available in contractService');
      return 0;
    } catch (error) {
      console.error('Error getting direct referral count:', error);
      return 0;
    }
  };

  // Get referrer
  const handleGetReferrer = async (): Promise<string> => {
    if (!address || !isCorrectNetwork) return '';

    try {
      const userInfo = await dwcContractInteractions.getUserInfo(address as `0x${string}`);
      return userInfo.referrer || '';
    } catch (error) {
      console.error('Error getting referrer:', error);
      return '';
    }
  };

  // Get total registered users
  const handleGetTotalRegistered = async (): Promise<number> => {
    try {
      // Read lastUserId from the DWC contract to get total registered users
      const total = await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: 'lastUserId',
        chainId: TESTNET_CHAIN_ID,
      });
      return Number(total);
    } catch (error) {
      console.error('Error getting total registered:', error);
      return 0;
    }
  };

  // Auto-check MLM registration when wallet connects and network is correct
  useEffect(() => {
    if (isConnected && address && isCorrectNetwork) {
      checkMLMRegistration();
    } else {
      setIsMLMRegistered(false);
    }
  }, [isConnected, address, isCorrectNetwork]);

  const value: MLMContextType = {
    address: address ?? null,
    isConnected,
    isMLMRegistered,
    isLoading,
    isCorrectNetwork,
    registerMLM: handleRegisterMLM,
    checkMLMRegistration,
    getDirectReferrals: handleGetDirectReferrals,
    getDirectReferralCount: handleGetDirectReferralCount,
    getReferrer: handleGetReferrer,
    getTotalRegistered: handleGetTotalRegistered,
  };

  return (
    <MLMContext.Provider value={value}>
      {children}
    </MLMContext.Provider>
  );
};

export const useMLM = (): MLMContextType => {
  const context = useContext(MLMContext);
  if (context === undefined) {
    throw new Error('useMLM must be used within an MLMProvider');
  }
  return context;
};