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
  isAuthenticated: false,
  isLoading: true,
  isMFARequired: false,
  mfaToken: null,
  userRole: null,
  permissions: [],
  lastActivity: null,
  sessionExpiry: null,
  failedLoginAttempts: 0,
  isLocked: false,
  lockoutUntil: null,
  deviceInfo: null,
  registrationMessage: null,
  loginHistory: [],
  securitySettings: {
    mfaEnabled: false,
    mfaMethod: null,
    passwordLastChanged: null,
    lastLoginLocation: null,
    trustedDevices: []
  }
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
    
    case 'MFA_REQUIRED':
      return {
        ...state,
        isMFARequired: true,
        mfaToken: action.payload.mfaToken,
        isLoading: false
      };
    
    case 'MFA_SUCCESS':
      return {
        ...state,
        isMFARequired: false,
        mfaToken: null,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        userRole: action.payload.user?.role || 'user',
        permissions: action.payload.user?.permissions || []
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
    
    case 'UPDATE_SECURITY_SETTINGS':
      return {
        ...state,
        securitySettings: { ...state.securitySettings, ...action.payload }
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
        sessionExpiry: null
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { t } = useTranslation();

  // Initialize auth state from stored token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('authToken');
      const mfaToken = Cookies.get('mfaToken');
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            Cookies.remove('authToken');
            dispatch({ type: 'LOGOUT' });
            return;
          }
          
          // Set auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile to get role and permissions
          try {
            const profileResponse = await api.get('/auth/profile');
            const userProfile = profileResponse.data.profile;
            
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: userProfile,
                token,
                sessionExpiry: new Date(decoded.exp * 1000).toISOString()
              }
            });
          } catch (profileError) {
            console.error('Failed to fetch user profile:', profileError);
            // Fallback to basic user data if profile fetch fails
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: { 
                  id: decoded.id,
                  email: null,
                  role: 'user'
                },
                token,
                sessionExpiry: new Date(decoded.exp * 1000).toISOString()
              }
            });
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          Cookies.remove('authToken');
          dispatch({ type: 'LOGOUT' });
        }
      } else if (mfaToken) {
        dispatch({
          type: 'MFA_REQUIRED',
          payload: { mfaToken }
        });
      } else {
        // No tokens found, user is not authenticated
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
        dispatch({ type: 'LOGOUT' });
      }
    };

    // Check immediately
    checkSession();
    
    // Then check every 5 minutes instead of every minute to reduce API calls
    const interval = setInterval(checkSession, 300000);
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.sessionExpiry, t]);

  // Activity tracking - throttled to reduce unnecessary updates
  useEffect(() => {
    if (!state.isAuthenticated) return;

    let timeoutId = null;
    const updateActivity = () => {
      if (timeoutId) return; // Throttle updates
      
      timeoutId = setTimeout(() => {
        dispatch({ type: 'UPDATE_ACTIVITY' });
        timeoutId = null;
      }, 30000); // Only update every 30 seconds
    };

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [state.isAuthenticated]);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await api.post('/auth/login', credentials);
      
      // Backend returns { accessToken, user } on success
      const { accessToken, user } = response.data;
      
      if (!accessToken) {
        throw new Error('No access token received');
      }
      
      // Store token
      Cookies.set('authToken', accessToken, { 
        expires: 7, // 7 days (matches backend refresh token expiry)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Decode token to get user info
      const decoded = jwtDecode(accessToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { 
          user: user || { 
            id: decoded.id,
            email: credentials.email, // Use email from login form
            role: 'user' // Default role, can be updated later
          }, 
          token: accessToken, 
          sessionExpiry: new Date(decoded.exp * 1000).toISOString()
        }
      });
      
      toast.success(t('loginSuccessful'));
      return { success: true, user: user || { role: 'user' } };
    } catch (error) {
      const message = error.response?.data?.message || t('loginFailed');
      toast.error(message);
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const verifyMFA = async (mfaCode) => {
    try {
      const mfaToken = Cookies.get('mfaToken');
      if (!mfaToken) {
        throw new Error('MFA token not found');
      }
      
      const response = await api.post('/auth/verify-mfa', {
        mfaCode,
        mfaToken
      });
      
      const { token, user, sessionExpiry } = response.data;
      
      // Clear MFA token
      Cookies.remove('mfaToken');
      
      // Store auth token
      Cookies.set('authToken', token, { 
        expires: new Date(sessionExpiry),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({
        type: 'MFA_SUCCESS',
        payload: { user, token, sessionExpiry }
      });
      
      toast.success(t('mfaVerificationSuccessful'));
      return { success: true, user: user };
    } catch (error) {
      const message = error.response?.data?.message || t('mfaVerificationFailed');
      toast.error(message);
      throw error;
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
      // Clear tokens
      Cookies.remove('authToken');
      Cookies.remove('mfaToken');
      
      // Clear auth header
      delete api.defaults.headers.common['Authorization'];
      
      dispatch({ type: 'LOGOUT' });
      toast.success(t('loggedOutSuccessfully'));
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const response = await api.post('/auth/register', userData);
      
      // Backend only returns a message, not user data
      // The user needs to verify their email before they can login
      toast.success(response.data.message || t('registrationSuccessful'));
      
      dispatch({ type: 'REGISTRATION_SUCCESS', payload: { message: response.data.message } });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || t('registrationFailed');
      toast.error(message);
      dispatch({ type: 'AUTH_FAILURE', payload: { error: message } });
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success(t('passwordResetInstructionsSent'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('failedToSendResetEmail');
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
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

  const setupMFA = async (method) => {
    try {
      const response = await api.post('/auth/setup-mfa', { method });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || t('mfaSetupFailed');
      toast.error(message);
      throw error;
    }
  };

  const verifyMFASetup = async (mfaCode) => {
    try {
      const response = await api.post('/auth/verify-mfa-setup', { mfaCode });
      
      dispatch({
        type: 'UPDATE_SECURITY_SETTINGS',
        payload: {
          mfaEnabled: true,
          mfaMethod: response.data.method
        }
      });
      
      toast.success(t('mfaSetupCompletedSuccessfully'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('mfaVerificationFailed');
      toast.error(message);
      throw error;
    }
  };

  const disableMFA = async (mfaCode) => {
    try {
      await api.delete('/auth/disable-mfa', { data: { mfaCode } });
      
      dispatch({
        type: 'UPDATE_SECURITY_SETTINGS',
        payload: {
          mfaEnabled: false,
          mfaMethod: null
        }
      });
      
      toast.success(t('mfaDisabledSuccessfully'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('failedToDisableMfa');
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
    verifyMFA,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    uploadProfileImage,
    deleteAccount,
    changePassword,
    setupMFA,
    verifyMFASetup,
    disableMFA,
    hasPermission,
    hasRole
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 