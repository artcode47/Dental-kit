import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import AdminLayout from './AdminLayout';

const Layout = ({ children, showHeader = true, showFooter = true, showSidebar = false }) => {
  const { isAuthenticated, userRole } = useAuth();
  const { isRTL } = useLanguage();
  const location = useLocation();

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
      {showHeader && <Header />}
      
      <div className="flex">
        {shouldShowSidebar && (
          <Sidebar type={getSidebarType()} />
        )}
        
        <main className={`flex-1 ${shouldShowSidebar ? 'lg:ml-64' : ''}`}>
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout; 