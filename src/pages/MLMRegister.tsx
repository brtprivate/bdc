import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const MLMRegister: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get the referral parameter from URL
    const ref = searchParams.get('ref');
    const slug = searchParams.get('slug');
    
    // Build the redirect URL with parameters
    let redirectUrl = '/';
    const params = new URLSearchParams();
    
    if (ref) {
      params.append('ref', ref);
    }
    if (slug) {
      params.append('slug', slug);
    }
    
    if (params.toString()) {
      redirectUrl += '?' + params.toString();
    }
    
    // Redirect to the main dashboard with the referral parameters
    navigate(redirectUrl, { replace: true });
  }, [navigate, searchParams]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        color: 'white',
        p: 3,
      }}
    >
      <CircularProgress sx={{ color: '#ff9800', mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Redirecting to Registration...
      </Typography>
      <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
        Please wait while we redirect you to the platform.
      </Typography>
    </Box>
  );
};

export default MLMRegister;
