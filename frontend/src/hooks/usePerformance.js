import { useEffect, useRef, useCallback } from 'react';

/**
 * Performance monitoring hook
 * Tracks page load times, component render times, and performance metrics
 */
export const usePerformance = (componentName = 'Unknown') => {
  const renderStartTime = useRef(performance.now());
  const renderCount = useRef(0);
  const metrics = useRef({
    firstRender: 0,
    averageRender: 0,
    totalRenders: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errors: 0
  });

  // Track component render performance
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current += 1;
    
    if (renderCount.current === 1) {
      metrics.current.firstRender = renderTime;
    }
    
    // Calculate average render time
    const totalTime = metrics.current.averageRender * (renderCount.current - 1) + renderTime;
    metrics.current.averageRender = totalTime / renderCount.current;
    metrics.current.totalRenders = renderCount.current;
    
    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        averageRender: `${metrics.current.averageRender.toFixed(2)}ms`,
        totalRenders: renderCount.current
      });
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && renderTime > 100) {
      // Send slow render to analytics
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
    
    renderStartTime.current = performance.now();
  });

  // Track memory usage
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = performance.memory;
      metrics.current.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Memory] ${componentName}:`, {
          used: `${metrics.current.memoryUsage.toFixed(2)}MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        });
      }
    }
  }, [componentName]);

  // Track network requests
  const trackNetworkRequest = useCallback((url, method, duration, status) => {
    metrics.current.networkRequests += 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Network] ${componentName}:`, {
        url,
        method,
        duration: `${duration.toFixed(2)}ms`,
        status
      });
    }
    
    // Track slow requests
    if (duration > 2000) {
      console.warn(`Slow network request in ${componentName}: ${url} (${duration.toFixed(2)}ms)`);
    }
  }, [componentName]);

  // Track errors
  const trackError = useCallback((error, context = '') => {
    metrics.current.errors += 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Error] ${componentName}:`, {
        error: error.message,
        context,
        stack: error.stack
      });
    }
    
    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to your error tracking service
      console.error('Error tracked:', {
        component: componentName,
        error: error.message,
        context,
        timestamp: new Date().toISOString()
      });
    }
  }, [componentName]);

  // Get performance metrics
  const getMetrics = useCallback(() => {
    return {
      ...metrics.current,
      componentName
    };
  }, [componentName]);

  // Monitor memory usage periodically
  useEffect(() => {
    const interval = setInterval(trackMemoryUsage, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [trackMemoryUsage]);

  return {
    trackNetworkRequest,
    trackError,
    getMetrics,
    trackMemoryUsage
  };
};

/**
 * Page load performance monitoring
 */
export const usePagePerformance = (pageName = 'Unknown') => {
  const pageLoadStart = useRef(performance.now());
  const metrics = useRef({
    pageLoadTime: 0,
    domContentLoaded: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0
  });

  useEffect(() => {
    // Track page load time
    const pageLoadTime = performance.now() - pageLoadStart.current;
    metrics.current.pageLoadTime = pageLoadTime;

    // Track DOM content loaded
    if (document.readyState === 'complete') {
      metrics.current.domContentLoaded = performance.now() - pageLoadStart.current;
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        metrics.current.domContentLoaded = performance.now() - pageLoadStart.current;
      });
    }

    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          metrics.current.firstContentfulPaint = fcp.startTime;
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        metrics.current.largestContentfulPaint = lcp.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
        metrics.current.cumulativeLayoutShift = cls;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fid = entries[0];
        metrics.current.firstInputDelay = fid.processingStart - fid.startTime;
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }

    // Log page performance
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Page Performance] ${pageName}:`, {
        pageLoadTime: `${pageLoadTime.toFixed(2)}ms`,
        domContentLoaded: `${metrics.current.domContentLoaded.toFixed(2)}ms`
      });
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics service
      console.log('Page performance tracked:', {
        page: pageName,
        metrics: metrics.current,
        timestamp: new Date().toISOString()
      });
    }

    return () => {
      // Cleanup observers
      if (fcpObserver) fcpObserver.disconnect();
      if (lcpObserver) lcpObserver.disconnect();
      if (clsObserver) clsObserver.disconnect();
      if (fidObserver) fidObserver.disconnect();
    };
  }, [pageName]);

  return {
    getPageMetrics: () => metrics.current
  };
};

export default usePerformance; 