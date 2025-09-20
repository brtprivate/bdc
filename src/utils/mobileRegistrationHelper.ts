import { Address } from 'viem';
import { dwcContractInteractions } from '../services/contractService';

export interface MobileRegistrationStatus {
  step: 'idle' | 'connecting' | 'validating' | 'executing' | 'confirming' | 'success' | 'error';
  message: string;
  progress: number; // 0-100
  txHash?: string;
  error?: string;
}

export class MobileRegistrationHelper {
  private statusCallback?: (status: MobileRegistrationStatus) => void;

  constructor(statusCallback?: (status: MobileRegistrationStatus) => void) {
    this.statusCallback = statusCallback;
  }

  private updateStatus(status: MobileRegistrationStatus) {
    console.log(`📱 Registration Status:`, status);
    if (this.statusCallback) {
      this.statusCallback(status);
    }
  }

  async registerWithMobileOptimization(
    referrer: Address, 
    account: Address
  ): Promise<string> {
    try {
      // Step 1: Initial validation
      this.updateStatus({
        step: 'validating',
        message: 'Validating addresses...',
        progress: 10
      });

      if (!account || !referrer) {
        throw new Error('Invalid addresses provided');
      }

      // Step 2: Check mobile environment
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                      (window.innerWidth <= 768 && 'ontouchstart' in window);

      this.updateStatus({
        step: 'validating',
        message: isMobile ? 'Mobile device detected' : 'Desktop device detected',
        progress: 20
      });

      // Step 3: Pre-execution checks
      this.updateStatus({
        step: 'validating',
        message: 'Checking user registration status...',
        progress: 30
      });

      // Quick user existence check
      const isUserExists = await dwcContractInteractions.isUserExists(account);
      if (isUserExists) {
        throw new Error('User is already registered');
      }

      // Step 4: Execute registration
      this.updateStatus({
        step: 'executing',
        message: isMobile ? 'Executing mobile-optimized registration...' : 'Executing registration...',
        progress: 50
      });

      // Add timeout wrapper for mobile
      const registrationPromise = dwcContractInteractions.register(referrer, account);
      
      let timeoutMs = isMobile ? 45000 : 90000; // Shorter timeout for mobile
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Registration timeout after ${timeoutMs/1000} seconds`)), timeoutMs)
      );

      const txHash = await Promise.race([registrationPromise, timeoutPromise]);

      // Step 5: Transaction submitted
      this.updateStatus({
        step: 'confirming',
        message: 'Transaction submitted, waiting for confirmation...',
        progress: 80,
        txHash
      });

      // Step 6: Success
      this.updateStatus({
        step: 'success',
        message: 'Registration completed successfully!',
        progress: 100,
        txHash
      });

      return txHash;

    } catch (error: any) {
      console.error('❌ Mobile registration failed:', error);
      
      // Provide mobile-specific error messages
      let errorMessage = error.message || 'Unknown error occurred';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'Registration is taking too long. Please try again or check your network connection.';
      } else if (error.message?.includes('User denied')) {
        errorMessage = 'Transaction was rejected. Please try again and approve the transaction.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient BNB for gas fees. Please add BNB to your wallet.';
      } else if (error.message?.includes('already registered')) {
        errorMessage = 'This wallet is already registered.';
      } else if (error.message?.includes('referrer')) {
        errorMessage = 'Invalid referrer address. Please check the referral link.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }

      this.updateStatus({
        step: 'error',
        message: errorMessage,
        progress: 0,
        error: errorMessage
      });

      throw new Error(errorMessage);
    }
  }

  // Helper method to reset status
  reset() {
    this.updateStatus({
      step: 'idle',
      message: 'Ready to register',
      progress: 0
    });
  }

  // Helper method to check if mobile
  static isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && 'ontouchstart' in window);
  }

  // Helper method to format transaction hash for display
  static formatTxHash(txHash: string): string {
    return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
  }

  // Helper method to get BSC scan URL
  static getBscScanUrl(txHash: string): string {
    return `https://bscscan.com/tx/${txHash}`;
  }
}

export default MobileRegistrationHelper;
