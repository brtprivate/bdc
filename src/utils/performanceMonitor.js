/**
 * Performance Monitor Utility
 * Tracks and logs performance metrics for the MyTeam page
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Start timing an operation
  startTiming(operationName) {
    if (!this.isEnabled) return;
    
    this.metrics.set(operationName, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
    
    console.log(`⏱️ Started timing: ${operationName}`);
  }

  // End timing an operation
  endTiming(operationName) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(operationName);
    if (!metric) {
      console.warn(`⚠️ No timing started for: ${operationName}`);
      return;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    console.log(`✅ Completed: ${operationName} in ${metric.duration.toFixed(2)}ms`);
    
    // Warn about slow operations
    if (metric.duration > 2000) {
      console.warn(`🐌 Slow operation detected: ${operationName} took ${metric.duration.toFixed(2)}ms`);
    }
    
    return metric.duration;
  }

  // Get timing for an operation
  getTiming(operationName) {
    return this.metrics.get(operationName);
  }

  // Get all metrics
  getAllMetrics() {
    const results = {};
    this.metrics.forEach((value, key) => {
      results[key] = value;
    });
    return results;
  }

  // Clear all metrics
  clear() {
    this.metrics.clear();
  }

  // Log performance summary
  logSummary() {
    if (!this.isEnabled) return;
    
    console.group('📊 Performance Summary');
    this.metrics.forEach((metric, operationName) => {
      if (metric.duration !== null) {
        const status = metric.duration > 2000 ? '🐌' : metric.duration > 1000 ? '⚠️' : '✅';
        console.log(`${status} ${operationName}: ${metric.duration.toFixed(2)}ms`);
      }
    });
    console.groupEnd();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
