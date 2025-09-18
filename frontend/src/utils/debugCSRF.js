// Debug utility for CSRF token issues
import Cookies from 'js-cookie';

export const debugCSRFToken = () => {
  const csrfToken = Cookies.get('csrf-token');
  const authToken = Cookies.get('authToken');
  
  console.log('=== CSRF Token Debug ===');
  console.log('CSRF Token:', csrfToken ? csrfToken.substring(0, 10) + '...' : 'NOT FOUND');
  console.log('Auth Token:', authToken ? authToken.substring(0, 10) + '...' : 'NOT FOUND');
  console.log('CSRF Token Length:', csrfToken ? csrfToken.length : 0);
  console.log('Auth Token Length:', authToken ? authToken.length : 0);
  
  return {
    hasCSRFToken: !!csrfToken,
    hasAuthToken: !!authToken,
    csrfToken: csrfToken,
    authToken: authToken
  };
};

export const clearAllTokens = () => {
  Cookies.remove('csrf-token');
  Cookies.remove('authToken');
  console.log('All tokens cleared');
};

export const testCSRFToken = async () => {
  try {
    const response = await fetch('/api/auth/csrf-token', {
      method: 'GET',
      credentials: 'include'
    });
    
    const csrfToken = response.headers.get('x-csrf-token');
    console.log('Test CSRF token received:', csrfToken ? csrfToken.substring(0, 10) + '...' : 'NOT FOUND');
    
    return csrfToken;
  } catch (error) {
    console.error('Error testing CSRF token:', error);
    return null;
  }
}; 