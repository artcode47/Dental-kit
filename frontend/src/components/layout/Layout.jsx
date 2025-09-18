import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import Seo from '../seo/Seo';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import AdminLayout from './AdminLayout';

const Layout = ({ children, showHeader = true, showFooter = true, showSidebar = false }) => {
  const { isAuthenticated, userRole } = useAuth();
  const { isRTL, currentLanguage } = useLanguage();
  const { currentTheme } = useTheme();
  const location = useLocation();

  const canonical = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', currentLanguage);
    url.searchParams.set('theme', currentTheme);
    return url.toString();
  }, [location.key, currentLanguage, currentTheme]);

  // Use AdminLayout for admin routes
  if (location.pathname.startsWith('/admin')) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Determine if we should show sidebar based on route and user role
  const shouldShowSidebar = showSidebar || 
    (isAuthenticated && (
      location.pathname.startsWith('/vendor') ||
      location.pathname.startsWith('/dashboard')
    ));

  // Determine sidebar type
  const getSidebarType = () => {
    if (location.pathname.startsWith('/vendor')) return 'vendor';
    if (location.pathname.startsWith('/dashboard')) return 'user';
    return 'default';
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Seo url={canonical} />
      {showHeader && <Header />}
      
      <div className="flex">
        {shouldShowSidebar && (
          <Sidebar type={getSidebarType()} />
        )}
        
        <main className={`flex-1 ${shouldShowSidebar ? 'lg:ml-64' : ''}`}>
          <div className="w-full px-4 py-8">
            {children}
          </div>
        </main>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout; 