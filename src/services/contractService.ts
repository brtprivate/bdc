import {
  estimateGas,
  getWalletClient,
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { ethers } from "ethers";

import type { Address, Address } from "viem";
import {
  decodeErrorResult,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "viem";
import { bscTestnet } from "wagmi/chains";
import { config } from "../config/web3modal";
import {
  USDC_ABI,
  USDC_CONTRACT_ADDRESS,
  usdcContractInteractions,
} from "./approvalservice";

// Export USDC_ABI for use in other files
export { USDC_ABI };
// Contract configuration - BSC Testnet
export const DWC_CONTRACT_ADDRESS =
  "0x5A615edDa19368a33aE90cc5eFA47D4bdB4A653b" as Address;
export const TESTNET_CHAIN_ID = 97;

// DWC Contract ABI (as provided)
export const DWC_ABI = [
  {
    inputs: [{ internalType: "address", name: "_daiAddr", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "addr", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "token",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "userId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "referrerId",
        type: "uint256",
      },
    ],
    name: "Registration",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "token",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Swap",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "from", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      { indexed: false, internalType: "uint8", name: "level", type: "uint8" },
      { indexed: false, internalType: "uint8", name: "Type", type: "uint8" },
    ],
    name: "Transaction",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_from",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "_to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "Iswithdraw",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_burnToken",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_daiamount", type: "uint256" }],
    name: "_daiToTokens",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_tokenAmount", type: "uint256" },
    ],
    name: "_tokensTodai",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_spender", type: "address" },
      { internalType: "uint256", name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "success", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bdctokenPool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "burn",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "coinRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "communityHoldingFund",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "creator",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dai",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dayRewardPercents",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "depositbdc",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "extraPool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "feewallet",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "uint256", name: "_rank", type: "uint256" },
    ],
    name: "getActiveCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getOrderLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getTeamCount",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "id1",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "isUserExists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastUserId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidityPool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidityPool_daiAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidityPool_tokenAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "map_ranks",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "uint256", name: "activedirect", type: "uint256" },
      { internalType: "uint256", name: "activeteam", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "maxPayoutOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "userAddress", type: "address" },
      { internalType: "address", name: "referrerAddress", type: "address" },
    ],
    name: "migrate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "orderInfos",
    outputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "holdingbonus", type: "uint256" },
      { internalType: "uint256", name: "deposit_time", type: "uint256" },
      { internalType: "uint256", name: "reward_time", type: "uint256" },
      { internalType: "bool", name: "isactive", type: "bool" },
      { internalType: "bool", name: "isdai", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceimpactwallet",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "referrerAddress", type: "address" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "rewardindex", type: "uint256" }],
    name: "rewardWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_tokenAmount", type: "uint256" },
    ],
    name: "tokenSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_to", type: "address" },
      { internalType: "uint256", name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "success", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_from", type: "address" },
      { internalType: "address", name: "_to", type: "address" },
      { internalType: "uint256", name: "_value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "success", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_creator", type: "address" }],
    name: "update",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_dayRewardPercents", type: "uint256" },
    ],
    name: "updateContractROI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_iswithdraw", type: "bool" }],
    name: "updateContractWithdrawal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "uint256", name: "_dayRewardPercents", type: "uint256" },
    ],
    name: "updateUserROI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "bool", name: "_iswithdraw", type: "bool" },
    ],
    name: "updateUserWithdrawal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "userranks",
    outputs: [{ internalType: "uint256", name: "rank", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "referrer", type: "address" },
      { internalType: "uint256", name: "partnersCount", type: "uint256" },
      { internalType: "uint256", name: "teamCount", type: "uint256" },
      { internalType: "uint256", name: "totalDeposit", type: "uint256" },
      { internalType: "uint256", name: "lastDeposit", type: "uint256" },
      { internalType: "uint256", name: "directBusiness", type: "uint256" },
      { internalType: "uint256", name: "reward", type: "uint256" },
      { internalType: "uint256", name: "levelincome", type: "uint256" },
      { internalType: "uint256", name: "roraltyincome", type: "uint256" },
      { internalType: "uint256", name: "maturityincome", type: "uint256" },
      { internalType: "uint256", name: "totalreward", type: "uint256" },
      { internalType: "uint256", name: "totalwithdraw", type: "uint256" },
      { internalType: "uint256", name: "dayRewardPercents", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "userscapping",
    outputs: [
      { internalType: "uint256", name: "totalCapping", type: "uint256" },
      { internalType: "uint256", name: "useCapping", type: "uint256" },
      { internalType: "bool", name: "Iswithdraw", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawfee",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];
// Constants for deposit limits
const MIN_DEPOSIT = parseEther("50");
const MAX_DEPOSIT = parseEther("10000");

// Interfaces for complex return types
interface UserInfo {
  id: bigint;
  referrer: Address;
  partnersCount: bigint;
  teamCount: bigint;
  totalDeposit: bigint;
  lastDeposit: bigint;
  directBusiness: bigint;
  reward: bigint;
  levelincome: bigint;
  royaltyincome: bigint;
  maturityincome: bigint;
  totalreward: bigint;
  totalwithdraw: bigint;
  dayRewardPercents: bigint;
}

interface OrderInfo {
  amount: bigint;
  holdingbonus: bigint;
  deposit_time: bigint;
  reward_time: bigint;
  isactive: boolean;
  isdai: boolean;
}

interface Rank {
  id: bigint;
  activedirect: bigint;
  activeteam: bigint;
}

interface UserRank {
  rank: bigint;
}

interface UserCapping {
  totalCapping: bigint;
  useCapping: bigint;
  Iswithdraw: boolean;
}

interface TeamCount {
  maxTeam: bigint;
  otherTeam: bigint;
}

interface BonusInfo {
  referralGains: bigint;
  levelGains: bigint;
  growthGains: bigint;
  teamGrowthGains: bigint;
  leaderGains: bigint;
  developmentGains: bigint;
  teamLevelStake: bigint;
  lapsTeamStake: bigint;
  totalStake: bigint;
  totalUnStake: bigint;
  totalWithdrwan: bigint;
  inOutBuy: bigint;
}

// Interface for contract interactions
interface DWCContractInteractions {
  approveUSDC: (amount: bigint, account: Address) => Promise<`0x${string}`>;
  approveDWC: (amount: bigint, account: Address) => Promise<`0x${string}`>;
  getUSDCBalance: (account: Address) => Promise<bigint>;
  getDWCBalance: (account: Address) => Promise<bigint>;
  register: (referrer: Address, account: Address) => Promise<`0x${string}`>;
  deposit: (amount: string, userAddress: Address) => Promise<`0x${string}`>;
  depositDWC: (amount: string, account: Address) => Promise<`0x${string}`>;
  tokenSwap: (tokenAmount: bigint, account: Address) => Promise<`0x${string}`>;
  tokenSwapv2: (
    tokenAmount: bigint,
    account: Address
  ) => Promise<`0x${string}`>;
  rewardWithdraw: (
    rewardIndex: bigint,
    account: Address
  ) => Promise<`0x${string}`>;
  burn: (amount: bigint, account: Address) => Promise<`0x${string}`>;
  transfer: (
    to: Address,
    value: bigint,
    account: Address
  ) => Promise<`0x${string}`>;
  transferFrom: (
    from: Address,
    to: Address,
    value: bigint,
    account: Address
  ) => Promise<`0x${string}`>;
  migrate: (
    userAddress: Address,
    referrerAddress: Address,
    account: Address
  ) => Promise<`0x${string}`>;
  update: (creator: Address, account: Address) => Promise<`0x${string}`>;
  updateContractROI: (
    dayRewardPercents: bigint,
    account: Address
  ) => Promise<`0x${string}`>;
  updateContractWithdrawal: (
    iswithdraw: boolean,
    account: Address
  ) => Promise<`0x${string}`>;
  updateUserROI: (
    user: Address,
    dayRewardPercents: bigint,
    account: Address
  ) => Promise<`0x${string}`>;
  updateUserWithdrawal: (
    user: Address,
    iswithdraw: boolean,
    account: Address
  ) => Promise<`0x${string}`>;
  getUserInfo: (user: Address) => Promise<UserInfo>;
  getUserRank: (user: Address) => Promise<UserRank>;
  getUserCapping: (user: Address) => Promise<UserCapping>;
  getOrderInfo: (user: Address, index: bigint) => Promise<OrderInfo>;
  getOrderLength: (user: Address) => Promise<bigint>;
  getTeamCount: (user: Address) => Promise<TeamCount>;
  getActiveCount: (user: Address, rank: bigint) => Promise<bigint>;
  getMaxPayout: (user: Address) => Promise<bigint>;
  getCoinRate: () => Promise<bigint>;
  daiToTokens: (daiAmount: bigint) => Promise<bigint>;
  tokensToDai: (tokenAmount: bigint) => Promise<bigint>;
  isUserExists: (user: Address) => Promise<boolean>;
  getTotalSupply: () => Promise<bigint>;
  getLiquidityPool: () => Promise<{ tokenAmount: bigint; daiAmount: bigint }>;
  getBurnedTokens: () => Promise<bigint>;
  getAllowance: (owner: Address, spender: Address) => Promise<bigint>;
  isWithdrawActive: () => Promise<boolean>;
  getCommunityHoldingFund: () => Promise<`0x${string}`>;
  getCreator: () => Promise<`0x${string}`>;
  getDaiAddress: () => Promise<`0x${string}`>;
  getDayRewardPercents: () => Promise<bigint>;
  getDecimals: () => Promise<number>;
  getDWCTokenPool: () => Promise<`0x${string}`>;
  getExtraPool: () => Promise<`0x${string}`>;
  getFeeWallet: (index: bigint) => Promise<`0x${string}`>;
  getId1: () => Promise<`0x${string}`>;
  getLastUserId: () => Promise<bigint>;
  getLiquidityPoolAddress: () => Promise<`0x${string}`>;
  getPriceImpactWallet: () => Promise<`0x${string}`>;
  getName: () => Promise<string>;
  getSymbol: () => Promise<string>;
  getRank: (rankId: bigint) => Promise<Rank>;
  getCommunityFundDAIBalance: () => Promise<bigint>;
  getCommunityFundDWCBalance: () => Promise<bigint>;
  getLiquidityPoolDAIBalance: () => Promise<bigint>;
  getLiquidityPoolDWCBalance: () => Promise<bigint>;
  getWithdrawFee: () => Promise<`0x${string}`>;
  bonusInfos: (user: Address) => Promise<BonusInfo>;
}

// Contract interaction functions for DWC contract
export const dwcContractInteractions: DWCContractInteractions = {
  async approveUSDC(amount: bigint, account: Address): Promise<`0x${string}`> {
    try {
      console.log(
        `Approving ${formatEther(amount)} USDC for ${DWC_CONTRACT_ADDRESS}`
      );
      const gasEstimate = await estimateGas(config, {
        abi: USDC_ABI,
        address: USDC_CONTRACT_ADDRESS,
        functionName: "approve",
        args: [DWC_CONTRACT_ADDRESS, amount],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: USDC_ABI,
        address: USDC_CONTRACT_ADDRESS,
        functionName: "approve",
        args: [DWC_CONTRACT_ADDRESS, amount],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error approving USDC: ${error.message || error}`);
      throw new Error(
        `Failed to approve USDC: ${error.message || "Unknown error"}`
      );
    }
  },

  async approveDWC(amount: bigint, account: Address): Promise<`0x${string}`> {
    try {
      console.log(
        `Approving ${formatEther(amount)} DWC for ${DWC_CONTRACT_ADDRESS}`
      );
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "approve",
        args: [DWC_CONTRACT_ADDRESS, amount],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "approve",
        args: [DWC_CONTRACT_ADDRESS, amount],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error approving DWC: ${error.message || error}`);
      throw new Error(
        `Failed to approve DWC: ${error.message || "Unknown error"}`
      );
    }
  },

  async getUSDCBalance(account: Address): Promise<bigint> {
    try {
      console.log(`🔍 Fetching USDC balance for account: ${account}`);
      console.log(`📍 Using USDC contract: ${USDC_CONTRACT_ADDRESS}`);
      console.log(`🌐 Using chain ID: ${TESTNET_CHAIN_ID}`);

      const balance = (await readContract(config, {
        abi: USDC_ABI,
        address: USDC_CONTRACT_ADDRESS,
        functionName: "balanceOf",
        args: [account],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;

      const formattedBalance = formatEther(balance);
      console.log(
        `✅ USDC balance for ${account}: ${formattedBalance} USDC (raw: ${balance})`
      );
      console.log(
        `📊 Contract call successful - balanceOf(${account}) returned: ${balance}`
      );

      return balance;
    } catch (error: any) {
      console.error(`❌ Error fetching USDC balance for ${account}:`, error);
      console.error(`Error details:`, {
        message: error.message,
        code: error.code,
        data: error.data,
        contractAddress: USDC_CONTRACT_ADDRESS,
        chainId: TESTNET_CHAIN_ID,
        account: account,
      });
      throw new Error(
        `Failed to fetch USDC balance: ${error.message || "Unknown error"}`
      );
    }
  },

  async getDWCBalance(account: Address): Promise<bigint> {
    try {
      console.log(`🔍 Fetching DWC balance for account: ${account}`);
      console.log(`📍 Using DWC contract: ${DWC_CONTRACT_ADDRESS}`);
      console.log(`🌐 Using chain ID: ${TESTNET_CHAIN_ID}`);

      const balance = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "balanceOf",
        args: [account],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;

      const formattedBalance = formatEther(balance);
      console.log(
        `✅ DWC balance for ${account}: ${formattedBalance} DWC (raw: ${balance})`
      );
      console.log(
        `📊 Contract call successful - balanceOf(${account}) returned: ${balance}`
      );

      return balance;
    } catch (error: any) {
      console.error(`❌ Error fetching DWC balance for ${account}:`, error);
      console.error(`Error details:`, {
        message: error.message,
        code: error.code,
        data: error.data,
        contractAddress: DWC_CONTRACT_ADDRESS,
        chainId: TESTNET_CHAIN_ID,
        account: account,
      });
      throw new Error(
        `Failed to fetch DWC balance: ${error.message || "Unknown error"}`
      );
    }
  },

  async register(referrer: Address, account: Address): Promise<`0x${string}`> {
    try {
      console.log(`Registering user ${account} with referrer: ${referrer}`);
      if (referrer === "0x0000000000000000000000000000000000000000") {
        throw new Error(
          "Invalid referrer address: zero address is not allowed"
        );
      }
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethAddressRegex.test(referrer)) {
        throw new Error("Invalid referrer address format");
      }
      const isUserExists = await this.isUserExists(account);
      if (isUserExists) {
        throw new Error("User already registered");
      }
      const isReferrerExists = await this.isUserExists(referrer);
      if (!isReferrerExists) {
        throw new Error("Referrer does not exist");
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "register",
        args: [referrer],
        chain: bscTestnet,
        account,
      });
      // Increase gas limit by 200% to handle reentrancy sentry and set minimum
      const gasLimit = (gasEstimate * 200n) / 100n;
      const minGasLimit = 150000n;
      const finalGasLimit = gasLimit > minGasLimit ? gasLimit : minGasLimit;
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "register",
        args: [referrer],
        chain: bscTestnet,
        account,
        gas: finalGasLimit,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error registering user: ${error.message || error}`);
      throw error;
    }
  },

  async deposit(amount: string, userAddress: Address): Promise<`0x${string}`> {
    try {
      console.log(`Depositing ${amount} USDC for ${userAddress}`);

      // Get USDC decimals
      const decimals = (await readContract(config, {
        abi: USDC_ABI,
        address: USDC_CONTRACT_ADDRESS,
        functionName: "decimals",
        chainId: TESTNET_CHAIN_ID,
      })) as number;
      console.log("USDC Decimals:", decimals);

      // Convert user-friendly amount → wei
      const amountInWei = parseUnits(amount, decimals);
      console.log(`Converted Amount: ${amountInWei.toString()} wei`);

      // ✅ Check if user exists
      const isUserExists = await this.isUserExists(userAddress);
      if (!isUserExists) {
        throw new Error("User is not registered");
      }

      // ✅ User info validation
      const userInfo = await this.getUserInfo(userAddress);
      if (amountInWei < userInfo.lastDeposit) {
        throw new Error(
          `Deposit amount must be >= last deposit: ${formatUnits(
            userInfo.lastDeposit,
            decimals
          )} USDT`
        );
      }

      // ✅ Balance check
      const balance = await this.getUSDCBalance(userAddress);
      if (balance < amountInWei) {
        throw new Error(
          `Insufficient balance. Available: ${formatUnits(
            balance,
            decimals
          )} USDT, Required: ${amount} USDT`
        );
      }

      // ✅ Allowance check
      const allowance = (await readContract(config, {
        abi: USDC_ABI,
        address: USDC_CONTRACT_ADDRESS,
        functionName: "allowance",
        args: [userAddress, DWC_CONTRACT_ADDRESS],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;

      console.log("Allowance:", formatUnits(allowance, decimals));
      if (allowance < amountInWei) {
        console.log(`Approving ${amount} USDT for DWC contract`);
        const approvalTx = await this.approveUSDC(amountInWei, userAddress);
        await waitForTransactionReceipt(config, {
          hash: approvalTx,
          chainId: TESTNET_CHAIN_ID,
        });
      }

      // ✅ Execute transaction
      console.log("Executing deposit transaction...");
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "deposit",
        args: [amountInWei],
        chain: bscTestnet,
        account: userAddress,
        // gas: BkigInt(500000), // Optional manual gas limit
      });

      console.log(`Deposit transaction successful: ${txHash}`);
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error("Error depositing USDC:", error);

      // ✅ Decode contract error if available
      if (error.cause?.data) {
        const decodedError = decodeErrorResult({
          abi: DWC_ABI,
          data: error.cause.data,
        });
        throw new Error(
          `Deposit failed: ${decodedError.errorName || "Unknown error"} - ${
            decodedError.args?.join(", ") || ""
          }`
        );
      }

      throw new Error(
        `Failed to deposit USDT: ${error.message || "Unknown error"}`
      );
    }
  },

  async depositDWC(amount: string, account: Address): Promise<`0x${string}`> {
    try {
      console.log(`Depositing ${amount} DWC for ${account}`);
      const decimals = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "decimals",
        chainId: TESTNET_CHAIN_ID,
      })) as number;
      const parsedAmount = parseUnits(amount, decimals);
      if (parsedAmount < MIN_DEPOSIT || parsedAmount > MAX_DEPOSIT) {
        throw new Error(
          `Deposit amount must be between ${formatEther(
            MIN_DEPOSIT
          )} and ${formatEther(MAX_DEPOSIT)} BDC`
        );
      }
      const isUserExists = await this.isUserExists(account);
      if (!isUserExists) {
        throw new Error("User is not registered");
      }
      const userInfo = await this.getUserInfo(account);
      if (parsedAmount < userInfo.lastDeposit) {
        throw new Error(
          `Deposit amount must be greater than or equal to last deposit: ${formatEther(
            userInfo.lastDeposit
          )} BDC`
        );
      }
      const balance = await this.getDWCBalance(account);
      const _inUsd = await this.daiToTokens(parsedAmount);
      if (balance < _inUsd) {
        throw new Error(
          `Insufficient DWC balance. Available: ${formatEther(
            balance
          )} BDC, Required: ${amount} BDC`
        );
      }
      const allowance = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "allowance",
        args: [account, DWC_CONTRACT_ADDRESS],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      if (allowance < parsedAmount) {
        console.log(`Approving ${amount} DWC for DWC contract`);
        const approvalTx = await this.approveDWC(parsedAmount, account);
        await waitForTransactionReceipt(config, {
          hash: approvalTx,
          chainId: TESTNET_CHAIN_ID,
        });
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "depositbdc",
        args: [parsedAmount],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "depositbdc",
        args: [parsedAmount],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error depositing DWC: ${error.message || error}`);
      throw error;
    }
  },

  async tokenSwap(
    tokenAmount: bigint,
    account: Address
  ): Promise<`0x${string}`> {
    try {
      console.log(`Swapping ${tokenAmount} DWC for USDC, ${account}`);

      // ✅ get wallet client (signer) from wagmi
      const walletClient = await getWalletClient(config);
      if (!walletClient) {
        throw new Error("Wallet not connected");
      }

      // ✅ write contract with signer
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "tokenSwap",
        args: [tokenAmount],
        account: walletClient.account, // signer address
        chainId: TESTNET_CHAIN_ID,
      });

      // ✅ wait for confirmation
      await waitForTransactionReceipt(config, {
        hash: txHash,
        chainId: TESTNET_CHAIN_ID,
      });

      return txHash;
    } catch (error: any) {
      console.error(`Error swapping tokens: ${error.message || error}`);
      throw error;
    }
  },
  async tokenSwapv2(
    tokenAmount: bigint,
    account: Address
  ): Promise<`0x${string}`> {
    try {
      // ✅ connect provider (BNB Testnet RPC)
      const provider = new ethers.providers.JsonRpcProvider(
        "https://bsc-testnet.publicnode.com"
      );

      // ✅ get signer from MetaMask
      const getSigner = async () => {
        if (!(window as any).ethereum) {
          throw new Error("MetaMask not detected");
        }
        const ethersProvider = new ethers.providers.Web3Provider(
          (window as any).ethereum
        );
        await ethersProvider.send("eth_requestAccounts", []); // request wallet connect
        const signer = ethersProvider.getSigner();
        return signer;
      };
      console.log(
        `Swapping ${ethers.utils.formatEther(
          tokenAmount
        )} DWC for USDC, ${account}`
      );

      const signer = await getSigner();
      const contract = new ethers.Contract(
        DWC_CONTRACT_ADDRESS,
        DWC_ABI,
        signer
      );

      // ✅ check balance
      const balance: ethers.BigNumber = await contract.balanceOf(account);
      if (balance.lt(tokenAmount)) {
        throw new Error(
          `Insufficient DWC balance. Available: ${ethers.utils.formatEther(
            balance
          )} DWC, Required: ${ethers.utils.formatEther(tokenAmount)} DWC`
        );
      }

      // ✅ estimate gas
      const gasEstimate = await contract.estimateGas.tokenSwap(tokenAmount);

      // ✅ send transaction
      const tx = await contract.tokenSwap(tokenAmount, {
        gasLimit: gasEstimate,
      });

      console.log("Transaction sent:", tx.hash);

      // ✅ wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt.transactionHash);

      return receipt.transactionHash;
    } catch (error: any) {
      console.error(`Error swapping tokens: ${error.message || error}`);
      throw error;
    }
  },

  async rewardWithdraw(
    rewardIndex: bigint,
    account: Address
  ): Promise<`0x${string}`> {
    try {
      console.log(`Withdrawing reward for index ${rewardIndex} for ${account}`);
      const isWithdrawActive = await this.isWithdrawActive();
      if (!isWithdrawActive) {
        throw new Error("Withdrawals are disabled");
      }
      const userCapping = await this.getUserCapping(account);
      if (!userCapping.Iswithdraw) {
        throw new Error("User withdrawals are not active");
      }
      const isUserExists = await this.isUserExists(account);
      if (!isUserExists) {
        throw new Error("User is not registered");
      }
      const order = await this.getOrderInfo(account, rewardIndex);
      if (!order.isactive) {
        throw new Error("Order is not active");
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "rewardWithdraw",
        args: [rewardIndex],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "rewardWithdraw",
        args: [rewardIndex],
        chain: bscTestnet,
        account,
        // gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error withdrawing reward: ${error.message || error}`);
      throw error;
    }
  },

  async burn(amount: bigint, account: Address): Promise<`0x${string}`> {
    try {
      console.log(`Burning ${formatEther(amount)} DWC for ${account}`);
      const dwcTokenPool = await this.getDWCTokenPool();
      if (account !== dwcTokenPool) {
        throw new Error("Only dwctokenPool can burn tokens");
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "burn",
        args: [amount, account],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "burn",
        args: [amount, account],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error burning tokens: ${error.message || error}`);
      throw error;
    }
  },

  async transfer(
    to: Address,
    value: bigint,
    account: Address
  ): Promise<`0x${string}`> {
    try {
      console.log(`Transferring ${formatEther(value)} DWC to ${to}`);
      const restrictedAddresses = [
        await dwcContractInteractions.getDWCTokenPool(),
        await dwcContractInteractions.getCommunityHoldingFund(),
        await dwcContractInteractions.getLiquidityPoolAddress(),
      ];
      if (restrictedAddresses.includes(account)) {
        throw new Error("Transfer from restricted address denied");
      }
      const balance = await dwcContractInteractions.getDWCBalance(account);
      if (balance < value) {
        throw new Error(
          `Insufficient balance. Available: ${formatEther(
            balance
          )} DWC, Required: ${formatEther(value)} DWC`
        );
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "transfer",
        args: [to, value],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "transfer",
        args: [to, value],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error transferring tokens: ${error.message || error}`);
      throw error;
    }
  },

  async transferFrom(
    from: Address,
    to: Address,
    value: bigint,
    account: Address
  ): Promise<`0x${string}`> {
    try {
      console.log(
        `Transferring ${formatEther(value)} DWC from ${from} to ${to}`
      );
      const allowance = await this.getAllowance(from, account);
      if (allowance < value) {
        throw new Error(
          `Insufficient allowance. Approved: ${formatEther(
            allowance
          )} DWC, Required: ${formatEther(value)} DWC`
        );
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "transferFrom",
        args: [from, to, value],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "transferFrom",
        args: [from, to, value],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(
        `Error transferring tokens from: ${error.message || error}`
      );
      throw error;
    }
  },

  async migrate(
    userAddress: Address,
    referrerAddress: Address,
    account: Address
  ): Promise<`0x${string}`> {
    try {
      console.log(
        `Migrating user ${userAddress} with referrer ${referrerAddress}`
      );
      const creator = await this.getCreator();
      if (account !== creator) {
        throw new Error("Only creator can migrate users");
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "migrate",
        args: [userAddress, referrerAddress],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "migrate",
        args: [userAddress, referrerAddress],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error migrating user: ${error.message || error}`);
      throw error;
    }
  },

  async update(creator: Address, account: Address): Promise<`0x${string}`> {
    try {
      console.log(`Updating creator to ${creator}`);
      const owner: Address = "0x078E9a7138610753BB4E76ae52384c03155EffEb";
      if (account !== owner) {
        throw new Error("Only owner can update creator");
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "update",
        args: [creator],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "update",
        args: [creator],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error updating creator: ${error.message || error}`);
      throw error;
    }
  },

  async updateContractROI(
    dayRewardPercents: bigint,
    account: Address
  ): Promise<`0x${string}`> {
    try {
      console.log(`Updating contract ROI to ${dayRewardPercents}`);
      const owner = "0x078E9a7138610753BB4E76ae52384c03155EffEb" as Address;
      if (account !== (owner as Address)) {
        throw new Error("Only owner can update contract ROI");
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "updateContractROI",
        args: [dayRewardPercents],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "updateContractROI",
        args: [dayRewardPercents],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error updating contract ROI: ${error.message || error}`);
      throw error;
    }
  },

  async updateContractWithdrawal(
    iswithdraw: boolean,
    account: Address
  ): Promise<`0x${string}`> {
    try {
      console.log(`Updating contract withdrawal status to ${iswithdraw}`);
      const owner = "0x078E9a7138610753BB4E76ae52384c03155EffEb" as Address;
      if (account !== owner) {
        throw new Error("Only owner can update contract withdrawal status");
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "updateContractWithdrawal",
        args: [iswithdraw],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "updateContractWithdrawal",
        args: [iswithdraw],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(
        `Error updating contract withdrawal status: ${error.message || error}`
      );
      throw error;
    }
  },

  async updateUserROI(
    user: Address,
    dayRewardPercents: bigint,
    account: Address
  ): Promise<`0x${string}`> {
    try {
      console.log(`Updating ROI for user ${user} to ${dayRewardPercents}`);
      const owner = "0x078E9a7138610753BB4E76ae52384c03155EffEb" as Address;
      if (account !== owner) {
        throw new Error("Only owner can update user ROI");
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "updateUserROI",
        args: [user, dayRewardPercents],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "updateUserROI",
        args: [user, dayRewardPercents],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(`Error updating user ROI: ${error.message || error}`);
      throw error;
    }
  },

  async updateUserWithdrawal(
    user: Address,
    iswithdraw: boolean,
    account: Address
  ): Promise<`0x${string}`> {
    try {
      console.log(
        `Updating withdrawal status for user ${user} to ${iswithdraw}`
      );
      const owner = "0x078E9a7138610753BB4E76ae52384c03155EffEb" as Address;
      if (account !== owner) {
        throw new Error("Only owner can update user withdrawal status");
      }
      const gasEstimate = await estimateGas(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "updateUserWithdrawal",
        args: [user, iswithdraw],
        chain: bscTestnet,
        account,
      });
      const txHash = await writeContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "updateUserWithdrawal",
        args: [user, iswithdraw],
        chain: bscTestnet,
        account,
        gas: gasEstimate,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
        chainId: TESTNET_CHAIN_ID,
      });
      return txHash as `0x${string}`;
    } catch (error: any) {
      console.error(
        `Error updating user withdrawal status: ${error.message || error}`
      );
      throw error;
    }
  },

  async getUserInfo(user: Address): Promise<UserInfo> {
    try {
      const result = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "users",
        args: [user],
        chainId: TESTNET_CHAIN_ID,
      })) as [
        bigint,
        Address,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint
      ];
      console.log(`User info for ${user}:`, result);
      return {
        id: result[0],
        referrer: result[1],
        partnersCount: result[2],
        teamCount: result[3],
        totalDeposit: result[4],
        lastDeposit: result[5],
        directBusiness: result[6],
        reward: result[7],
        levelincome: result[8],
        royaltyincome: result[9],
        maturityincome: result[10],
        totalreward: result[11],
        totalwithdraw: result[12],
        dayRewardPercents: result[13],
      };
    } catch (error: any) {
      console.error(`Error fetching user info: ${error.message || error}`);
      throw error;
    }
  },

  async getUserRank(user: Address): Promise<UserRank> {
    try {
      const rank = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "userranks",
        args: [user],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(`User rank for ${user}: ${rank}`);
      return { rank };
    } catch (error: any) {
      console.error(`Error fetching user rank: ${error.message || error}`);
      throw error;
    }
  },

  async getUserCapping(user: Address): Promise<UserCapping> {
    try {
      const [totalCapping, useCapping, Iswithdraw] = (await readContract(
        config,
        {
          abi: DWC_ABI,
          address: DWC_CONTRACT_ADDRESS,
          functionName: "userscapping",
          args: [user],
          chainId: TESTNET_CHAIN_ID,
        }
      )) as [bigint, bigint, boolean];
      console.log(`User capping for ${user}:`, {
        totalCapping,
        useCapping,
        Iswithdraw,
      });
      return { totalCapping, useCapping, Iswithdraw };
    } catch (error: any) {
      console.error(`Error fetching user capping: ${error.message || error}`);
      throw error;
    }
  },

  async getOrderInfo(user: Address, index: bigint): Promise<OrderInfo> {
    try {
      const [amount, holdingbonus, deposit_time, reward_time, isactive, isdai] =
        (await readContract(config, {
          abi: DWC_ABI,
          address: DWC_CONTRACT_ADDRESS,
          functionName: "orderInfos",
          args: [user, index],
          chainId: TESTNET_CHAIN_ID,
        })) as [bigint, bigint, bigint, bigint, boolean, boolean];
      console.log(`Order info for ${user} at index ${index}:`, {
        amount,
        holdingbonus,
        deposit_time,
        reward_time,
        isactive,
        isdai,
      });
      return {
        amount,
        holdingbonus,
        deposit_time,
        reward_time,
        isactive,
        isdai,
      };
    } catch (error: any) {
      console.error(`Error fetching order info: ${error.message || error}`);
      throw error;
    }
  },

  async getOrderLength(user: Address): Promise<bigint> {
    try {
      const length = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "getOrderLength",
        args: [user],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(`Order length for ${user}: ${length}`);
      return length;
    } catch (error: any) {
      console.error(`Error fetching order length: ${error.message || error}`);
      throw error;
    }
  },

  async getTeamCount(user: Address): Promise<TeamCount> {
    try {
      const [maxTeam, otherTeam] = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "getTeamCount",
        args: [user],
        chainId: TESTNET_CHAIN_ID,
      })) as [bigint, bigint];
      console.log(`Team count for ${user}:`, { maxTeam, otherTeam });
      return { maxTeam, otherTeam };
    } catch (error: any) {
      console.error(`Error fetching team count: ${error.message || error}`);
      throw error;
    }
  },

  async getActiveCount(user: Address, rank: bigint): Promise<bigint> {
    try {
      const activeCount = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "getActiveCount",
        args: [user, rank],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(`Active count for ${user} at rank ${rank}: ${activeCount}`);
      return activeCount;
    } catch (error: any) {
      console.error(`Error fetching active count: ${error.message || error}`);
      throw error;
    }
  },

  async getMaxPayout(user: Address): Promise<bigint> {
    try {
      const maxPayout = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "maxPayoutOf",
        args: [user],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(`Max payout for ${user}: ${formatEther(maxPayout)}`);
      return maxPayout;
    } catch (error: any) {
      console.error(`Error fetching max payout: ${error.message || error}`);
      throw error;
    }
  },

  async getCoinRate(): Promise<bigint> {
    try {
      const rate = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "coinRate",
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(`DWC coin rate: ${formatEther(rate)} USDC per DWC`);
      return rate;
    } catch (error: any) {
      console.error(`Error fetching coin rate: ${error.message || error}`);
      throw error;
    }
  },

  async daiToTokens(daiAmount: bigint): Promise<bigint> {
    try {
      const tokenAmount = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "_daiToTokens",
        args: [daiAmount],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(
        `${formatEther(daiAmount)} USDC converts to ${formatEther(
          tokenAmount
        )} DWC`
      );
      return tokenAmount;
    } catch (error: any) {
      console.error(
        `Error converting USDC to tokens: ${error.message || error}`
      );
      throw error;
    }
  },

  async tokensToDai(tokenAmount: bigint): Promise<bigint> {
    console.log("🚀 ~ tokensToDai ~ tokenAmount:", tokenAmount);
    try {
      const daiAmount = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "_tokensTodai",
        args: [tokenAmount],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(
        `${formatEther(tokenAmount)} DWC converts to ${formatEther(
          daiAmount
        )} USDC`
      );
      return daiAmount;
    } catch (error: any) {
      console.error(
        `Error converting tokens to USDC: ${error.message || error}`
      );
      throw error;
    }
  },

  async isUserExists(user: Address): Promise<boolean> {
    try {
      const exists = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "isUserExists",
        args: [user],
        chainId: TESTNET_CHAIN_ID,
      })) as boolean;
      console.log(`User ${user} exists: ${exists}`);
      return exists;
    } catch (error: any) {
      console.error(`Error checking user existence: ${error.message || error}`);
      return false;
    }
  },

  async getTotalSupply(): Promise<bigint> {
    try {
      const totalSupply = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "totalSupply",
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(`DWC total supply: ${formatEther(totalSupply)} DWC`);
      return totalSupply;
    } catch (error: any) {
      console.error(`Error fetching total supply: ${error.message || error}`);
      throw error;
    }
  },

  async getLiquidityPool(): Promise<{
    tokenAmount: bigint;
    daiAmount: bigint;
  }> {
    try {
      const [tokenAmount, daiAmount] = await Promise.all([
        readContract(config, {
          abi: DWC_ABI,
          address: DWC_CONTRACT_ADDRESS,
          functionName: "liquidityPool_tokenAmount",
          chainId: TESTNET_CHAIN_ID,
        }) as Promise<bigint>,
        readContract(config, {
          abi: DWC_ABI,
          address: DWC_CONTRACT_ADDRESS,
          functionName: "liquidityPool_daiAmount",
          chainId: TESTNET_CHAIN_ID,
        }) as Promise<bigint>,
      ]);
      console.log(
        "🚀 ~ getLiquidityPool ~ tokenAmount, daiAmount:",
        tokenAmount,
        daiAmount
      );
      console.log(
        `Liquidity pool: ${formatEther(tokenAmount)} DWC, ${formatEther(
          daiAmount
        )} USDC`
      );
      return { tokenAmount, daiAmount };
    } catch (error: any) {
      console.error(`Error fetching liquidity pool: ${error.message || error}`);
      throw error;
    }
  },

  async getBurnedTokens(): Promise<bigint> {
    try {
      const burnedTokens = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "_burnToken",
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(`Burned tokens: ${formatEther(burnedTokens)} DWC`);
      return burnedTokens;
    } catch (error: any) {
      console.error(`Error fetching burned tokens: ${error.message || error}`);
      throw error;
    }
  },

  async getAllowance(owner: Address, spender: Address): Promise<bigint> {
    try {
      const allowance = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "allowance",
        args: [owner, spender],
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(
        `Allowance for ${owner} to ${spender}: ${formatEther(allowance)} DWC`
      );
      return allowance;
    } catch (error: any) {
      console.error(`Error fetching allowance: ${error.message || error}`);
      throw error;
    }
  },

  async isWithdrawActive(): Promise<boolean> {
    try {
      const isActive = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "Iswithdraw",
        chainId: TESTNET_CHAIN_ID,
      })) as boolean;
      console.log(`Withdraw active: ${isActive}`);
      return isActive;
    } catch (error: any) {
      console.error(
        `Error checking withdraw status: ${error.message || error}`
      );
      throw error;
    }
  },

  async getCommunityHoldingFund(): Promise<Address> {
    try {
      const address = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "communityHoldingFund",
        chainId: TESTNET_CHAIN_ID,
      })) as `0x${string}`;
      console.log(`Community holding fund: ${address}`);
      return address;
    } catch (error: any) {
      console.error(
        `Error fetching community holding fund: ${error.message || error}`
      );
      throw error;
    }
  },

  async getCreator(): Promise<Address> {
    try {
      const creator = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "creator",
        chainId: TESTNET_CHAIN_ID,
      })) as `0x${string}`;
      console.log(`Creator: ${creator}`);
      return creator;
    } catch (error: any) {
      console.error(`Error fetching creator: ${error.message || error}`);
      throw error;
    }
  },

  async getDaiAddress(): Promise<Address> {
    try {
      const daiAddress = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "dai",
        chainId: TESTNET_CHAIN_ID,
      })) as `0x${string}`;
      console.log(`USDC address: ${daiAddress}`);
      return daiAddress;
    } catch (error: any) {
      console.error(`Error fetching USDC address: ${error.message || error}`);
      throw error;
    }
  },

  async getDayRewardPercents(): Promise<bigint> {
    try {
      const percents = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "dayRewardPercents",
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(`Day reward percents: ${percents}`);
      return percents;
    } catch (error: any) {
      console.error(
        `Error fetching day reward percents: ${error.message || error}`
      );
      throw error;
    }
  },

  async getDecimals(): Promise<number> {
    try {
      const decimals = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "decimals",
        chainId: TESTNET_CHAIN_ID,
      })) as number;
      console.log(`Decimals: ${decimals}`);
      return decimals;
    } catch (error: any) {
      console.error(`Error fetching decimals: ${error.message || error}`);
      throw error;
    }
  },

  async getDWCTokenPool(): Promise<`0x${string}`> {
    try {
      const address = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "bdctokenPool",
        chainId: TESTNET_CHAIN_ID,
      })) as `0x${string}`;
      console.log(`DWC token pool: ${address}`);
      return address;
    } catch (error: any) {
      console.error(`Error fetching DWC token pool: ${error.message || error}`);
      throw error;
    }
  },

  async getExtraPool(): Promise<`0x${string}`> {
    try {
      const address = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "extraPool",
        chainId: TESTNET_CHAIN_ID,
      })) as `0x${string}`;
      console.log(`Extra pool: ${address}`);
      return address;
    } catch (error: any) {
      console.error(`Error fetching extra pool: ${error.message || error}`);
      throw error;
    }
  },

  async getFeeWallet(index: bigint): Promise<`0x${string}`> {
    try {
      const address = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "feewallet",
        args: [index],
        chainId: TESTNET_CHAIN_ID,
      })) as `0x${string}`;
      console.log(`Fee wallet at index ${index}: ${address}`);
      return address;
    } catch (error: any) {
      console.error(`Error fetching fee wallet: ${error.message || error}`);
      throw error;
    }
  },

  async getId1(): Promise<`0x${string}`> {
    try {
      const id1 = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "id1",
        chainId: TESTNET_CHAIN_ID,
      })) as `0x${string}`;
      console.log(`ID1: ${id1}`);
      return id1;
    } catch (error: any) {
      console.error(`Error fetching id1: ${error.message || error}`);
      throw error;
    }
  },

  async getLastUserId(): Promise<bigint> {
    try {
      const lastUserId = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "lastUserId",
        chainId: TESTNET_CHAIN_ID,
      })) as bigint;
      console.log(`Last user ID: ${lastUserId}`);
      return lastUserId;
    } catch (error: any) {
      console.error(`Error fetching last user ID: ${error.message || error}`);
      throw error;
    }
  },

  async getLiquidityPoolAddress(): Promise<`0x${string}`> {
    try {
      const address = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "liquidityPool",
        chainId: TESTNET_CHAIN_ID,
      })) as `0x${string}`;
      console.log(`Liquidity pool address: ${address}`);
      return address;
    } catch (error: any) {
      console.error(
        `Error fetching liquidity pool address: ${error.message || error}`
      );
      throw error;
    }
  },

  async getPriceImpactWallet(): Promise<`0x${string}`> {
    try {
      const address = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "priceimpactwallet",
        chainId: TESTNET_CHAIN_ID,
      })) as `0x${string}`;
      console.log(`Price impact wallet: ${address}`);
      return address;
    } catch (error: any) {
      console.error(
        `Error fetching price impact wallet: ${error.message || error}`
      );
      throw error;
    }
  },

  async getName(): Promise<string> {
    try {
      const name = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "name",
        chainId: TESTNET_CHAIN_ID,
      })) as string;
      console.log(`Contract name: ${name}`);
      return name;
    } catch (error: any) {
      console.error(`Error fetching contract name: ${error.message || error}`);
      throw error;
    }
  },

  async getSymbol(): Promise<string> {
    try {
      const symbol = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "symbol",
        chainId: TESTNET_CHAIN_ID,
      })) as string;
      console.log(`Contract symbol: ${symbol}`);
      return symbol;
    } catch (error: any) {
      console.error(
        `Error fetching contract symbol: ${error.message || error}`
      );
      throw error;
    }
  },

  async getRank(rankId: bigint): Promise<Rank> {
    try {
      const [id, activedirect, activeteam] = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "map_ranks",
        args: [rankId],
        chainId: TESTNET_CHAIN_ID,
      })) as [bigint, bigint, bigint];
      console.log(`Rank ${rankId}:`, { id, activedirect, activeteam });
      return { id, activedirect, activeteam };
    } catch (error: any) {
      console.error(`Error fetching rank: ${error.message || error}`);
      throw error;
    }
  },

  async getCommunityFundDAIBalance(): Promise<bigint> {
    try {
      const fundAddress = await this.getCommunityHoldingFund();
      return this.getUSDCBalance(fundAddress);
    } catch (error: any) {
      console.error(
        `Error fetching community fund USDT balance: ${error.message || error}`
      );
      throw error;
    }
  },

  async getCommunityFundDWCBalance(): Promise<bigint> {
    try {
      const fundAddress = await this.getCommunityHoldingFund();
      return this.getDWCBalance(fundAddress);
    } catch (error: any) {
      console.error(
        `Error fetching community fund DWC balance: ${error.message || error}`
      );
      throw error;
    }
  },

  async getLiquidityPoolDAIBalance(): Promise<bigint> {
    try {
      const poolAddress = await this.getLiquidityPoolAddress();
      return this.getUSDCBalance(poolAddress);
    } catch (error: any) {
      console.error(
        `Error fetching liquidity pool USDC balance: ${error.message || error}`
      );
      throw error;
    }
  },

  async getLiquidityPoolDWCBalance(): Promise<bigint> {
    try {
      const poolAddress = await this.getLiquidityPoolAddress();
      return this.getDWCBalance(poolAddress);
    } catch (error: any) {
      console.error(
        `Error fetching liquidity pool DWC balance: ${error.message || error}`
      );
      throw error;
    }
  },

  async getWithdrawFee(): Promise<`0x${string}`> {
    try {
      const address = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "withdrawfee",
        chainId: TESTNET_CHAIN_ID,
      })) as `0x${string}`;
      console.log(`Withdraw fee address: ${address}`);
      return address;
    } catch (error: any) {
      console.error(
        `Error fetching withdraw fee address: ${error.message || error}`
      );
      throw error;
    }
  },

  async bonusInfos(user: Address): Promise<BonusInfo> {
    try {
      const result = (await readContract(config, {
        abi: DWC_ABI,
        address: DWC_CONTRACT_ADDRESS,
        functionName: "bonusInfos",
        args: [user],
        chainId: TESTNET_CHAIN_ID,
      })) as [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint
      ];
      console.log(`Bonus info for ${user}:`, result);
      return {
        referralGains: result[0],
        levelGains: result[1],
        growthGains: result[2],
        teamGrowthGains: result[3],
        leaderGains: result[4],
        developmentGains: result[5],
        teamLevelStake: result[6],
        lapsTeamStake: result[7],
        totalStake: result[8],
        totalUnStake: result[9],
        totalWithdrwan: result[10],
        inOutBuy: result[11],
      };
    } catch (error: any) {
      console.error(`Error fetching bonus info: ${error.message || error}`);
      throw error;
    }
  },
};

// Export individual functions for convenience
export const { approveUSDC } = usdcContractInteractions;

export const {
  approveDWC,
  getUSDCBalance,
  getDWCBalance,
  register,
  deposit,
  depositDWC,
  tokenSwap,
  tokenSwapv2,
  rewardWithdraw,
  burn,
  transfer,
  transferFrom,
  migrate,
  update,
  updateContractROI,
  updateContractWithdrawal,
  updateUserROI,
  updateUserWithdrawal,
  getUserInfo,
  getUserRank,
  getUserCapping,
  getOrderInfo,
  getOrderLength,
  getTeamCount,
  getActiveCount,
  getMaxPayout,
  getCoinRate,
  daiToTokens,
  tokensToDai,
  isUserExists,
  getTotalSupply,
  getLiquidityPool,
  getBurnedTokens,
  getAllowance,
  isWithdrawActive,
  getCommunityHoldingFund,
  getCreator,
  getDaiAddress,
  getDayRewardPercents,
  getDecimals,
  getDWCTokenPool,
  getExtraPool,
  getFeeWallet,
  getId1,
  getLastUserId,
  getLiquidityPoolAddress,
  getPriceImpactWallet,
  getName,
  getSymbol,
  getRank,
  getCommunityFundDAIBalance,
  getCommunityFundDWCBalance,
  getLiquidityPoolDAIBalance,
  getLiquidityPoolDWCBalance,
} = dwcContractInteractions;
