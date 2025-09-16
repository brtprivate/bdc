import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Link,
} from '@mui/material';
import { useWallet } from '../context/WalletContext';
import { dwcContractInteractions } from '../services/contractService';
import { formatUnits, parseUnits } from 'viem';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Flame } from 'lucide-react';

const SwapPage = () => {
  const wallet = useWallet();

  // Swap state
  const [dwcAmount, setDwcAmount] = useState('');
  const [daiAmount, setDaiAmount] = useState('');
  const [dwcBalance, setDwcBalance] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  // Burned tokens display
  const [burnedTokens, setBurnedTokens] = useState(0);

  useEffect(() => {
    if (wallet.isConnected && wallet.account) {
      fetchBalance();
      fetchBurnedTokens();
    }
  }, [wallet.isConnected, wallet.account]);

  const fetchBalance = async () => {
    try {
      const balance = await dwcContractInteractions.getDWCBalance(wallet.account);
      const _usdcBalance = await dwcContractInteractions.getUSDCBalance(wallet.account);
      setDwcBalance(parseFloat(formatUnits(balance, 18)));
      setUsdtBalance(parseFloat(formatUnits(_usdcBalance, 18)));
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    }
  };

  const fetchBurnedTokens = async () => {
    try {
      const burned = await dwcContractInteractions.getBurnedTokens();
      setBurnedTokens(parseFloat(formatUnits(burned, 18)));
    } catch (err) {
      console.error('Error fetching burned tokens:', err);
    }
  };

  const handleAmountChange = async (value) => {
    setDwcAmount(value);
    if (value && !isNaN(value)) {
      try {
        const tokenAmount = parseUnits(value, 18);
        const daiOutput = await dwcContractInteractions.tokensToDai(tokenAmount);
        console.log("🚀 ~ handleAmountChange ~ daiOutput:", daiOutput)
        setDaiAmount(formatUnits(daiOutput, 18));
      } catch (err) {
        console.error('Error calculating DAI amount:', err);
        setDaiAmount('');
      }
    } else {
      setDaiAmount('');
    }
  };

  const handleSwap = async () => {
    if (!dwcAmount || isNaN(dwcAmount)) return;
    setIsSwapping(true);
    setError('');
    try {
      const amount = parseUnits(dwcAmount, 18);
      console.log("🚀 ~ handleSwap ~ amount:", amount)
      const txHash = await dwcContractInteractions.tokenSwap(amount, wallet.account);
      setSuccessMessage(txHash);

      setDwcAmount('');
      setDaiAmount('');
      fetchBalance();
    } catch (err) {
      console.error('Swap failed:', err);
      setError('Swap failed: ' + err.message);
    } finally {
      setIsSwapping(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, px: 3 }}>
        <Alert
          severity="warning"
          sx={{
            fontSize: '1rem',
            fontWeight: 500,
            '& .MuiAlert-message': {
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          Please connect your wallet to access the token operations page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      fullWidth
      maxWidth="lg"
      sx={{
        py: 4,
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Burned Tokens Small Card */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Card sx={{
          px: 3,
          py: 2,
          borderRadius: 3,
          boxShadow: 3,
          background: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
          border: '1px solid',
          borderColor: 'error.light',
          maxWidth: 400,
          width: '100%'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={24} style={{ color: '#d32f2f', marginRight: '12px' }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'error.dark',
                  mb: 0.5
                }}
              >
                Total Burned
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'error.main',
                  fontSize: '1.25rem',
                  lineHeight: 1
                }}
              >
                {burnedTokens.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0
                })} BDC
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {/* Swap Card */}
        <Grid item xs={12} md={8} lg={6}>
          <Card sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            boxShadow: 6,
            height: 'fit-content'
          }}>
            {/* Header with improved typography */}
            <Typography
              variant="h5"
              sx={{
                mb: 1,
                fontWeight: 700,
                textAlign: 'center',
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                letterSpacing: '-0.02em',
                background: 'linear-gradient(45deg, #6200ea 30%, #00bcd4 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Swap BDC → USDT
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: '1rem',
                fontWeight: 400,
              }}
            >
              Exchange your BDC tokens for USDT
            </Typography>

            {/* Input: DWC */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'text.primary'
                }}
              >
                From (BDC)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={dwcAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                slotProps={{
                  input: {
                    endAdornment: (
                      <Button
                        size="small"
                        onClick={() => handleAmountChange(dwcBalance.toString())}
                        sx={{
                          ml: 1,
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        Max
                      </Button>
                    ),
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    fontWeight: 500,
                  }
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  display: 'block',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Balance: {dwcBalance.toFixed(4)} BDC
              </Typography>
            </Box>

            {/* Swap Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <Box sx={{
                p: 2,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SwapHorizIcon sx={{ fontSize: 28 }} />
              </Box>
            </Box>

            {/* Output: USDT */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'text.primary'
                }}
              >
                To (USDT)
              </Typography>
              <TextField
                fullWidth
                disabled
                value={daiAmount ? parseFloat(daiAmount).toFixed(4) : '0.0000'}
                placeholder="0.00"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    backgroundColor: 'action.hover',
                  }
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  display: 'block',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Balance: {usdtBalance.toFixed(4)} USDT
              </Typography>
            </Box>

            {/* Actions */}
            {error && (
              <Alert
                severity={error.includes('successful') ? 'success' : 'error'}
                sx={{
                  mb: 3,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }
                }}
              >
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }
                }}
              >
                Successfully swapped! Transaction:
                <a
                  href={`https://testnet.bscscan.com/tx/${successMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#1976d2',
                    textDecoration: 'underline',
                    fontWeight: 600,
                    marginLeft: '4px'
                  }}
                >
                  {`${successMessage.slice(0, 6)}...${successMessage.slice(-4)}`}
                </a>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSwap}
                disabled={isSwapping || !dwcAmount || parseFloat(dwcAmount) > dwcBalance}
                startIcon={isSwapping ? <CircularProgress size={20} /> : <SwapHorizIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                {isSwapping ? 'Swapping...' : 'Swap Tokens'}
              </Button>
            </Box>

            {parseFloat(dwcAmount) > dwcBalance && (
              <Alert
                severity="warning"
                sx={{
                  mt: 2,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }
                }}
              >
                Insufficient BDC balance
              </Alert>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SwapPage;
