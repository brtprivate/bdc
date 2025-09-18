import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Refresh,
  Storage,
  CloudOff,
  CloudDone,
} from '@mui/icons-material';
import { apiService } from '../../services/apiService';
import { useWallet } from '../../context/WalletContext';

interface DatabaseStatusProps {
  compact?: boolean;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ compact = false }) => {
  const { account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');

  const checkApiStatus = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 Checking API connection...');
      const isConnected = await apiService.testConnection();
      
      if (isConnected) {
        setApiStatus('connected');
        console.log('✅ API connection successful');
        
        // If wallet is connected, check if user exists in database
        if (account) {
          const userResponse = await apiService.getUser(account);
          setUserExists(userResponse.success);
          
          if (userResponse.success) {
            console.log('✅ User found in database');
          } else {
            console.log('ℹ️ User not found in database');
          }
        }
      } else {
        setApiStatus('disconnected');
        console.log('❌ API connection failed');
      }
      
      setLastCheck(new Date());
    } catch (error) {
      console.error('❌ Error checking API status:', error);
      setApiStatus('disconnected');
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, [account]);

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'connected':
        return 'success';
      case 'disconnected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <CircularProgress size={16} />;
    }
    
    switch (apiStatus) {
      case 'connected':
        return <CloudDone />;
      case 'disconnected':
        return <CloudOff />;
      default:
        return <Storage />;
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'connected':
        return 'Database Connected';
      case 'disconnected':
        return 'Database Disconnected';
      default:
        return 'Checking Database...';
    }
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor()}
          size="small"
          variant="outlined"
        />
        <Button
          size="small"
          onClick={checkApiStatus}
          disabled={isLoading}
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <Refresh fontSize="small" />
        </Button>
      </Box>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Storage />
            Database Status
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={checkApiStatus}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* API Connection Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ minWidth: 120 }}>
              API Connection:
            </Typography>
            <Chip
              icon={getStatusIcon()}
              label={getStatusText()}
              color={getStatusColor()}
              size="small"
            />
          </Box>

          {/* User Registration Status */}
          {isConnected && account && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ minWidth: 120 }}>
                User in Database:
              </Typography>
              <Chip
                icon={userExists ? <CheckCircle /> : <Error />}
                label={userExists ? 'Registered' : 'Not Registered'}
                color={userExists ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          )}

          {/* Last Check Time */}
          {lastCheck && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ minWidth: 120 }}>
                Last Check:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastCheck.toLocaleTimeString()}
              </Typography>
            </Box>
          )}

          {/* Error Message */}
          {error && (
            <>
              <Divider />
              <Alert severity="error" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Error:</strong> {error}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Make sure the backend server is running on port 5000
                </Typography>
              </Alert>
            </>
          )}

          {/* Success Message */}
          {apiStatus === 'connected' && !error && (
            <Alert severity="success" sx={{ mt: 1 }}>
              <Typography variant="body2">
                Successfully connected to backend database. 
                {userExists && ' User data is being tracked.'}
              </Typography>
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DatabaseStatus;
