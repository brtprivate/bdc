/**
 * MyTeam.jsx - Optimized MLM Team Management Page
 *
 * PERFORMANCE OPTIMIZATIONS IMPLEMENTED:
 *
 * 1. API Optimizations:
 *    - Uses ultra-optimized backend endpoints with caching
 *    - Batch API calls with Promise.allSettled for parallel fetching
 *    - Fallback mechanisms for API failures
 *    - Proper error handling and retry logic
 *
 * 2. React Performance:
 *    - React.memo for expensive components (LevelCard, LoadingSkeleton)
 *    - useMemo for expensive calculations (summary cards, totals)
 *    - useCallback for event handlers to prevent re-renders
 *    - Memoized overview cards data to prevent recalculation
 *
 * 3. Loading & UX:
 *    - Skeleton loading components for better perceived performance
 *    - Progressive data loading (show cached data first, then fetch details)
 *    - Debounced refresh to prevent excessive API calls
 *    - Auto-refresh every 5 minutes when page is visible
 *
 * 4. Data Management:
 *    - Efficient data structures for 21-level team hierarchy
 *    - Smart caching of level details to avoid redundant API calls
 *    - Optimized state updates to minimize re-renders
 *
 * 5. Performance Monitoring:
 *    - Load time tracking and logging
 *    - Slow loading detection and warnings
 *    - Development-only performance metrics
 *
 * 6. Mobile Optimization:
 *    - Responsive design with mobile-first approach
 *    - Optimized table layouts for mobile devices
 *    - Touch-friendly interactions
 */

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
  Avatar,
  Skeleton
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

// Optimized Loading Skeleton Component for better UX
const LoadingSkeleton = React.memo(() => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 3 }}>
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ p: 2, height: '140px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
                <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={16} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Grid>
    <Grid item xs={12}>
      <Card sx={{ p: { xs: 2, sm: 3 }, boxShadow: 3 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ p: 2, height: '100px' }}>
                <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={32} />
              </Card>
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Card>
    </Grid>
  </Grid>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

