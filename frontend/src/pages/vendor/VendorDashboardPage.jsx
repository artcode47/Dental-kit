import React from 'react';
import { useTranslation } from 'react-i18next';

const VendorDashboardPage = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('vendor.dashboard.title')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('vendor.dashboard.totalProducts')}
          </h3>
          <p className="text-3xl font-bold text-blue-600">123</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('vendor.dashboard.totalOrders')}
          </h3>
          <p className="text-3xl font-bold text-green-600">456</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('vendor.dashboard.revenue')}
          </h3>
          <p className="text-3xl font-bold text-purple-600">$7,890</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('vendor.dashboard.rating')}
          </h3>
          <p className="text-3xl font-bold text-orange-600">4.8</p>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage; 