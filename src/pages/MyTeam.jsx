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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
  TableHead,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import { useWallet } from '../context/WalletContext';
import { useChainId, useSwitchChain } from 'wagmi';
import { formatUnits, decodeErrorResult } from 'viem';
import { MAINNET_CHAIN_ID, dwcContractInteractions, USDC_ABI } from '../services/contractService';
import { apiService } from '../services/apiService';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';

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

const MyTeam = () => {
  const wallet = useWallet();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [teamData, setTeamData] = useState({
    directReferrals: 0,
    directBusiness: 0,
    majorTeam: 0,
    minorTeam: 0,
    userRank: 0,
    levelIncome: 0,
    royaltyIncome: 0,
    totalTeam: 0,
    levels: [],
    dbLevels: [], // Database levels (1-21)
    referralTree: null,
    referralStats: null,
  });

  // Modal state for level details
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelUsers, setLevelUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Inject CSS to ensure mobile-first layout for all cards
  useEffect(() => {
    const styleId = 'my-team-mobile-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media (max-width: 599px) {
          /* Force all grid items in overview section to full width */
          .my-team-overview-grid .MuiGrid-item {
            width: 100% !important;
            max-width: 100% !important;
            flex-basis: 100% !important;
            flex: 0 0 100% !important;
            margin-bottom: 12px !important;
          }

          /* Ensure all cards take full width and utilize complete horizontal space */
          .my-team-overview-grid .MuiGrid-item .MuiCard-root,
          .my-team-main-cards .MuiCard-root {
            width: 100% !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }

          /* Optimize card content layout for mobile */
          .my-team-overview-grid .MuiCardContent-root {
            text-align: center !important;
            padding: 16px !important;
          }

          /* Maintain horizontal icon and text layout for better mobile UX */
          .my-team-overview-grid .MuiBox-root {
            justify-content: flex-start !important;
            align-items: center !important;
            margin-bottom: 12px !important;
          }

          /* Ensure main container cards take full width */
          .my-team-main-cards {
            width: 100% !important;
          }

          /* Enhanced performance table responsiveness */
          .my-team-performance-table .MuiTableContainer-root {
            width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }

          /* Container optimizations for full width utilization */
          .my-team-overview-grid {
            margin: 0 !important;
            width: 100% !important;
          }

          /* Improved typography scaling for mobile readability */
          .my-team-overview-grid .MuiTypography-h4 {
            font-size: 1.5rem !important;
            line-height: 1.3 !important;
          }

          .my-team-overview-grid .MuiTypography-h6 {
            font-size: 1rem !important;
            margin-bottom: 8px !important;
            line-height: 1.4 !important;
          }

          /* Ensure proper spacing between cards */
          .my-team-overview-grid .MuiGrid-container {
            margin: 0 !important;
            width: 100% !important;
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

  const getRankLabel = (rank) => {
    switch (Number(rank)) {
      case 0: return 'Holder';
      case 1: return 'Expert';
      case 2: return 'Star';
      case 3: return 'Two Star';
      case 4: return 'Three Star';
      case 5: return 'Five Star';
      default: return 'Holder';
    }
  };

  // Function to fetch level details
  const fetchLevelDetails = async (level) => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Wallet not connected');
      return;
    }

    setModalLoading(true);
    try {
      console.log(`🔍 Fetching details for level ${level}`);

      // Use the new direct API endpoint
      const response = await apiService.getUserReferralTree(wallet.account, 21);
      console.log('📊 API Response:', response);

      // Check both response.data (API wrapper) and direct response
      const responseData = response.data || response;

      if (responseData && responseData.tree && responseData.tree[`level${level}`]) {
        const users = responseData.tree[`level${level}`];
        console.log(`👥 Found ${users.length} users at level ${level}:`, users);

        // Fetch investment details for each user
        const usersWithInvestments = await Promise.all(
          users.map(async (user) => {
            try {
              const investmentResponse = await apiService.getUserInvestments(user.userAddress);
              const investments = investmentResponse?.data || investmentResponse || [];
              return {
                ...user,
                investments: investments,
                totalInvestmentAmount: investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
              };
            } catch (error) {
              console.log(`No investments found for ${user.userAddress}`);
              return {
                ...user,
                investments: [],
                totalInvestmentAmount: 0
              };
            }
          })
        );

        console.log('💰 Users with investment data:', usersWithInvestments);
        setLevelUsers(usersWithInvestments);
        setSelectedLevel(level);
        setModalOpen(true);
      } else {
        console.log(`❌ No users found at level ${level}. Response structure:`, response);
        setError(`No users found at level ${level}`);
      }
    } catch (error) {
      console.error('Error fetching level details:', error);
      setError('Failed to fetch level details: ' + error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchTeamData = async () => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Wallet not connected. Please connect your wallet.');
      return;
    }

    if (chainId !== MAINNET_CHAIN_ID) {
      try {
        await switchChain({ chainId: MAINNET_CHAIN_ID });
      } catch (error) {
        setError('Please switch to BSC Mainnet.');
        return;
      }
    }

    try {
      setIsLoading(true);
      setError('');
      setNotRegistered(false);

      const userInfo = await dwcContractInteractions.getUserInfo(wallet.account);

      console.log('User Info:', userInfo);

      if (!userInfo?.id || userInfo.id === 0n) {
        setError('User not registered. Please register to view your team.');
        setNotRegistered(true);
        setIsLoading(false);
        return;
      }

      console.log('🏆 MyTeam: Fetching team data and user rank...');
      const [teamCount, userRank] = await Promise.all([
        dwcContractInteractions.getTeamCount(wallet.account),
        dwcContractInteractions.getUserRank(wallet.account), // 🏆 Enhanced logging will trigger
      ]);

      console.log('✅ MyTeam: Data fetch completed');
      if (process.env.NODE_ENV === 'development') {
        console.log('Team Count:', teamCount);
        console.log('User Rank:', userRank);
      }
      console.log('🏆 MyTeam: User Rank Result:', userRank);

      const levels = [];
      const currentUserRank = Number(userRank.rank) || 0;
      const maxLevel = 10; // Configurable max level

      for (let level = 1; level <= Math.min(maxLevel, currentUserRank + 1); level++) {
        try {
          const [rankData, activeCount, levelEarning] = await Promise.all([
            dwcContractInteractions.getRank(BigInt(level)),
            dwcContractInteractions.getActiveCount(wallet.account, BigInt(level)),
            dwcContractInteractions.getLevelEarning?.(wallet.account, BigInt(level)) || Promise.resolve(0n),
          ]);

          if (process.env.NODE_ENV === 'development') {
            console.log(`Level ${level} Rank Data:`, rankData);
            console.log(`Level ${level} Active Count:`, activeCount);
          }

          levels.push({
            level,
            rankData,
            activeCount: Number(activeCount),
            earning: levelEarning || 0n,
            status: currentUserRank >= level,
          });
        } catch (error) {
          console.error(`Error fetching data for level ${level}:`, error);
          levels.push({
            level,
            rankData: { id: BigInt(level), activedirect: 0n, activeteam: 0n },
            activeCount: 0,
            earning: 0n,
            status: false,
          });
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Levels Data:', levels);
      }

      // Fetch database team data
      let referralTree = null;
      let referralStats = null;
      let dbLevels = [];

      try {
        console.log('🌳 Fetching database team data...');

        // Fetch referral tree (21 levels)
        const treeResponse = await apiService.getUserReferralTree(wallet.account, 21);
        if (treeResponse.success) {
          referralTree = treeResponse.data;
          console.log('✅ Referral tree fetched:', referralTree);
        }

        // Fetch referral statistics
        const statsResponse = await apiService.getUserReferralStats(wallet.account);
        if (statsResponse.success) {
          referralStats = statsResponse.data;
          console.log('✅ Referral stats fetched:', referralStats);
        }

        // Process database levels (1-21)
        if (referralTree && referralTree.tree) {
          for (let level = 1; level <= 21; level++) {
            const levelKey = `level${level}`;
            const levelUsers = referralTree.tree[levelKey] || [];

            dbLevels.push({
              level,
              userCount: levelUsers.length,
              users: levelUsers,
              totalInvestment: levelUsers.reduce((sum, user) => sum + (user.totalInvestment || 0), 0),
              totalEarnings: levelUsers.reduce((sum, user) => sum + (user.totalEarnings || 0), 0),
            });
          }
        }

        console.log('✅ Database levels processed:', dbLevels);

      } catch (error) {
        console.error('❌ Error fetching database team data:', error);
        // Continue with blockchain data even if database fails
      }

      setTeamData({
        directReferrals: Number(userInfo.partnersCount) || 0,
        directBusiness: parseFloat(formatUnits(userInfo.directBusiness || 0n, 18)) || 0,
        majorTeam: Number(teamCount.maxTeam) || 0,
        minorTeam: Number(teamCount.otherTeam) || 0,
        userRank: getRankLabel(currentUserRank),
        levelIncome: parseFloat(formatUnits(userInfo.levelincome || 0n, 18)) || 0,
        royaltyIncome: parseFloat(formatUnits(userInfo.royaltyincome || 0n, 18)) || 0,
        totalTeam: Number(userInfo.teamCount) || 0,
        levels,
        dbLevels,
        referralTree,
        referralStats,
      });
    } catch (error) {
      console.error('Error fetching team data:', error);
      let errorMessage = 'Failed to fetch team data. Please try again.';
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

  const handleClaimReward = async (level) => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Please connect your wallet to claim rewards.');
      return;
    }

    if (chainId !== MAINNET_CHAIN_ID) {
      try {
        await switchChain({ chainId: MAINNET_CHAIN_ID });
      } catch (error) {
        setError('Please switch to BSC Mainnet.');
        return;
      }
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const txHash = await dwcContractInteractions.claimLevelReward(wallet.account, BigInt(level));
      setSuccess(`Successfully claimed level ${level} reward! Transaction: ${txHash}`);
      setTimeout(fetchTeamData, 3000);
    } catch (error) {
      console.error('Error claiming reward:', error);
      setError(`Failed to claim reward: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLevelDetails = async (level) => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Please connect your wallet to view level details.');
      return;
    }

    await fetchLevelDetails(level);
  };

  useEffect(() => {
    if (wallet.isConnected && wallet.account) {
      fetchTeamData();
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

  if (!wallet.isConnected) {
    return (
      <Container
        maxWidth="xl"
        sx={{ py: { xs: 2, sm: 3 }, background: 'linear-gradient(135deg, #f0f4ff 0%, #d9e4ff 100%)', minHeight: '100vh' }}
      >
        <Alert severity="warning">Please connect your wallet to view your team.</Alert>
      </Container>
    );
  }

  if (isLoading && !teamData.directReferrals) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f0f4ff 0%, #d9e4ff 100%)',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 2, sm: 3 }, background: 'linear-gradient(135deg, #f0f4ff 0%, #d9e4ff 100%)', minHeight: '100vh' }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')} closeText="Close">
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')} closeText="Close">
          {success}
        </Alert>
      )}
      {notRegistered && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {/* Add registration logic or redirect */ }}
            >
              Register Now
            </Button>
          }
        >
          You need to register to view your team.
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
            My Team
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTeamData}
          disabled={isLoading}
          sx={{ width: { xs: '100%', sm: 'auto' }, fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 3 }} className="my-team-main-cards">
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: 'primary.main', fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Overview
            </Typography>
            <MobileFirstGrid
              container
              spacing={{ xs: 1, sm: 2 }}
              className="my-team-overview-grid"
            >
              {[
                {
                  icon: <PeopleIcon />,
                  title: 'Direct Referrals',
                  value: teamData.directReferrals.toString(),
                  subtitle: 'People directly referred by you',
                  color: 'primary.main',
                },
                {
                  icon: <BusinessIcon />,
                  title: 'Direct Business',
                  value: formatCurrency(teamData.directBusiness),
                  subtitle: 'Business volume from direct referrals',
                  color: 'secondary.main',
                },
                {
                  icon: <GroupIcon />,
                  title: 'Major Performance',
                  value: teamData.majorTeam.toString(),
                  subtitle: 'Members in your major team',
                  color: 'success.main',
                },
                {
                  icon: <PeopleIcon />,
                  title: 'Minor Performance',
                  value: teamData.minorTeam.toString(),
                  subtitle: 'Members in your minor team',
                  color: 'warning.main',
                },
                // {
                //   icon: <EmojiEventsIcon />,
                //   title: 'User Rank',
                //   value: teamData.userRank.toString(),
                //   subtitle: 'Your current rank in the system',
                //   color: 'info.main',
                // },
                // {
                //   icon: <TrendingUpIcon />,
                //   title: 'Team Referral Bonus',
                //   value: formatCurrency(teamData.levelIncome),
                //   subtitle: 'Income from team levels',
                //   color: 'primary.main',
                // },
                // {
                //   icon: <AccountBalanceWalletIcon />,
                //   title: 'Royalty Bonus',
                //   value: formatCurrency(teamData.royaltyIncome),
                //   subtitle: 'Royalty earnings from team',
                //   color: 'secondary.main',
                // },
                {
                  icon: <GroupIcon />,
                  title: 'My Team',
                  value: teamData.totalTeam.toString(),
                  subtitle: 'Total members in your network',
                  color: 'success.main',
                },
                {
                  icon: <EmojiEventsIcon />,
                  title: 'Database Team',
                  value: teamData.dbLevels ? teamData.dbLevels.reduce((sum, level) => sum + level.userCount, 0).toString() : '0',
                  subtitle: 'Total team members in database',
                  color: 'info.main',
                },
                {
                  icon: <TrendingUpIcon />,
                  title: 'Team Investment',
                  value: formatCurrency(teamData.dbLevels ? teamData.dbLevels.reduce((sum, level) => sum + level.totalInvestment, 0) : 0),
                  subtitle: 'Total investment by team',
                  color: 'primary.main',
                },
                {
                  icon: <AccountBalanceWalletIcon />,
                  title: 'Team Earnings',
                  value: formatCurrency(teamData.dbLevels ? teamData.dbLevels.reduce((sum, level) => sum + level.totalEarnings, 0) : 0),
                  subtitle: 'Total earnings from team',
                  color: 'secondary.main',
                },
              ].map((card, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={`team-${index}`}
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
          </Card>
        </Grid>

        {/* <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 3 }} className="my-team-main-cards">
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: 'primary.main', fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Performance
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 2, overflowX: 'auto' }} className="my-team-performance-table">
              <Table sx={{ minWidth: { xs: 'auto', sm: 650 } }} aria-label="levels table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Level</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }} align="center">Earnings</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }} align="center">Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamData.levels && teamData.levels.length > 0 ? (
                    teamData.levels.map((levelData) => (
                      <TableRow
                        key={levelData.level}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell component="th" scope="row">
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Level {levelData.level}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {formatCurrency(parseFloat(formatUnits(levelData.earning || 0n, 18)))}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={levelData.status ? 'Achieved' : 'Pending'}
                            color={levelData.status ? 'success' : 'warning'}
                            variant="filled"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {levelData.status && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleClaimReward(levelData.level)}
                              disabled={isLoading}
                            >
                              Claim Reward
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No level data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid> */}

        {/* 21 Levels Team Structure */}
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 3 }} className="my-team-main-cards">
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: 'primary.main', fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              21 Levels Team Structure
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 2, overflowX: 'auto', maxHeight: 600 }}>
              <Table sx={{ minWidth: { xs: 'auto', sm: 650 } }} aria-label="21 levels table" stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main' }}>Level</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main' }} align="center">Users</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main' }} align="center">Total Investment</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main' }} align="center">Total Earnings</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main' }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamData.dbLevels && teamData.dbLevels.length > 0 ? (
                    teamData.dbLevels.map((levelData) => (
                      <TableRow
                        key={levelData.level}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'primary.light', opacity: 0.1 }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Level {levelData.level}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={levelData.userCount}
                            color={levelData.userCount > 0 ? 'success' : 'default'}
                            variant="filled"
                            sx={{ fontWeight: 'bold', minWidth: '60px' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                            {formatCurrency(levelData.totalInvestment)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            {formatCurrency(levelData.totalEarnings)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewLevelDetails(levelData.level)}
                            disabled={levelData.userCount === 0}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    Array.from({ length: 21 }, (_, index) => (
                      <TableRow key={index + 1}>
                        <TableCell component="th" scope="row">
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Level {index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label="0"
                            color="default"
                            variant="filled"
                            sx={{ fontWeight: 'bold', minWidth: '60px' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                            {formatCurrency(0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                            {formatCurrency(0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                            sx={{ fontSize: '0.75rem' }}
                          >
                            No Users
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Level Details Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6">
              Level {selectedLevel} Details
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {modalLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box mb={2}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Level {selectedLevel} Users ({levelUsers.length} Total)
                </Typography>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>User Address</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Investment</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Deposits</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Join Date</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {levelUsers.map((user, index) => (
                      <TableRow
                        key={user.userAddress}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                          '&:hover': { backgroundColor: '#f0f0f0' }
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar size="small" sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                              {index + 1}
                            </Avatar>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                wordBreak: 'break-all'
                              }}
                            >
                              {user.userAddress}
                            </Typography>
                            {user.investments && user.investments.length > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                {user.investments.length} transaction{user.investments.length > 1 ? 's' : ''}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                            <AccountBalanceWalletIcon fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              ${user.totalInvestmentAmount || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                            <TrendingUpIcon fontSize="small" color="success" />
                            <Typography variant="body2">
                              {user.depositCount || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {new Date(user.registrationTime).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Investment History Section */}
              {levelUsers.some(user => user.investments && user.investments.length > 0) && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Investment History
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {levelUsers.map((user, userIndex) =>
                          user.investments && user.investments.length > 0 ?
                            user.investments.map((investment, invIndex) => (
                              <TableRow
                                key={`${user.userAddress}-${invIndex}`}
                                sx={{
                                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                                  '&:hover': { backgroundColor: '#f0f0f0' }
                                }}
                              >
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: 'monospace',
                                      fontSize: '0.75rem',
                                      wordBreak: 'break-all'
                                    }}
                                  >
                                    {user.userAddress.slice(0, 10)}...{user.userAddress.slice(-8)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2" fontWeight="bold" color="primary">
                                    ${investment.amount}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={investment.type || 'USDT'}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2">
                                    {new Date(investment.investmentTime).toLocaleDateString()}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )) : null
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {levelUsers.length === 0 && (
                <Box textAlign="center" py={3}>
                  <Typography color="text.secondary">
                    No users found at this level
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyTeam;