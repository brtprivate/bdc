// Mobile Wallet Connection Fix for Node.js Server Environment
// This utility helps fix wallet connection issues when React app is served through Node.js

export interface ServerEnvironmentInfo {
  isNodeServer: boolean;
  serverPort: string | null;
  baseUrl: string;
  isMobile: boolean;
  userAgent: string;
}

// Detect if we're running through Node.js server
export const detectServerEnvironment = (): ServerEnvironmentInfo => {
  const isNodeServer = window.location.port === '1737' || 
                      window.location.hostname === 'localhost' ||
                      window.location.pathname.startsWith('/app');
  
  const serverPort = window.location.port || null;
  const baseUrl = `${window.location.protocol}//${window.location.hostname}${serverPort ? ':' + serverPort : ''}`;
  
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (window.innerWidth <= 768 && 'ontouchstart' in window);
  
  return {
    isNodeServer,
    serverPort,
    baseUrl,
    isMobile,
    userAgent: navigator.userAgent
  };
};

// Fix Web3Modal configuration for Node.js server environment
export const applyNodeServerFixes = () => {
  const env = detectServerEnvironment();
  
  console.log('🔧 Applying Node.js server fixes for wallet connections...');
  console.log('Environment:', env);
  
  if (env.isNodeServer && env.isMobile) {
    console.log('📱 Mobile device detected on Node.js server - applying fixes');
    
    // Fix 1: Override CSP restrictions
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (metaCSP) {
      metaCSP.setAttribute('content', 
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
        "frame-src *; connect-src *; img-src *; media-src *; " +
        "object-src 'none'; base-uri 'self';"
      );
      console.log('✅ CSP headers updated for mobile wallet compatibility');
    }
    
    // Fix 2: Add mobile-specific meta tags if missing
    if (!document.querySelector('meta[name="mobile-web-app-capable"]')) {
      const mobileCapable = document.createElement('meta');
      mobileCapable.name = 'mobile-web-app-capable';
      mobileCapable.content = 'yes';
      document.head.appendChild(mobileCapable);
    }
    
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const appleCapable = document.createElement('meta');
      appleCapable.name = 'apple-mobile-web-app-capable';
      appleCapable.content = 'yes';
      document.head.appendChild(appleCapable);
    }
    
    // Fix 3: Override window.open for wallet deep links
    const originalOpen = window.open;
    window.open = function(url, target, features) {
      console.log('🔗 Intercepted window.open for wallet:', url);
      
      // Handle wallet deep links specially
      if (url && (url.includes('trust://') || url.includes('metamask://') || url.includes('cbwallet://'))) {
        console.log('📱 Wallet deep link detected, using location.href');
        window.location.href = url;
        return null;
      }
      
      return originalOpen.call(window, url, target, features);
    };
    
    // Fix 4: Add wallet connection event listeners
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'WALLET_CONNECT') {
        console.log('📱 Wallet connection message received:', event.data);
      }
    });
    
    // Fix 5: Override fetch for wallet API calls
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      
      // Add CORS headers for wallet API calls
      if (url.includes('walletconnect') || url.includes('web3modal') || url.includes('reown')) {
        const newInit = {
          ...init,
          mode: 'cors',
          credentials: 'omit',
          headers: {
            ...init?.headers,
            'Access-Control-Allow-Origin': '*',
          }
        };
        console.log('🌐 Enhanced fetch for wallet API:', url);
        return originalFetch.call(window, input, newInit);
      }
      
      return originalFetch.call(window, input, init);
    };
    
    console.log('✅ Node.js server wallet fixes applied successfully');
  }
};

// Mobile wallet connection helper for Node.js server
export const connectMobileWalletOnServer = async (walletName: string) => {
  const env = detectServerEnvironment();
  
  if (!env.isMobile) {
    console.log('Not on mobile device, using standard connection');
    return;
  }
  
  console.log(`🔗 Connecting to ${walletName} on mobile through Node.js server`);
  
  // Apply server fixes before connection
  applyNodeServerFixes();
  
  // Wait a bit for fixes to take effect
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Check if wallet is available
  if (typeof window.ethereum === 'undefined') {
    console.log('❌ No Web3 provider detected');
    
    // Try to open wallet app
    const walletUrls = {
      'trust': 'trust://',
      'metamask': 'metamask://',
      'coinbase': 'cbwallet://',
    };
    
    const walletKey = walletName.toLowerCase();
    if (walletUrls[walletKey as keyof typeof walletUrls]) {
      console.log(`📱 Opening ${walletName} app...`);
      window.location.href = walletUrls[walletKey as keyof typeof walletUrls];
    }
    
    throw new Error(`${walletName} not detected. Please install the wallet app.`);
  }
  
  console.log('✅ Web3 provider detected, proceeding with connection');
  return true;
};

// Debug function for Node.js server wallet issues
export const debugNodeServerWallet = () => {
  const env = detectServerEnvironment();
  
  console.log('=== Node.js Server Wallet Debug ===');
  console.log('Environment Info:', env);
  console.log('Current URL:', window.location.href);
  console.log('Document Title:', document.title);
  console.log('User Agent:', navigator.userAgent);
  
  // Check CSP
  const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  console.log('CSP Meta Tag:', csp?.getAttribute('content') || 'Not found');
  
  // Check mobile meta tags
  const mobileCapable = document.querySelector('meta[name="mobile-web-app-capable"]');
  const appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
  console.log('Mobile Web App Capable:', mobileCapable?.getAttribute('content') || 'Not set');
  console.log('Apple Mobile Web App Capable:', appleCapable?.getAttribute('content') || 'Not set');
  
  // Check Web3 providers
  console.log('window.ethereum:', window.ethereum);
  console.log('window.trustwallet:', (window as any).trustwallet);
  console.log('window.BinanceChain:', (window as any).BinanceChain);
  
  // Check if we're in iframe
  console.log('In iframe:', window !== window.top);
  console.log('Frame ancestors allowed:', !csp?.getAttribute('content')?.includes('frame-ancestors'));
  
  console.log('================================');
};

// Auto-apply fixes when module loads
if (typeof window !== 'undefined') {
  // Apply fixes after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyNodeServerFixes);
  } else {
    applyNodeServerFixes();
  }
}
