import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import {
  HomeIcon,
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CogIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';

const MaintenancePage = () => {
  const { t } = useTranslation('ecommerce');
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('2-3 hours');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleSubscribe = () => {
    setIsSubscribed(true);
    // TODO: Implement actual notification subscription
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-yellow-900/20 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 ${
          isDark ? 'bg-yellow-400' : 'bg-yellow-300'
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
            {/* Maintenance Icon with Animation */}
            <div className="relative mb-8">
              <div className={`text-9xl md:text-[12rem] font-black tracking-tighter ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-600 to-yellow-700'
              }`}>
                🔧
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <WrenchScrewdriverIcon className={`w-8 h-8 animate-bounce ${
                  isDark ? 'text-yellow-400' : 'text-yellow-500'
                }`} />
              </div>
              
              <div className="absolute top-1/2 right-0 transform translate-y-1/2 translate-x-4">
                <CogIcon className={`w-6 h-6 animate-spin ${
                  isDark ? 'text-orange-400' : 'text-orange-500'
                }`} />
              </div>
            </div>

            {/* Error Message */}
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.maintenance.title', 'Under Maintenance')}
            </h2>
            
            <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t('errors.maintenance.description', 'We\'re currently performing some maintenance on our site. We\'ll be back shortly! Thank you for your patience.')}
            </p>
          </div>

          {/* Maintenance Details */}
          <div className={`mb-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <ClockIcon className={`w-6 h-6 ${
                  isDark ? 'text-blue-400' : 'text-blue-500'
                }`} />
              </div>
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.maintenance.estimatedTime', 'Estimated Completion Time')}
            </h3>
            
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('errors.maintenance.estimatedTimeDescription', 'We expect to complete the maintenance in approximately')} <span className="font-semibold">{estimatedTime}</span>
            </p>
          </div>

          {/* Current Status */}
          <div className={`mb-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.maintenance.statusTitle', 'Current Status')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100/70'
              }`}>
                <div className="text-2xl mb-2">🕐</div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {t('errors.maintenance.status.currentTime', 'Current Time')}
                </div>
                <div className={`text-lg font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100/70'
              }`}>
                <div className="text-2xl mb-2">📅</div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {t('errors.maintenance.status.date', 'Date')}
                </div>
                <div className={`text-lg font-bold ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  {currentTime.toLocaleDateString()}
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-100/70'
              }`}>
                <div className="text-2xl mb-2">⏱️</div>
                <div className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {t('errors.maintenance.status.estimated', 'Estimated')}
                </div>
                <div className={`text-lg font-bold ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {estimatedTime}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Subscription */}
          <div className={`mb-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <BellIcon className={`w-6 h-6 ${
                  isDark ? 'text-green-400' : 'text-green-500'
                }`} />
              </div>
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.maintenance.notificationTitle', 'Get Notified')}
            </h3>
            
            <p className={`text-sm mb-4 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('errors.maintenance.notificationDescription', 'We\'ll notify you when the maintenance is complete and the site is back online.')}
            </p>
            
            <Button
              onClick={handleSubscribe}
              variant={isSubscribed ? "success" : "primary"}
              size="lg"
              icon={<BellIcon className="w-5 h-5" />}
              className="min-w-[200px]"
              disabled={isSubscribed}
            >
              {isSubscribed 
                ? t('errors.maintenance.subscribed', 'Subscribed!')
                : t('errors.maintenance.subscribe', 'Notify Me When Ready')
              }
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={handleRefresh}
              variant="primary"
              size="lg"
              icon={<CogIcon className="w-5 h-5" />}
              className="min-w-[160px]"
            >
              {t('errors.maintenance.refresh', 'Check Status')}
            </Button>
            
            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              icon={<ArrowLeftIcon className="w-5 h-5" />}
              className="min-w-[160px]"
            >
              {t('errors.maintenance.goBack', 'Go Back')}
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              size="lg"
              icon={<HomeIcon className="w-5 h-5" />}
              className="min-w-[160px]"
            >
              {t('errors.maintenance.goHome', 'Go Home')}
            </Button>
          </div>

          {/* What We're Working On */}
          <div className={`mb-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.maintenance.workTitle', 'What We\'re Working On')}
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
                    {t('errors.maintenance.work.server', 'Server Updates')}
                  </span>
                </div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('errors.maintenance.work.serverDesc', 'Updating our server infrastructure for better performance')}
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
                    {t('errors.maintenance.work.security', 'Security Enhancements')}
                  </span>
                </div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('errors.maintenance.work.securityDesc', 'Implementing the latest security measures')}
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
                    {t('errors.maintenance.work.features', 'New Features')}
                  </span>
                </div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('errors.maintenance.work.featuresDesc', 'Adding exciting new features to improve your experience')}
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
                    {t('errors.maintenance.work.performance', 'Performance')}
                  </span>
                </div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('errors.maintenance.work.performanceDesc', 'Optimizing site speed and responsiveness')}
                </p>
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
              {t('errors.maintenance.helpText', 'Have urgent questions?')}{' '}
              <Link 
                to="/contact" 
                className={`font-medium hover:underline ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {t('errors.maintenance.contactUs', 'Contact our support team')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
