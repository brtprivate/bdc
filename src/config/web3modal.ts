import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { bsc } from 'wagmi/chains';
import { NETWORK_CONFIG } from '../config';

const projectId = 'b0cebcda95846f0aabc833a9f05dca99';
const metadata = {
  name: 'BDC Stack',
  description: 'BDC Stack - Biggest Decentralized Community Platform',
  url: 'https://bdcstack.com/',
  icons: ['https://bdcstack.com/favicon.ico']
};

const bscChain = {
  ...bsc,
  rpcUrls: {
    default: {
      http: [NETWORK_CONFIG.rpcUrl],
    },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: NETWORK_CONFIG.explorerUrl },
  },
};

const chains = [bscChain] as const;

export const config = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  metadata,
  // Mobile-optimized configuration with more wallet options
  featuredWalletIds: [
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live
    'ecc4036f814562b41a5268adc86270ffc6a78b56b8e8b8b8b8b8b8b8b8b8b8b8', // Binance Wallet
  ],
  // Include all wallets for better mobile support
  includeWalletIds: [
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
    'ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef', // Crypto.com DeFi Wallet
  ],
  // Enable mobile-specific features
  enableAnalytics: true,
  enableOnramp: false,
  enableEmail: false,
  enableSocials: false,
  // Mobile-friendly theme
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FFA000',
    '--w3m-border-radius-master': '12px',
    '--w3m-font-family': 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    '--w3m-z-index': '9999'
  },
  // Default to BSC Mainnet for production
  defaultChain: bscChain,
  // Mobile-specific configurations
  allowUnsupportedChain: false,
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true
});
