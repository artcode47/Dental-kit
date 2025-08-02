import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  HomeIcon, 
  UserIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  CogIcon,
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const userMenuItems = [
    { path: '/dashboard', icon: HomeIcon, label: t('nav.dashboard') },
    { path: '/profile', icon: UserIcon, label: t('nav.profile') },
    { path: '/orders', icon: ShoppingBagIcon, label: t('nav.orders') },
    { path: '/wishlist', icon: HeartIcon, label: t('nav.wishlist') },
    { path: '/settings', icon: CogIcon, label: t('nav.settings') },
  ];

  const adminMenuItems = [
    { path: '/admin', icon: ChartBarIcon, label: t('nav.adminDashboard') },
    { path: '/admin/users', icon: UsersIcon, label: t('nav.adminUsers') },
    { path: '/admin/products', icon: CubeIcon, label: t('nav.adminProducts') },
    { path: '/admin/orders', icon: ShoppingCartIcon, label: t('nav.adminOrders') },
    { path: '/admin/categories', icon: CubeIcon, label: t('nav.adminCategories') },
  ];

  const vendorMenuItems = [
    { path: '/vendor', icon: ChartBarIcon, label: t('nav.vendorDashboard') },
    { path: '/vendor/products', icon: CubeIcon, label: t('nav.vendorProducts') },
    { path: '/vendor/orders', icon: ShoppingCartIcon, label: t('nav.vendorOrders') },
  ];

  const getMenuItems = () => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      return adminMenuItems;
    } else if (user?.role === 'vendor') {
      return vendorMenuItems;
    }
    return userMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full ${isRTL ? 'border-l border-r-0' : ''}`}>
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 