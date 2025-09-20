import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Divider,
  Grid,
  Tooltip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatUnits } from 'viem';
import {
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  Info,
  Coins,
  PiggyBank
} from 'lucide-react';
import { calculateRewards, formatCurrency, formatDate } from '../utils/rewardCalculations';

// Ensure animations are available
if (typeof document !== 'undefined' && !document.getElementById('staking-animations')) {
  const globalStyles = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;

  const style = document.createElement('style');
  style.id = 'staking-animations';
  style.textContent = globalStyles;
  document.head.appendChild(style);
}

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
  border: '1px solid rgba(25, 118, 210, 0.1)',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(25, 118, 210, 0.1)',
    borderColor: 'rgba(25, 118, 210, 0.2)',
  },
}));

const RewardBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)',
  borderRadius: '8px',
  padding: theme.spacing(1.5),
  border: '1px solid rgba(25, 118, 210, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
  },
}));

const StakingOrderCard = ({ order, index }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [rewardData, setRewardData] = useState({
    pastRewards: 0,
    todayRewards: 0,
    totalRewards: 0,
    dayProgress: 0,
    daysStaked: 0
  });

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate rewards whenever time updates
  useEffect(() => {
    if (!order || !order.isactive) return;

    const updateRewards = () => {
      const now = Math.floor(currentTime / 1000); // Current time in seconds
      const depositTime = Number(order.deposit_time);
      const stakedAmount = parseFloat(formatUnits(order.amount, 18));

      const rewards = calculateRewards(stakedAmount, depositTime, now);
      setRewardData(rewards);
    };

    updateRewards();
  }, [currentTime, order]);

  if (!order) return null;

  const stakedAmount = parseFloat(formatUnits(order.amount, 18));
  const releaseStackBonus = parseFloat(formatUnits(order.releaseStackBonus || 0n, 18));
  const depositDate = new Date(Number(order.deposit_time) * 1000);
  const currentValue = stakedAmount + rewardData.totalRewards;

  return (
    <StyledCard>
      <CardContent sx={{ p: 2, position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          pb: 1,
          borderBottom: '1px solid rgba(25, 118, 210, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              p: 0.5,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              boxShadow: '0 1px 4px rgba(25, 118, 210, 0.2)'
            }}>
              <PiggyBank size={14} style={{ color: 'white' }} />
            </Box>
            <Typography variant="body1" sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              fontSize: '0.9rem'
            }}>
              Order #{index + 1}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip
              label={order.isactive ? 'Active' : 'Inactive'}
              color={order.isactive ? 'success' : 'default'}
              size="small"
              sx={{
                fontSize: '0.7rem',
                height: '20px',
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
            <Chip
              label={order.isUsdt ? 'USDT' : 'BDC'}
              color="primary"
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.7rem',
                height: '20px',
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          </Box>
        </Box>

        {/* Main Stats Grid */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {/* Original Staked Amount */}
          <Grid item xs={12} sm={6}>
            <Box sx={{
              textAlign: 'center',
              p: 1.5,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                borderColor: 'rgba(25, 118, 210, 0.2)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Box sx={{
                  p: 0.5,
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 0.5,
                  boxShadow: '0 1px 4px rgba(25, 118, 210, 0.2)'
                }}>
                  <DollarSign size={12} style={{ color: 'white' }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.7rem' }}>
                  Staked
                </Typography>
              </Box>
              <Typography variant="body2" sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                fontSize: '0.85rem'
              }}>
                {formatCurrency(stakedAmount)}
              </Typography>
            </Box>
          </Grid>

          {/* Current Value */}
          <Grid item xs={12} sm={6}>
            <Box sx={{
              textAlign: 'center',
              p: 1.5,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                borderColor: 'rgba(25, 118, 210, 0.2)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Box sx={{
                  p: 0.5,
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 0.5,
                  boxShadow: '0 1px 4px rgba(25, 118, 210, 0.2)'
                }}>
                  <TrendingUp size={12} style={{ color: 'white' }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.7rem' }}>
                  Current
                </Typography>
              </Box>
              <Typography variant="body2" sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                fontSize: '0.85rem'
              }}>
                {formatCurrency(currentValue)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Real-time Rewards Section */}
        {order.isactive && (
          <RewardBox sx={{ mb: 2, position: 'relative', zIndex: 1 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5,
              position: 'relative',
              zIndex: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  p: 0.5,
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1,
                  boxShadow: '0 1px 4px rgba(25, 118, 210, 0.3)',
                  animation: 'pulse 2s infinite'
                }}>
                  <Coins size={14} style={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    fontSize: '0.8rem'
                  }}>
                    Live Rewards
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    display: 'block',
                    fontSize: '0.65rem'
                  }}>
                    0.5% Daily
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Updates every second" arrow>
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' },
                    width: 24,
                    height: 24
                  }}
                >
                  <Info size={12} style={{ color: '#1976d2' }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Grid container spacing={1} sx={{ mb: 1.5, position: 'relative', zIndex: 2 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{
                  textAlign: 'center',
                  p: 1,
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
                  borderRadius: '6px',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)'
                  }
                }}>
                  <Typography variant="caption" sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '0.65rem'
                  }}>
                    Past {rewardData.daysStaked}d
                  </Typography>
                  <Typography variant="body2" sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    mt: 0.5,
                    fontSize: '0.75rem'
                  }}>
                    {formatCurrency(rewardData.pastRewards)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{
                  textAlign: 'center',
                  p: 1,
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 152, 0, 0.02) 100%)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 152, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(255, 152, 0, 0.1)'
                  }
                }}>
                  <Typography variant="caption" sx={{
                    color: 'warning.main',
                    fontWeight: 600,
                    fontSize: '0.65rem'
                  }}>
                    Today
                  </Typography>
                  <Typography variant="body2" sx={{
                    fontWeight: 'bold',
                    color: 'warning.main',
                    mt: 0.5,
                    fontSize: '0.75rem'
                  }}>
                    {formatCurrency(rewardData.todayRewards)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{
                  textAlign: 'center',
                  p: 1,
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.04) 100%)',
                  borderRadius: '6px',
                  border: '1px solid rgba(25, 118, 210, 0.2)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 1px 4px rgba(25, 118, 210, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)'
                  }
                }}>
                  <Typography variant="caption" sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: '0.65rem'
                  }}>
                    Total
                  </Typography>
                  <Typography variant="body2" sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    mt: 0.5,
                    fontSize: '0.8rem'
                  }}>
                    {formatCurrency(rewardData.totalRewards)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

          

          </RewardBox>
        )}

        <Divider sx={{
          my: 1.5,
          background: 'linear-gradient(90deg, transparent 0%, rgba(25, 118, 210, 0.2) 50%, transparent 100%)',
          height: '1px',
          border: 'none'
        }} />

        {/* Additional Info */}
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Box sx={{
              p: 1,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(25, 118, 210, 0.01) 100%)',
              borderRadius: '6px',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{
                  p: 0.25,
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 0.5
                }}>
                  <Calendar size={10} style={{ color: 'white' }} />
                </Box>
                <Typography variant="caption" sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.65rem'
                }}>
                  Staked On
                </Typography>
              </Box>
              <Typography variant="caption" sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                fontSize: '0.7rem'
              }}>
                {formatDate(depositDate)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{
              p: 1,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(25, 118, 210, 0.01) 100%)',
              borderRadius: '6px',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{
                  p: 0.25,
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 0.5
                }}>
                  <Clock size={10} style={{ color: 'white' }} />
                </Box>
                <Typography variant="caption" sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.65rem'
                }}>
                  Days Staked
                </Typography>
              </Box>
              <Typography variant="caption" sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                fontSize: '0.7rem'
              }}>
                {rewardData.daysStaked} days
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {releaseStackBonus > 0 && (
          <Box sx={{
            mt: 1.5,
            p: 1.5,
            background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 152, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.1)'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)',
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2 }}>
              <Box sx={{
                p: 0.5,
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1,
                boxShadow: '0 1px 4px rgba(255, 152, 0, 0.3)'
              }}>
                <Coins size={12} style={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{
                  fontWeight: 'bold',
                  color: 'warning.dark',
                  mb: 0.25,
                  fontSize: '0.7rem'
                }}>
                  Release Stack Bonus
                </Typography>
                <Typography variant="body2" sx={{
                  fontWeight: 'bold',
                  color: 'warning.main',
                  fontSize: '0.8rem'
                }}>
                  {formatCurrency(releaseStackBonus)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default StakingOrderCard;
