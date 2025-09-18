const unifiedStore = require('./unifiedStore');

class PerformanceService {
  constructor() {
    this.metrics = {
      apiCalls: new Map(),
      cacheHits: new Map(),
      cacheMisses: new Map(),
      responseTimes: new Map(),
      errors: new Map(),
      databaseQueries: new Map()
    };
    
    this.startTime = Date.now();
    this.cleanupInterval = null;
    
    // Start cleanup interval
    this.startCleanupInterval();
  }

  // Start cleanup interval to prevent memory leaks
  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics();
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }

  // Stop cleanup interval
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Clean up old metrics to prevent memory leaks
  cleanupOldMetrics() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    // Clean up old API call metrics
    for (const [key, value] of this.metrics.apiCalls.entries()) {
      if (now - value.timestamp > maxAge) {
        this.metrics.apiCalls.delete(key);
      }
    }

    // Clean up old response time metrics
    for (const [key, value] of this.metrics.responseTimes.entries()) {
      if (now - value.timestamp > maxAge) {
        this.metrics.responseTimes.delete(key);
      }
    }

    // Clean up old error metrics
    for (const [key, value] of this.metrics.errors.entries()) {
      if (now - value.timestamp > maxAge) {
        this.metrics.errors.delete(key);
      }
    }
  }

  // Track API call
  trackApiCall(endpoint, method, userId = null) {
    const key = `${method}:${endpoint}`;
    const timestamp = Date.now();
    
    if (!this.metrics.apiCalls.has(key)) {
      this.metrics.apiCalls.set(key, {
        count: 0,
        lastCall: timestamp,
        firstCall: timestamp,
        users: new Set()
      });
    }
    
    const metric = this.metrics.apiCalls.get(key);
    metric.count++;
    metric.lastCall = timestamp;
    
    if (userId) {
      metric.users.add(userId);
    }
  }

  // Track response time
  trackResponseTime(endpoint, method, responseTime) {
    const key = `${method}:${endpoint}`;
    const timestamp = Date.now();
    
    if (!this.metrics.responseTimes.has(key)) {
      this.metrics.responseTimes.set(key, {
        count: 0,
        totalTime: 0,
        minTime: responseTime,
        maxTime: responseTime,
        averageTime: responseTime,
        lastCall: timestamp
      });
    }
    
    const metric = this.metrics.responseTimes.get(key);
    metric.count++;
    metric.totalTime += responseTime;
    metric.minTime = Math.min(metric.minTime, responseTime);
    metric.maxTime = Math.max(metric.maxTime, responseTime);
    metric.averageTime = metric.totalTime / metric.count;
    metric.lastCall = timestamp;
  }

  // Track cache hit
  trackCacheHit(cacheKey, operation) {
    const key = `${operation}:${cacheKey.split(':')[0]}`;
    
    if (!this.metrics.cacheHits.has(key)) {
      this.metrics.cacheHits.set(key, 0);
    }
    
    this.metrics.cacheHits.set(key, this.metrics.cacheHits.get(key) + 1);
  }

  // Track cache miss
  trackCacheMiss(cacheKey, operation) {
    const key = `${operation}:${cacheKey.split(':')[0]}`;
    
    if (!this.metrics.cacheMisses.has(key)) {
      this.metrics.cacheMisses.set(key, 0);
    }
    
    this.metrics.cacheMisses.set(key, this.metrics.cacheMisses.get(key) + 1);
  }

  // Track error
  trackError(endpoint, method, errorType, errorMessage) {
    const key = `${method}:${endpoint}`;
    const timestamp = Date.now();
    
    if (!this.metrics.errors.has(key)) {
      this.metrics.errors.set(key, {
        count: 0,
        types: new Map(),
        lastError: timestamp,
        firstError: timestamp
      });
    }
    
    const metric = this.metrics.errors.get(key);
    metric.count++;
    metric.lastError = timestamp;
    
    if (!metric.types.has(errorType)) {
      metric.types.set(errorType, 0);
    }
    metric.types.set(errorType, metric.types.get(errorType) + 1);
  }

  // Track database query
  trackDatabaseQuery(collection, operation, queryTime) {
    const key = `${collection}:${operation}`;
    
    if (!this.metrics.databaseQueries.has(key)) {
      this.metrics.databaseQueries.set(key, {
        count: 0,
        totalTime: 0,
        minTime: queryTime,
        maxTime: queryTime,
        averageTime: queryTime
      });
    }
    
    const metric = this.metrics.databaseQueries.get(key);
    metric.count++;
    metric.totalTime += queryTime;
    metric.minTime = Math.min(metric.minTime, queryTime);
    metric.maxTime = Math.max(metric.maxTime, queryTime);
    metric.averageTime = metric.totalTime / metric.count;
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const now = Date.now();
    const uptime = now - this.startTime;
    
    // Calculate cache hit rates
    const cacheMetrics = {};
    for (const [key, hits] of this.metrics.cacheHits.entries()) {
      const misses = this.metrics.cacheMisses.get(key) || 0;
      const total = hits + misses;
      cacheMetrics[key] = {
        hits,
        misses,
        total,
        hitRate: total > 0 ? (hits / total * 100).toFixed(2) + '%' : '0%'
      };
    }

    // Calculate API performance
    const apiMetrics = {};
    for (const [key, metric] of this.metrics.apiCalls.entries()) {
      const responseTime = this.metrics.responseTimes.get(key);
      const errors = this.metrics.errors.get(key);
      
      apiMetrics[key] = {
        totalCalls: metric.count,
        uniqueUsers: metric.users.size,
        lastCall: new Date(metric.lastCall).toISOString(),
        firstCall: new Date(metric.firstCall).toISOString(),
        responseTime: responseTime ? {
          average: responseTime.averageTime.toFixed(2) + 'ms',
          min: responseTime.minTime.toFixed(2) + 'ms',
          max: responseTime.maxTime.toFixed(2) + 'ms',
          total: responseTime.totalTime.toFixed(2) + 'ms'
        } : null,
        errors: errors ? {
          count: errors.count,
          types: Object.fromEntries(errors.types),
          lastError: new Date(errors.lastError).toISOString()
        } : null
      };
    }

    // Calculate database performance
    const dbMetrics = {};
    for (const [key, metric] of this.metrics.databaseQueries.entries()) {
      dbMetrics[key] = {
        count: metric.count,
        averageTime: metric.averageTime.toFixed(2) + 'ms',
        minTime: metric.minTime.toFixed(2) + 'ms',
        maxTime: metric.maxTime.toFixed(2) + 'ms',
        totalTime: metric.totalTime.toFixed(2) + 'ms'
      };
    }

    return {
      uptime: {
        milliseconds: uptime,
        seconds: Math.floor(uptime / 1000),
        minutes: Math.floor(uptime / (1000 * 60)),
        hours: Math.floor(uptime / (1000 * 60 * 60))
      },
      cache: cacheMetrics,
      api: apiMetrics,
      database: dbMetrics,
      summary: {
        totalApiCalls: Array.from(this.metrics.apiCalls.values()).reduce((sum, m) => sum + m.count, 0),
        totalCacheHits: Array.from(this.metrics.cacheHits.values()).reduce((sum, hits) => sum + hits, 0),
        totalCacheMisses: Array.from(this.metrics.cacheMisses.values()).reduce((sum, misses) => sum + misses, 0),
        totalErrors: Array.from(this.metrics.errors.values()).reduce((sum, e) => sum + e.count, 0),
        totalDbQueries: Array.from(this.metrics.databaseQueries.values()).reduce((sum, q) => sum + q.count, 0)
      }
    };
  }

  // Get cache performance
  getCachePerformance() {
    const metrics = {};
    
    for (const [key, hits] of this.metrics.cacheHits.entries()) {
      const misses = this.metrics.cacheMisses.get(key) || 0;
      const total = hits + misses;
      
      metrics[key] = {
        hits,
        misses,
        total,
        hitRate: total > 0 ? (hits / total * 100).toFixed(2) + '%' : '0%',
        efficiency: total > 0 ? (hits / total).toFixed(3) : 0
      };
    }
    
    return metrics;
  }

  // Get API performance
  getApiPerformance() {
    const metrics = {};
    
    for (const [key, metric] of this.metrics.apiCalls.entries()) {
      const responseTime = this.metrics.responseTimes.get(key);
      const errors = this.metrics.errors.get(key);
      
      metrics[key] = {
        calls: metric.count,
        uniqueUsers: metric.users.size,
        averageResponseTime: responseTime ? responseTime.averageTime.toFixed(2) + 'ms' : 'N/A',
        errorRate: errors ? ((errors.count / metric.count) * 100).toFixed(2) + '%' : '0%',
        lastCall: new Date(metric.lastCall).toISOString()
      };
    }
    
    return metrics;
  }

  // Get database performance
  getDatabasePerformance() {
    const metrics = {};
    
    for (const [key, metric] of this.metrics.databaseQueries.entries()) {
      metrics[key] = {
        queries: metric.count,
        averageTime: metric.averageTime.toFixed(2) + 'ms',
        totalTime: metric.totalTime.toFixed(2) + 'ms',
        efficiency: metric.averageTime < 100 ? 'Excellent' : 
                   metric.averageTime < 500 ? 'Good' : 
                   metric.averageTime < 1000 ? 'Fair' : 'Poor'
      };
    }
    
    return metrics;
  }

  // Get performance recommendations
  getPerformanceRecommendations() {
    const recommendations = [];
    const metrics = this.getPerformanceMetrics();
    
    // Cache recommendations
    for (const [key, cache] of Object.entries(metrics.cache)) {
      if (cache.hitRate < 50) {
        recommendations.push({
          type: 'cache',
          priority: 'high',
          message: `Low cache hit rate for ${key}: ${cache.hitRate}. Consider increasing cache TTL or improving cache keys.`
        });
      }
    }
    
    // API performance recommendations
    for (const [key, api] of Object.entries(metrics.api)) {
      if (api.responseTime && parseFloat(api.responseTime.average) > 1000) {
        recommendations.push({
          type: 'api',
          priority: 'high',
          message: `Slow API response for ${key}: ${api.responseTime.average}. Consider implementing caching or query optimization.`
        });
      }
      
      if (api.errorRate && parseFloat(api.errorRate) > 5) {
        recommendations.push({
          type: 'api',
          priority: 'medium',
          message: `High error rate for ${key}: ${api.errorRate}. Review error handling and validation.`
        });
      }
    }
    
    // Database recommendations
    for (const [key, db] of Object.entries(metrics.database)) {
      if (parseFloat(db.averageTime) > 500) {
        recommendations.push({
          type: 'database',
          priority: 'high',
          message: `Slow database queries for ${key}: ${db.averageTime}. Consider adding indexes or optimizing queries.`
        });
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Reset all metrics
  resetMetrics() {
    this.metrics = {
      apiCalls: new Map(),
      cacheHits: new Map(),
      cacheMisses: new Map(),
      responseTimes: new Map(),
      errors: new Map(),
      databaseQueries: new Map()
    };
    
    this.startTime = Date.now();
    console.log('✅ Performance metrics reset');
  }

  // Export metrics to unifiedStore for persistence
  async exportMetrics() {
    try {
      const metrics = this.getPerformanceMetrics();
      await unifiedStore.setCache('performance:metrics', metrics, 3600); // Cache for 1 hour
      return metrics;
    } catch (error) {
      console.error('Error exporting performance metrics:', error);
      return null;
    }
  }

  // Import metrics from unifiedStore
  async importMetrics() {
    try {
      const metrics = await unifiedStore.getCache('performance:metrics');
      if (metrics) {
        // Restore metrics from cache
        this.metrics = metrics;
        console.log('✅ Performance metrics imported from cache');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing performance metrics:', error);
      return false;
    }
  }

  // Get health status
  getHealthStatus() {
    const metrics = this.getPerformanceMetrics();
    const recommendations = this.getPerformanceRecommendations();
    
    const criticalIssues = recommendations.filter(r => r.priority === 'high').length;
    const warningIssues = recommendations.filter(r => r.priority === 'medium').length;
    
    let status = 'healthy';
    if (criticalIssues > 0) {
      status = 'critical';
    } else if (warningIssues > 0) {
      status = 'warning';
    }
    
    return {
      status,
      criticalIssues,
      warningIssues,
      totalIssues: recommendations.length,
      uptime: metrics.uptime,
      cacheHitRate: this.getOverallCacheHitRate(),
      averageResponseTime: this.getAverageResponseTime()
    };
  }

  // Get overall cache hit rate
  getOverallCacheHitRate() {
    const totalHits = Array.from(this.metrics.cacheHits.values()).reduce((sum, hits) => sum + hits, 0);
    const totalMisses = Array.from(this.metrics.cacheMisses.values()).reduce((sum, misses) => sum + misses, 0);
    const total = totalHits + totalMisses;
    
    return total > 0 ? (totalHits / total * 100).toFixed(2) + '%' : '0%';
  }

  // Get average response time
  getAverageResponseTime() {
    let totalTime = 0;
    let totalCalls = 0;
    
    for (const metric of this.metrics.responseTimes.values()) {
      totalTime += metric.totalTime;
      totalCalls += metric.count;
    }
    
    return totalCalls > 0 ? (totalTime / totalCalls).toFixed(2) + 'ms' : 'N/A';
  }
}

module.exports = PerformanceService;
