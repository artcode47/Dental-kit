import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { Bars3Icon, XMarkIcon, HomeIcon, CubeIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const VendorSidebar = () => {
  const { t } = useTranslation('admin');
  const { isRTL } = useLanguage();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/vendor/dashboard', icon: HomeIcon, label: t('vendor.dashboard.title') },
    { path: '/vendor/products', icon: CubeIcon, label: t('vendor.products.title') },
    { path: '/vendor/orders', icon: ShoppingCartIcon, label: t('vendor.orders.title') }
  ];

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-[1001]">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 z-[1002] h-screen transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        w-64 bg-white/95 dark:bg-gray-900/95 border-r border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md
        ${isRTL ? 'lg:border-l lg:border-r-0' : ''}
      `}>
        <div className="flex items-center justify-center p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/10 dark:to-blue-900/10">
          <div className="text-center">
            <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Vendor</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('panel.subtitle')}</p>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 text-sky-700 dark:text-sky-300 border-r-2 border-sky-600 dark:border-sky-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive(item.path) && <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default VendorSidebar;


