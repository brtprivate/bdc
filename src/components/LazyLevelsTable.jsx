import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Skeleton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Collapse,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const LazyLevelsTable = ({ dbLevels, isLoading, onViewDetails }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Memoize filtered and sorted levels with better performance
  const processedLevels = useMemo(() => {
    if (!dbLevels || dbLevels.length === 0) return [];

    const levels = [];
    for (let i = 0; i < dbLevels.length; i++) {
      const level = dbLevels[i];
      const levelNumber = i + 1;

      // Skip inactive levels if filter is on
      if (showOnlyActive && (!level.userCount || level.userCount === 0)) {
        continue;
      }

      levels.push({
        ...level,
        levelNumber,
        avgInvestment: level.userCount > 0 ? level.totalInvestment / level.userCount : 0
      });
    }

    return levels;
  }, [dbLevels, showOnlyActive]);

  // Calculate pagination
  const totalPages = Math.ceil(processedLevels.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Get visible levels for current page
  const visibleLevels = useMemo(() => {
    return processedLevels.slice(startIndex, endIndex);
  }, [processedLevels, startIndex, endIndex]);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const handleViewDetails = useCallback((level) => {
    if (onViewDetails) {
      onViewDetails(level);
    }
  }, [onViewDetails]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Level</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Users</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Investment</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Avg Investment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (processedLevels.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No team data available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your team members will appear here once they join
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Team Levels ({processedLevels.length} {showOnlyActive ? 'active' : 'total'} levels)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant={showOnlyActive ? "contained" : "outlined"}
            size="small"
            onClick={() => setShowOnlyActive(!showOnlyActive)}
            sx={{ minWidth: 120 }}
          >
            {showOnlyActive ? 'Show All' : 'Active Only'}
          </Button>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Rows per page</InputLabel>
            <Select
              value={rowsPerPage}
              label="Rows per page"
              onChange={handleRowsPerPageChange}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={processedLevels.length || 21}>All ({processedLevels.length || 21})</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 2,
          maxHeight: '500px',
          overflowY: 'auto'
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                Level
              </TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                Users
              </TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                Total Investment
              </TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                Avg Investment
              </TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleLevels.map((level) => (
              <TableRow
                key={level.levelNumber}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                  '&:hover': { backgroundColor: 'action.selected', cursor: 'pointer' }
                }}
                onClick={() => level.userCount > 0 && handleViewDetails(level.levelNumber)}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Level {level.levelNumber}
                    </Typography>
                    {level.userCount > 0 && (
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={level.userCount.toLocaleString()}
                    color={level.userCount > 0 ? 'primary' : 'default'}
                    variant={level.userCount > 0 ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ fontWeight: 'bold', minWidth: 50 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 'bold',
                      color: level.totalInvestment > 0 ? 'success.main' : 'text.secondary'
                    }}
                  >
                    {formatCurrency(level.totalInvestment)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(level.avgInvestment)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    variant={level.userCount > 0 ? "contained" : "outlined"}
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (level.userCount > 0) {
                        handleViewDetails(level.levelNumber);
                      }
                    }}
                    disabled={level.userCount === 0}
                    sx={{
                      fontSize: '0.75rem',
                      minWidth: 100,
                      background: level.userCount > 0
                        ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                        : 'transparent'
                    }}
                  >
                    {level.userCount > 0 ? 'View Details' : 'No Users'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default LazyLevelsTable;
