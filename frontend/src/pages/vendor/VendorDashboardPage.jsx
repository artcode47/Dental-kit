import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { endpoints } from '../../services/api';
import VendorLayout from '../../components/layout/VendorLayout';

const VendorDashboardPage = () => {
  const { t } = useTranslation('admin');

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get(endpoints.vendors.me.stats);
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <VendorLayout>
      <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('vendor.dashboard.title')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('vendor.dashboard.totalProducts')}
          </h3>
          <p className="text-3xl font-bold text-blue-600">{loading ? '...' : stats?.totals?.products || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('vendor.dashboard.totalOrders')}
          </h3>
          <p className="text-3xl font-bold text-green-600">{loading ? '...' : stats?.totals?.totalOrders || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('vendor.dashboard.revenue')}
          </h3>
          <p className="text-3xl font-bold text-purple-600">{loading ? '...' : `$${(stats?.totals?.totalSales || 0).toFixed(2)}`}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('vendor.dashboard.rating')}
          </h3>
          <p className="text-3xl font-bold text-orange-600">—</p>
        </div>
      </div>
      </div>
    </VendorLayout>
  );
};

export default VendorDashboardPage; 