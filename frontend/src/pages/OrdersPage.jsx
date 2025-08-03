import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import api, { endpoints } from '../services/api';
import { toast } from 'react-hot-toast';

const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        sortOrder
      };
      
      const response = await api.get(endpoints.users.orders, { params });
      const data = response.data || response;
      
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || t('orders.error.fetchingOrders'));
      toast.error(t('orders.error.fetchingOrders'));
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
    fetchOrders();
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
    fetchOrders();
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOrders();
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    const statusConfig = {
      pending: {
        color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
        icon: ClockIcon,
        label: t('orders.status.pending')
      },
      confirmed: {
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
        icon: CheckIcon,
        label: t('orders.status.confirmed')
      },
      processing: {
        color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
        icon: CheckIcon,
        label: t('orders.status.processing')
      },
      shipped: {
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20',
        icon: TruckIcon,
        label: t('orders.status.shipped')
      },
      delivered: {
        color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
        icon: CheckIcon,
        label: t('orders.status.delivered')
      },
      cancelled: {
        color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
        icon: XMarkIcon,
        label: t('orders.status.cancelled')
      }
    };
    
    return statusConfig[status] || statusConfig.pending;
  };

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [currentPage, sortBy, sortOrder]);

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('orders.error.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <Button onClick={fetchOrders} variant="primary">
              {t('orders.retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <ShoppingBagIcon className="w-4 h-4 mr-2" />
              {t('orders.title')}
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {t('orders.title')}
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {t('orders.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20 dark:border-gray-700/20">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('orders.searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </form>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                {t('orders.filters')}
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('orders.filterByStatus')}
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">{t('orders.allStatuses')}</option>
                      <option value="pending">{t('orders.status.pending')}</option>
                      <option value="confirmed">{t('orders.status.confirmed')}</option>
                      <option value="processing">{t('orders.status.processing')}</option>
                      <option value="shipped">{t('orders.status.shipped')}</option>
                      <option value="delivered">{t('orders.status.delivered')}</option>
                      <option value="cancelled">{t('orders.status.cancelled')}</option>
                    </select>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('orders.sortBy')}
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="createdAt">{t('orders.sortByDate')}</option>
                      <option value="total">{t('orders.sortByTotal')}</option>
                      <option value="orderNumber">{t('orders.sortByOrderNumber')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/20 dark:border-gray-700/20">
                <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('orders.noOrders')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t('orders.noOrdersMessage')}
                </p>
                <Button onClick={() => navigate('/products')} variant="primary">
                  {t('orders.startShopping')}
                </Button>
              </div>
            ) : (
              orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div
                    key={order._id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                              <StatusIcon className="w-4 h-4 mr-1" />
                              {statusInfo.label}
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {t('orders.items', { count: order.items.length })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {order.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                  <img
                                    src={item.product?.images?.[0] || '/placeholder-product.svg'}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    +{order.items.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Order Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-300">{t('orders.total')}:</span>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatPrice(order.total)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-300">{t('orders.paymentStatus')}:</span>
                              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                {order.paymentStatus}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-300">{t('orders.shippingMethod')}:</span>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {t(`orders.shippingMethods.${order.shippingMethod}`)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-300">{t('orders.items')}:</span>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {order.items.length}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => navigate(`/orders/${order._id}`)}
                            variant="primary"
                            className="flex items-center justify-center"
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            {t('orders.viewDetails')}
                          </Button>
                          
                          {order.status === 'delivered' && (
                            <Button
                              onClick={() => navigate(`/products/${order.items[0]?.product?._id}/review`)}
                              variant="outline"
                              className="flex items-center justify-center"
                            >
                              {t('orders.writeReview')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  {t('orders.previous')}
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={currentPage === page ? "primary" : "outline"}
                    size="sm"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  {t('orders.next')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage; 