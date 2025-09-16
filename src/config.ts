// MLM Contract addresses - BSC Mainnet
export const REFERRAL_CONTRACT_ADDRESS = '0xYourBSCReferralContract';

// USD Stack Contract - BSC Mainnet
export const USD_STACK_CONTRACT_ADDRESS = '0xYourBSCStackContract';

// Owner address for MLM registration (default referrer)
export const OWNER_ADDRESS = '0x1922C8333021F85326c14EC667C06E893C0CFf07';
export const DEFAULT_REFERRAL_ADDRESS = OWNER_ADDRESS;

// Chain ID for BSC Mainnet
export const CHAIN_ID = 56;

// Network configuration
export const NETWORK_CONFIG = {
  name: 'BSC Mainnet',
  chainId: CHAIN_ID,
  rpcUrl: 'https://bsc-dataseed1.binance.org/',
  explorerUrl: 'https://bscscan.com',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
};
