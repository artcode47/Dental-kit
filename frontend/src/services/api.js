import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

// Security configuration
const SECURITY_CONFIG = {
  CSRF_TOKEN_HEADER: 'X-CSRF-Token',
  RATE_LIMIT_HEADER: 'X-RateLimit-Remaining'
};

// Create axios instance with enhanced security
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Enable CSRF protection
});

// CSRF token management
let csrfToken = null;

const getCSRFToken = () => {
  if (!csrfToken) {
    csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                Cookies.get('csrf-token');
  }
  return csrfToken;
};

// Request interceptor with enhanced security
api.interceptors.request.use(
  (config) => {
    // Add CSRF token if available
    const token = getCSRFToken();
    if (token) {
      config.headers[SECURITY_CONFIG.CSRF_TOKEN_HEADER] = token;
    }
    
    // Add auth token if available (use httpOnly cookies in production)
    const authToken = Cookies.get('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    // Add language header
    const language = Cookies.get('language') || 'en';
    config.headers['Accept-Language'] = language;
    
    // Add device info with sanitization
    const deviceInfo = {
      platform: navigator.platform || 'unknown',
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      screen: {
        width: screen.width || 0,
        height: screen.height || 0
      },
      viewport: {
        width: window.innerWidth || 0,
        height: window.innerHeight || 0
      }
    };
    
    config.headers['X-Device-Info'] = JSON.stringify(deviceInfo);
    
    // Add request timestamp
    config.headers['X-Request-Timestamp'] = Date.now().toString();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    // Update CSRF token if provided
    const newCSRFToken = response.headers['x-csrf-token'];
    if (newCSRFToken) {
      csrfToken = newCSRFToken;
      Cookies.set('csrf-token', newCSRFToken, { 
        secure: true, 
        sameSite: 'strict',
        expires: 1 // 1 day
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token
      Cookies.remove('authToken');
      Cookies.remove('csrf-token');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
      return Promise.reject(error);
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      toast.error('Resource not found.');
      return Promise.reject(error);
    }
    
    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach(err => {
          toast.error(err.message || 'Validation error');
        });
      } else {
        toast.error('Validation error');
      }
      return Promise.reject(error);
    }
    
    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const message = retryAfter 
        ? `Too many requests. Please try again in ${retryAfter} seconds.`
        : 'Too many requests. Please try again later.';
      toast.error(message);
      return Promise.reject(error);
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }
    
    // Handle other errors
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    verify: '/auth/verify',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    profile: '/auth/profile',
    setupMFA: '/auth/setup-mfa',
    verifyMFASetup: '/auth/verify-mfa-setup',
    disableMFA: '/auth/disable-mfa',
    verifyMFA: '/auth/verify-mfa'
  },
  
  // Users
  users: {
    list: '/users',
    get: (id) => `/users/${id}`,
    create: '/users',
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    profile: '/users/profile',
    orders: '/users/orders',
    wishlist: '/users/wishlist',
    reviews: '/users/reviews',
    addresses: '/users/addresses',
    notifications: '/users/notifications',
    preferences: '/users/preferences'
  },
  
  // Products
  products: {
    list: '/products',
    get: (id) => `/products/${id}`,
    create: '/products',
    update: (id) => `/products/${id}`,
    delete: (id) => `/products/${id}`,
    search: '/products/search',
    filter: '/products/filter',
    categories: '/products/categories',
    brands: '/products/brands',
    reviews: (id) => `/products/${id}/reviews`,
    related: (id) => `/products/${id}/related`,
    recommendations: '/products/recommendations',
    compare: '/products/compare',
    wishlist: '/products/wishlist'
  },
  
  // Cart
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: (id) => `/cart/update/${id}`,
    remove: (id) => `/cart/remove/${id}`,
    clear: '/cart/clear',
    sync: '/cart/sync',
    calculateShipping: '/cart/calculate-shipping'
  },
  
  // Orders
  orders: {
    list: '/orders',
    get: (id) => `/orders/${id}`,
    create: '/orders',
    checkout: '/orders/checkout',
    update: (id) => `/orders/${id}`,
    cancel: (id) => `/orders/${id}/cancel`,
    track: (id) => `/orders/${id}/track`,
    invoice: (id) => `/orders/${id}/invoice`
  },
  
  // Categories
  categories: {
    list: '/categories',
    get: (id) => `/categories/${id}`,
    create: '/categories',
    update: (id) => `/categories/${id}`,
    delete: (id) => `/categories/${id}`,
    products: (id) => `/categories/${id}/products`
  },
  
  // Reviews
  reviews: {
    list: '/reviews',
    get: (id) => `/reviews/${id}`,
    create: '/reviews',
    update: (id) => `/reviews/${id}`,
    delete: (id) => `/reviews/${id}`,
    product: (id) => `/reviews/product/${id}`,
    user: '/reviews/user'
  },
  
  // Coupons
  coupons: {
    list: '/coupons',
    get: (id) => `/coupons/${id}`,
    create: '/coupons',
    update: (id) => `/coupons/${id}`,
    delete: (id) => `/coupons/${id}`,
    apply: '/coupons/apply',
    validate: '/coupons/validate'
  },
  
  // Gift Cards
  giftCards: {
    list: '/gift-cards',
    get: (id) => `/gift-cards/${id}`,
    create: '/gift-cards',
    update: (id) => `/gift-cards/${id}`,
    delete: (id) => `/gift-cards/${id}`,
    apply: '/gift-cards/apply',
    validate: '/gift-cards/validate'
  },
  
  // Vendors
  vendors: {
    list: '/vendors',
    get: (id) => `/vendors/${id}`,
    create: '/vendors',
    update: (id) => `/vendors/${id}`,
    delete: (id) => `/vendors/${id}`,
    products: (id) => `/vendors/${id}/products`,
    profile: '/vendors/profile'
  },
  
  // Admin
  admin: {
    dashboard: '/admin/dashboard',
    stats: '/admin/stats',
    users: '/admin/users',
    products: '/admin/products',
    orders: '/admin/orders',
    categories: '/admin/categories',
    vendors: '/admin/vendors',
    coupons: '/admin/coupons',
    giftCards: '/admin/gift-cards',
    reviews: '/admin/reviews',
    settings: '/admin/settings'
  },
  
  // Upload
  upload: {
    image: '/upload/image',
    file: '/upload/file',
    multiple: '/upload/multiple'
  },
  
  // Notifications
  notifications: {
    list: '/notifications',
    get: (id) => `/notifications/${id}`,
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    settings: '/notifications/settings'
  },
  
  // Search
  search: {
    global: '/search',
    products: '/search/products',
    suggestions: '/search/suggestions',
    history: '/search/history',
    popular: '/search/popular'
  }
};

// API helper functions
export const apiHelpers = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Upload file
  upload: async (url, file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onProgress
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Upload multiple files
  uploadMultiple: async (url, files, onProgress = null) => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onProgress
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Export default api instance
export default api; 