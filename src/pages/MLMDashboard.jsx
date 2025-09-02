import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useWallet } from '../context/WalletContext';
import { useChainId, useSwitchChain } from 'wagmi';
import { formatUnits, parseUnits, decodeErrorResult } from 'viem';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '../config/web3modal';
import { TESTNET_CHAIN_ID, USDC_ABI, dwcContractInteractions } from '../services/contractService';
import { USDC_CONTRACT_ADDRESS } from '../services/approvalservice';
// Icons
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DiamondIcon from '@mui/icons-material/Diamond';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import ContractStatsSection from '../components/sections/ContractStatsSection';

const MLMDashboard = () => {
  const wallet = useWallet();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [depositType, setDepositType] = useState('usdc');
  const [notRegistered, setNotRegistered] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [mlmData, setMlmData] = useState({
    myHolding: 0,
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
  const [orders, setOrders] = useState([]);

  // Format DWC amount
  const formatDWC = (amount = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' BDC';
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
        dwcContractInteractions.getUserRank(wallet.account),
        dwcContractInteractions.getOrderLength(wallet.account),
        dwcContractInteractions.getCoinRate(),
        // dwcContractInteractions.bonusInfos(wallet.account),
      ]);

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

      setMlmData({
        myHolding: myHolding || 0,
        // retentionBonus: parseFloat(formatUnits(bonusInfo.teamGrowthGains || 0n, 18)) || 0,
        // releasedRetentionBonus: parseFloat(formatUnits(bonusInfo.developmentGains || 0n, 18)) || 0,
        // residualBonus: parseFloat(formatUnits(bonusInfo.referralGains || 0n, 18)) || 0,
        levelIncome: parseFloat(formatUnits(userInfo?.levelincome || 0n, 18)) || 0,
        royaltyIncome: parseFloat(formatUnits(userInfo?.roraltyincome || 0n, 18)) || 0,
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

  useEffect(() => {
    if (wallet.isConnected && wallet.account) {
      fetchMlmData();
    }
  }, [wallet.isConnected, wallet.account, chainId]);

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
      const approveAmount = parseUnits('1', Number(decimals));
      const approvalTx = await dwcContractInteractions.approveUSDC(approveAmount, wallet.account);
      await waitForTransactionReceipt(config, { hash: approvalTx, chainId: TESTNET_CHAIN_ID });

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

      if (Number(amount) < 50 || Number(amount) > 10000) {
        setError('Stake amount must be between 50 and 10,000 USDC.');
        return;
      }

      const txHash = await dwcContractInteractions.deposit(amount, wallet.account);
      await waitForTransactionReceipt(config, { hash: txHash, chainId: TESTNET_CHAIN_ID });

      setSuccess(`Successfully staked ${amount} USDC! Transaction: ${txHash}`);
      setStakeAmount('');
      setTimeout(fetchMlmData, 3000);
    } catch (error) {
      console.error('Error staking:', error);
      if (error.message?.includes('User rejected')) {
        setError('Transaction was cancelled by user');
      } else if (error.message?.includes('insufficient')) {
        setError('Insufficient USDC balance or BNB for gas fees.');
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
      setIsLoading(true);
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
      setIsLoading(false);
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
        {/* First Box: Performance Overview */}
        <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 1 } }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: 'primary.main', fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Performance Overview
            </Typography>

            {/* Financial Overview */}
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: 'primary.main', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Financial Overview
            </Typography>
            <Grid container spacing={2} sx={{ mb: { xs: 3, sm: 4 } }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <AccountBalanceWalletIcon sx={{ color: 'primary.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        My Holding
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.25rem' }}>
                      {formatDWC(mlmData.myHolding)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      BDC
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <MonetizationOnIcon sx={{ color: 'success.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        Residual Bonus
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.residualBonus)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDC
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <TrendingUpIcon sx={{ color: 'secondary.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        Level Income
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.levelIncome)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDC
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
                        Retention Bonus
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.retentionBonus)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDC
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
                        Released Retention Bonus
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.releasedRetentionBonus)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDC
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
                        Royalty Income
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.royaltyIncome)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDC
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <AccountBalanceIcon sx={{ color: 'primary.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        Total Income
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.totalIncome)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDC
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <LocalAtmIcon sx={{ color: 'warning.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        Total Withdraw
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main', fontSize: '1.25rem' }}>
                      {formatCurrency(mlmData.totalWithdraw)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      USDC
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <PeopleIcon sx={{ color: 'success.main', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                        Team Count
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1.25rem' }}>
                      {mlmData.teamCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Team Members
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

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
                        <TableCell>Amount (USDC)</TableCell>
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
                                disabled={isLoading}
                              >
                                Withdraw
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

        {/* Second Box: Trading & Referrals */}
        <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 2 } }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: 'primary.main', fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Trading & Referrals
            </Typography>

            {/* Stake Section */}
            {!notRegistered && (
              <Box sx={{ mb: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Stake USDC
                </Typography>
                <TextField
                  fullWidth
                  label="Amount to Stake"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">USDC</InputAdornment>,
                    inputProps: { min: 50, max: 10000 },
                  }}
                  sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
                />
                <Button
                  variant="contained"
                  startIcon={<LocalAtmIcon />}
                  onClick={handleStake}
                  disabled={isLoading || !stakeAmount}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  Stake Now
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Stake between 50 and 10,000 USDC. Current coin rate: {mlmData.coinRate.toFixed(4)} USDC/BDC
                </Typography>
              </Box>
            )}

            {/* Referral Code Section */}
            <Box sx={{ mb: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  onClick={() => {
                    if (wallet.account) {
                      navigator.clipboard.writeText(wallet.account);
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
            </Box>
          </Card>
        </Grid>

        {/* Third Box: Contract Stats & Balances */}
        <Grid item xs={12} sx={{ order: 3 }}>
          <ContractStatsSection />
        </Grid>
      </Grid>
    </Container>
  );
};

export default MLMDashboard;