import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  LinearProgress,
  Container,
  Backdrop,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useWallet } from '../../context/WalletContext';
import { useChainId, useSwitchChain } from 'wagmi';
import { formatUnits, decodeErrorResult } from 'viem';
import { useBalance } from 'wagmi';
import { TESTNET_CHAIN_ID, dwcContractInteractions, USDC_ABI } from '../../services/contractService';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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

const ContractStatsSection = () => {
  const wallet = useWallet();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Inject CSS to ensure mobile-first layout
  React.useEffect(() => {
    const styleId = 'contract-stats-mobile-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media (max-width: 599px) {
          .MuiGrid-container .MuiGrid-item {
            width: 100% !important;
            max-width: 100% !important;
            flex-basis: 100% !important;
            flex: 0 0 100% !important;
          }
          .MuiGrid-container .MuiGrid-item .MuiCard-root {
            width: 100% !important;
            margin: 0 !important;
          }
          .MuiGrid-container .MuiGrid-item .MuiCardContent-root {
            text-align: center !important;
          }
          .MuiGrid-container .MuiGrid-item .MuiBox-root {
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
    liquidityPoolFundUSDT: 0,
    userStatus: 'INACTIVE',
  });

  // Fetch BNB balance
  const { data: bnbBalance } = useBalance({
    address: wallet.account,
    chainId: TESTNET_CHAIN_ID,
  });


  // Helper function to get rank label
  const getRankLabel = (rank) => {
    console.log("🚀 ~ getRankLabel ~ rank:", rank)
    switch (Number(rank)) {
      case 0: return 'Holder';
      case 1: return 'Expert';
      case 2: return 'Star';
      case 3: return 'Two Star';
      case 4: return 'Three Star';
      case 5: return 'Four Star';
      case 6: return 'Five Star';
      default: return 'Holder';
    }
  };
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
        maxPayout
      ] = await Promise.all([
        dwcContractInteractions.getUSDCBalance(wallet.account),
        dwcContractInteractions.getDWCBalance(wallet.account),
        dwcContractInteractions.getCommunityHoldingFund(),
        dwcContractInteractions.getUserInfo(wallet.account),
        dwcContractInteractions.getUserRank(wallet.account),
        dwcContractInteractions.getTotalSupply(),
        dwcContractInteractions.getBurnedTokens(),
        dwcContractInteractions.getLastUserId(),
        dwcContractInteractions.getMaxPayout(wallet.account)
      ]);

      const [communityDWCBalance] = await Promise.all([
        dwcContractInteractions.getDWCBalance(communityHoldingFund),
      ]);
      const [communityUSDCBalance] = await Promise.all([
        dwcContractInteractions.tokensToDai(communityDWCBalance),
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
        userRank: getRankLabel(Number(userRank.rank)),
        user: userRank,
        totalDeposit: parseFloat(formatUnits(userInfo.totalDeposit, 18)),
        maxPayout: parseFloat(formatUnits(maxPayout, 18)),
        liquidityPoolFundUSDT: parseFloat(formatUnits(liquidityPool.daiAmount, 18)),
        liquidityPoolFund: parseFloat(formatUnits(liquidityPool.tokenAmount, 18)),
        userStatus: userInfo.totalDeposit > 0 ? 'ACTIVE' : 'INACTIVE',
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

  // if (isLoading) {
  //   return (
  //     <Backdrop
  //       open={true}
  //       sx={{
  //         color: "#fff",
  //         zIndex: (theme) => theme.zIndex.drawer + 1,
  //         background: "rgba(0, 0, 0, 0.5)",
  //       }}
  //     >
  //       <CircularProgress color="inherit" />
  //     </Backdrop>
  //   );
  // }

  return (
    <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 3 }}>
      {isLoading && (
        <Backdrop
          open={true}
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          color: 'primary.main',
          fontWeight: 'bold',
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        Contract Stats & Balances
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <MobileFirstGrid
        container
        spacing={{ xs: 1, sm: 2 }}
        sx={{
          // Additional mobile-first responsive behavior with stronger CSS overrides
          '& > .MuiGrid-item': {
            '@media (max-width: 599px)': {
              width: '100% !important',
              maxWidth: '100% !important',
              flexBasis: '100% !important',
              flex: '0 0 100% !important'
            },
            '@media (min-width: 600px) and (max-width: 899px)': {
              width: '50% !important',
              maxWidth: '50% !important',
              flexBasis: '50% !important',
              flex: '0 0 50% !important'
            }
          }
        }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
                <AccountBalanceWalletIcon sx={{ color: 'primary.main', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                  BNB Balance
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {formatCurrency(statsData.bnbBalance)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                BNB
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
                <MonetizationOnIcon sx={{ color: 'secondary.main', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                  USDT Balance
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {formatCurrency(statsData.usdcBalance)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
                <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                  BDC Balance
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {formatDWC(statsData.dwcBalance)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                BDC
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
                <BarChartIcon sx={{ color: 'primary.main', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, fontWeight: 600 }}>
                  Community Fund
                </Typography>
              </Box>

              {/* Values Row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: { xs: 1.5, sm: 2 },
                  width: "100%",
                }}
              >
                {/* BDC */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "warning.main",
                      fontSize: { xs: "1rem", sm: "1.25rem" }, // smaller on mobile
                      wordBreak: "break-word",
                    }}
                  >
                    {formatDWC(statsData.communityFundDWC)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
                  >
                    BDC
                  </Typography>
                </Box>

                {/* USDT */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "info.main",
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      wordBreak: "break-word",
                    }}
                  >
                    {formatCurrency(statsData.communityFundUSDC)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
                  >
                    USDT
                  </Typography>
                </Box>
              </Box>

            </CardContent>
          </Card>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
                <BarChartIcon sx={{ color: 'primary.main', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, fontWeight: 600 }}>
                  Liquidity Pool Fund
                </Typography>
              </Box>

              {/* Values Row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: { xs: 1.5, sm: 2 },
                  width: "100%",
                }}
              >
                {/* BDC */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "warning.main",
                      fontSize: { xs: "1rem", sm: "1.25rem" }, // smaller on mobile
                      wordBreak: "break-word",
                    }}
                  >
                    {formatDWC(statsData.liquidityPoolFund)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
                  >
                    BDC
                  </Typography>
                </Box>

                {/* USDT */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "info.main",
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      wordBreak: "break-word",
                    }}
                  >
                    ${formatDWC(statsData?.liquidityPoolFundUSDT)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
                  >
                    USDT
                  </Typography>
                </Box>
              </Box>

            </CardContent>
          </Card>
        </Grid>



        {/* Referral Address */}
        {/* <Grid item xs={12} sm={6} md={4}>
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
        </Grid> */}
        {/* Your Wallet Address */}
        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
                <PersonIcon sx={{ color: 'error.main', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                  Your Wallet Address
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main', fontSize: '1rem' }}>
                {formatAddress(statsData.referralAddress)} <IconButton
                  onClick={() => {
                    const refLink = `${statsData.referralAddress}`;
                    navigator.clipboard.writeText(refLink);
                    alert("Referral link copied to clipboard!");
                  }}
                  sx={{
                    color: "black",

                    // backgroundColor: "primary.main",
                    // "&:hover": {
                    //   opacity: 0.9,
                    //   backgroundColor: "primary.dark",
                    // },
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LinkIcon sx={{ color: "primary.main", mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                  <Typography variant="h6" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    Your Referral Link
                  </Typography>
                </Box>


              </Box>

              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  wordBreak: "break-all",
                  color: "text.secondary",
                  fontSize: "0.9rem",
                }}
              >
                {`${window.location.origin}`}  {/* Icon button instead of text button */}
                <IconButton
                  onClick={() => {
                    const refLink = `${window.location.origin}?ref=${statsData.referralAddress}`;
                    navigator.clipboard.writeText(refLink);
                    alert("Referral link copied to clipboard!");
                  }}
                  sx={{
                    color: "black",

                    // backgroundColor: "primary.main",
                    // "&:hover": {
                    //   opacity: 0.9,
                    //   backgroundColor: "primary.dark",
                    // },
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
                <PersonIcon sx={{ color: 'secondary.main', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                  Sponsor Address
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                {formatAddress(statsData.referrerAddress)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                Referred By
              </Typography>
            </CardContent>
          </Card>
        </Grid>




        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
                <BarChartIcon sx={{ color: 'error.main', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                  Burned Tokens
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {formatDWC(statsData.burnedTokens)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                BDC
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
                <EmojiEventsIcon sx={{ color: 'info.main', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                  Your Rank
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {statsData.userStatus === 'INACTIVE' ? "N/A" : statsData.userRank}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                Rank Status
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
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
            width: '100%',
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
                <CheckCircleIcon sx={{ color: statsData.userStatus === 'INACTIVE' ? "error.main" : 'success.main', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                  Contract Status
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: statsData.userStatus === 'INACTIVE' ? "error.main" : 'success.main', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {statsData.userStatus}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                Status
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

        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            backgroundColor: "background.paper",
            boxShadow: 2,
            width: "100%", // full width inside grid
          }}
        >
          {/* Header with left + right text */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", sm: "space-between" },
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 0 },
              mb: 1.5,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
              Earning Limit: {statsData?.user?.rank < 6 ? statsData?.totalDeposit * 3 || 0 : statsData?.totalDeposit * 4 || 0}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
              Remaining Limit : {statsData?.maxPayout || 0}
            </Typography>
          </Box>

          {/* Progress Bar */}
          {
            (() => {
              const earningLimit =
                statsData?.user?.rank < 6
                  ? (statsData?.totalDeposit || 0) * 3
                  : (statsData?.totalDeposit || 0) * 4;

              const usedLimit = earningLimit - (statsData?.maxPayout || 0);
              console.log("🚀 ~ statsData?.maxPayout:", statsData?.maxPayout)

              const progress =
                earningLimit > 0 ? (usedLimit / earningLimit) * 100 : 0;


              return (
                <LinearProgress
                  variant="determinate"
                  value={progress > 0 ? progress : 1} // keep bar visible if 0
                  sx={{
                    height: { xs: 10, sm: 12 },
                    width: "100%",
                    borderRadius: { xs: 5, sm: 6 },
                    backgroundColor: "grey.300",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: { xs: 5, sm: 6 },
                    },
                  }}
                />
              );
            })()}


        </Box>

      </MobileFirstGrid>
    </Card>
  );
};

export default ContractStatsSection;