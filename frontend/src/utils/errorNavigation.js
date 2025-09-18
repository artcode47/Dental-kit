/**
 * Utility functions for error page navigation
 * Can be used outside of React components
 */

/**
 * Navigate to a specific error page
 * @param {string} errorType - Type of error page to navigate to
 * @param {Object} options - Navigation options
 * @param {boolean} options.replace - Whether to replace current history entry
 * @param {Object} options.state - State to pass with navigation
 */
export const navigateToErrorPage = (errorType, options = {}) => {
  const errorRoutes = {
    'not-found': '/404',
    'unauthorized': '/unauthorized',
    'server-error': '/server-error',
    'maintenance': '/maintenance',
    'network-error': '/network-error'
  };

  const route = errorRoutes[errorType];
  if (route) {
    if (options.replace) {
      window.location.replace(route);
    } else {
      window.location.href = route;
    }
  } else {
    console.warn(`Unknown error type: ${errorType}`);
    window.location.href = '/404';
  }
};

/**
 * Handle API errors and navigate to appropriate error pages
 * @param {Error} error - The error object
 * @param {string} fallbackRoute - Fallback route if error type is unknown
 */
export const handleApiErrorNavigation = (error, fallbackRoute = '/server-error') => {
  const status = error?.response?.status;
  
  switch (status) {
    case 401:
    case 403:
      navigateToErrorPage('unauthorized', { replace: true });
      break;
    case 404:
      navigateToErrorPage('not-found', { replace: true });
      break;
    case 500:
    case 502:
      navigateToErrorPage('server-error', { replace: true });
      break;
    case 503:
      navigateToErrorPage('maintenance', { replace: true });
      break;
    default:
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
        navigateToErrorPage('network-error', { replace: true });
      } else {
        navigateToErrorPage('server-error', { replace: true });
      }
  }
};

/**
 * Check if current page is an error page
 * @returns {boolean} True if current page is an error page
 */
export const isErrorPage = () => {
  const errorPaths = ['/404', '/unauthorized', '/server-error', '/maintenance', '/network-error'];
  return errorPaths.includes(window.location.pathname);
};

/**
 * Get the current error page type
 * @returns {string|null} The current error page type or null if not on an error page
 */
export const getCurrentErrorPageType = () => {
  const pathToType = {
    '/404': 'not-found',
    '/unauthorized': 'unauthorized',
    '/server-error': 'server-error',
    '/maintenance': 'maintenance',
    '/network-error': 'network-error'
  };
  
  return pathToType[window.location.pathname] || null;
};

export default {
  navigateToErrorPage,
  handleApiErrorNavigation,
  isErrorPage,
  getCurrentErrorPageType
};
