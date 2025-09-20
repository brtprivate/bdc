import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  PiggyBank,
  DollarSign,
  Clock,
  Info
} from 'lucide-react';
import StakingOrdersSection from './StakingOrdersSection';
import { testRewardCalculations } from '../utils/rewardCalculations';

const DemoContainer = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  borderRadius: '20px',
  border: '1px solid #e3f2fd',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  margin: theme.spacing(2),
}));

const StakingOrdersDemo = () => {
  // Create sample staking orders for demonstration
  const sampleOrders = [
    {
      amount: 50000000000000000000n, // 50 tokens
      releaseStackBonus: 0n,
      deposit_time: Math.floor(Date.now() / 1000) - (86400 * 10), // 10 days ago
      reward_time: Math.floor(Date.now() / 1000) - (86400 * 10),
      isactive: true,
      isUsdt: true
    },
    {
      amount: 100000000000000000000n, // 100 tokens
      releaseStackBonus: 5000000000000000000n, // 5 tokens bonus
      deposit_time: Math.floor(Date.now() / 1000) - (86400 * 5), // 5 days ago
      reward_time: Math.floor(Date.now() / 1000) - (86400 * 5),
      isactive: true,
      isUsdt: false
    },
    {
      amount: 200000000000000000000n, // 200 tokens
      releaseStackBonus: 0n,
      deposit_time: Math.floor(Date.now() / 1000) - (86400 * 1.5), // 1.5 days ago
      reward_time: Math.floor(Date.now() / 1000) - (86400 * 1.5),
      isactive: true,
      isUsdt: true
    },
    {
      amount: 75000000000000000000n, // 75 tokens
      releaseStackBonus: 2500000000000000000n, // 2.5 tokens bonus
      deposit_time: Math.floor(Date.now() / 1000) - (86400 * 0.5), // 12 hours ago
      reward_time: Math.floor(Date.now() / 1000) - (86400 * 0.5),
      isactive: true,
      isUsdt: true
    }
  ];

  const runTests = () => {
    const testResults = testRewardCalculations();
    console.log('Reward Calculation Tests:', testResults);
    alert('Test results logged to console. Check developer tools.');
  };

  return (
    <Box sx={{ p: 2 }}>
      <DemoContainer>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PiggyBank size={32} style={{ color: '#1976d2', marginRight: '12px' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Staking Orders Demo
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Real-time reward calculations with 0.5% daily returns
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Info size={20} style={{ marginRight: '8px' }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  How it works:
                </Typography>
                <Typography variant="body2" component="div">
                  • Users earn <strong>0.5% daily rewards</strong> on their staked amount<br/>
                  • Rewards accumulate <strong>continuously per second</strong> to reach full 0.5% by midnight<br/>
                  • Past complete days show full rewards, current day shows real-time progress<br/>
                  • Display updates every second to show live reward accrual
                </Typography>
              </Box>
            </Box>
          </Alert>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark', mb: 1 }}>
                  Sample Data Structure
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.8rem',
                  color: 'success.dark',
                  whiteSpace: 'pre-wrap'
                }}>
{`{
  amount: 50000000000000000000n, // 50 tokens
  releaseStackBonus: 0n,
  deposit_time: 1758007078, // Unix timestamp
  reward_time: 1758007078,
  isactive: true,
  isUsdt: true
}`}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.dark', mb: 1 }}>
                  Calculation Example
                </Typography>
                <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                  <strong>100 tokens staked 10 days ago:</strong><br/>
                  • Past 9 complete days: 9 × 0.5% = 4.5 tokens<br/>
                  • Current day progress: Time elapsed × (0.5% ÷ 86400 seconds)<br/>
                  • Total display: 100 + 4.5 + today's accrued rewards
                </Typography>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<TrendingUp size={16} />}
              onClick={runTests}
              sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
            >
              Run Calculation Tests
            </Button>
            <Chip
              label={`${sampleOrders.length} Sample Orders`}
              color="primary"
              variant="outlined"
              icon={<PiggyBank size={16} />}
            />
            <Chip
              label="Real-time Updates"
              color="success"
              variant="outlined"
              icon={<Clock size={16} />}
            />
          </Box>
        </CardContent>
      </DemoContainer>

      {/* Demo Staking Orders Section */}
      <StakingOrdersSection 
        orders={sampleOrders}
        isLoading={false}
        onRefresh={() => console.log('Refresh clicked')}
        notRegistered={false}
      />

      {/* Not Registered Demo */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'text.secondary' }}>
          Not Registered State:
        </Typography>
        <StakingOrdersSection 
          orders={[]}
          isLoading={false}
          onRefresh={() => console.log('Refresh clicked')}
          notRegistered={true}
        />
      </Box>
    </Box>
  );
};

export default StakingOrdersDemo;
