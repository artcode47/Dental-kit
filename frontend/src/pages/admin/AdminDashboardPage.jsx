import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import Chart from '../../components/admin/Chart';
import RecentActivity from '../../components/admin/RecentActivity';
import QuickActions from '../../components/admin/QuickActions';
import { 
  UsersIcon, 
  CubeIcon, 
  ShoppingCartIcon, 
  CurrencyDollarIcon,
  TagIcon,
  UserGroupIcon,
  StarIcon,
  CreditCardIcon,
  GiftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { getDashboardStats, getAnalytics } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch real data from backend
        const [stats, analytics] = await Promise.all([
          getDashboardStats(),
          getAnalytics(selectedPeriod)
        ]);
        
        setDashboardData(stats);
        setAnalyticsData(analytics);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

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
            {t('admin.dashboard.errorLoading')}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {error}
          </p>
        </div>
      </AdminLayout>
    );
  }

  const statsCards = [
    {
      title: t('admin.dashboard.totalUsers'),
      value: dashboardData?.overview?.totalUsers || 0,
      change: 12,
      changeType: 'positive',
      icon: UsersIcon,
      color: 'blue',
      format: 'number',
      trend: 'up'
    },
    {
      title: t('admin.dashboard.totalProducts'),
      value: dashboardData?.overview?.totalProducts || 0,
      change: 8,
      changeType: 'positive',
      icon: CubeIcon,
      color: 'green',
      format: 'number',
      trend: 'up'
    },
    {
      title: t('admin.dashboard.totalOrders'),
      value: dashboardData?.overview?.totalOrders || 0,
      change: 15,
      changeType: 'positive',
      icon: ShoppingCartIcon,
      color: 'purple',
      format: 'number',
      trend: 'up'
    },
    {
      title: t('admin.dashboard.revenue'),
      value: dashboardData?.overview?.totalRevenue || 0,
      change: 23,
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'yellow',
      format: 'currency',
      trend: 'up'
    },
    {
      title: t('admin.dashboard.totalCategories'),
      value: dashboardData?.overview?.totalCategories || 0,
      change: 5,
      changeType: 'positive',
      icon: TagIcon,
      color: 'indigo',
      format: 'number',
      trend: 'up'
    },
    {
      title: t('admin.dashboard.totalVendors'),
      value: dashboardData?.overview?.totalVendors || 0,
      change: 3,
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'red',
      format: 'number',
      trend: 'up'
    },
    {
      title: t('admin.dashboard.totalReviews'),
      value: dashboardData?.overview?.totalReviews || 0,
      change: 18,
      changeType: 'positive',
      icon: StarIcon,
      color: 'yellow',
      format: 'number',
      trend: 'up'
    },
    {
      title: t('admin.dashboard.totalCoupons'),
      value: dashboardData?.overview?.totalCoupons || 0,
      change: -2,
      changeType: 'negative',
      icon: CreditCardIcon,
      color: 'green',
      format: 'number',
      trend: 'down'
    }
  ];

  const weeklyChartData = dashboardData?.weeklyTrends?.map(day => ({
    label: new Date(day._id?.year, 0, day._id?.day).toLocaleDateString('en-US', { weekday: 'short' }),
    value: day.revenue || 0
  })) || [];

  const categoryChartData = dashboardData?.revenueByCategory?.map(cat => ({
    label: cat.categoryName,
    value: cat.revenue || 0
  })) || [];

  const recentActivities = dashboardData?.recentOrders?.map(order => ({
    type: 'order',
    title: `Order ${order._id}`,
    description: `${order.user?.firstName} ${order.user?.lastName} - $${order.total}`,
    timestamp: order.createdAt,
    status: order.status
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Enhanced Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {t('admin.dashboard.title')}
              </h1>
              <p className="text-blue-100 mt-1">
                {t('admin.dashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-sm text-blue-100">{t('admin.dashboard.lastUpdated')}</div>
                <div className="font-semibold">{new Date().toLocaleDateString()}</div>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.slice(0, 4).map((stat, index) => (
            <div key={index} className="transform hover:scale-105 transition-transform duration-200">
              <StatsCard {...stat} />
            </div>
          ))}
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.slice(4).map((stat, index) => (
            <div key={index} className="transform hover:scale-105 transition-transform duration-200">
              <StatsCard {...stat} />
            </div>
          ))}
        </div>

        {/* Enhanced Charts and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Revenue Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
              <Chart
                title={t('admin.dashboard.weeklyRevenue')}
                data={weeklyChartData}
                type="line"
                height={300}
                color="blue"
              />
            </div>
          </div>

          {/* Enhanced Recent Activity */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
              <RecentActivity activities={recentActivities} />
            </div>
          </div>
        </div>

        {/* Enhanced Revenue by Category and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
              <Chart
                title={t('admin.dashboard.revenueByCategory')}
                data={categoryChartData}
                type="bar"
                height={300}
                color="green"
              />
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
              <QuickActions />
            </div>
          </div>
        </div>

        {/* Enhanced Top Products and Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                 <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
                 {t('admin.dashboard.topProducts')}
               </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {dashboardData?.topProducts?.length || 0} {t('admin.dashboard.products')}
              </span>
            </div>
            <div className="space-y-3">
              {dashboardData?.topProducts?.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('admin.dashboard.sold')}: {product.totalSold || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      ${product.totalRevenue || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {((product.totalRevenue / (dashboardData?.overview?.totalRevenue || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Low Stock Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                {t('admin.dashboard.lowStockAlerts')}
              </h3>
              <span className="text-sm text-red-500 dark:text-red-400 font-medium">
                {dashboardData?.lowStockProducts?.length || 0} {t('admin.dashboard.alerts')}
              </span>
            </div>
            <div className="space-y-3">
              {dashboardData?.lowStockProducts?.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        !
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {t('admin.dashboard.stock')}: {product.stock}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${product.price}
                    </p>
                    <p className="text-xs text-red-500 dark:text-red-400">
                      {product.stock <= 5 ? 'Critical' : 'Low'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('admin.dashboard.avgOrderValue')}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${((dashboardData?.overview?.totalRevenue || 0) / (dashboardData?.overview?.totalOrders || 1)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('admin.dashboard.conversionRate')}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {((dashboardData?.overview?.totalOrders || 0) / (dashboardData?.overview?.totalUsers || 1) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <StarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('admin.dashboard.avgRating')}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  4.8
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage; 