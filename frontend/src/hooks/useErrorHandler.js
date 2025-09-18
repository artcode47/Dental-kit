import { useNavigate } from 'react-router-dom';

/**
 * Hook for functional components error handling and navigation
 */
export const useErrorHandler = () => {
  const navigate = useNavigate();

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

  const navigateToError = (errorType, options = {}) => {
    const errorRoutes = {
      'not-found': '/404',
      'unauthorized': '/unauthorized',
      'server-error': '/server-error',
      'maintenance': '/maintenance',
      'network-error': '/network-error'
    };

    const route = errorRoutes[errorType];
    if (route) {
      navigate(route, { 
        replace: options.replace !== false,
        state: options.state || {}
      });
    } else {
      console.warn(`Unknown error type: ${errorType}`);
      navigate('/404', { replace: true });
    }
  };

  const handleApiError = (error, fallbackRoute = '/server-error') => {
    const status = error?.response?.status;
    
    switch (status) {
      case 401:
        navigateToError('unauthorized');
        break;
      case 403:
        navigateToError('unauthorized');
        break;
      case 404:
        navigateToError('not-found');
        break;
      case 500:
      case 502:
      case 503:
        navigateToError('server-error');
        break;
      case 503:
        navigateToError('maintenance');
        break;
      default:
        if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
          navigateToError('network-error');
        } else {
          navigate(fallbackRoute, { replace: true });
        }
    }
  };

  return { 
    handleError, 
    navigateToError, 
    handleApiError 
  };
};

export default useErrorHandler; 