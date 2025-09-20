import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Container,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatUnits } from 'viem';
import {
  TrendingUp,
  PiggyBank,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Coins,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import StakingOrderCard from './StakingOrderCard';
import { calculateSummaryRewards, formatCurrency } from '../utils/rewardCalculations';

// Add CSS animations
const globalStyles = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('staking-animations')) {
  const style = document.createElement('style');
  style.id = 'staking-animations';
  style.textContent = globalStyles;
  document.head.appendChild(style);
}

const SectionContainer = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
  borderRadius: '12px',
  border: '1px solid rgba(25, 118, 210, 0.1)',
  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.06)',
  overflow: 'hidden',
  position: 'relative',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  borderRadius: '8px 8px 0 0',
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
  },
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  border: '1px solid rgba(25, 118, 210, 0.08)',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(25, 118, 210, 0.08)',
    borderColor: 'rgba(25, 118, 210, 0.15)',
  },
}));

// Mobile Slider Components
const SliderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  borderRadius: '12px',
}));

const SliderTrack = styled(Box)(({ theme }) => ({
  display: 'flex',
  transition: 'transform 0.3s ease-in-out',
  width: '100%',
}));

const SliderSlide = styled(Box)(({ theme }) => ({
  minWidth: '100%',
  width: '100%',
  flexShrink: 0,
}));

const SliderNavigation = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  zIndex: 10,
  padding: '0 8px',
}));

const SliderButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  border: '1px solid rgba(25, 118, 210, 0.2)',
  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
  pointerEvents: 'auto',
  width: '40px',
  height: '40px',
  '&:hover': {
    background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
  },
  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  },
}));

const SliderIndicators = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  marginTop: '16px',
}));

const SliderDot = styled(Box)(({ active }) => ({
  width: active ? '24px' : '8px',
  height: '8px',
  borderRadius: '4px',
  background: active
    ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
    : 'rgba(25, 118, 210, 0.2)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    background: active
      ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
      : 'rgba(25, 118, 210, 0.4)',
  },
}));

