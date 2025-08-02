/**
 * Hook for functional components error handling
 */
export const useErrorHandler = () => {
  const handleError = (error, errorInfo = null) => {
    // Log error
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // In production, send to error tracking service
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Send to your error tracking service
      console.error('Error logged to service:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    }
  };

  return { handleError };
};

export default useErrorHandler; 