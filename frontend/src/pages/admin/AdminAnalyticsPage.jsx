import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  StarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getAnalytics, getDashboardStats } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const AdminAnalyticsPage = () => {
  const { t } = useTranslation('admin');
  const [analytics, setAnalytics] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChart, setSelectedChart] = useState('revenue');

  const Chart = ({ data = [], xKey, yKey, stroke = '#2563eb', fill = 'rgba(37,99,235,0.15)' }) => {
    const width = 600;
    const height = 200;
    const padding = 32;
    if (!data || data.length === 0) {
      return (
        <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">{t('admin.analytics.chartPlaceholder')}</p>
          </div>
        </div>
      );
    }

    const values = data.map(d => Number(d[yKey] || 0));
    const maxY = Math.max(...values, 1);
    const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);

    const points = data.map((d, i) => {
      const x = padding + i * stepX;
      const y = padding + (height - padding * 2) * (1 - (Number(d[yKey] || 0) / maxY));
      return `${x},${y}`;
    }).join(' ');

    const areaPath = () => {
      const firstPoint = points.split(' ')[0];
      const lastPoint = points.split(' ')[points.split(' ').length - 1];
      const [lastX] = lastPoint.split(',').map(Number);
      return `M ${firstPoint} L ${points.replace(/^\S+\s/, '')} L ${lastX} ${height - padding} L ${padding} ${height - padding} Z`;
    };

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="none" />
        <g>
          {/* Y-axis grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
            <line key={idx} x1={padding} x2={width - padding} y1={padding + (height - padding * 2) * p} y2={padding + (height - padding * 2) * p} stroke="#e5e7eb" className="dark:stroke-gray-600" strokeWidth="1" />
          ))}
        </g>
        <path d={areaPath()} fill="url(#grad)" />
        <polyline fill="none" stroke={stroke} strokeWidth="2.5" points={points} />
      </svg>
    );
  };

  // Fetch analytics on component mount
  useEffect(() => {
    fetchAnalytics();
    fetchDashboardStats();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getAnalytics(selectedPeriod);
      setAnalytics(response);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      setDashboardStats(response);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleRefresh = () => {
    fetchAnalytics();
    fetchDashboardStats();
    toast.success(t('admin.analytics.refreshSuccess'));
  };

  const handleExport = (type) => {
    // Implement export functionality
    toast.success(`${type} export started`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-2">
            {t('admin.analytics.errorLoading')}
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            {t('admin.analytics.retry')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.analytics.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.analytics.subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
              <ArrowPathIcon className="h-5 w-5" />
              {t('admin.analytics.refresh')}
            </Button>
            <Button variant="outline" onClick={() => handleExport('PDF')} className="flex items-center gap-2">
              <ArrowDownTrayIcon className="h-5 w-5" />
              {t('admin.analytics.exportPDF')}
            </Button>
            <Button onClick={() => handleExport('Excel')} className="flex items-center gap-2">
              <ArrowDownTrayIcon className="h-5 w-5" />
              {t('admin.analytics.exportExcel')}
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('admin.analytics.timePeriod')}
            </h2>
            <div className="flex gap-2">
              {[
                { value: '7d', label: t('admin.analytics.last7Days') },
                { value: '30d', label: t('admin.analytics.last30Days') },
                { value: '90d', label: t('admin.analytics.last90Days') },
                { value: '1y', label: t('admin.analytics.lastYear') }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.analytics.totalRevenue')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(dashboardStats.overview?.totalRevenue || 0)}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm font-medium ${getGrowthColor(12.5)}`}>
                      +12.5%
                    </span>
                    <ArrowUpIcon className="h-4 w-4 ml-1 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCartIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.analytics.totalOrders')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(dashboardStats.overview?.totalOrders || 0)}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm font-medium ${getGrowthColor(8.2)}`}>
                      +8.2%
                    </span>
                    <ArrowUpIcon className="h-4 w-4 ml-1 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.analytics.totalUsers')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(dashboardStats.overview?.totalUsers || 0)}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm font-medium ${getGrowthColor(15.3)}`}>
                      +15.3%
                    </span>
                    <ArrowUpIcon className="h-4 w-4 ml-1 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <StarIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.analytics.avgRating')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    4.8/5.0
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm font-medium ${getGrowthColor(2.1)}`}>
                      +2.1%
                    </span>
                    <ArrowUpIcon className="h-4 w-4 ml-1 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue/Orders Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('admin.analytics.revenueChart')}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedChart('revenue')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedChart === 'revenue'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('admin.analytics.revenue')}
                </button>
                <button
                  onClick={() => setSelectedChart('orders')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedChart === 'orders'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('admin.analytics.orders')}
                </button>
              </div>
            </div>
            
            {selectedChart === 'revenue' ? (
              <Chart data={(analytics?.salesAnalytics || []).sort((a,b)=> new Date(a.date)-new Date(b.date))} xKey="date" yKey="revenue" />
            ) : (
              <Chart data={(analytics?.salesAnalytics || []).sort((a,b)=> new Date(a.date)-new Date(b.date))} xKey="date" yKey="orders" stroke="#16a34a" fill="rgba(22,163,74,0.15)" />
            )}
          </div>

          {/* User Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('admin.analytics.userGrowth')}
              </h3>
                                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            
            <Chart data={(analytics?.userAnalytics || []).sort((a,b)=> new Date(a.date)-new Date(b.date))} xKey="date" yKey="newUsers" stroke="#9333ea" fill="rgba(147,51,234,0.15)" />
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('admin.analytics.topProducts')}
            </h3>
            <div className="space-y-4">
              {dashboardStats?.topProducts?.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatNumber(product.sold || product.totalSold)} {t('admin.analytics.sold')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(product.revenue || product.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('admin.analytics.categoryPerformance')}
            </h3>
            <div className="space-y-4">
              {dashboardStats?.revenueByCategory?.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.categoryName || category.category}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatNumber(category.orders)} {t('admin.analytics.orders')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(category.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('admin.analytics.recentActivity')}
            </h3>
            <div className="space-y-4">
              {dashboardStats?.recentOrders?.slice(0, 5).map((order, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <ShoppingCartIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.orderNumber || order.id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(order.total || order.amount)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {t(`admin.orders.status.${order.status}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.analytics.summary')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics?.salesAnalytics?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.analytics.totalSales')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics?.salesAnalytics?.reduce((sum, item) => sum + (item.orders || 0), 0) || 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.analytics.totalOrders')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics?.userAnalytics?.reduce((sum, item) => sum + (item.newUsers || 0), 0) || 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.analytics.newUsers')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics?.salesAnalytics?.reduce((sum, item) => sum + (item.revenue || 0), 0) / 
                               Math.max(analytics?.salesAnalytics?.reduce((sum, item) => sum + (item.orders || 0), 0), 1) || 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.analytics.avgOrderValue')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage; 