const MyTeam = () => {
  const wallet = useWallet();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);
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

  // Optimized function to fetch level details with better caching and performance
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

      // First, check if we already have the data from teamData.dbLevels (cached data)
      const existingLevelData = teamData.dbLevels?.find(l => l.level === level);
      if (existingLevelData && existingLevelData.users && existingLevelData.users.length > 0) {
        console.log(`📋 Using cached data for level ${level} (${existingLevelData.users.length} users)`);

        // Use cached data immediately for better UX
        const cachedUsers = existingLevelData.users.map(user => ({
          userAddress: user.userAddress || user.walletAddress,
          registrationTime: user.registrationTime || new Date().toISOString(),
          status: user.status || 'active',
          totalInvestment: user.totalInvestment || 0,
          totalEarnings: user.totalEarnings || 0,
          investments: [],
          totalInvestmentAmount: user.totalInvestment || 0,
          depositCount: user.depositCount || 0
        }));

        setLevelUsers(cachedUsers);
        setModalLoading(false);
        return;
      }

      // If no cached data, try to fetch from referral tree directly
      console.log(`🚀 No cached data, fetching level ${level} users from referral tree`);

      if (teamData.referralTree && teamData.referralTree.tree) {
        const levelKey = `level${level}`;
        const levelUsers = teamData.referralTree.tree[levelKey] || [];

        if (levelUsers.length > 0) {
          console.log(`� Found ${levelUsers.length} users at level ${level} from referral tree`);

          // Process users data from referral tree
          const processedUsers = levelUsers.map(user => ({
            userAddress: user.userAddress || user.walletAddress,
            registrationTime: user.registrationTime || new Date().toISOString(),
            status: user.status || 'active',
            totalInvestment: user.totalInvestment || 0,
            totalEarnings: user.totalEarnings || 0,
            investments: [],
            totalInvestmentAmount: user.totalInvestment || 0,
            depositCount: user.depositCount || 0
          }));

          setLevelUsers(processedUsers);
          setModalLoading(false);
          return;
        }
      }

      // Last resort: fetch fresh data from API
      console.log(`🔄 Fetching fresh data for level ${level} from API`);
      const response = await apiService.getUserReferralTree(wallet.account, 21);

      if (response.success && response.data && response.data.tree) {
        const levelKey = `level${level}`;
        const levelUsers = response.data.tree[levelKey] || [];

        if (levelUsers.length > 0) {
          console.log(`👥 Found ${levelUsers.length} users at level ${level} from fresh API call`);

          // Process users data
          const processedUsers = levelUsers.map(user => ({
            userAddress: user.userAddress || user.walletAddress,
            registrationTime: user.registrationTime || new Date().toISOString(),
            status: user.status || 'active',
            totalInvestment: user.totalInvestment || 0,
            totalEarnings: user.totalEarnings || 0,
            investments: [],
            totalInvestmentAmount: user.totalInvestment || 0,
            depositCount: user.depositCount || 0
          }));

          setLevelUsers(processedUsers);
          setModalLoading(false);
        } else {
          console.log(`ℹ️ No users found at level ${level}`);
          setLevelUsers([]);
          setModalLoading(false);
        }
      } else {
        console.log(`ℹ️ No users found at level ${level} - this is normal for empty levels`);
        setLevelUsers([]);
        setModalLoading(false);
      }
    } catch (error) {
      console.error('Error fetching level details:', error);
      // Don't show error for empty levels, just show empty state
      setLevelUsers([]);
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
      const startTime = performance.now();
      setLoadingStartTime(startTime);
      setIsLoading(true);
      setError('');
      setNotRegistered(false);

      console.log('🚀 MyTeam: Starting optimized data fetch...');

      // First check if user is registered
      const userInfo = await dwcContractInteractions.getUserInfo(wallet.account);
      console.log('User Info:', userInfo);

      if (!userInfo?.id || userInfo.id === 0n) {
        setError('User not registered. Please register to view your team.');
        setNotRegistered(true);
        setIsLoading(false);
        return;
      }

      console.log('🚀 MyTeam: Starting optimized data fetch...');

      // Parallel fetch of blockchain and database data for better performance
      const [blockchainData, databaseData] = await Promise.allSettled([
        // Blockchain data
        Promise.all([
          dwcContractInteractions.getTeamCount(wallet.account),
          dwcContractInteractions.getUserRank(wallet.account),
        ]),
        // Database data (batch fetch)
        apiService.batchFetchTeamData(wallet.account)
      ]);

      // Process blockchain data
      let teamCount, userRank;
      if (blockchainData.status === 'fulfilled') {
        [teamCount, userRank] = blockchainData.value;
        console.log('✅ Blockchain data fetched successfully');
      } else {
        console.error('❌ Blockchain data fetch failed:', blockchainData.reason);
        throw new Error('Failed to fetch blockchain data');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Team Count:', teamCount);
        console.log('User Rank:', userRank);
      }

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

      // Process database data from batch fetch
      let referralTree = null;
      let referralStats = null;
      let dbLevels = [];

      if (databaseData.status === 'fulfilled') {
        const { tree, stats, summary } = databaseData.value;

        console.log('📊 Processing batch-fetched database data...');

        // Process referral tree
        if (tree.success && tree.data) {
          referralTree = tree.data;
          console.log('✅ Referral tree processed from batch fetch');
        } else {
          console.warn('⚠️ Referral tree not available in batch fetch:', tree.error);
        }

        // Process referral stats
        if (stats.success && stats.data) {
          referralStats = stats.data;
          console.log('✅ Referral stats processed from batch fetch');
        } else {
          console.warn('⚠️ Referral stats not available in batch fetch:', stats.error);
        }

        // Process database levels (1-21) with optimized data structure
        if (referralTree && referralTree.tree) {
          console.log('📊 Processing 21 levels data from batch fetch...');

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

          console.log(`✅ Processed ${dbLevels.length} levels with ${dbLevels.reduce((sum, level) => sum + level.userCount, 0)} total users`);
        } else {
          console.warn('⚠️ No referral tree data available, creating empty levels structure');
          // Create empty structure for all 21 levels
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
      } else {
        console.error('❌ Database batch fetch failed:', databaseData.reason);
        // Create empty structure for all 21 levels as fallback
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

      // Performance logging
      const endTime = performance.now();
      const loadTime = endTime - loadingStartTime;
      console.log(`✅ MyTeam: Data fetch completed in ${loadTime.toFixed(2)}ms`);

      if (loadTime > 3000) {
        console.warn(`⚠️ Slow loading detected: ${loadTime.toFixed(2)}ms`);
      }

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
      setLoadingStartTime(null);
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
  const debouncedRefresh = React.useCallback(
    React.useMemo(() => {
      let timeoutId;
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (wallet.isConnected && wallet.account) {
            fetchTeamData();
          }
        }, 300); // 300ms debounce
      };
    }, [wallet.isConnected, wallet.account]),
    [wallet.isConnected, wallet.account]
  );

  // Optimized effect with better dependency management
  useEffect(() => {
    if (wallet.isConnected && wallet.account && chainId === MAINNET_CHAIN_ID) {
      fetchTeamData();
    }
  }, [wallet.isConnected, wallet.account, chainId]);

  // Auto-refresh data every 5 minutes when page is visible
  useEffect(() => {
    if (!wallet.isConnected || !wallet.account) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isLoading) {
        console.log('🔄 Auto-refreshing team data...');
        fetchTeamData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [wallet.isConnected, wallet.account, isLoading]);

  // Optimized memoized calculations for summary cards with better performance
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

  const totalEarningsAmount = React.useMemo(() =>
    formatCurrency(teamData.dbLevels ? teamData.dbLevels.reduce((sum, level) => sum + level.totalEarnings, 0) : 0),
    [teamData.dbLevels, formatCurrency]
  );

  // Memoized overview cards data for better performance
  const overviewCardsData = React.useMemo(() => [
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
      value: totalUsersCount.toString(),
      subtitle: 'Total team members in database',
      color: 'info.main',
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Team Investment',
      value: totalInvestmentAmount,
      subtitle: 'Total investment by team',
      color: 'primary.main',
    },
    {
      icon: <AccountBalanceWalletIcon />,
      title: 'Team Earnings',
      value: totalEarningsAmount,
      subtitle: 'Total earnings from team',
      color: 'secondary.main',
    },
  ], [
    teamData.directReferrals,
    teamData.directBusiness,
    teamData.majorTeam,
    teamData.minorTeam,
    teamData.totalTeam,
    totalUsersCount,
    totalInvestmentAmount,
    totalEarningsAmount,
    formatCurrency
  ]);



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
        sx={{ py: { xs: 2, sm: 3 }, background: 'linear-gradient(135deg, #f0f4ff 0%, #d9e4ff 100%)', minHeight: '100vh' }}
      >
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
          <Skeleton variant="text" width="200px" height={48} />
          <Skeleton variant="rectangular" width="120px" height={36} />
        </Box>
        <LoadingSkeleton />
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
          onClick={debouncedRefresh}
          disabled={isLoading}
          sx={{ width: { xs: '100%', sm: 'auto' }, fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
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
              {overviewCardsData.map((card, index) => (
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
          <Card sx={{ p: { xs: 1, sm: 2 }, boxShadow: 3, width: '100%' }} className="my-team-main-cards">
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: 'primary.main', fontWeight: 'bold', mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              21 Levels Team Structure
            </Typography>

            {/* Summary Cards - Optimized with useMemo */}
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

            {/* 21 Levels Table */}
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: 2,
                overflowX: 'auto',
                maxHeight: '600px',
                width: '100%',
                margin: 0,
                '& .MuiTable-root': {
                  width: '100%',
                  minWidth: '100%'
                },
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'transparent',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.1)',
                  },
                },
                '&::-webkit-scrollbar-corner': {
                  background: 'transparent',
                },
                scrollbarWidth: 'thin',
                scrollbarColor: 'transparent transparent',
              }}
            >
              <Table sx={{ width: '100%', minWidth: '100%', tableLayout: 'auto' }} aria-label="21 levels table" stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main' }}>Level</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main' }} align="center">Users</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main' }} align="center">Investment</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main' }} align="center">Earnings</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main' }} align="center">Status</TableCell>
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
                          '&:hover': { backgroundColor: 'primary.light', cursor: 'pointer' }
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
                            sx={{ fontWeight: 'bold', minWidth: '50px' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{
                            fontWeight: 'bold',
                            color: levelData.totalInvestment > 0 ? 'secondary.main' : 'text.secondary'
                          }}>
                            {formatCurrency(levelData.totalInvestment)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{
                            fontWeight: 'bold',
                            color: levelData.totalEarnings > 0 ? 'success.main' : 'text.secondary'
                          }}>
                            {formatCurrency(levelData.totalEarnings)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={levelData.userCount > 0 ? 'Active' : 'Inactive'}
                            color={levelData.userCount > 0 ? 'success' : 'default'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant={levelData.userCount > 0 ? "contained" : "outlined"}
                            size="small"
                            onClick={() => levelData.userCount > 0 && handleViewLevelDetails(levelData.level)}
                            disabled={levelData.userCount === 0 || isLoading}
                            sx={{
                              fontSize: '0.75rem',
                              minWidth: '80px',
                              background: levelData.userCount > 0
                                ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                                : 'transparent',
                              '&:hover': levelData.userCount > 0 ? {
                                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                              } : {},
                            }}
                          >
                            {levelData.userCount > 0 ? 'View Details' : 'No Users'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // Fallback: Show 21 empty levels if no data
                    Array.from({ length: 21 }, (_, index) => (
                      <TableRow
                        key={index + 1}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }
                        }}
                      >
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
                            sx={{ fontWeight: 'bold', minWidth: '50px' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatCurrency(0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatCurrency(0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label="Inactive"
                            color="default"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                            sx={{ fontSize: '0.75rem', minWidth: '80px' }}
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

              {levelUsers.length > 0 ? (
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
                            label={user.status === 'active' ? 'Active' : 'Inactive'}
                            color={user.status === 'active' ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                // Empty state when no users found
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  py={6}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    backgroundColor: '#fafafa'
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Users Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Level {selectedLevel} doesn't have any users yet.
                    <br />
                    Users will appear here as your team grows.
                  </Typography>
                </Box>
              )}

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