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
import {
  TeamOverviewSkeleton,
  LevelsTableSkeleton,
  SummaryCardsSkeleton,
  ProgressiveLoader,
  SmartLoader
} from '../components/LoadingSkeleton';
import { useWallet } from '../context/WalletContext';
import { useChainId, useSwitchChain } from 'wagmi';
import { formatUnits, decodeErrorResult } from 'viem';
import { MAINNET_CHAIN_ID, dwcContractInteractions, USDC_ABI } from '../services/contractService';
import { apiService } from '../services/apiService';
import { useApiPerformanceMonitor } from '../hooks/usePerformanceMonitor';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import LazyLevelsTable from '../components/LazyLevelsTable';
import PerformanceMonitor from '../components/PerformanceMonitor';

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

// Optimized Level Card Component
const LevelCard = React.memo(({ levelData, onViewDetails, formatCurrency }) => {
  const handleClick = React.useCallback(() => {
    if (levelData.userCount > 0) {
      onViewDetails(levelData.level);
    }
  }, [levelData.userCount, levelData.level, onViewDetails]);

  const handleKeyDown = React.useCallback((e) => {
    if ((e.key === 'Enter' || e.key === ' ') && levelData.userCount > 0) {
      e.preventDefault();
      onViewDetails(levelData.level);
    }
  }, [levelData.userCount, levelData.level, onViewDetails]);

  const handleButtonClick = React.useCallback((e) => {
    e.stopPropagation();
    if (levelData.userCount > 0) {
      onViewDetails(levelData.level);
    }
  }, [levelData.userCount, levelData.level, onViewDetails]);

  return (
    <Card
      component="article"
      role="button"
      tabIndex={levelData.userCount > 0 ? 0 : -1}
      aria-label={`Level ${levelData.level} with ${levelData.userCount} users`}
      sx={{
        p: 2,
        height: '100%',
        minHeight: '140px',
        border: levelData.userCount > 0 ? '2px solid #4caf50' : '1px solid #e0e0e0',
        background: levelData.userCount > 0
          ? 'linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%)'
          : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: levelData.userCount > 0 ? 'pointer' : 'default',
        willChange: 'transform',
        '&:hover': levelData.userCount > 0 ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '2px solid #2e7d32'
        } : {},
        '&:focus': levelData.userCount > 0 ? {
          outline: '2px solid #1976d2',
          outlineOffset: '2px'
        } : {},
        '&:active': levelData.userCount > 0 ? {
          transform: 'translateY(0px)',
        } : {}
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Level Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: levelData.userCount > 0 ? 'primary.main' : 'text.secondary',
            fontSize: '1rem'
          }}
        >
          Level {levelData.level}
        </Typography>
        <Chip
          label={levelData.userCount}
          color={levelData.userCount > 0 ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 'bold', minWidth: '45px' }}
        />
      </Box>

      {/* Level Stats */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Investment:</Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: levelData.totalInvestment > 0 ? 'secondary.main' : 'text.secondary',
              fontSize: '0.8rem'
            }}
          >
            {formatCurrency(levelData.totalInvestment)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Earnings:</Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: levelData.totalEarnings > 0 ? 'success.main' : 'text.secondary',
              fontSize: '0.8rem'
            }}
          >
            {formatCurrency(levelData.totalEarnings)}
          </Typography>
        </Box>
      </Box>

      {/* Action Button */}
      <Button
        variant={levelData.userCount > 0 ? "contained" : "outlined"}
        size="small"
        fullWidth
        onClick={handleButtonClick}
        disabled={levelData.userCount === 0}
        sx={{
          fontSize: '0.75rem',
          py: 0.5,
          background: levelData.userCount > 0
            ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
            : 'transparent',
          '&:hover': levelData.userCount > 0 ? {
            background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
          } : {},
          '&:disabled': {
            opacity: 0.5,
            color: 'text.secondary'
          }
        }}
      >
        {levelData.userCount > 0 ? 'View Details' : 'No Users'}
      </Button>
    </Card>
  );
});

LevelCard.displayName = 'LevelCard';

