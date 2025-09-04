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
} from '@mui/material';
import { useWallet } from '../context/WalletContext';
import { dwcContractInteractions } from '../services/contractService';
import { formatUnits, parseUnits } from 'viem';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const SwapPage = () => {
  const wallet = useWallet();
  const [dwcAmount, setDwcAmount] = useState('');
  const [daiAmount, setDaiAmount] = useState('');
  const [dwcBalance, setDwcBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    if (wallet.isConnected && wallet.account) {
      fetchBalance();
    }
  }, [wallet.isConnected, wallet.account]);

  const fetchBalance = async () => {
    try {
      const balance = await dwcContractInteractions.getDWCBalance(wallet.account);
      setDwcBalance(parseFloat(formatUnits(balance, 18)));
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
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

  const handleApprove = async () => {
    if (!dwcAmount || isNaN(dwcAmount)) return;
    setIsApproving(true);
    setError('');
    try {
      const amount = parseUnits(dwcAmount, 18);
      await dwcContractInteractions.approveDWC(amount, wallet.account);
      setError('Approval successful');
    } catch (err) {
      console.error('Approval failed:', err);
      setError('Approval failed: ' + err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!dwcAmount || isNaN(dwcAmount)) return;
    setIsSwapping(true);
    setError('');
    try {
      const amount = parseUnits(dwcAmount, 18);
      console.log("🚀 ~ handleSwap ~ amount:", amount)
      await dwcContractInteractions.tokenSwap(amount, wallet.account);
      setError('Swap successful');
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Please connect your wallet to access the swap page.</Alert>
      </Container>
    );
  }

  return (

    <Container
      fullWidth
      maxWidth="md"

      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Card sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          Swap BDC → DAI
        </Typography>

        {/* Input: DWC */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            From (DWC)
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={dwcAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            InputProps={{
              endAdornment: (
                <Button
                  size="small"
                  onClick={() => handleAmountChange(dwcBalance.toString())}
                  // onClick={() => setDwcAmount(dwcBalance.toString())}
                  sx={{ ml: 1 }}
                >
                  Max
                </Button>
              ),
            }}
          />
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
            Balance: {dwcBalance.toFixed(4)} DWC
          </Typography>
        </Box>

        {/* Swap Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <SwapHorizIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        </Box>

        {/* Output: DAI */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            To (DAI)
          </Typography>
          <TextField
            fullWidth
            disabled
            value={daiAmount ? parseFloat(daiAmount).toFixed(4) : '0.0000'}
            placeholder="0.00"
          />
        </Box>

        {/* Actions */}
        {error && (
          <Alert severity={error.includes('successful') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* <Button
            variant="outlined"
            fullWidth
            onClick={handleApprove}
            disabled={isApproving || !dwcAmount}
            startIcon={isApproving ? <CircularProgress size={20} /> : null}
          >
            {isApproving ? 'Approving...' : 'Approve'}
          </Button> */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSwap}
            disabled={isSwapping || !dwcAmount || parseFloat(dwcAmount) > dwcBalance}
            startIcon={isSwapping ? <CircularProgress size={20} /> : null}
          >
            {isSwapping ? 'Swapping...' : 'Swap'}
          </Button>
        </Box>

        {parseFloat(dwcAmount) > dwcBalance && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Insufficient DWC balance
          </Alert>
        )}
      </Card>
    </Container>


  );
};

export default SwapPage;
