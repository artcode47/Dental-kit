const PerformanceService = require('../services/performanceService');

// Initialize performance service
const performanceService = new PerformanceService();

// Performance monitoring middleware
const performanceMonitoring = (req, res, next) => {
  const startTime = Date.now();
  const { method, path, user } = req;
  
  // Track API call
  performanceService.trackApiCall(path, method, user?.id);
  
  // Override res.json to track response time
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Track response time
    performanceService.trackResponseTime(path, method, responseTime);
    
    // Track errors if status code indicates error
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      const errorMessage = data?.message || 'Unknown error';
      performanceService.trackError(path, method, errorType, errorMessage);
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  // Override res.send to track response time for non-JSON responses
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Track response time
    performanceService.trackResponseTime(path, method, responseTime);
    
    // Track errors if status code indicates error
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      const errorMessage = typeof data === 'string' ? data : 'Unknown error';
      performanceService.trackError(path, method, errorType, errorMessage);
    }
    
    // Call original send method
    return originalSend.call(this, data);
  };
  
  next();
};

// Database query performance monitoring
const databasePerformanceMonitoring = (collection, operation) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original methods to track performance
    const originalMethods = {};
    
    // Override response methods to track database performance
    ['json', 'send'].forEach(method => {
      if (res[method]) {
        originalMethods[method] = res[method];
        res[method] = function(data) {
          const queryTime = Date.now() - startTime;
          
          // Track database query performance
          performanceService.trackDatabaseQuery(collection, operation, queryTime);
          
          // Call original method
          return originalMethods[method].call(this, data);
        };
      }
    });
    
    next();
  };
};

// Cache performance monitoring middleware
const cachePerformanceMonitoring = (req, res, next) => {
  // Override unifiedStore methods to track cache performance
  const unifiedStore = require('../services/unifiedStore');
  
  // Store original methods
  const originalGetCache = unifiedStore.getCache;
  const originalSetCache = unifiedStore.setCache;
  
  // Override getCache to track hits and misses
  unifiedStore.getCache = async function(key, ...args) {
    try {
      const result = await originalGetCache.call(this, key, ...args);
      
      if (result !== null) {
        // Cache hit
        performanceService.trackCacheHit(key, 'get');
      } else {
        // Cache miss
        performanceService.trackCacheMiss(key, 'get');
      }
      
      return result;
    } catch (error) {
      // Cache miss due to error
      performanceService.trackCacheMiss(key, 'get');
      throw error;
    }
  };
  
  // Override setCache to track writes
  unifiedStore.setCache = async function(key, data, ttl, ...args) {
    try {
      const result = await originalSetCache.call(this, key, data, ttl, ...args);
      
      // Track cache write
      performanceService.trackCacheHit(key, 'set');
      
      return result;
    } catch (error) {
      // Track cache write failure
      performanceService.trackCacheMiss(key, 'set');
      throw error;
    }
  };
  
  next();
};

