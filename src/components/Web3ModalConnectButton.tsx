import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { Button, Stack } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';

const Web3ModalConnectButton = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const truncated = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'Connect Wallet';

  if (isConnected) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="outlined"
          onClick={() => open()}
          startIcon={<AccountBalanceWalletIcon />}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }}
        >
          {truncated}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            disconnect();
            // Clear cached data
            localStorage.removeItem('wagmi.store');
            localStorage.removeItem('wagmi.cache');
          }}
          startIcon={<LogoutIcon />}
          sx={{ borderRadius: 3 }}
        >
          Disconnect
        </Button>
      </Stack>
    );
  }

  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      onClick={() => open()}
      startIcon={<AccountBalanceWalletIcon />}
      sx={{
        py: 1.5,
        px: 4,
        fontSize: '1.1rem',
        fontWeight: 'bold',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(98, 0, 234, 0.3)',
        '&:hover': {
          boxShadow: '0 6px 25px rgba(98, 0, 234, 0.4)',
          transform: 'translateY(-2px)'
        },
        transition: 'all 0.3s ease'
      }}
    >
      Connect Wallet
    </Button>
  );
};

export default Web3ModalConnectButton;
