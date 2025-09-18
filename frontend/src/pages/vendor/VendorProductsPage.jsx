import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/layout/Layout';

const VendorProductsPage = () => {
  const { t } = useTranslation('admin');

  return (
    <Layout showSidebar={true}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t('vendor.products.title')}
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300">
              {t('vendor.products.comingSoon')}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VendorProductsPage; 