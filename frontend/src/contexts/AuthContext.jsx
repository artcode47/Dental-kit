import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  tokenId: null,
  isAuthenticated: false,
  isLoading: true,
  userRole: null,
  permissions: [],
  lastActivity: null,
  sessionExpiry: null,
  failedLoginAttempts: 0,
  isLocked: false,
  lockoutUntil: null,
  deviceInfo: null,
  registrationMessage: null,
  loginHistory: []
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        tokenId: action.payload.tokenId || null,
        isAuthenticated: true,
        isLoading: false,
        userRole: action.payload.user?.role || 'user',
        permissions: action.payload.user?.permissions || [],
        lastActivity: new Date().toISOString(),
        sessionExpiry: action.payload.sessionExpiry,
        failedLoginAttempts: 0,
        isLocked: false,
        lockoutUntil: null,
        deviceInfo: action.payload.deviceInfo
      };
    
    case 'REGISTRATION_SUCCESS':
      return {
        ...state,
        isLoading: false,
        registrationMessage: action.payload.message
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        failedLoginAttempts: state.failedLoginAttempts + 1,
        isLocked: state.failedLoginAttempts >= 4,
        lockoutUntil: state.failedLoginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date().toISOString()
      };
    
    case 'SESSION_EXPIRED':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        tokenId: null,
        sessionExpiry: null
      };
    
    case 'TOKEN_REFRESHED':
      return {
        ...state,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        tokenId: action.payload.tokenId,
        sessionExpiry: action.payload.sessionExpiry
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { t } = useTranslation();

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('authToken');
      const refreshTokenCookie = Cookies.get('refreshToken');
      const tokenIdCookie = Cookies.get('tokenId');
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            if (refreshTokenCookie && tokenIdCookie) {
              try {
                const refreshed = await refreshToken();
                if (refreshed) return;
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
              }
            }
            Cookies.remove('authToken');
            Cookies.remove('refreshToken');
            Cookies.remove('tokenId');
            dispatch({ type: 'LOGOUT' });
            return;
          }
          
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            const profileResponse = await api.get('/auth/profile');
            const userProfile = profileResponse.data.profile;
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: userProfile,
                token,
                refreshToken: refreshTokenCookie || null,
                tokenId: tokenIdCookie || null,
                sessionExpiry: new Date(decoded.exp * 1000).toISOString()
              }
            });
          } catch (profileError) {
            console.error('Failed to fetch user profile:', profileError);
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: { 
                  id: decoded.id,
                  email: null,
                  role: 'user'
                },
                token,
                refreshToken: refreshTokenCookie || null,
                tokenId: tokenIdCookie || null,
                sessionExpiry: new Date(decoded.exp * 1000).toISOString()
              }
            });
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          Cookies.remove('authToken');
          Cookies.remove('refreshToken');
          Cookies.remove('tokenId');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Session monitoring
  useEffect(() => {
    if (!state.isAuthenticated || !state.sessionExpiry) return;

    const checkSession = () => {
      const now = new Date();
      const expiry = new Date(state.sessionExpiry);
      
      if (expiry <= now) {
        dispatch({ type: 'SESSION_EXPIRED' });
        toast.error(t('sessionExpired'));
        Cookies.remove('authToken');
        Cookies.remove('refreshToken');
        Cookies.remove('tokenId');
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 300000);
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.sessionExpiry, t]);

  // Activity tracking - throttled
  useEffect(() => {
    if (!state.isAuthenticated) return;

    let timeoutId = null;
    const updateActivity = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        dispatch({ type: 'UPDATE_ACTIVITY' });
        timeoutId = null;
      }, 30000);
    };

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [state.isAuthenticated]);

  // Token refresh
  const refreshToken = async () => {
    try {
      const currentRefreshToken = Cookies.get('refreshToken');
      const currentTokenId = Cookies.get('tokenId');
      
      if (!currentRefreshToken || !currentTokenId) {
        throw new Error('No refresh token or token ID available');
      }

      const response = await api.post('/auth/refresh-token', {
        refreshToken: currentRefreshToken,
        tokenId: currentTokenId
      });

      const { accessToken, refreshToken: newRefreshToken, tokenId: newTokenId } = response.data;
      
      if (accessToken && newRefreshToken && newTokenId) {
        Cookies.set('authToken', accessToken, { 
          expires: 7,
          secure: import.meta.env.PROD,
          sameSite: 'strict',
          httpOnly: false
        });
        
        Cookies.set('refreshToken', newRefreshToken, { 
          expires: 7,
          secure: import.meta.env.PROD,
          sameSite: 'strict',
          httpOnly: false
        });
        
        Cookies.set('tokenId', newTokenId, { 
          expires: 7,
          secure: import.meta.env.PROD,
          sameSite: 'strict',
          httpOnly: false
        });
        
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        const decoded = jwtDecode(accessToken);
        dispatch({
          type: 'TOKEN_REFRESHED',
          payload: { 
            accessToken,
            refreshToken: newRefreshToken,
            tokenId: newTokenId,
            sessionExpiry: new Date(decoded.exp * 1000).toISOString()
          }
        });
        
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!state.isAuthenticated || !state.sessionExpiry) return;

    const checkAndRefreshToken = async () => {
      const now = new Date();
      const expiry = new Date(state.sessionExpiry);
      const timeUntilExpiry = expiry.getTime() - now.getTime();
      
      if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
        await refreshToken();
      }
    };

    const interval = setInterval(checkAndRefreshToken, 60000);
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.sessionExpiry]);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const sanitizedCredentials = typeof credentials === 'object' ? {
        email: credentials.email?.trim().toLowerCase(),
        password: credentials.password
      } : { email: arguments[0], password: arguments[1] };
      
      if (!sanitizedCredentials.email || !sanitizedCredentials.password) {
        throw new Error('Invalid credentials');
      }
      
      const response = await api.post('/auth/login', sanitizedCredentials);
      const { accessToken, refreshToken, tokenId, user } = response.data;
      
      if (!accessToken || !refreshToken || !tokenId) {
        throw new Error('Incomplete authentication response received');
      }
      
      try {
        const decoded = jwtDecode(accessToken);
        if (!decoded.exp || !decoded.id) {
          throw new Error('Invalid token format');
        }
      } catch (decodeError) {
        throw new Error('Invalid token received');
      }
      
      Cookies.set('authToken', accessToken, { 
        expires: 7,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
        httpOnly: false
      });
      Cookies.set('refreshToken', refreshToken, { 
        expires: 7,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
        httpOnly: false
      });
      Cookies.set('tokenId', tokenId, { 
        expires: 7,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
        httpOnly: false
      });
      
      const csrfToken = response.headers['x-csrf-token'];
      if (csrfToken) {
        Cookies.set('csrf-token', csrfToken, {
          secure: import.meta.env.PROD,
          sameSite: 'strict',
          expires: 1
        });
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      const decoded = jwtDecode(accessToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { 
          user: user || { id: decoded.id, email: sanitizedCredentials.email, role: decoded.role || 'user' }, 
          token: accessToken,
          refreshToken,
          tokenId,
          sessionExpiry: new Date(decoded.exp * 1000).toISOString()
        }
      });
      
      toast.success(t('loginSuccessful'));
      return { success: true, user: user || { role: 'user' } };
    } catch (error) {
      const message = error.response?.data?.message || t('loginFailed');
      toast.error(message);
      dispatch({ type: 'AUTH_FAILURE' });
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      if (state.token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('authToken');
      Cookies.remove('refreshToken');
      Cookies.remove('tokenId');
      
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('cart');
      window.dispatchEvent(new CustomEvent('userLogout'));
      
      dispatch({ type: 'LOGOUT' });
      toast.success(t('loggedOutSuccessfully'));
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const response = await api.post('/auth/register', userData);
      const message = response.data?.message || t('registrationSuccessful');
      toast.success(message);
      dispatch({ type: 'REGISTRATION_SUCCESS', payload: { message } });
      return { success: true, message };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || t('registrationFailed');
      toast.error(message);
      dispatch({ type: 'AUTH_FAILURE', payload: { error: message, status } });
      return { success: false, error: message, status };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/request-password-reset', { email });
      toast.success(t('passwordResetInstructionsSent'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('failedToSendResetEmail');
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (token, email, password) => {
    try {
      await api.post('/auth/reset-password', { token, email, password });
      toast.success(t('passwordResetSuccessful'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('passwordResetFailed');
      toast.error(message);
      throw error;
    }
  };

  const getProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.profile
      });
      return response.data.profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.profile
      });
      toast.success(t('profile.changesSaved'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('profile.updateFailed');
      toast.error(message);
      throw error;
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      dispatch({
        type: 'UPDATE_USER',
        payload: { profileImage: response.data.imageUrl }
      });

      toast.success(t('profile.imageUploaded'));
      return { success: true, imageUrl: response.data.imageUrl };
    } catch (error) {
      const message = error.response?.data?.message || t('profile.imageUploadFailed');
      toast.error(message);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      await logout();
      toast.success(t('profile.accountDeleted'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('profile.deleteAccountFailed');
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success(t('passwordChangedSuccessfully'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('passwordChangeFailed');
      toast.error(message);
      throw error;
    }
  };

  const hasPermission = (permission) => {
    return state.permissions.includes(permission) || state.user?.role === 'admin';
  };

  const hasRole = (role) => {
    return state.user?.role === role || state.user?.role === 'admin';
  };

  const value = {
    ...state,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    uploadProfileImage,
    deleteAccount,
    changePassword,
    hasPermission,
    hasRole,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth called outside AuthProvider. Returning safe defaults.');
    return {
      ...initialState,
      login: async () => ({ success: false }),
      logout: async () => {},
      register: async () => ({ success: false }),
      forgotPassword: async () => ({ success: false }),
      resetPassword: async () => ({ success: false }),
      getProfile: async () => null,
      updateProfile: async () => ({ success: false }),
      uploadProfileImage: async () => ({ success: false }),
      deleteAccount: async () => ({ success: false }),
      changePassword: async () => ({ success: false }),
      hasPermission: () => false,
      hasRole: () => false,
      refreshToken: async () => false
    };
  }
  return context;
};