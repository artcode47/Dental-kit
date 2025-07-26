const os = require('os');

// Global monitoring data
global.systemMetrics = {
  startTime: Date.now(),
  totalRequests: 0,
  activeRequests: 0,
  errorCount: 0,
  responseTimes: [],
  requestHistory: [],
  peakMemory: 0,
  peakCPU: 0
};

/**
 * Request monitoring middleware
 * Tracks request statistics and performance metrics
 */
const requestMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Increment active requests
  global.systemMetrics.activeRequests++;
  global.systemMetrics.totalRequests++;
  
  // Track request
  const requestData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date(),
    userId: req.user?._id
  };
  
  global.systemMetrics.requestHistory.push(requestData);
  
  // Keep only last 1000 requests
  if (global.systemMetrics.requestHistory.length > 1000) {
    global.systemMetrics.requestHistory = global.systemMetrics.requestHistory.slice(-1000);
  }
  
  // Monitor response
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Track response time
    global.systemMetrics.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times
    if (global.systemMetrics.responseTimes.length > 1000) {
      global.systemMetrics.responseTimes = global.systemMetrics.responseTimes.slice(-1000);
    }
    
    // Track errors
    if (res.statusCode >= 400) {
      global.systemMetrics.errorCount++;
    }
    
    // Decrement active requests
    global.systemMetrics.activeRequests--;
    
    // Update peak metrics
    const memoryUsage = process.memoryUsage();
    const currentMemory = memoryUsage.heapUsed;
    if (currentMemory > global.systemMetrics.peakMemory) {
      global.systemMetrics.peakMemory = currentMemory;
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * System monitoring middleware
 * Tracks system resources and performance
 */
const systemMonitor = (req, res, next) => {
  // Update system metrics every 30 seconds
  const now = Date.now();
  if (!global.systemMetrics.lastUpdate || now - global.systemMetrics.lastUpdate > 30000) {
    global.systemMetrics.lastUpdate = now;
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    global.systemMetrics.currentMemory = memoryUsage.heapUsed;
    global.systemMetrics.memoryUsage = {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external
    };
    
    // CPU usage
    const cpuUsage = process.cpuUsage();
    global.systemMetrics.cpuUsage = cpuUsage;
    
    // System load
    global.systemMetrics.systemLoad = os.loadavg();
    
    // Uptime
    global.systemMetrics.uptime = process.uptime();
    global.systemMetrics.systemUptime = os.uptime();
  }
  
  next();
};

/**
 * Performance monitoring middleware
 * Tracks slow requests and performance bottlenecks
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Monitor slow requests (over 1 second)
  const checkPerformance = () => {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.url} took ${duration}ms`);
      
      // Track slow requests
      if (!global.systemMetrics.slowRequests) {
        global.systemMetrics.slowRequests = [];
      }
      
      global.systemMetrics.slowRequests.push({
        method: req.method,
        url: req.url,
        duration,
        timestamp: new Date(),
        userId: req.user?._id
      });
      
      // Keep only last 100 slow requests
      if (global.systemMetrics.slowRequests.length > 100) {
        global.systemMetrics.slowRequests = global.systemMetrics.slowRequests.slice(-100);
      }
    }
  };
  
  // Check performance after response
  res.on('finish', checkPerformance);
  
  next();
};

/**
 * Error monitoring middleware
 * Tracks errors and exceptions
 */
const errorMonitor = (err, req, res, next) => {
  // Track error
  global.systemMetrics.errorCount++;
  
  // Log error details
  const errorData = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?._id,
    timestamp: new Date()
  };
  
  if (!global.systemMetrics.errors) {
    global.systemMetrics.errors = [];
  }
  
  global.systemMetrics.errors.push(errorData);
  
  // Keep only last 100 errors
  if (global.systemMetrics.errors.length > 100) {
    global.systemMetrics.errors = global.systemMetrics.errors.slice(-100);
  }
  
  next(err);
};

/**
 * Get comprehensive monitoring data
 */
const getMonitoringData = () => {
  const responseTimes = global.systemMetrics.responseTimes;
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;
  
  const errorRate = global.systemMetrics.totalRequests > 0 
    ? (global.systemMetrics.errorCount / global.systemMetrics.totalRequests * 100).toFixed(2)
    : 0;
  
  return {
    uptime: {
      process: process.uptime(),
      system: os.uptime(),
      formatted: {
        process: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
        system: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`
      }
    },
    requests: {
      total: global.systemMetrics.totalRequests,
      active: global.systemMetrics.activeRequests,
      errorCount: global.systemMetrics.errorCount,
      errorRate: `${errorRate}%`,
      averageResponseTime: `${avgResponseTime.toFixed(2)}ms`,
      peakMemory: `${(global.systemMetrics.peakMemory / 1024 / 1024).toFixed(2)} MB`
    },
    system: {
      memory: global.systemMetrics.memoryUsage,
      cpu: global.systemMetrics.cpuUsage,
      load: global.systemMetrics.systemLoad,
      currentMemory: `${(global.systemMetrics.currentMemory / 1024 / 1024).toFixed(2)} MB`
    },
    performance: {
      slowRequests: global.systemMetrics.slowRequests?.length || 0,
      recentErrors: global.systemMetrics.errors?.length || 0
    },
    timestamp: new Date()
  };
};

/**
 * Get real-time monitoring data
 */
const getRealTimeData = () => {
  return {
    activeRequests: global.systemMetrics.activeRequests,
    memoryUsage: `${(global.systemMetrics.currentMemory / 1024 / 1024).toFixed(2)} MB`,
    systemLoad: global.systemMetrics.systemLoad,
    uptime: process.uptime(),
    timestamp: new Date()
  };
};

/**
 * Reset monitoring data
 */
const resetMonitoringData = () => {
  global.systemMetrics = {
    startTime: Date.now(),
    totalRequests: 0,
    activeRequests: 0,
    errorCount: 0,
    responseTimes: [],
    requestHistory: [],
    peakMemory: 0,
    peakCPU: 0,
    slowRequests: [],
    errors: []
  };
};

module.exports = {
  requestMonitor,
  systemMonitor,
  performanceMonitor,
  errorMonitor,
  getMonitoringData,
  getRealTimeData,
  resetMonitoringData
}; 