import { useState, useEffect, useRef } from 'react';

export const usePerformanceMonitor = (label = 'Operation') => {
  const [metrics, setMetrics] = useState({
    startTime: null,
    endTime: null,
    duration: null,
    isRunning: false
  });
  
  const startTimeRef = useRef(null);

  const start = () => {
    const now = performance.now();
    startTimeRef.current = now;
    setMetrics(prev => ({
      ...prev,
      startTime: now,
      endTime: null,
      duration: null,
      isRunning: true
    }));
    
    if (process.env.NODE_ENV === 'development') {
      console.time(`⏱️ ${label}`);
    }
  };

  const end = () => {
    const now = performance.now();
    const duration = startTimeRef.current ? now - startTimeRef.current : 0;
    
    setMetrics(prev => ({
      ...prev,
      endTime: now,
      duration,
      isRunning: false
    }));
    
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(`⏱️ ${label}`);
      console.log(`📊 ${label} completed in ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };

  const reset = () => {
    startTimeRef.current = null;
    setMetrics({
      startTime: null,
      endTime: null,
      duration: null,
      isRunning: false
    });
  };

  return {
    metrics,
    start,
    end,
    reset,
    formatDuration: (ms) => {
      if (!ms) return 'N/A';
      if (ms < 1000) return `${ms.toFixed(0)}ms`;
      return `${(ms / 1000).toFixed(1)}s`;
    }
  };
};

// Hook for monitoring API call performance with enhanced metrics
export const useApiPerformanceMonitor = () => {
  const [apiMetrics, setApiMetrics] = useState({});
  const [performanceAlerts, setPerformanceAlerts] = useState([]);

  // Performance thresholds
  const SLOW_THRESHOLD = 3000; // 3 seconds
  const VERY_SLOW_THRESHOLD = 5000; // 5 seconds

  const trackApiCall = async (apiName, apiCall) => {
    const startTime = performance.now();

    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Determine performance level
      let performanceLevel = 'fast';
      if (duration > VERY_SLOW_THRESHOLD) {
        performanceLevel = 'very_slow';
      } else if (duration > SLOW_THRESHOLD) {
        performanceLevel = 'slow';
      }

      const metric = {
        duration,
        success: true,
        timestamp: new Date().toISOString(),
        status: 'completed',
        performanceLevel,
        cached: result?.cached || false
      };

      setApiMetrics(prev => ({
        ...prev,
        [apiName]: metric
      }));

      // Add performance alert if slow
      if (performanceLevel !== 'fast') {
        const alert = {
          id: Date.now(),
          apiName,
          duration,
          level: performanceLevel,
          timestamp: new Date().toISOString()
        };

        setPerformanceAlerts(prev => [...prev.slice(-4), alert]); // Keep last 5 alerts

        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Slow API ${apiName}: ${duration.toFixed(2)}ms (${performanceLevel})`);
        }
      }

      if (process.env.NODE_ENV === 'development') {
        const cacheStatus = result?.cached ? ' (cached)' : '';
        console.log(`🚀 API ${apiName}: ${duration.toFixed(2)}ms${cacheStatus}`);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metric = {
        duration,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'failed',
        performanceLevel: 'error'
      };

      setApiMetrics(prev => ({
        ...prev,
        [apiName]: metric
      }));

      // Add error alert
      const alert = {
        id: Date.now(),
        apiName,
        duration,
        level: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      setPerformanceAlerts(prev => [...prev.slice(-4), alert]);

      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API ${apiName} failed after ${duration.toFixed(2)}ms:`, error);
      }

      throw error;
    }
  };
  
  const getMetrics = () => apiMetrics;

  const clearMetrics = () => {
    setApiMetrics({});
    setPerformanceAlerts([]);
  };

  const getTotalTime = () => {
    return Object.values(apiMetrics).reduce((total, metric) => total + metric.duration, 0);
  };

  const getSuccessRate = () => {
    const metrics = Object.values(apiMetrics);
    if (metrics.length === 0) return 0;
    const successful = metrics.filter(m => m.success).length;
    return (successful / metrics.length) * 100;
  };

  const getPerformanceStats = () => {
    const metrics = Object.values(apiMetrics);
    if (metrics.length === 0) return null;

    const durations = metrics.map(m => m.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    const slowCalls = metrics.filter(m => m.performanceLevel === 'slow' || m.performanceLevel === 'very_slow').length;
    const cachedCalls = metrics.filter(m => m.cached).length;

    return {
      totalCalls: metrics.length,
      avgDuration: avgDuration.toFixed(2),
      maxDuration: maxDuration.toFixed(2),
      minDuration: minDuration.toFixed(2),
      slowCalls,
      cachedCalls,
      cacheHitRate: ((cachedCalls / metrics.length) * 100).toFixed(1)
    };
  };

  const clearAlert = (alertId) => {
    setPerformanceAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return {
    trackApiCall,
    getMetrics,
    clearMetrics,
    getTotalTime,
    getSuccessRate,
    getPerformanceStats,
    performanceAlerts,
    clearAlert,
    apiMetrics
  };
};

export default usePerformanceMonitor;
