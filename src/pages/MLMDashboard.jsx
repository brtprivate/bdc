import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import React, { useEffect, useState } from 'react';
import { decodeErrorResult, formatUnits, parseUnits } from 'viem';
import { useChainId, useSwitchChain } from 'wagmi';
import { config } from '../config/web3modal';
import { useWallet } from '../context/WalletContext';
import { USDC_CONTRACT_ADDRESS } from '../services/approvalservice';
import { TESTNET_CHAIN_ID, USDC_ABI, dwcContractInteractions } from '../services/contractService';
// import RankLogsDashboard from '../components/sections/RankLogsDashboard';
// Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  PiggyBank,
  TrendingUp,
  ArrowDownToLine,
  Users,
  Layers,
  Coins,
  UserMinus,
  UserPlus,
  Crown,
  Banknote
} from 'lucide-react';
import ContractStatsSection from '../components/sections/ContractStatsSection';
import { useWeb3Modal } from '@web3modal/wagmi/react';

// Styled Grid component to enforce mobile-first layout
const MobileFirstGrid = styled(Grid)(({ theme }) => ({
  '& .MuiGrid-item': {
    [theme.breakpoints.down('sm')]: {
      width: '100% !important',
      maxWidth: '100% !important',
      flexBasis: '100% !important',
      flex: '0 0 100% !important',
    },
  },
}));

