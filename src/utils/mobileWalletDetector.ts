// Mobile Wallet Detection and Connection Helper
export interface MobileWalletInfo {
  name: string;
  id: string;
  deepLink: string;
  universalLink: string;
  isInstalled: boolean;
  downloadUrl: string;
}

export const MOBILE_WALLETS: MobileWalletInfo[] = [
  {
    name: 'Trust Wallet',
    id: '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    deepLink: 'trust://wc',
    universalLink: 'https://link.trustwallet.com/wc',
    isInstalled: false,
    downloadUrl: 'https://trustwallet.com/download'
  },
  {
    name: 'MetaMask',
    id: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    deepLink: 'metamask://wc',
    universalLink: 'https://metamask.app.link/wc',
    isInstalled: false,
    downloadUrl: 'https://metamask.io/download/'
  },
  {
    name: 'Coinbase Wallet',
    id: 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    deepLink: 'cbwallet://wc',
    universalLink: 'https://go.cb-w.com/wc',
    isInstalled: false,
    downloadUrl: 'https://www.coinbase.com/wallet'
  },
  {
    name: 'Binance Wallet',
    id: 'ecc4036f814562b41a5268adc86270ffc6a78b56b8e8b8b8b8b8b8b8b8b8b8b8',
    deepLink: 'bnc://wc',
    universalLink: 'https://app.binance.com/wc',
    isInstalled: false,
    downloadUrl: 'https://www.binance.com/en/wallet'
  }
];

// Detect if we're on mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobileUA || (isTouchDevice && isSmallScreen);
};

// Detect specific mobile OS
export const getMobileOS = (): 'ios' | 'android' | 'other' => {
  if (typeof window === 'undefined') return 'other';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  
  return 'other';
};

// Check if a specific wallet is installed on mobile
export const isWalletInstalled = (walletName: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  switch (walletName.toLowerCase()) {
    case 'trust':
    case 'trustwallet':
      return userAgent.includes('trustwallet') || 
             (window as any).trustwallet !== undefined ||
             (window as any).ethereum?.isTrust === true;
             
    case 'metamask':
      return userAgent.includes('metamask') || 
             (window as any).ethereum?.isMetaMask === true;
             
    case 'coinbase':
      return userAgent.includes('coinbasewallet') || 
             (window as any).ethereum?.isCoinbaseWallet === true;
             
    case 'binance':
      return userAgent.includes('binance') || 
             (window as any).BinanceChain !== undefined;
             
    default:
      return false;
  }
};

// Get installed wallets
export const getInstalledWallets = (): MobileWalletInfo[] => {
  return MOBILE_WALLETS.map(wallet => ({
    ...wallet,
    isInstalled: isWalletInstalled(wallet.name)
  }));
};

// Open wallet app with deep link
export const openWalletApp = (walletId: string, wcUri?: string): void => {
  const wallet = MOBILE_WALLETS.find(w => w.id === walletId);
  if (!wallet) return;
  
  const mobileOS = getMobileOS();
  let link = wallet.universalLink;
  
  // Use deep link for installed apps
  if (wallet.isInstalled) {
    link = wallet.deepLink;
  }
  
  // Append WalletConnect URI if provided
  if (wcUri) {
    const encodedUri = encodeURIComponent(wcUri);
    link += `?uri=${encodedUri}`;
  }
  
  // Open the wallet
  if (mobileOS === 'ios') {
    // iOS: Try deep link first, fallback to universal link
    window.location.href = link;
    
    // Fallback to App Store if wallet not installed
    setTimeout(() => {
      if (!wallet.isInstalled) {
        window.open(wallet.downloadUrl, '_blank');
      }
    }, 2000);
  } else if (mobileOS === 'android') {
    // Android: Use intent or universal link
    try {
      window.location.href = link;
    } catch (error) {
      // Fallback to Play Store
      window.open(wallet.downloadUrl, '_blank');
    }
  } else {
    // Desktop or other: Open download page
    window.open(wallet.downloadUrl, '_blank');
  }
};

// Enhanced mobile wallet connection helper
export const connectMobileWallet = async (walletId: string): Promise<void> => {
  if (!isMobile()) {
    console.log('Not on mobile device, using standard connection');
    return;
  }
  
  const wallet = MOBILE_WALLETS.find(w => w.id === walletId);
  if (!wallet) {
    throw new Error(`Wallet with ID ${walletId} not found`);
  }
  
  console.log(`Attempting to connect to ${wallet.name} on mobile`);
  
  // Check if wallet is installed
  if (!isWalletInstalled(wallet.name)) {
    console.log(`${wallet.name} not installed, redirecting to download`);
    window.open(wallet.downloadUrl, '_blank');
    throw new Error(`${wallet.name} is not installed. Please install it first.`);
  }
  
  // For installed wallets, let Web3Modal handle the connection
  console.log(`${wallet.name} is installed, proceeding with connection`);
};

// Debug function to log mobile wallet status
export const debugMobileWallets = (): void => {
  console.log('=== Mobile Wallet Debug Info ===');
  console.log('Is Mobile:', isMobile());
  console.log('Mobile OS:', getMobileOS());
  console.log('User Agent:', navigator.userAgent);
  console.log('Screen Size:', `${window.innerWidth}x${window.innerHeight}`);
  console.log('Touch Support:', 'ontouchstart' in window);
  console.log('Max Touch Points:', navigator.maxTouchPoints);
  
  console.log('\n=== Wallet Detection ===');
  const installedWallets = getInstalledWallets();
  installedWallets.forEach(wallet => {
    console.log(`${wallet.name}: ${wallet.isInstalled ? 'INSTALLED' : 'NOT INSTALLED'}`);
  });
  
  console.log('\n=== Window Objects ===');
  console.log('window.ethereum:', (window as any).ethereum);
  console.log('window.trustwallet:', (window as any).trustwallet);
  console.log('window.BinanceChain:', (window as any).BinanceChain);
  console.log('================================');
};
