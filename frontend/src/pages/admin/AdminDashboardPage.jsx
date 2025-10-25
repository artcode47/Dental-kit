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
  ArrowDownIcon,
  CalendarIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { getDashboardStats } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboardPage = () => {
  const { t, i18n } = useTranslation('admin');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch real data from backend
        const stats = await getDashboardStats();
        
        setDashboardData(stats);
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
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-md mx-auto">
                          <div className="text-red-600 text-lg font-medium mb-2">
                {t('dashboard.errorLoading')}
              </div>
            <p className="text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const derivedTotals = {
    totalCategories: dashboardData?.overview?.totalCategories ?? (dashboardData?.revenueByCategory?.length || 0),
    totalVendors: dashboardData?.overview?.totalVendors ?? 0
  };

  const statsCards = [
    {
      title: t('dashboard.totalUsers'),
      value: dashboardData?.overview?.totalUsers || 0,
      change: 12,
      changeType: 'positive',
      icon: UsersIcon,
      color: 'blue',
      format: 'number',
      trend: 'up'
    },
    {
      title: t('dashboard.totalProducts'),
      value: dashboardData?.overview?.totalProducts || 0,
      change: 8,
      changeType: 'positive',
      icon: CubeIcon,
      color: 'green',
      format: 'number',
      trend: 'up'
    },
    {
      title: t('dashboard.totalOrders'),
      value: dashboardData?.overview?.totalOrders || 0,
      change: 15,
      changeType: 'positive',
      icon: ShoppingCartIcon,
      color: 'purple',
      format: 'number',
      trend: 'up'
    },
    {
      title: t('dashboard.revenue'),
      value: dashboardData?.overview?.totalRevenue || 0,
      change: 23,
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'yellow',
      format: 'currency',
      trend: 'up'
    },
    {
      title: t('dashboard.totalCategories'),
      value: derivedTotals.totalCategories,
      change: 5,
      changeType: 'positive',
      icon: TagIcon,
      color: 'indigo',
      format: 'number',
      trend: 'up'
    },
    {
      title: t('dashboard.totalVendors'),
      value: derivedTotals.totalVendors,
      change: 3,
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'red',
      format: 'number',
      trend: 'up'
    }
  ];

  const weeklyChartData = dashboardData?.weeklyTrends?.map(day => ({
    label: new Date(day.date).toLocaleDateString(i18n.language, { weekday: 'short' }),
    value: day.revenue || 0
  })) || [];

  const categoryChartData = dashboardData?.revenueByCategory?.map(cat => ({
    label: cat.category || cat.categoryName,
    value: cat.revenue || 0
  })) || [];

  const recentActivities = dashboardData?.recentOrders?.map(order => ({
    type: 'order',
    title: `Order ${order.id}`,
    description: `${order.total} EGP`,
    timestamp: order.createdAt,
    status: order.status
  })) || [];

  return (
    <AdminLayout>
      {/* Main Dashboard Container - Natural Flow, No Height Constraints */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-6">
          {/* Enhanced Mobile-Responsive Header */}
          <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  {t('dashboard.title')}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  {t('dashboard.subtitle')}
                </p>
              </div>
              
              {/* Mobile Menu Toggle */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="bg-white/20 rounded-lg p-2 hover:bg-white/30 transition-colors"
                >
                  <CogIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Desktop Controls */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <div className="text-sm text-blue-100">{t('dashboard.lastUpdated')}</div>
                  <div className="font-semibold">{new Date().toLocaleDateString(i18n.language)}</div>
                </div>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                >
                  <option value="7d">{t('dashboard.periods.7d')}</option>
                  <option value="30d">{t('dashboard.periods.30d')}</option>
                  <option value="90d">{t('dashboard.periods.90d')}</option>
                </select>
              </div>
            </div>

            {/* Mobile Controls */}
            {isMobileMenuOpen && (
              <div className="lg:hidden mt-4 space-y-3">
                <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <div className="text-sm text-blue-100">{t('dashboard.lastUpdated')}</div>
                  <div className="font-semibold">{new Date().toLocaleDateString(i18n.language)}</div>
                </div>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                >
                  <option value="7d">{t('dashboard.periods.7d')}</option>
                  <option value="30d">{t('dashboard.periods.30d')}</option>
                  <option value="90d">{t('dashboard.periods.90d')}</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content Area - Natural Flow */}
        <div className="space-y-6">
          {/* Stats Cards - 3 Columns on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {statsCards.map((stat, index) => (
              <div key={index} className="transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
                <StatsCard {...stat} />
              </div>
            ))}
          </div>

          {/* Enhanced Charts and Activity Section - Mobile Responsive */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Weekly Revenue Chart */}
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
                <Chart
                  title={t('dashboard.weeklyRevenue')}
                  data={weeklyChartData}
                  type="line"
                  height={300}
                  color="blue"
                />
              </div>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="xl:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
                <RecentActivity activities={recentActivities} />
              </div>
            </div>
          </div>

          {/* Enhanced Revenue by Category and Quick Actions - Mobile Responsive */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Revenue by Category */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
                <Chart
                  title={t('dashboard.revenueByCategory')}
                  data={categoryChartData}
                  type="bar"
                  height={300}
                  color="green"
                />
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
                <QuickActions />
              </div>
            </div>
          </div>

          {/* Enhanced Top Products and Low Stock Alerts - Mobile Responsive */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Enhanced Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
                  {t('dashboard.topProducts')}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {dashboardData?.topProducts?.length || 0} {t('dashboard.products')}
                </span>
              </div>
              <div className="space-y-3">
                {dashboardData?.topProducts?.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('dashboard.sold')}: {product.totalSold || 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {product.totalRevenue || 0} EGP
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                  {t('dashboard.lowStockAlerts')}
                </h3>
                <span className="text-sm text-red-500 dark:text-red-400 font-medium">
                  {dashboardData?.lowStockProducts?.length || 0} {t('dashboard.alerts')}
                </span>
              </div>
              <div className="space-y-3">
                {dashboardData?.lowStockProducts?.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                          !
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {t('dashboard.stock')}: {product.stock}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {product.price} EGP
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

          {/* Performance Metrics - Mobile Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.avgOrderValue')}
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {((dashboardData?.overview?.totalRevenue || 0) / (dashboardData?.overview?.totalOrders || 1)).toFixed(2)} EGP
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.conversionRate')}
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {((dashboardData?.overview?.totalOrders || 0) / (dashboardData?.overview?.totalUsers || 1) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <StarIcon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.avgRating')}
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    4.8
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage; 