const MLMDashboard = () => {
  const { open } = useWeb3Modal();

  const wallet = useWallet();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Inject CSS to ensure mobile-first layout for Performance Overview
  React.useEffect(() => {
    const styleId = 'performance-overview-mobile-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media (max-width: 599px) {
          .performance-overview-grid .MuiGrid-item {
            width: 100% !important;
            max-width: 100% !important;
            flex-basis: 100% !important;
            flex: 0 0 100% !important;
          }
          .performance-overview-grid .MuiGrid-item .MuiCard-root {
            width: 100% !important;
            margin: 0 !important;
          }
          .performance-overview-grid .MuiCardContent-root {
            text-align: center !important;
          }
          .performance-overview-grid .MuiBox-root {
            justify-content: center !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawingIndex, setWithdrawingIndex] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [depositType, setDepositType] = useState('usdt');
  const [notRegistered, setNotRegistered] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [mlmData, setMlmData] = useState({
    myHolding: 0,
    bdcBalance: 0,
    usdtBalance: 0,
    myHoldingBdc: 0,
    retentionBonus: 0,
    releasedRetentionBonus: 0,
    residualBonus: 0,
    levelIncome: 0,
    royaltyIncome: 0,
    totalIncome: 0,
    totalWithdraw: 0,
    partnersCount: 0,
    teamCount: 0,
    userRank: 0,
    totalCapping: 0,
    useCapping: 0,
    usdcBalance: 0,
    dwcBalance: 0,
    coinRate: 0,
  });
  const [rewardsData, setRewardsData] = useState({
    retentionBonus: 0,
    releasedRetentionBonus: 0,
    residualBonus: 0,
    levelIncome: 0,
    royaltyIncome: 0,
    totalIncome: 0,
    totalWithdraw: 0,
    availableToWithdraw: 0,
    bnbBalance: 0,
  });
  const [orders, setOrders] = useState([]);

  // Format DWC amount
  const formatDWC = (amount = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const fetchMlmData = async () => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Wallet not connected. Please connect your wallet.');
      return;
    }

    if (chainId !== TESTNET_CHAIN_ID) {
      try {
        await switchChain({ chainId: TESTNET_CHAIN_ID });
      } catch (error) {
        setError('Please switch to BSC Testnet.');
        return;
      }
    }

    try {
      setIsLoading(true);
      setError('');

      const userInfo = await dwcContractInteractions.getUserInfo(wallet.account);
      console.log('User Info:', userInfo);
      if (!userInfo?.id || userInfo.id === 0n) {
        setNotRegistered(true);
        setIsLoading(false);
        return;
      }

      setNotRegistered(false);

      // Fetch additional data
      console.log('🚀 Dashboard: Starting comprehensive data fetch...');
      const [
        usdcBalanceRaw,
        dwcBalanceRaw,
        userCapping,
        userRank,
        orderLength,
        coinRateRaw,
        bonusInfo,
      ] = await Promise.all([
        dwcContractInteractions.getUSDCBalance(wallet.account),
        dwcContractInteractions.getDWCBalance(wallet.account),
        dwcContractInteractions.getUserCapping(wallet.account),
        dwcContractInteractions.getUserRank(wallet.account), // 🏆 This will trigger enhanced logging
        dwcContractInteractions.getOrderLength(wallet.account),
        dwcContractInteractions.getCoinRate(),
        // dwcContractInteractions.bonusInfos(wallet.account),
      ]);

      console.log('✅ Dashboard: All data fetched successfully');
      console.log('🏆 Dashboard: User Rank Result:', userRank);

      console.log('Raw USDC Balance:', usdcBalanceRaw);
      console.log('Coin Rate:', coinRateRaw);
      console.log('Order Length:', orderLength);
      console.log('Bonus Info:', bonusInfo);

      // Fetch orders and calculate total active USDC
      const ordersData = [];
      let totalActiveUsdc = 0;
      for (let i = 0n; i < orderLength; i++) {
        const order = await dwcContractInteractions.getOrderInfo(wallet.account, i);
        console.log(`Order ${i}:`, order);
        if (order.isactive) {
          totalActiveUsdc += parseFloat(formatUnits(order.amount, 18));
        }
        ordersData.push(order);
      }

      setOrders(ordersData);

      // Calculate myHolding based on total active USDC and coin rate
      const coinRate = parseFloat(formatUnits(coinRateRaw, 18)) || 1;
      const myHolding = totalActiveUsdc / coinRate;

      console.log('Total Active USDC:', totalActiveUsdc);
      console.log('Calculated My Holding (DWC):', myHolding);
      // console.log('Calculated My Holding usdt to (DWC):', holdingInDWC);

      setMlmData({
        myHoldingBdc: myHolding || 0,
        myHolding: totalActiveUsdc || 0,
        bdcBalance: parseFloat(formatUnits(dwcBalanceRaw, 18)) || 0,
        usdtBalance: parseFloat(formatUnits(usdcBalanceRaw, 18)) || 0,
        // retentionBonus: parseFloat(formatUnits(bonusInfo.teamGrowthGains || 0n, 18)) || 0,
        // releasedRetentionBonus: parseFloat(formatUnits(bonusInfo.developmentGains || 0n, 18)) || 0,
        // residualBonus: parseFloat(formatUnits(bonusInfo.referralGains || 0n, 18)) || 0,
        levelIncome: parseFloat(formatUnits(userInfo?.levelincome || 0n, 18)) || 0,
        royaltyIncome: parseFloat(formatUnits(userInfo?.royaltyincome || 0n, 18)) || 0,
        totalIncome: parseFloat(formatUnits(userInfo?.totalreward || 0n, 18)) || 0,
        totalWithdraw: parseFloat(formatUnits(userInfo?.totalwithdraw || 0n, 18)) || 0,
        partnersCount: Number(userInfo?.partnersCount) || 0,
        teamCount: Number(userInfo?.teamCount) || 0,
        userRank: Number(userRank?.rank) || 0,
        totalCapping: parseFloat(formatUnits(userCapping?.totalCapping || 0n, 18)) || 0,
        useCapping: parseFloat(formatUnits(userCapping?.useCapping || 0n, 18)) || 0,
        usdcBalance: parseFloat(formatUnits(usdcBalanceRaw, 18)) || 0,
        dwcBalance: parseFloat(formatUnits(dwcBalanceRaw, 18)) || 0,
        coinRate: coinRate,
      });
    } catch (error) {
      console.error('Error fetching MLM data:', error);
      setError('Failed to fetch MLM data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRewardsData = async () => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Wallet not connected. Please connect your wallet.');
      return;
    }

    if (chainId !== TESTNET_CHAIN_ID) {
      try {
        await switchChain({ chainId: TESTNET_CHAIN_ID });
      } catch (error) {
        setError('Please switch to BSC Testnet.');
        return;
      }
    }

    try {
      setIsLoading(true);
      setError('');
      setNotRegistered(false);

      const [userInfo, userCapping] = await Promise.all([
        dwcContractInteractions.getUserInfo(wallet.account),
        dwcContractInteractions.getUserCapping(wallet.account),
      ]);

      const [totalDepositBDC] = await Promise.all([
        dwcContractInteractions.daiToTokens(userInfo.totalDeposit || 0n),

      ]);

      if (process.env.NODE_ENV === 'development') {
        console.log('User Info for Rewards:', userInfo);
      }

      console.log("🚀 ~ fetchRewardsData ~ userInfo:", userInfo)
      if (!userInfo?.id || userInfo.id === 0n) {
        setError('User not registered. Please register to view rewards.');
        setNotRegistered(true);
        setIsLoading(false);
        return;
      }

      setRewardsData({
        retentionBonus: parseFloat(formatUnits(userInfo?.reward || 0n, 18)) || 0,
        releasedRetentionBonus: parseFloat(formatUnits((userInfo?.totalreward || 0n) - (userInfo?.totalwithdraw || 0n), 18)) || 0,
        residualBonus: parseFloat(formatUnits(userInfo?.maturityincome || 0n, 18)) || 0,
        levelIncome: parseFloat(formatUnits(userInfo?.levelincome || 0n, 18)) || 0,
        royaltyIncome: parseFloat(formatUnits(userInfo?.royaltyincome || 0n, 18)) || 0,
        totalIncome: parseFloat(formatUnits(userInfo?.totalreward || 0n, 18)) || 0,
        totalWithdraw: parseFloat(formatUnits(userInfo?.totalwithdraw || 0n, 18)) || 0,
        availableToWithdraw: parseFloat(formatUnits(userCapping?.totalCapping || 0n, 18)) - parseFloat(formatUnits(userCapping?.useCapping || 0n, 18)) || 0,
        totalDeposit: parseFloat(formatUnits(userInfo?.totalDeposit || 0n, 18)) || 0,
        totalDepositBDC: totalDepositBDC ? parseFloat(formatUnits(totalDepositBDC, 18)) : 0,
        // bnbBalance: bnbBalance ? parseFloat(formatUnits(bnbBalance.value, 18)) : 0,
      });
    } catch (error) {
      console.error('Error fetching rewards data:', error);
      let errorMessage = 'Failed to fetch rewards data. Please try again.';
      if (error.cause?.data) {
        const decodedError = decodeErrorResult({
          abi: USDC_ABI,
          data: error.cause.data,
        });
        errorMessage = `Error: ${decodedError.errorName || 'Unknown error'} - ${decodedError.args?.join(', ') || ''}`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.isConnected && wallet.account) {
      fetchMlmData();
      fetchRewardsData()
    }
  }, [wallet.isConnected, wallet.account, chainId]);



  // Check for referral code in URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref"); // 👉 gives you the value of ?ref=
    if (ref) {
      open()
      setReferralCode(ref);
      setShowReferralInput(true);
      // now reset the URL to prevent re-adding the ref code on reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }

  }, []);

  const handleRegister = async () => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Please connect your wallet to register.');
      return;
    }

    if (chainId !== TESTNET_CHAIN_ID) {
      try {
        await switchChain({ chainId: TESTNET_CHAIN_ID });
      } catch (error) {
        setError('Please switch to BSC Testnet.');
        return;
      }
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const decimals = await readContract(config, {
        abi: USDC_ABI,
        address: USDC_CONTRACT_ADDRESS,
        functionName: 'decimals',
        chainId: TESTNET_CHAIN_ID,
      });
      // const approveAmount = parseUnits('1', Number(decimals));
      // const approvalTx = await dwcContractInteractions.approveUSDC(approveAmount, wallet.account);
      // await waitForTransactionReceipt(config, { hash: approvalTx, chainId: TESTNET_CHAIN_ID });

      const refCode = referralCode || '0xA841371376190547E54c8Fa72B0e684191E756c7';
      const registerTx = await dwcContractInteractions.register(refCode, wallet.account);
      await waitForTransactionReceipt(config, { hash: registerTx, chainId: TESTNET_CHAIN_ID });

      setSuccess(`Registration successful! Transaction: ${registerTx}`);
      setReferralCode('');
      setShowReferralInput(false);
      setTimeout(fetchMlmData, 3000);
    } catch (error) {
      console.error('Error registering user:', error);
      if (error.cause?.data) {
        const decodedError = decodeErrorResult({
          abi: USDC_ABI,
          data: error.cause.data,
        });
        setError(`Registration failed: ${decodedError.errorName || 'Unknown error'} - ${decodedError.args?.join(', ') || ''}`);
      } else if (error.message?.includes('User rejected')) {
        setError('Transaction was cancelled by user');
      } else if (error.message?.includes('insufficient')) {
        setError('Insufficient USDC balance or BNB for gas fees. Ensure you have ~1 USDC and ~0.05 BNB.');
      } else if (error.message?.includes('already registered')) {
        setError('Address is already registered');
      } else {
        setError(`Failed to register: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async () => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Please connect your wallet to stake.');
      return;
    }

    if (chainId !== TESTNET_CHAIN_ID) {
      try {
        await switchChain({ chainId: TESTNET_CHAIN_ID });
      } catch (error) {
        setError('Please switch to BSC Testnet.');
        return;
      }
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const amount = stakeAmount.trim();
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        setError('Please enter a valid stake amount.');
        return;
      }

      let stakeInUSDT = 0;

      if (depositType === 'bdc') {
        stakeInUSDT = amount

        /* Additional logic for BDC deposits can go here */

        if ((Number(stakeAmount) / (mlmData.coinRate || 1)).toFixed(4) > mlmData.bdcBalance) {
          setError('Insufficient BDC balance.');
          return;
        }
      } else {
        stakeInUSDT = Number(amount);
        if (Number(amount) > mlmData.usdtBalance) {
          setError('Insufficient USDT balance.');
          return;
        }
      }

      if (stakeInUSDT < 50 || stakeInUSDT > 10000) {
        setError('Stake must be between 50 and 10,000 USDT (equivalent).');
        return;
      }

      // --- TX handling ---
      const txHash =
        depositType === 'bdc'
          ? await dwcContractInteractions.depositDWC(amount, wallet.account)
          : await dwcContractInteractions.deposit(amount, wallet.account);

      await waitForTransactionReceipt(config, {
        hash: txHash,
        chainId: TESTNET_CHAIN_ID,
      });

      setSuccess(`Successfully staked ${amount} ${depositType.toUpperCase()}! TX: ${txHash}`);

      setStakeAmount('');
      setTimeout(fetchMlmData, 3000);
    } catch (error) {
      console.error('Error staking:', error);
      if (error.message?.includes('User rejected')) {
        setError('Transaction was cancelled by user');
      } else if (error.message?.includes('insufficient')) {
        setError('Insufficient balance or BNB for gas fees.');
      } else if (error.message?.includes('not registered')) {
        setError('You must be registered to stake.');
      } else {
        setError(`Failed to stake: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleWithdrawReward = async (index) => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Please connect your wallet to withdraw.');
      return;
    }

    if (chainId !== TESTNET_CHAIN_ID) {
      try {
        await switchChain({ chainId: TESTNET_CHAIN_ID });
      } catch (error) {
        setError('Please switch to BSC Testnet.');
        return;
      }
    }

    try {
      setWithdrawingIndex(index);
      setError('');
      setSuccess('');

      const txHash = await dwcContractInteractions.rewardWithdraw(index, wallet.account);
      await waitForTransactionReceipt(config, { hash: txHash, chainId: TESTNET_CHAIN_ID });

      setSuccess(`Successfully withdrawn reward! Transaction: ${txHash}`);

      setTimeout(fetchMlmData, 3000);
    } catch (error) {
      console.error('Error withdrawing reward:', error);
      if (error.message?.includes('User rejected')) {
        setError('Transaction was cancelled by user');
      } else if (error.message?.includes('Withdrawals are disabled')) {
        setError('Withdrawals are currently disabled.');
      } else {
        setError(`Failed to withdraw reward: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setWithdrawingIndex(null);
    }
  };

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (timestamp = 0) => {
    return timestamp ? new Date(Number(timestamp) * 1000).toLocaleString() : 'N/A';
  };

  if (!wallet.isConnected) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, background: 'linear-gradient(135deg, #f0f4ff 0%, #d9e4ff 100%)', minHeight: '100vh' }}>
        <Alert severity="warning">Please connect your wallet to view the dashboard.</Alert>
      </Container>
    );
  }

  if (isLoading && !mlmData.myHolding) {
    return (
      <Container
        maxWidth="xl"
        sx={{ py: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #d9e4ff 100%)' }}
      >
        <CircularProgress />
      </Container>
    );
  }

  const registrationAlert = notRegistered ? (
    showReferralInput ? (
      <Alert
        severity="info"
        sx={{ mb: 2 }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              label="Referral ID (optional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <Button
              color="inherit"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={handleRegister}
              disabled={isLoading}
            >
              Register
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={() => setShowReferralInput(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Box>
        }
      >
        Enter a referral ID if you have one, or leave blank to use the default.
      </Alert>
    ) : (
      <Alert
        severity="info"
        sx={{ mb: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => setShowReferralInput(true)}
            disabled={isLoading}
          >
            Register Now
          </Button>
        }
      >
        You need to register to participate in the system. Click "Register Now" to enter a referral ID (optional).
      </Alert>
    )
  ) : null;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, background: 'linear-gradient(135deg, #f0f4ff 0%, #d9e4ff 100%)', minHeight: '100vh' }}>
      {registrationAlert}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box
        sx={{
          mb: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Monitor your team performance and manage your investments
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchMlmData}
          disabled={isLoading}
          sx={{ width: { xs: '100%', sm: 'auto' }, fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={2}>

      

        {/* Third Box: Contract Stats & Balances */}
        <Grid item xs={12} sx={{ order: 1 }}>
          <ContractStatsSection />
        </Grid>

        {/* Second Box: Trading & Referrals */}
        <Grid item xs={12} md={4} sx={{ order: { xs: 2, } }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: 'primary.main', fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Stack to Earn More
            </Typography>

            {/* Stake Section */}
            {!notRegistered && (
              <Box
                sx={{
                  mb: { xs: 3, sm: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: 'primary.main',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 'bold',
                  }}
                >
                  Stake USDT / BDC
                </Typography>

                <TextField
                  fullWidth
                  label="Amount to Stake"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  type="number"
                  error={!!error}
                  helperText={error}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ m: 0 }}>
                        <Select
                          value={depositType}
                          onChange={(e) => setDepositType(e.target.value)}
                          variant="filled"
                          disableUnderline
                          sx={{
                            minWidth: 70,
                            ml: 0,
                            fontSize: '0.875rem',
                            '& .MuiSelect-select': { py: 0.5, px: 1 },
                          }}
                        >
                          <MenuItem value="usdt">USDT</MenuItem>
                          <MenuItem value="bdc">BDC</MenuItem>
                        </Select>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Converted amount display */}
                {stakeAmount && !isNaN(Number(stakeAmount)) && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                  >
                    {/* {depositType === 'usdt'
                      ? `≈ ${(Number(stakeAmount) / (mlmData.coinRate || 1)).toFixed(4)} BDC`
                      : `≈ ${(Number(stakeAmount) * (mlmData.coinRate || 1)).toFixed(4)} USDT`} */}
                    {`≈ ${(Number(stakeAmount) / (mlmData.coinRate || 1)).toFixed(4)} BDC`}
                  </Typography>
                )}

                {/* Balance cards */}
                {/* Balance cards */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 120,
                      p: 1.5,
                      borderRadius: 2,
                      border: depositType === 'bdc' ? '2px solid' : '1px solid',
                      borderColor: depositType === 'bdc' ? 'primary.main' : 'divider',
                      bgcolor: 'background.default',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      BDC Balance
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, wordBreak: 'break-word' }}
                    >
                      {mlmData?.bdcBalance.toFixed(4)} BDC
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 120,
                      p: 1.5,
                      borderRadius: 2,
                      border: depositType === 'usdt' ? '2px solid' : '1px solid',
                      borderColor: depositType === 'usdt' ? 'primary.main' : 'divider',
                      bgcolor: 'background.default',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      USDT Balance
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, wordBreak: 'break-word' }}
                    >
                      {mlmData?.usdtBalance.toFixed(4)} USDT
                    </Typography>
                  </Box>
                </Box>


                <Button
                  variant="contained"
                  startIcon={<Banknote size={20} />}
                  onClick={handleStake}
                  disabled={isLoading || !stakeAmount}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mt: 1 }}
                >
                  Stake Now
                </Button>
                {success && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 1 }}>
                    {success}
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 1 }}
                >
                  Stake between 50 and 10,000 USDT. Current coin rate:{" "}
                  {mlmData.coinRate.toFixed(4)} USDT/BDC
                </Typography>
              </Box>

            )}

            {/* Referral Code Section */}
            {/* <Box sx={{ mb: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ color: 'primary.main', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Your Referral Code
              </Typography>
              <TextField
                fullWidth
                label="Referral Code"
                value={wallet.account || ''}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={async () => {
                    if (wallet.account) {
                      const refLink = `${window.location.origin}?ref=${wallet.account}`;
                      await navigator.clipboard.writeText(refLink);
                      setSuccess('Referral code copied to clipboard!');
                    }
                  }}
                  disabled={!wallet.account}
                  sx={{ flex: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Copy
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (wallet.account) {
                      const shareText = `Join me on the platform! Use my referral code: ${wallet.account}`;
                      if (navigator.share) {
                        navigator
                          .share({
                            title: 'Referral',
                            text: shareText,
                            url: window.location.origin,
                          })
                          .catch(() => {
                            navigator.clipboard.writeText(shareText);
                            setSuccess('Referral message copied to clipboard!');
                          });
                      } else {
                        navigator.clipboard.writeText(shareText);
                        setSuccess('Referral message copied to clipboard!');
                      }
                    }
                  }}
                  disabled={!wallet.account}
                  sx={{ flex: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Share
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Share this code to earn referral bonuses when friends join and stake!
              </Typography>
            </Box> */}
          </Card>
        </Grid>

        {/* First Box: Performance Overview */}
        <Grid item xs={12} md={8} sx={{ order: { xs: 3 } }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: 'primary.main', fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Performance Overview
            </Typography>

            {/* Financial Overview */}
            {/* <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: 'primary.main',
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '1rem', sm: '1.25rem' },
                textAlign: 'center'
              }}
            >
              Financial Overview
            </Typography> */}
            <MobileFirstGrid
              container
              spacing={{ xs: 1, sm: 2 }}
              sx={{ mb: { xs: 3, sm: 4 } }}
              className="performance-overview-grid"
            >
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                sx={{
                  '@media (max-width: 599px)': {
                    width: '100% !important',
                    maxWidth: '100% !important',
                    flexBasis: '100% !important'
                  }
                }}
              >
                <Card sx={{
                  p: { xs: 1.5, sm: 2 },
                  boxShadow: 2,
                  height: '100%',
                  '@media (max-width: 599px)': {
                    width: '100% !important',
                    margin: '0 !important'
                  }
                }}>
                  <CardContent sx={{
                    p: { xs: 1, sm: 2 },
                    '&:last-child': { pb: { xs: 1, sm: 2 } },
                    textAlign: 'center'
                  }}>
                    {/* Header */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}>
                      <PiggyBank size={24} style={{ color: '#1976d2', marginRight: '8px' }} />
                      <Typography variant="h6" sx={{
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        fontWeight: 600
                      }}>
                        My Holding
                      </Typography>
                    </Box>

                    {/* Values Row */}
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                      gap: 1
                    }}>
                      {/* USDT Holding */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 'bold',
                            color: 'info.main',
                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                          }}
                        >
                          {formatCurrency(rewardsData?.totalDeposit || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                          fontSize: { xs: '0.75rem', sm: '0.8rem' }
                        }}>
                          USDT
                        </Typography>
                      </Box>

                      {/* BDC Holding */}
                      {/* <Box>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 'bold', color: 'warning.main', fontSize: '1.25rem' }}
                        >
                          {formatDWC(rewardsData?.totalDepositBDC || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          BDC
                        </Typography>
                      </Box> */}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <MonetizationOnIcon sx={{ color: 'success.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        Team Withdrawal Bonus
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.residualBonus)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid> */}
              {/* <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <TrendingUpIcon sx={{ color: 'secondary.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        Team Referral Bonus
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.levelIncome)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <DiamondIcon sx={{ color: 'warning.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        Stack Bonus
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.retentionBonus)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <TimelineIcon sx={{ color: 'info.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        Stack Bonus
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.releasedRetentionBonus)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <EmojiEventsIcon sx={{ color: 'error.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        Royalty Bonus
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.royaltyIncome)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid> */}

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                sx={{
                  '@media (max-width: 599px)': {
                    width: '100% !important',
                    maxWidth: '100% !important',
                    flexBasis: '100% !important'
                  }
                }}
              >
                <Card sx={{
                  p: { xs: 1.5, sm: 2 },
                  boxShadow: 2,
                  height: '100%',
                  '@media (max-width: 599px)': {
                    width: '100% !important',
                    margin: '0 !important'
                  }
                }}>
                  <CardContent sx={{
                    p: { xs: 1, sm: 2 },
                    '&:last-child': { pb: { xs: 1, sm: 2 } },
                    textAlign: 'center'
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5
                    }}>
                      <TrendingUp size={24} style={{ color: '#1976d2', marginRight: '8px' }} />
                      <Typography variant="h6" sx={{
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}>
                        Total Income
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{
                      fontWeight: 'bold',
                      color: 'primary.main',
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}>
                      {formatCurrency(mlmData.totalIncome)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8rem' }
                    }}>
                      USDT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                sx={{
                  '@media (max-width: 599px)': {
                    width: '100% !important',
                    maxWidth: '100% !important',
                    flexBasis: '100% !important'
                  }
                }}
              >
                <Card sx={{
                  p: { xs: 1.5, sm: 2 },
                  boxShadow: 2,
                  height: '100%',
                  '@media (max-width: 599px)': {
                    width: '100% !important',
                    margin: '0 !important'
                  }
                }}>
                  <CardContent sx={{
                    p: { xs: 1, sm: 2 },
                    '&:last-child': { pb: { xs: 1, sm: 2 } },
                    textAlign: 'center'
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5
                    }}>
                      <ArrowDownToLine size={24} style={{ color: '#ed6c02', marginRight: '8px' }} />
                      <Typography variant="h6" sx={{
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}>
                        Total Withdraw
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{
                      fontWeight: 'bold',
                      color: 'warning.main',
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}>
                      {formatCurrency(mlmData.totalWithdraw)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8rem' }
                    }}>
                      USDT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                sx={{
                  '@media (max-width: 599px)': {
                    width: '100% !important',
                    maxWidth: '100% !important',
                    flexBasis: '100% !important'
                  }
                }}
              >
                <Card sx={{
                  p: { xs: 1.5, sm: 2 },
                  boxShadow: 2,
                  height: '100%',
                  '@media (max-width: 599px)': {
                    width: '100% !important',
                    margin: '0 !important'
                  }
                }}>
                  <CardContent sx={{
                    p: { xs: 1, sm: 2 },
                    '&:last-child': { pb: { xs: 1, sm: 2 } },
                    textAlign: 'center'
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5
                    }}>
                      <Users size={24} style={{ color: '#2e7d32', marginRight: '8px' }} />
                      <Typography variant="h6" sx={{
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}>
                        Team Count
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{
                      fontWeight: 'bold',
                      color: 'success.main',
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}>
                      {mlmData.teamCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8rem' }
                    }}>
                      Team Members
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <MobileFirstGrid
                  container
                  spacing={{ xs: 1, sm: 2 }}
                  className="performance-overview-grid"
                >
                  {[
                    {
                      icon: <Layers size={24} />,
                      title: 'Stack Bonus',
                      value: formatCurrency(rewardsData.retentionBonus),
                      subtitle: 'Current reward balance (USDT)',
                      color: 'primary.main',
                    },
                    {
                      icon: <Coins size={24} />,
                      title: 'Earning Bonus',
                      value: formatCurrency(rewardsData.releasedRetentionBonus),
                      subtitle: 'Total rewards minus withdrawals (USDT)',
                      color: 'success.main',
                    },
                    {
                      icon: <UserMinus size={24} />,
                      title: 'Team Withdrawal Bonus',
                      value: formatCurrency(rewardsData.residualBonus),
                      subtitle: 'Maturity income (USDT)',
                      color: 'warning.main',
                    },
                    {
                      icon: <UserPlus size={24} />,
                      title: 'Team Referral Bonus',
                      value: formatCurrency(rewardsData.levelIncome),
                      subtitle: 'Income from team levels (USDT)',
                      color: 'info.main',
                    },
                    {
                      icon: <Crown size={24} />,
                      title: 'Royalty Bonus',
                      value: formatCurrency(rewardsData.royaltyIncome),
                      subtitle: 'Royalty earnings (USDT)',
                      color: 'secondary.main',
                    },
                  ].map((card, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={`reward-${index}`}
                      sx={{
                        '@media (max-width: 599px)': {
                          width: '100% !important',
                          maxWidth: '100% !important',
                          flexBasis: '100% !important'
                        }
                      }}
                    >
                      <Card sx={{
                        p: { xs: 1.5, sm: 2 },
                        boxShadow: 3,
                        height: '100%',
                        '@media (max-width: 599px)': {
                          width: '100% !important',
                          margin: '0 !important'
                        }
                      }}>
                        <CardContent sx={{
                          p: { xs: 1, sm: 2 },
                          '&:last-child': { pb: { xs: 1, sm: 2 } },
                          textAlign: 'center'
                        }}>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5
                          }}>
                            {React.cloneElement(card.icon, {
                              sx: {
                                color: card.color,
                                mr: 1,
                                fontSize: { xs: '1.25rem', sm: '1.5rem' }
                              }
                            })}
                            <Typography variant="h6" sx={{
                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                            }}>
                              {card.title}
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{
                            fontWeight: 'bold',
                            color: card.color,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                          }}>
                            {card.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          }}>
                            {card.subtitle}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </MobileFirstGrid>
              </Grid>
            </MobileFirstGrid>

            {/* Orders Table */}
            {!notRegistered && (
              <>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  Your Orders
                </Typography>
                <TableContainer component={Paper} sx={{ mb: { xs: 2, sm: 3 } }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Amount (USDT)</TableCell>
                        <TableCell>Holding Bonus</TableCell>
                        <TableCell>Deposit Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order, index) => (
                        <TableRow key={index}>
                          <TableCell>{index}</TableCell>
                          <TableCell>{formatUnits(order.amount, 18)}</TableCell>
                          <TableCell>{formatUnits(order.holdingbonus, 18)}</TableCell>
                          <TableCell>{formatDate(order.deposit_time)}</TableCell>
                          <TableCell>{order.isactive ? 'Active' : 'Inactive'}</TableCell>
                          <TableCell>
                            {order.isactive && (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleWithdrawReward(index)}
                                disabled={withdrawingIndex === index}
                              >
                                {withdrawingIndex === index ? 'Processing...' : 'Withdraw'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Card>
        </Grid>




      </Grid>
    </Container >
  );
};

export default MLMDashboard;