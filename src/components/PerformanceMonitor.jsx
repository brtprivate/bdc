import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Alert,
  AlertTitle,
  Grid,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Cache as CacheIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

const PerformanceMonitor = ({ 
  performanceAlerts, 
  clearAlert, 
  getPerformanceStats, 
  getTotalTime,
  getSuccessRate 
}) => {
  const [expanded, setExpanded] = useState(false);
  const stats = getPerformanceStats();
  
  if (!stats && performanceAlerts.length === 0) {
    return null;
  }

  const getAlertIcon = (level) => {
    switch (level) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'very_slow':
        return <WarningIcon color="error" />;
      case 'slow':
        return <WarningIcon color="warning" />;
      default:
        return <SpeedIcon color="info" />;
    }
  };

  const getAlertSeverity = (level) => {
    switch (level) {
      case 'error':
        return 'error';
      case 'very_slow':
        return 'error';
      case 'slow':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000, maxWidth: 400 }}>
      {/* Performance Alerts */}
      {performanceAlerts.map((alert) => (
        <Alert
          key={alert.id}
          severity={getAlertSeverity(alert.level)}
          icon={getAlertIcon(alert.level)}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => clearAlert(alert.id)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 1, maxWidth: 400 }}
        >
          <AlertTitle>
            {alert.level === 'error' ? 'API Error' : 'Slow Performance'}
          </AlertTitle>
          <Typography variant="body2">
            <strong>{alert.apiName}</strong> took {formatDuration(alert.duration)}
            {alert.error && (
              <>
                <br />
                <em>{alert.error}</em>
              </>
            )}
          </Typography>
        </Alert>
      ))}

      {/* Performance Stats Card */}
      {stats && process.env.NODE_ENV === 'development' && (
        <Card sx={{ p: 2, mt: 1, backgroundColor: 'background.paper', boxShadow: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon color="primary" />
              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                Performance Monitor
              </Typography>
            </Box>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Divider sx={{ my: 1 }} />
            
            {/* Quick Stats */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Total Time
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatDuration(getTotalTime())}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Success Rate
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {getSuccessRate().toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Detailed Stats */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Tooltip title="Total API Calls">
                <Chip
                  icon={<TimerIcon />}
                  label={`${stats.totalCalls} calls`}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
              
              <Tooltip title="Average Response Time">
                <Chip
                  icon={<SpeedIcon />}
                  label={`${stats.avgDuration}ms avg`}
                  size="small"
                  variant="outlined"
                  color={parseFloat(stats.avgDuration) > 2000 ? 'warning' : 'default'}
                />
              </Tooltip>
              
              <Tooltip title="Cache Hit Rate">
                <Chip
                  icon={<CacheIcon />}
                  label={`${stats.cacheHitRate}% cached`}
                  size="small"
                  variant="outlined"
                  color={parseFloat(stats.cacheHitRate) > 50 ? 'success' : 'default'}
                />
              </Tooltip>
            </Box>

            {/* Performance Issues */}
            {stats.slowCalls > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" fontSize="small" />
                <Typography variant="caption" color="warning.main">
                  {stats.slowCalls} slow call{stats.slowCalls > 1 ? 's' : ''} detected
                </Typography>
              </Box>
            )}

            {/* Performance Ranges */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Range: {stats.minDuration}ms - {stats.maxDuration}ms
              </Typography>
            </Box>
          </Collapse>
        </Card>
      )}
    </Box>
  );
};

export default PerformanceMonitor;
