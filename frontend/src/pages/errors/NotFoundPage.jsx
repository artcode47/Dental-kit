import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import {
  HomeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  MapIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';

const NotFoundPage = () => {
  const { t } = useTranslation('ecommerce');
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 ${
          isDark ? 'bg-blue-400' : 'bg-blue-300'
        } blur-3xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 ${
          isDark ? 'bg-purple-400' : 'bg-purple-300'
        } blur-3xl`}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className={`max-w-4xl w-full text-center transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          {/* Main Error Display */}
          <div className="mb-12">
            {/* 404 Number with Animation */}
            <div className="relative mb-8">
              <h1 className={`text-9xl md:text-[12rem] font-black tracking-tighter ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-500 to-red-600' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-600 to-red-700'
              }`}>
                404
              </h1>
              
              {/* Floating Elements */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <SparklesIcon className={`w-8 h-8 animate-bounce ${
                  isDark ? 'text-yellow-400' : 'text-yellow-500'
                }`} />
              </div>
              
              <div className="absolute top-1/2 right-0 transform translate-y-1/2 translate-x-4">
                <ExclamationTriangleIcon className={`w-6 h-6 animate-pulse ${
                  isDark ? 'text-orange-400' : 'text-orange-500'
                }`} />
              </div>
            </div>

            {/* Error Message */}
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.notFound.title', 'Page Not Found')}
            </h2>
            
            <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t('errors.notFound.description', 'Oops! The page you\'re looking for seems to have wandered off. It might have been moved, deleted, or you entered the wrong URL.')}
            </p>
          </div>

          {/* Search Section */}
          <div className={`mb-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.notFound.searchTitle', 'Looking for something specific?')}
            </h3>
            
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('errors.notFound.searchPlaceholder', 'Search our products...')}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="mt-4 w-full"
                disabled={!searchQuery.trim()}
              >
                {t('errors.notFound.searchButton', 'Search Products')}
              </Button>
            </form>
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
              {t('errors.notFound.goBack', 'Go Back')}
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="primary"
              size="lg"
              icon={<HomeIcon className="w-5 h-5" />}
              className="min-w-[160px]"
            >
              {t('errors.notFound.goHome', 'Go Home')}
            </Button>
          </div>

          {/* Quick Links */}
          <div className={`p-6 rounded-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700/50' 
              : 'bg-white/70 border border-gray-200/50 shadow-xl'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('errors.notFound.quickLinksTitle', 'Popular Pages')}
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
              {t('errors.notFound.helpText', 'Still can\'t find what you\'re looking for?')}{' '}
              <Link 
                to="/contact" 
                className={`font-medium hover:underline ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {t('errors.notFound.contactUs', 'Contact our support team')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
