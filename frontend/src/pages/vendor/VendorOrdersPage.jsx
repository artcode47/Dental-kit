import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VendorLayout from '../../components/layout/VendorLayout';
import api, { endpoints } from '../../services/api';

const VendorOrdersPage = () => {
  const { t } = useTranslation('admin');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get(endpoints.vendors.me.orders);
        setOrders(data.orders || []);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <VendorLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t('vendor.orders.title')}
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            {loading ? (
              <p className="text-gray-600 dark:text-gray-300">Loading...</p>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900 dark:text-white">Order #{o.orderNumber || o.id}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Status: {o.status}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Total: ${o.total}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorOrdersPage; 