// Memory usage monitoring
const memoryMonitoring = (req, res, next) => {
  const startMemory = process.memoryUsage();
  
  // Override response methods to track memory usage
  const originalJson = res.json;
  const originalSend = res.send;
  
  res.json = function(data) {
    const endMemory = process.memoryUsage();
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external
    };
    
    // Log memory usage if significant increase
    if (memoryDiff.heapUsed > 1024 * 1024) { // 1MB increase
      console.warn(`⚠️ High memory usage detected for ${req.method} ${req.path}:`, {
        heapUsedIncrease: `${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        totalHeapUsed: `${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`
      });
    }
    
    return originalJson.call(this, data);
  };
  
  res.send = function(data) {
    const endMemory = process.memoryUsage();
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external
    };
    
    // Log memory usage if significant increase
    if (memoryDiff.heapUsed > 1024 * 1024) { // 1MB increase
      console.warn(`⚠️ High memory usage detected for ${req.method} ${req.path}:`, {
        heapUsedIncrease: `${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        totalHeapUsed: `${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Request size monitoring
const requestSizeMonitoring = (req, res, next) => {
  const startTime = Date.now();
  const contentLength = parseInt(req.headers['content-length']) || 0;
  
  // Log large requests
  if (contentLength > 1024 * 1024) { // 1MB
    console.warn(`⚠️ Large request detected: ${req.method} ${req.path}`, {
      size: `${(contentLength / 1024 / 1024).toFixed(2)}MB`,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
  }
  
  // Monitor request processing time
  req.on('end', () => {
    const processingTime = Date.now() - startTime;
    
    if (processingTime > 5000) { // 5 seconds
      console.warn(`⚠️ Slow request processing: ${req.method} ${req.path}`, {
        processingTime: `${processingTime}ms`,
        size: `${(contentLength / 1024).toFixed(2)}KB`
      });
    }
  });
  
  next();
};

// Response compression monitoring
const compressionMonitoring = (req, res, next) => {
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {
    const originalSize = chunk ? chunk.length : 0;
    const compressedSize = parseInt(res.getHeader('content-length')) || originalSize;
    
    if (originalSize > 0 && compressedSize > 0) {
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
      
      if (compressionRatio > 50) {
        console.log(`✅ Good compression for ${req.method} ${req.path}: ${compressionRatio}% reduction`);
      } else if (compressionRatio < 10) {
        console.warn(`⚠️ Low compression for ${req.method} ${req.path}: ${compressionRatio}% reduction`);
      }
    }
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Database connection monitoring
const databaseConnectionMonitoring = (req, res, next) => {
  // Monitor database connection pool status
  const checkDatabaseHealth = async () => {
    try {
      // This would check your database connection pool status
      // For now, we'll just log that monitoring is active
      console.log('🔍 Database connection monitoring active');
    } catch (error) {
      console.error('❌ Database connection monitoring error:', error);
    }
  };
  
  // Check database health every 30 seconds
  if (!global.dbHealthInterval) {
    global.dbHealthInterval = setInterval(checkDatabaseHealth, 30000);
  }
  
  next();
};

// Performance metrics endpoint
const getPerformanceMetrics = async (req, res) => {
  try {
    const metrics = performanceService.getPerformanceMetrics();
    const health = performanceService.getHealthStatus();
    const recommendations = performanceService.getRecommendations();
    
    res.json({
      success: true,
      data: {
        metrics,
        health,
        recommendations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving performance metrics',
      error: error.message
    });
  }
};

// Reset performance metrics endpoint
const resetPerformanceMetrics = async (req, res) => {
  try {
    performanceService.resetMetrics();
    
    res.json({
      success: true,
      message: 'Performance metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting performance metrics',
      error: error.message
    });
  }
};

// Export performance metrics endpoint
const exportPerformanceMetrics = async (req, res) => {
  try {
    const metrics = await performanceService.exportMetrics();
    
    res.json({
      success: true,
      message: 'Performance metrics exported successfully',
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting performance metrics',
      error: error.message
    });
  }
};

// Performance health check endpoint
const performanceHealthCheck = async (req, res) => {
  try {
    const health = performanceService.getHealthStatus();
    
    res.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting performance health:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving performance health',
      error: error.message
    });
  }
};

// Cleanup function for graceful shutdown
const cleanupPerformanceMonitoring = () => {
  if (performanceService) {
    performanceService.stopCleanupInterval();
  }
  
  if (global.dbHealthInterval) {
    clearInterval(global.dbHealthInterval);
  }
  
  console.log('✅ Performance monitoring cleaned up');
};

// Export all middleware and functions
module.exports = {
  performanceMonitoring,
  databasePerformanceMonitoring,
  cachePerformanceMonitoring,
  memoryMonitoring,
  requestSizeMonitoring,
  compressionMonitoring,
  databaseConnectionMonitoring,
  getPerformanceMetrics,
  resetPerformanceMetrics,
  exportPerformanceMetrics,
  performanceHealthCheck,
  cleanupPerformanceMonitoring,
  performanceService
};
