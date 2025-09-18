import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  const { isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 lg:ml-50 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 