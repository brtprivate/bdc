import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

// Loading skeleton for team overview cards
export const TeamOverviewSkeleton = () => (
  <Grid container spacing={2}>
    {Array.from({ length: 8 }, (_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Card sx={{ p: 2, height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={16} />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// Loading skeleton for 21 levels table
export const LevelsTableSkeleton = () => (
  <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: 'primary.main' }}>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Level</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Users</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Investment</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Earnings</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Status</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: 21 }, (_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton variant="text" width="60%" height={24} />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="rectangular" width={40} height={24} sx={{ mx: 'auto' }} />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="text" width="80%" height={20} />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="text" width="80%" height={20} />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="rectangular" width={60} height={24} sx={{ mx: 'auto' }} />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="rectangular" width={80} height={32} sx={{ mx: 'auto' }} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Loading skeleton for summary cards
export const SummaryCardsSkeleton = () => (
  <Grid container spacing={2} sx={{ mb: 3 }}>
    {Array.from({ length: 4 }, (_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={32} />
        </Card>
      </Grid>
    ))}
  </Grid>
);

// Progressive loading component that shows data as it becomes available
export const ProgressiveLoader = ({ 
  isBasicDataLoaded, 
  isDbDataLoaded, 
  children, 
  fallback 
}) => {
  if (!isBasicDataLoaded) {
    return fallback || <TeamOverviewSkeleton />;
  }
  
  return children;
};

// Smart loading wrapper that handles different loading states
export const SmartLoader = ({ 
  loading, 
  error, 
  data, 
  skeleton, 
  children,
  minHeight = '200px'
}) => {
  if (loading && !data) {
    return (
      <Box sx={{ minHeight }}>
        {skeleton || <Skeleton variant="rectangular" width="100%" height={minHeight} />}
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box sx={{ 
        minHeight, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'error.main',
        textAlign: 'center',
        p: 2
      }}>
        {error}
      </Box>
    );
  }

  return children;
};

export default {
  TeamOverviewSkeleton,
  LevelsTableSkeleton,
  SummaryCardsSkeleton,
  ProgressiveLoader,
  SmartLoader
};
