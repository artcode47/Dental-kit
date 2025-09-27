import React, { useEffect, useState } from 'react';
import Seo from '../components/seo/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import api, { endpoints } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const OrdersPage = () => {
  const { t } = useTranslation('ecommerce');
  const { currentLanguage } = useLanguage();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(endpoints.orders.list);
        const data = res?.data?.orders || res?.orders || [];
        if (active) setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setError(t('orders.error.fetchingOrders'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Seo
        title={t('seo.orders.title', 'Orders')}
        description={t('seo.orders.description', 'View your orders and track statuses')}
        type="website"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={currentTheme === 'dark' ? '#0B1220' : '#FFFFFF'}
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 py-14 relative">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('orders.title')}</h1>
          <p className="opacity-90">{t('orders.subtitle', { count: orders.length })}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="max-w-xl mx-auto text-center bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow p-6">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="primary">{t('orders.error.retry')}</Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="max-w-xl mx-auto text-center bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('orders.empty.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t('orders.empty.description')}</p>
            <Button onClick={() => navigate('/products')} variant="primary">{t('orders.startShopping')}</Button>
          </div>
        )}

        {/* Orders Grid */}
        {!loading && !error && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.id || order._id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">{t('orders.orderNumber')} #{order.id}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {t(`orders.status.${order.status}`)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {(order.items || []).slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img src={getImageUrl(item?.image)} alt={item?.name || 'Product'} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">{t('orders.quantity')}: {item.quantity}</p>
                        </div>
                        <div className="ml-auto text-sm font-semibold text-gray-900 dark:text-white">${(item.price || 0).toFixed(2)}</div>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-xs text-gray-500">+{order.items.length - 2} {t('orders.moreItems')}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-300">{t('orders.orderTotal') || t('orders.orderSummary.total', 'Total')}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">${(order.total || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50/60 dark:bg-gray-900/40 rounded-b-2xl flex items-center gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => navigate(`/orders/${order.id}`)}>{t('orders.viewDetails')}</Button>
                  <Button variant="primary" className="flex-1" onClick={() => navigate(`/orders/${order.id}`)}>{t('orders.trackOrder')}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 