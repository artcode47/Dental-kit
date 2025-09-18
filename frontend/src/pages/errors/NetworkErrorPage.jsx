import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import {
  HomeIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  WifiIcon,
  SignalIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';

const NetworkErrorPage = () => {
  const { t } = useTranslation('ecommerce');
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Check connection status
    checkConnection();
    
    return () => clearTimeout(timer);
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        // If connection is restored, redirect back or reload
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await checkConnection();
    setIsRetrying(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <WifiIcon className="w-6 h-6 text-green-500" />;
      case 'checking':
        return <SignalIcon className="w-6 h-6 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <GlobeAltIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return t('errors.network.connected', 'Connection Restored!');
      case 'checking':
        return t('errors.network.checking', 'Checking Connection...');
      case 'disconnected':
        return t('errors.network.disconnected', 'No Internet Connection');
      default:
        return t('errors.network.error', 'Connection Error');
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 ${
          isDark ? 'bg-blue-400' : 'bg-blue-300'
        } blur-3xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 ${
          isDark ? 'bg-cyan-400' : 'bg-cyan-300'
        } blur-3xl`}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className={`max-w-4xl w-full text-center transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          {/* Main Error Display */}
          <div className="mb-12">
            {/* Network Error Icon with Animation */}
            <div className="relative mb-8">
              <div className={`text-9xl md:text-[12rem] font-black tracking-tighter ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-600 to-blue-700'
              }`}>
                🌐
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <WifiIcon className={`w-8 h-8 animate-bounce ${
                  isDark ? 'text-yellow-400' : 'text-yellow-500'
                }`} />
              </div>
              
              <div className="absolute top-1/2 right-0 transform translate-y-1/2 translate-x-4">
                <SignalIcon className={`w-6 h-6 animate-pulse ${
                  isDark ? 'text-blue-400' : 'text-blue-500'
                }`} />
              </div>
            </div>

            {/* Error Message */}
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.network.title', 'Network Error')}
            </h2>
            
            <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t('errors.network.description', 'It looks like you\'re experiencing network connectivity issues. This could be due to a slow internet connection, server problems, or temporary network outage.')}
            </p>
          </div>

          {/* Connection Status */}
          <div className={`mb-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {getConnectionIcon()}
              </div>
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {getConnectionText()}
            </h3>
            
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {connectionStatus === 'connected' 
                ? t('errors.network.connectedMessage', 'Great! Your connection is working again. Redirecting you back...')
                : t('errors.network.statusMessage', 'We\'re monitoring your connection status and will automatically retry when possible.')
              }
            </p>
          </div>

          {/* Troubleshooting Tips */}
          <div className={`mb-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.network.troubleshootingTitle', 'Troubleshooting Tips')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100/70'
              }`}>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t('errors.network.tips.checkWifi', 'Check Wi-Fi')}
                  </span>
                </div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('errors.network.tips.checkWifiDesc', 'Ensure your device is connected to a stable network')}
                </p>
              </div>
              
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100/70'
              }`}>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t('errors.network.tips.refresh', 'Refresh Page')}
                  </span>
                </div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('errors.network.tips.refreshDesc', 'Sometimes a simple refresh can resolve connection issues')}
                </p>
              </div>
              
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100/70'
              }`}>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t('errors.network.tips.wait', 'Wait & Retry')}
                  </span>
                </div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('errors.network.tips.waitDesc', 'Network issues are often temporary and resolve quickly')}
                </p>
              </div>
              
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100/70'
              }`}>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t('errors.network.tips.contact', 'Contact Support')}
                  </span>
                </div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('errors.network.tips.contactDesc', 'If the problem persists, our team can help')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={handleRetry}
              variant="primary"
              size="lg"
              icon={<ArrowPathIcon className="w-5 h-5" />}
              className="min-w-[160px]"
              disabled={isRetrying || connectionStatus === 'connected'}
              loading={isRetrying}
            >
              {isRetrying 
                ? t('errors.network.retrying', 'Retrying...')
                : t('errors.network.retry', 'Try Again')
              }
            </Button>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="lg"
              icon={<ArrowPathIcon className="w-5 h-5" />}
              className="min-w-[160px]"
            >
              {t('errors.network.refresh', 'Refresh Page')}
            </Button>
          </div>

          {/* Alternative Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              icon={<ArrowLeftIcon className="w-5 h-5" />}
              className="min-w-[160px]"
            >
              {t('errors.network.goBack', 'Go Back')}
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              size="lg"
              icon={<HomeIcon className="w-5 h-5" />}
              className="min-w-[160px]"
            >
              {t('errors.network.goHome', 'Go Home')}
            </Button>
          </div>

          {/* Status Information */}
          <div className={`mb-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.network.statusTitle', 'Connection Status')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100/70'
              }`}>
                <div className="text-2xl mb-2">🔄</div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {t('errors.network.status.retry', 'Retry Count')}
                </div>
                <div className={`text-lg font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {retryCount}
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100/70'
              }`}>
                <div className="text-2xl mb-2">⏱️</div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {t('errors.network.status.time', 'Time')}
                </div>
                <div className={`text-lg font-bold ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100/70'
              }`}>
                <div className="text-2xl mb-2">📊</div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {t('errors.network.status.status', 'Status')}
                </div>
                <div className={`text-lg font-bold ${
                  connectionStatus === 'connected' 
                    ? (isDark ? 'text-green-400' : 'text-green-600')
                    : connectionStatus === 'checking'
                    ? (isDark ? 'text-yellow-400' : 'text-yellow-600')
                    : (isDark ? 'text-red-400' : 'text-red-600')
                }`}>
                  {connectionStatus === 'connected' 
                    ? t('errors.network.status.connected', 'Connected')
                    : connectionStatus === 'checking'
                    ? t('errors.network.status.checking', 'Checking')
                    : t('errors.network.status.disconnected', 'Disconnected')
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className={`mt-8 p-4 rounded-xl ${
            isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'
          }`}>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('errors.network.helpText', 'Still having connection issues?')}{' '}
              <Link 
                to="/contact" 
                className={`font-medium hover:underline ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {t('errors.network.contactUs', 'Contact our support team')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorPage;