const StakingOrdersSection = ({ orders, isLoading, onRefresh, notRegistered }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentSlide, setCurrentSlide] = useState(0);

  const [summaryData, setSummaryData] = useState({
    totalStaked: 0,
    totalRewards: 0,
    totalValue: 0,
    activeOrders: 0,
    averageDailyReturn: 0
  });

  // Calculate summary data whenever orders change
  useEffect(() => {
    if (!orders || orders.length === 0) {
      setSummaryData({
        totalStaked: 0,
        totalRewards: 0,
        totalValue: 0,
        activeOrders: 0,
        averageDailyReturn: 0
      });
      return;
    }

    const calculateSummary = () => {
      // Convert orders to the format expected by calculateSummaryRewards
      const formattedOrders = orders.map(order => ({
        ...order,
        amount: parseFloat(formatUnits(order.amount, 18))
      }));

      const summary = calculateSummaryRewards(formattedOrders);
      setSummaryData(summary);
    };

    calculateSummary();

    // Update summary every 10 seconds for real-time updates
    const interval = setInterval(calculateSummary, 10000);
    return () => clearInterval(interval);
  }, [orders]);

  // Slider navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % orders.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + orders.length) % orders.length);
  };

  // Reset slide when orders change
  useEffect(() => {
    setCurrentSlide(0);
  }, [orders]);



  if (notRegistered) {
    return (
      <SectionContainer sx={{ mb: 4 }}>
        <HeaderBox>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PiggyBank size={32} style={{ marginRight: '12px' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Staking Orders
              </Typography>
            </Box>
          </Box>
        </HeaderBox>
        <CardContent sx={{ p: 4 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AlertCircle size={20} style={{ marginRight: '8px' }} />
              <Typography>
                Please register to view your staking orders and start earning rewards.
              </Typography>
            </Box>
          </Alert>
        </CardContent>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer sx={{ mb: 4 }}>
      {/* Header */}
      <HeaderBox>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PiggyBank size={20} style={{ marginRight: '8px' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.25 }}>
                Staking Orders
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                Real-time rewards • 0.5% daily
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={12} color="inherit" /> : <RefreshCw size={12} />}
            onClick={onRefresh}
            disabled={isLoading}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              backdropFilter: 'blur(10px)',
              fontSize: '0.75rem',
              px: 2,
              py: 0.5
            }}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </HeaderBox>

      <CardContent sx={{ p: 2 }}>
        {/* Summary Cards */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard>
              <CardContent sx={{ textAlign: 'center', p: 1.5, position: 'relative' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                  position: 'relative',
                  zIndex: 2
                }}>
                  <Box sx={{
                    p: 0.5,
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 0.5,
                    boxShadow: '0 2px 6px rgba(25, 118, 210, 0.2)'
                  }}>
                    <DollarSign size={14} style={{ color: 'white' }} />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.7rem' }}>
                    Total Staked
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 0.5,
                  fontSize: '1rem'
                }}>
                  {formatCurrency(summaryData.totalStaked)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.65rem' }}>
                  Principal Amount
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard>
              <CardContent sx={{ textAlign: 'center', p: 1.5, position: 'relative' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                  position: 'relative',
                  zIndex: 2
                }}>
                  <Box sx={{
                    p: 0.5,
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 0.5,
                    boxShadow: '0 2px 6px rgba(25, 118, 210, 0.2)',
                    animation: 'pulse 2s infinite'
                  }}>
                    <TrendingUp size={14} style={{ color: 'white' }} />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.7rem' }}>
                    Total Rewards
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 0.5,
                  fontSize: '1rem'
                }}>
                  {formatCurrency(summaryData.totalRewards)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.65rem' }}>
                  Earned Rewards
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard>
              <CardContent sx={{ textAlign: 'center', p: 1.5, position: 'relative' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                  position: 'relative',
                  zIndex: 2
                }}>
                  <Box sx={{
                    p: 0.5,
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 0.5,
                    boxShadow: '0 2px 6px rgba(25, 118, 210, 0.2)'
                  }}>
                    <Coins size={14} style={{ color: 'white' }} />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.7rem' }}>
                    Total Value
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 0.5,
                  fontSize: '1rem'
                }}>
                  {formatCurrency(summaryData.totalValue)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.65rem' }}>
                  Current Portfolio
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard>
              <CardContent sx={{ textAlign: 'center', p: 1.5, position: 'relative' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                  position: 'relative',
                  zIndex: 2
                }}>
                  <Box sx={{
                    p: 0.5,
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 0.5,
                    boxShadow: '0 2px 6px rgba(25, 118, 210, 0.2)'
                  }}>
                    <PiggyBank size={14} style={{ color: 'white' }} />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.7rem' }}>
                    Active Orders
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 0.5,
                  fontSize: '1rem'
                }}>
                  {summaryData.activeOrders}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.65rem' }}>
                  Staking Positions
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>
        </Grid>

        <Divider sx={{
          mb: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(25, 118, 210, 0.2) 50%, transparent 100%)',
          height: '1px',
          border: 'none'
        }} />

        {/* Orders Grid */}
        {isLoading && orders.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={24} />
            <Typography variant="body1" sx={{ ml: 1, fontSize: '0.9rem' }}>
              Loading staking orders...
            </Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 4,
            background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)',
            borderRadius: '12px',
            border: '1px dashed rgba(25, 118, 210, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%231976d2" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.5,
            }} />
            
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)',
                animation: 'float 3s ease-in-out infinite'
              }}>
                <PiggyBank size={24} style={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" sx={{
                mb: 1,
                fontWeight: 'bold',
                color: 'primary.main'
              }}>
                No Staking Orders Yet
              </Typography>
              <Typography variant="body1" sx={{
                color: 'text.secondary',
                maxWidth: '400px',
                mx: 'auto',
                lineHeight: 1.6
              }}>
                Start staking to see your orders here and earn <strong>0.5% daily rewards</strong> with real-time tracking!
              </Typography>
            </Box>
          </Box>
        ) : isMobile ? (
          // Mobile Slider View
          <Box>
            <SliderContainer>
              <SliderTrack sx={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {orders.map((order, index) => (
                  <SliderSlide key={index}>
                    <Box sx={{ px: 1 }}>
                      <StakingOrderCard order={order} index={index} />
                    </Box>
                  </SliderSlide>
                ))}
              </SliderTrack>

              {orders.length > 1 && (
                <SliderNavigation>
                  <SliderButton
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft size={20} />
                  </SliderButton>
                  <SliderButton
                    onClick={nextSlide}
                    disabled={currentSlide === orders.length - 1}
                  >
                    <ChevronRight size={20} />
                  </SliderButton>
                </SliderNavigation>
              )}
            </SliderContainer>

            {orders.length > 1 && (
              <SliderIndicators>
                {orders.map((_, index) => (
                  <SliderDot
                    key={index}
                    active={index === currentSlide}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </SliderIndicators>
            )}
          </Box>
        ) : (
          // Desktop Grid View
          <Grid container spacing={1.5}>
            {orders.map((order, index) => (
              <Grid item xs={12} sm={12} md={6} lg={6} xl={4} key={index}>
                <StakingOrderCard order={order} index={index} />
              </Grid>
            ))}
          </Grid>
        )}

       
      </CardContent>
    </SectionContainer>
  );
};

export default StakingOrdersSection;
