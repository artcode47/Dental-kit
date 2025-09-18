import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  UserIcon,
  KeyIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';

const UnauthorizedPage = () => {
  const { t } = useTranslation('ecommerce');
  const { isDark } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-red-50 to-orange-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 ${
          isDark ? 'bg-red-400' : 'bg-red-300'
        } blur-3xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 ${
          isDark ? 'bg-orange-400' : 'bg-orange-300'
        } blur-3xl`}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className={`max-w-4xl w-full text-center transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          {/* Main Error Display */}
          <div className="mb-12">
            {/* 403 Number with Animation */}
            <div className="relative mb-8">
              <h1 className={`text-9xl md:text-[12rem] font-black tracking-tighter ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-500 to-red-600' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-600 to-red-700'
              }`}>
                403
              </h1>
              
              {/* Floating Elements */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <LockClosedIcon className={`w-8 h-8 animate-bounce ${
                  isDark ? 'text-yellow-400' : 'text-yellow-500'
                }`} />
              </div>
              
              <div className="absolute top-1/2 right-0 transform translate-y-1/2 translate-x-4">
                <ShieldExclamationIcon className={`w-6 h-6 animate-pulse ${
                  isDark ? 'text-orange-400' : 'text-orange-500'
                }`} />
              </div>
            </div>

            {/* Error Message */}
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.unauthorized.title', 'Access Denied')}
            </h2>
            
            <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t('errors.unauthorized.description', 'Sorry! You don\'t have permission to access this page. This area is restricted and requires proper authentication or authorization.')}
            </p>
          </div>

          {/* Authentication Status */}
          <div className={`mb-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {isAuthenticated ? (
                  <UserIcon className={`w-6 h-6 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                ) : (
                  <KeyIcon className={`w-6 h-6 ${
                    isDark ? 'text-red-400' : 'text-red-600'
                  }`} />
                )}
              </div>
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {isAuthenticated 
                ? t('errors.unauthorized.authenticatedTitle', 'You are logged in')
                : t('errors.unauthorized.notAuthenticatedTitle', 'You are not logged in')
              }
            </h3>
            
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {isAuthenticated 
                ? t('errors.unauthorized.authenticatedMessage', 'Your account doesn\'t have the required permissions for this page.')
                : t('errors.unauthorized.notAuthenticatedMessage', 'Please log in or create an account to access this content.')
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              icon={<ArrowLeftIcon className="w-5 h-5" />}
              className="min-w-[160px]"
            >
              {t('errors.unauthorized.goBack', 'Go Back')}
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              size="lg"
              icon={<HomeIcon className="w-5 h-5" />}
              className="min-w-[160px]"
            >
              {t('errors.unauthorized.goHome', 'Go Home')}
            </Button>
          </div>

          {/* Authentication Actions */}
          {!isAuthenticated && (
            <div className={`mb-12 p-6 rounded-2xl backdrop-blur-sm ${
              isDark 
                ? 'bg-gray-800/50 border border-gray-700/50' 
                : 'bg-white/70 border border-gray-200/50 shadow-xl'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {t('errors.unauthorized.authActionsTitle', 'Get Access')}
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={handleLogin}
                  variant="primary"
                  size="lg"
                  icon={<KeyIcon className="w-5 h-5" />}
                  className="min-w-[160px]"
                >
                  {t('errors.unauthorized.login', 'Log In')}
                </Button>
                
                <Button
                  onClick={handleRegister}
                  variant="outline"
                  size="lg"
                  icon={<UserIcon className="w-5 h-5" />}
                  className="min-w-[160px]"
                >
                  {t('errors.unauthorized.register', 'Sign Up')}
                </Button>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className={`p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.unauthorized.quickLinksTitle', 'Public Pages')}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { path: '/products', label: t('common.products', 'Products'), icon: '🛍️' },
                { path: '/categories', label: t('common.categories', 'Categories'), icon: '📂' },
                { path: '/about', label: t('common.about', 'About'), icon: 'ℹ️' },
                { path: '/contact', label: t('common.contact', 'Contact'), icon: '📞' }
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`p-3 rounded-xl text-center transition-all duration-200 hover:scale-105 ${
                    isDark
                      ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600/50'
                      : 'bg-gray-100/70 hover:bg-gray-200/70 text-gray-700 hover:text-gray-900 border border-gray-200/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{link.icon}</div>
                  <div className="text-sm font-medium">{link.label}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className={`mt-8 p-4 rounded-xl ${
            isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'
          }`}>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('errors.unauthorized.helpText', 'Need help with access?')}{' '}
              <Link 
                to="/contact" 
                className={`font-medium hover:underline ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {t('errors.unauthorized.contactUs', 'Contact our support team')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
