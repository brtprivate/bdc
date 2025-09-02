import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useWallet } from '../../context/WalletContext';
import { useChainId, useSwitchChain } from 'wagmi';
import { formatUnits, decodeErrorResult } from 'viem';
import { useBalance } from 'wagmi';
import { TESTNET_CHAIN_ID, dwcContractInteractions, USDC_ABI } from '../../services/contractService';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PoolIcon from '@mui/icons-material/Pool';
const ContractStatsSection = () => {
  const wallet = useWallet();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statsData, setStatsData] = useState({
    bnbBalance: 0,
    usdcBalance: 0,
    dwcBalance: 0,
    communityFundDWC: 0,
    communityFundUSDC: 0,
    referralAddress: '',
    referrerAddress: '',
    totalSupply: 0,
    burnedTokens: 0,
    lastUserId: 0,
    userRank: 0,
    liquidityPoolFund: 0,
  });

  // Fetch BNB balance
  const { data: bnbBalance } = useBalance({
    address: wallet.account,
    chainId: TESTNET_CHAIN_ID,
  });

  const fetchStatsData = async () => {
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

      const [
        usdcBalanceRaw,
        dwcBalanceRaw,
        communityHoldingFund,
        userInfo,
        userRank,
        totalSupply,
        burnedTokens,
        lastUserId,
      ] = await Promise.all([
        dwcContractInteractions.getUSDCBalance(wallet.account),
        dwcContractInteractions.getDWCBalance(wallet.account),
        dwcContractInteractions.getCommunityHoldingFund(),
        dwcContractInteractions.getUserInfo(wallet.account),
        dwcContractInteractions.getUserRank(wallet.account),
        dwcContractInteractions.getTotalSupply(),
        dwcContractInteractions.getBurnedTokens(),
        dwcContractInteractions.getLastUserId(),
      ]);

      const [communityDWCBalance, communityUSDCBalance] = await Promise.all([
        dwcContractInteractions.getDWCBalance(communityHoldingFund),
        dwcContractInteractions.getUSDCBalance(communityHoldingFund),
      ]);

      const liquidityPool = await dwcContractInteractions.getLiquidityPool();

      setStatsData({
        bnbBalance: bnbBalance ? parseFloat(formatUnits(bnbBalance.value, 18)) : 0,
        usdcBalance: parseFloat(formatUnits(usdcBalanceRaw, 18)),
        dwcBalance: parseFloat(formatUnits(dwcBalanceRaw, 18)),
        communityFundDWC: parseFloat(formatUnits(communityDWCBalance, 18)),
        communityFundUSDC: parseFloat(formatUnits(communityUSDCBalance, 18)),
        referralAddress: wallet.account,
        referrerAddress: userInfo.referrer,
        totalSupply: parseFloat(formatUnits(totalSupply, 18)),
        burnedTokens: parseFloat(formatUnits(burnedTokens, 18)),
        lastUserId: Number(lastUserId),
        userRank: Number(userRank.rank),
        liquidityPoolFund: parseFloat(formatUnits(liquidityPool.tokenAmount, 18)),
      });
    } catch (error) {
      console.error('Error fetching stats data:', error);
      let errorMessage = 'Failed to fetch contract stats. Please try again.';
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
      fetchStatsData();
    }
  }, [wallet.isConnected, wallet.account, chainId]);

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDWC = (amount = 0) => {
    return (Math.floor(amount * 10000) / 10000).toFixed(4);
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!wallet.isConnected) {
    return (
      <Card sx={{ p: 3, boxShadow: 3 }}>
        <Alert severity="warning">Please connect your wallet to view contract stats.</Alert>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card sx={{ p: 3, boxShadow: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
        Contract Stats & Balances
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <AccountBalanceWalletIcon sx={{ color: 'primary.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  BNB Balance
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.25rem' }}>
                {formatCurrency(statsData.bnbBalance)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                BNB
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <MonetizationOnIcon sx={{ color: 'secondary.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  USDC Balance
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main', fontSize: '1.25rem' }}>
                {formatCurrency(statsData.usdcBalance)}
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
                <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  BDC Balance
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1.25rem' }}>
                {formatDWC(statsData.dwcBalance)}
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
                <BarChartIcon sx={{ color: 'warning.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  Community Fund BDC
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main', fontSize: '1.25rem' }}>
                {formatDWC(statsData.communityFundDWC)}
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
                <BarChartIcon sx={{ color: 'info.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  Community Fund USDC
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main', fontSize: '1.25rem' }}>
                {formatCurrency(statsData.communityFundUSDC)}
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
                <LinkIcon sx={{ color: 'primary.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  Referral Address
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1rem' }}>
                {formatAddress(statsData.referralAddress)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Your Wallet
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PersonIcon sx={{ color: 'secondary.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                Sponsor Address
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main', fontSize: '1rem' }}>
                {formatAddress(statsData.referrerAddress)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Referred By
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <BarChartIcon sx={{ color: 'error.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  Burned Tokens
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main', fontSize: '1.25rem' }}>
                {formatDWC(statsData.burnedTokens)}
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
                <EmojiEventsIcon sx={{ color: 'info.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  Your Rank
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main', fontSize: '1.25rem' }}>
                {statsData.userRank}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Rank Status
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  Contract Status
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1.25rem' }}>
                Active
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Status
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PoolIcon sx={{ color: 'primary.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  Liquidity Pool Fund
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.25rem' }}>
                {formatDWC(statsData.liquidityPoolFund)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                BDC
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PeopleIcon sx={{ color: 'primary.main', mr: 1, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.25rem' }}>
                {statsData.lastUserId}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Registered Users
              </Typography>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </Card>
  );
};

export default ContractStatsSection;