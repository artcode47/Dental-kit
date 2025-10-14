import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CubeIcon, 
  ShoppingCartIcon,
  TagIcon,
  CogIcon,
  BellIcon,
  ChartPieIcon,
  DocumentTextIcon,
  CreditCardIcon,
  GiftIcon,
  StarIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const { t } = useTranslation('admin');
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const adminMenuItems = [
    { 
      path: '/admin', 
      icon: HomeIcon, 
      label: t('sidebar.dashboard'),
      description: t('sidebar.dashboardDesc')
    },
    { 
      path: '/admin/users', 
      icon: UsersIcon, 
      label: t('sidebar.users'),
      description: t('sidebar.usersDesc')
    },
    { 
      path: '/admin/products', 
      icon: CubeIcon, 
      label: t('sidebar.products'),
      description: t('sidebar.productsDesc')
    },
    { 
      path: '/admin/orders', 
      icon: ShoppingCartIcon, 
      label: t('sidebar.orders'),
      description: t('sidebar.ordersDesc')
    },
    { 
      path: '/admin/categories', 
      icon: TagIcon, 
      label: t('sidebar.categories'),
      description: t('sidebar.categoriesDesc')
    },
    { 
      path: '/admin/packages', 
      icon: CubeIcon, 
      label: t('sidebar.packages'),
      description: t('sidebar.packagesDesc')
    },
    { 
      path: '/admin/vendors', 
      icon: UsersIcon, 
      label: t('sidebar.vendors'),
      description: t('sidebar.vendorsDesc')
    },
    { 
      path: '/admin/reviews', 
      icon: StarIcon, 
      label: t('sidebar.reviews'),
      description: t('sidebar.reviewsDesc')
    },
    { 
      path: '/admin/coupons', 
      icon: CreditCardIcon, 
      label: t('sidebar.coupons'),
      description: t('sidebar.couponsDesc')
    },
    { 
      path: '/admin/gift-cards', 
      icon: GiftIcon, 
      label: t('sidebar.giftCards'),
      description: t('sidebar.giftCardsDesc')
    },
    { 
      path: '/admin/analytics', 
      icon: ChartPieIcon, 
      label: t('sidebar.analytics'),
      description: t('sidebar.analyticsDesc')
    },
    { 
      path: '/admin/reports', 
      icon: DocumentTextIcon, 
      label: t('sidebar.reports'),
      description: t('sidebar.reportsDesc')
    },
    { 
      path: '/admin/settings', 
      icon: CogIcon, 
      label: t('sidebar.settings'),
      description: t('sidebar.settingsDesc')
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        w-64 bg-white/95 dark:bg-gray-900/95 border-r border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md
        ${isRTL ? 'lg:border-l lg:border-r-0' : ''}
      `}>
        {/* Simplified Header - No Logo or Branding */}
        <div className="flex items-center justify-center p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/10 dark:to-blue-900/10">
          <div className="text-center">
            <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              {t('panel.title')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('panel.subtitle')}
            </p>
          </div>
        </div>

        {/* Navigation with Enhanced Scrollbar */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 text-sky-700 dark:text-sky-300 border-r-2 border-sky-600 dark:border-sky-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
                title={item.description}
              >
                <Icon className={`
                  h-5 w-5 transition-all duration-200
                  ${isActive(item.path)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }
                  ${isRTL ? 'ml-3' : 'mr-3'}
                `} />
                <span className="flex-1">{item.label}</span>
                {isActive(item.path) && (
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Simplified Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-sky-50/95 to-blue-50/95 dark:from-sky-900/10 dark:to-blue-900/10 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
              <UsersIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.firstName || user?.email || t('nav.admin')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role ? t(`roles.${user.role}`) : t('roles.admin')}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar; 