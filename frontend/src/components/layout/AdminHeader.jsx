import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  BellIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeToggle from '../common/ThemeToggle';

const AdminHeader = () => {
  const { t } = useTranslation('admin');
  const { user, logout } = useAuth();
  const { isRTL } = useLanguage();
  const { currentTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 relative z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={currentTheme === 'dark' ? '/Logo Page Darkmode.png' : '/Logo Page Lightmode.png'}
                  alt="DentalKit Admin Logo"
                  className="h-12 w-auto transition-all duration-300"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  DentalKit Management
                </p>
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher variant="dropdown" size="sm" showFlags={true} showNames={false} />
            </div>

            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle variant="toggle" size="md" />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={toggleNotifications}
                className="p-3 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              >
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg"></span>
              </button>

              {/* Notifications dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50 backdrop-blur-sm">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t('header.notifications')}
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          {t('header.noNotifications')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-teal">
                  <ShieldCheckIcon className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.firstName || user?.email || t('nav.admin')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role ? t(`roles.${user.role}`) : t('roles.admin')}
                  </p>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </button>

              {/* Profile dropdown menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50 backdrop-blur-sm">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.firstName || user?.email || t('nav.admin')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          // Navigate to profile settings
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <UserCircleIcon className="h-4 w-4 mr-3 text-gray-400" />
                        {t('header.profile')}
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          // Navigate to settings
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <CogIcon className="h-4 w-4 mr-3 text-gray-400" />
                        {t('header.settings')}
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-2">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        {t('header.logout')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 