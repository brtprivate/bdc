import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { bsc } from 'wagmi/chains';
import { NETWORK_CONFIG } from '../config';

// Use a working WalletConnect project ID
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

// Simplified Web3Modal configuration that works like safemint
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  metadata,
  // Simplified wallet configuration for better compatibility
  featuredWalletIds: [
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
  ],
  // Basic theme configuration
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FFA000',
    '--w3m-border-radius-master': '12px',
  },
  // Essential settings only
  defaultChain: bscChain,
  enableAnalytics: false,
  enableOnramp: false,
  enableEmail: false,
  enableSocials: false,
  // Core wallet features
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true,
  allowUnsupportedChain: false
});
