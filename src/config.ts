// MLM Contract addresses - BSC Testnet
export const REFERRAL_CONTRACT_ADDRESS = '0xYourBSCReferralContract';

// USD Stack Contract - BSC Testnet
export const USD_STACK_CONTRACT_ADDRESS = '0xYourBSCStackContract';

// Owner address for MLM registration (default referrer)
export const OWNER_ADDRESS = '0x1922C8333021F85326c14EC667C06E893C0CFf07';
export const DEFAULT_REFERRAL_ADDRESS = OWNER_ADDRESS;

// Chain ID for BSC Testnet
export const CHAIN_ID = 97;

// Network configuration
export const NETWORK_CONFIG = {
  name: 'BSC Testnet',
  chainId: CHAIN_ID,
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  explorerUrl: 'https://testnet.bscscan.com',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
};
