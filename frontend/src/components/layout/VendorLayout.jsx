import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import VendorHeader from './VendorHeader';
import VendorSidebar from './VendorSidebar';

const VendorLayout = ({ children }) => {
  const { isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="relative">
        <VendorHeader />
      </div>
      <div className="flex">
        <VendorSidebar />
        <main className="flex-1 lg:ml-50 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;