const MyTeam = () => {
  const wallet = useWallet();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const {
    trackApiCall,
    getTotalTime,
    getSuccessRate,
    getPerformanceStats,
    performanceAlerts,
    clearAlert
  } = useApiPerformanceMonitor();
  const [isLoading, setIsLoading] = useState(false);
  const [isBasicDataLoaded, setIsBasicDataLoaded] = useState(false);
  const [isDbDataLoaded, setIsDbDataLoaded] = useState(false);
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
          .my-team-performance-table .MuiTableContainer-root,
          .my-team-main-cards .MuiTableContainer-root {
            width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Ensure 21 levels table takes full width */
          .my-team-main-cards .MuiTable-root {
            width: 100% !important;
            min-width: 100% !important;
            table-layout: fixed !important;
          }

          /* Responsive table cells for mobile */
          .my-team-main-cards .MuiTableCell-root {
            padding: 6px 4px !important;
            font-size: 0.7rem !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          /* Ensure table header cells take full width */
          .my-team-main-cards .MuiTableHead-root .MuiTableCell-root {
            font-size: 0.75rem !important;
            font-weight: bold !important;
          }

          /* Set specific column widths for better distribution */
          .my-team-main-cards .MuiTableCell-root:nth-child(1) { width: 15% !important; }
          .my-team-main-cards .MuiTableCell-root:nth-child(2) { width: 12% !important; }
          .my-team-main-cards .MuiTableCell-root:nth-child(3) { width: 20% !important; }
          .my-team-main-cards .MuiTableCell-root:nth-child(4) { width: 20% !important; }
          .my-team-main-cards .MuiTableCell-root:nth-child(5) { width: 13% !important; }
          .my-team-main-cards .MuiTableCell-root:nth-child(6) { width: 20% !important; }



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

  // Function to fetch level details - Optimized
  const fetchLevelDetails = async (level) => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Wallet not connected');
      return;
    }

    // Open modal immediately with loading state for better UX
   setSelectedLevel(level);
    setModalOpen(true);
    setModalLoading(true);
    setLevelUsers([]);

    try {
      console.log(`🔍 Fetching details for level ${level}`);

      // Check if we already have the data from teamData.dbLevels
      const existingLevelData = teamData.dbLevels?.find(l => l.level === level);
      if (existingLevelData && existingLevelData.users && existingLevelData.users.length > 0) {
        console.log(`📋 Using cached data for level ${level}`);

        // Use cached data and fetch investments in background
        const cachedUsers = existingLevelData.users.map(user => ({
          ...user,
          investments: [],
          totalInvestmentAmount: user.totalInvestment || 0
        }));

        setLevelUsers(cachedUsers);
        setModalLoading(false);

        // Fetch detailed investment data in background
        setTimeout(async () => {
          try {
            const usersWithInvestments = await Promise.all(
              existingLevelData.users.slice(0, 10).map(async (user) => { // Limit to first 10 for performance
                try {
                  const investmentResponse = await apiService.getUserInvestments(user.userAddress);
                  const investments = investmentResponse?.data || investmentResponse || [];
                  return {
                    ...user,
                    investments: investments,
                    totalInvestmentAmount: investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
                  };
                } catch (error) {
                  return {
                    ...user,
                    investments: [],
                    totalInvestmentAmount: user.totalInvestment || 0
                  };
                }
              })
            );
            setLevelUsers(usersWithInvestments);
          } catch (error) {
            console.log('Background investment fetch failed:', error);
          }
        }, 100);

        return;
      }

      // Fallback to API call if no cached data
      const response = await apiService.getUserReferralTree(wallet.account, 21);
      const responseData = response.data || response;

      if (responseData && responseData.tree && responseData.tree[`level${level}`]) {
        const users = responseData.tree[`level${level}`];
        console.log(`👥 Found ${users.length} users at level ${level}:`, users);

        // Show basic user data first
        const basicUsers = users.map(user => ({
          ...user,
          investments: [],
          totalInvestmentAmount: user.totalInvestment || 0
        }));

        setLevelUsers(basicUsers);
        setModalLoading(false);

        // Fetch investment details for first 10 users only (for performance)
        if (users.length > 0) {
          setTimeout(async () => {
            try {
              const usersWithInvestments = await Promise.all(
                users.slice(0, 10).map(async (user) => {
                  try {
                    const investmentResponse = await apiService.getUserInvestments(user.userAddress);
                    const investments = investmentResponse?.data || investmentResponse || [];
                    return {
                      ...user,
                      investments: investments,
                      totalInvestmentAmount: investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
                    };
                  } catch (error) {
                    return {
                      ...user,
                      investments: [],
                      totalInvestmentAmount: user.totalInvestment || 0
                    };
                  }
                })
              );
              setLevelUsers(prev => [
                ...usersWithInvestments,
                ...prev.slice(10) // Keep remaining users as-is
              ]);
            } catch (error) {
              console.log('Background investment fetch failed:', error);
            }
          }, 100);
        }
      } else {
        console.log(`❌ No users found at level ${level}`);
        setError(`No users found at level ${level}`);
        setModalLoading(false);
      }
    } catch (error) {
      console.error('Error fetching level details:', error);
      setError('Failed to fetch level details: ' + error.message);
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
      setIsBasicDataLoaded(false);
      setIsDbDataLoaded(false);
      setError('');
      setNotRegistered(false);

      // Step 1: Quick user validation
      const userInfo = await dwcContractInteractions.getUserInfo(wallet.account);
      console.log('User Info:', userInfo);

      if (!userInfo?.id || userInfo.id === 0n) {
        setError('User not registered. Please register to view your team.');
        setNotRegistered(true);
        setIsLoading(false);
        return;
      }

      // Step 2: Load basic blockchain data first (fast)
      console.log('🏆 MyTeam: Fetching basic team data...');
      const [teamCount, userRank] = await Promise.all([
        dwcContractInteractions.getTeamCount(wallet.account),
        dwcContractInteractions.getUserRank(wallet.account),
      ]);

      console.log('✅ MyTeam: Basic data fetch completed');
      const currentUserRank = Number(userRank.rank) || 0;

      // Step 3: Set initial data with blockchain info
      setTeamData(prevData => ({
        ...prevData,
        directReferrals: Number(userInfo.partnersCount) || 0,
        directBusiness: parseFloat(formatUnits(userInfo.directBusiness || 0n, 18)) || 0,
        majorTeam: Number(teamCount.maxTeam) || 0,
        minorTeam: Number(teamCount.otherTeam) || 0,
        userRank: getRankLabel(currentUserRank),
        levelIncome: parseFloat(formatUnits(userInfo.levelincome || 0n, 18)) || 0,
        royaltyIncome: parseFloat(formatUnits(userInfo.royaltyincome || 0n, 18)) || 0,
        totalTeam: Number(userInfo.teamCount) || 0,
      }));

      // Mark basic data as loaded
      setIsBasicDataLoaded(true);

      // Step 4: Load database team data in background (slower) with optimized batch size
      console.log('🌳 Fetching database team data in background...');

      // Use smaller batch size for faster initial load, then load more if needed
      const initialLimit = 50; // Reduced from 100 for faster initial load

      // Use Promise.allSettled to prevent one failure from blocking others
      const [treeResult, statsResult] = await Promise.allSettled([
        trackApiCall('referralTree', () => apiService.getUserReferralTreeOptimized(wallet.account, 21, initialLimit)),
        trackApiCall('referralStats', () => apiService.getUserReferralStats(wallet.account))
      ]);

      let referralTree = null;
      let referralStats = null;
      let dbLevels = [];

      // Process tree data
      if (treeResult.status === 'fulfilled' && treeResult.value.success) {
        referralTree = treeResult.value.data;
        console.log('✅ Referral tree fetched:', referralTree);

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
      } else {
        console.warn('⚠️ Failed to fetch referral tree:', treeResult.status === 'rejected' ? treeResult.reason : 'Unknown error');

        // If user is not registered, create empty levels structure
        const errorMessage = treeResult.status === 'rejected' ? treeResult.reason?.message : '';
        if (errorMessage && errorMessage.includes('User not found')) {
          console.log('📝 User not registered, showing empty referral tree');
          // Create empty levels for unregistered users
          for (let level = 1; level <= 21; level++) {
            dbLevels.push({
              level,
              userCount: 0,
              users: [],
              totalInvestment: 0,
              totalEarnings: 0,
            });
          }
        }
      }

      // Process stats data
      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        referralStats = statsResult.value.data;
        console.log('✅ Referral stats fetched:', referralStats);
      } else {
        console.warn('⚠️ Failed to fetch referral stats:', statsResult.status === 'rejected' ? statsResult.reason : 'Unknown error');
      }

      // Step 5: Update with complete data
      setTeamData(prevData => ({
        ...prevData,
        dbLevels,
        referralTree,
        referralStats,
      }));

      // Mark database data as loaded
      setIsDbDataLoaded(true);
      console.log('✅ Database levels processed:', dbLevels);

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

  // Memoize formatCurrency function
  const formatCurrency = React.useCallback((amount = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  // Memoize handleViewLevelDetails function
  const handleViewLevelDetails = React.useCallback(async (level) => {
    if (!wallet.isConnected || !wallet.account) {
      setError('Please connect your wallet to view level details.');
      return;
    }

    await fetchLevelDetails(level);
  }, [wallet.isConnected, wallet.account]);

  // Debounced refresh function to prevent excessive API calls
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefreshData = React.useCallback(async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes

    setIsRefreshing(true);
    try {
      // Clear API cache
      apiService.clearCache();

      // Reset loading states
      setIsBasicDataLoaded(false);
      setIsDbDataLoaded(false);

      // Fetch fresh data
      await fetchTeamData();
    } finally {
      // Add a small delay to prevent rapid successive calls
      setTimeout(() => setIsRefreshing(false), 2000);
    }
  }, [isRefreshing]);

  useEffect(() => {
    if (wallet.isConnected && wallet.account) {
      fetchTeamData();
    }
  }, [wallet.isConnected, wallet.account, chainId]);

  // Memoized calculations for summary cards
  const activeLevelsCount = React.useMemo(() =>
    teamData.dbLevels ? teamData.dbLevels.filter(level => level.userCount > 0).length : 0,
    [teamData.dbLevels]
  );

  const totalUsersCount = React.useMemo(() =>
    teamData.dbLevels ? teamData.dbLevels.reduce((sum, level) => sum + level.userCount, 0) : 0,
    [teamData.dbLevels]
  );

  const totalInvestmentAmount = React.useMemo(() =>
    formatCurrency(teamData.dbLevels ? teamData.dbLevels.reduce((sum, level) => sum + level.totalInvestment, 0) : 0),
    [teamData.dbLevels, formatCurrency]
  );

  // Memoized calculations for summary cards with better performance
  const summaryStats = React.useMemo(() => {
    if (!teamData.dbLevels || teamData.dbLevels.length === 0) {
      return {
        activeLevelsCount: 0,
        totalUsersCount: 0,
        totalInvestmentAmount: formatCurrency(0)
      };
    }

    let activeLevels = 0;
    let totalUsers = 0;
    let totalInvestment = 0;

    for (const level of teamData.dbLevels) {
      if (level.userCount > 0) {
        activeLevels++;
      }
      totalUsers += level.userCount;
      totalInvestment += level.totalInvestment;
    }

    return {
      activeLevelsCount: activeLevels,
      totalUsersCount: totalUsers,
      totalInvestmentAmount: formatCurrency(totalInvestment)
    };
  }, [teamData.dbLevels, formatCurrency]);

  const { activeLevelsCount, totalUsersCount, totalInvestmentAmount } = summaryStats;



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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          {(isLoading || !isDbDataLoaded) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                {!isBasicDataLoaded ? 'Loading basic data...' : 'Loading team data...'}
              </Typography>
              {process.env.NODE_ENV === 'development' && getTotalTime() > 0 && (
                <Typography variant="caption" color="info.main">
                  ({(getTotalTime() / 1000).toFixed(1)}s)
                </Typography>
              )}
            </Box>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshData}
            disabled={isLoading || isRefreshing}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
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
            <ProgressiveLoader
              isBasicDataLoaded={isBasicDataLoaded}
              fallback={<TeamOverviewSkeleton />}
            >
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
            </ProgressiveLoader>
          </Card>
        </Grid>


        {/* 21 Levels Team Structure */}
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 1, sm: 2 }, boxShadow: 3, width: '100%' }} className="my-team-main-cards">
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: 'primary.main', fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              21 Levels Team Structure
            </Typography>

            {/* Summary Cards - Optimized with useMemo */}
            <SmartLoader
              loading={!isDbDataLoaded}
              data={teamData.dbLevels}
              skeleton={<SummaryCardsSkeleton />}
            >
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    color: 'white',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}>
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1, opacity: 0.9 }}>Total Levels</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>21</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
                    color: 'white',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}>
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1, opacity: 0.9 }}>Active Levels</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {activeLevelsCount}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
                    color: 'white',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}>
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1, opacity: 0.9 }}>Total Users</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {totalUsersCount}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
                    color: 'white',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}>
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1, opacity: 0.9 }}>Total Investment</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      {totalInvestmentAmount}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </SmartLoader>

            {/* Optimized 21 Levels Table */}
            <LazyLevelsTable
              dbLevels={teamData.dbLevels}
              isLoading={!isDbDataLoaded}
              onViewDetails={handleViewLevelDetails}
            />
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
                        key={user.walletAddress || user.userAddress}
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
                              {user.walletAddress || user.userAddress}
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
                        {levelUsers.map((user) =>
                          user.investments && user.investments.length > 0 ?
                            user.investments.map((investment, invIndex) => (
                              <TableRow
                                key={`${user.walletAddress || user.userAddress}-${invIndex}`}
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
                                    {(user.walletAddress || user.userAddress).slice(0, 10)}...{(user.walletAddress || user.userAddress).slice(-8)}
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

      {/* Performance Monitor */}
      {/* <PerformanceMonitor
        performanceAlerts={performanceAlerts}
        clearAlert={clearAlert}
        getPerformanceStats={getPerformanceStats}
        getTotalTime={getTotalTime}
        getSuccessRate={getSuccessRate}
      /> */}
    </Container>
  );
};

export default MyTeam;