import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShoppingCartIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  BanknotesIcon,
  ChartBarIcon,
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { getAllOrders, bulkOrderOperations, updateOrderStatus } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StatCard from '../../components/admin/StatCard';
import OrdersTable from '../../components/admin/OrdersTable';
import OrdersGrid from '../../components/admin/OrdersGrid';
import Pagination from '../../components/admin/Pagination';
import OrderViewModal from '../../components/admin/orders/OrderViewModal';
import { toast } from 'react-hot-toast';

const AdminOrdersPage = () => {
  const { t } = useTranslation('admin');

  // Data state
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [showFilters, setShowFilters] = useState(false);
  
  // Force grid view on mobile and tablet
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Override viewMode for mobile/tablet
  const effectiveViewMode = isMobile ? 'grid' : viewMode;

  // Query state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selection
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedStatus, selectedPaymentStatus, dateFrom, dateTo, sortBy, sortOrder]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: perPage,
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
        paymentStatus: selectedPaymentStatus || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy,
        sortOrder
      };

      const res = await getAllOrders(params);
      setOrders(res.orders || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const list = orders || [];
    const total = totalCount;
    const totalRevenue = list.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const avgOrderValue = list.length > 0 ? totalRevenue / list.length : 0;
    const pending = list.filter(o => o?.status === 'pending').length;
    const today = new Date().toDateString();
    const todayOrders = list.filter(o => new Date(o.createdAt).toDateString() === today).length;
    
    return { total, totalRevenue, avgOrderValue, pending, todayOrders };
  }, [orders, totalCount]);

  // Helper functions
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'EGP' 
  }).format(amount || 0);

  const paginate = (page) => setCurrentPage(page);

  const handleSelectOrder = (id) => {
    setSelectedOrders(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPaymentBadge = (ps) => {
    switch (ps) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'partially_refunded': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4"/>;
      case 'confirmed': return <CheckIcon className="h-4 w-4"/>;
      case 'processing': return <PencilIcon className="h-4 w-4"/>;
      case 'shipped': return <TruckIcon className="h-4 w-4"/>;
      case 'delivered': return <CheckCircleIcon className="h-4 w-4"/>;
      case 'cancelled': return <XCircleIcon className="h-4 w-4"/>;
      case 'refunded': return <ExclamationTriangleIcon className="h-4 w-4"/>;
      default: return <ClockIcon className="h-4 w-4"/>;
    }
  };

  const handleBulkOperation = async (operation, data = null) => {
    if (selectedOrders.length === 0) return;
    
    try {
      setIsSubmitting(true);
      await bulkOrderOperations(operation, selectedOrders, data || undefined);
      toast.success(
        operation === 'updateStatus' ? t('orders.bulkUpdateStatusSuccess') :
        operation === 'updatePaymentStatus' ? t('orders.bulkUpdatePaymentSuccess') :
        t('orders.bulkDeleteSuccess')
      );
      setSelectedOrders([]);
      fetchOrders();
    } catch (err) {
      toast.error(t('orders.bulkOperationError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setIsSubmitting(true);
      await updateOrderStatus(orderId, newStatus);
      toast.success(t('orders.statusUpdateSuccess'));
      fetchOrders();
    } catch (err) {
      toast.error(t('orders.statusUpdateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(t('orders.confirmDelete'))) return;
    
    try {
      setIsSubmitting(true);
      await bulkOrderOperations('delete', [orderId]);
      toast.success(t('orders.deleteSuccess'));
      fetchOrders();
    } catch (err) {
      toast.error(t('orders.deleteError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal handlers
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };


  const handleDeleteOrderClick = (order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedOrder(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPaymentStatus('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

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
              {t('orders.errorLoading')}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchOrders}>
              {t('orders.retry')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="pl-2 pr-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  {t('orders.title')}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  {t('orders.subtitle')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  {t('orders.exportCSV')}
                </Button>
                <Button 
                  className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => {/* TODO: Implement create order */}}
                >
                  <PlusIcon className="h-5 w-5" />
                  {t('orders.createOrder')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard 
            icon={ShoppingCartIcon} 
            label={t('orders.totalOrders')} 
            value={stats.total} 
            color="blue"
            trend={stats.todayOrders > 0 ? { value: stats.todayOrders, type: 'up' } : null}
          />
          <StatCard 
            icon={CurrencyDollarIcon} 
            label={t('orders.totalRevenue')} 
            value={formatCurrency(stats.totalRevenue)} 
            color="green"
          />
          <StatCard 
            icon={ChartBarIcon} 
            label={t('orders.avgOrderValue')} 
            value={formatCurrency(stats.avgOrderValue)} 
            color="purple"
          />
          <StatCard 
            icon={ClockIcon} 
            label={t('orders.pendingOrders')} 
            value={stats.pending} 
            color="yellow"
          />
          <StatCard 
            icon={CalendarIcon} 
            label={t('orders.todayOrders')} 
            value={stats.todayOrders} 
            color="indigo"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                type="text" 
                placeholder={t('orders.searchPlaceholder')} 
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }} 
                className="pl-10" 
              />
            </div>

            {/* Status Filter */}
            <select 
              value={selectedStatus} 
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }} 
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('orders.allStatuses')}</option>
              <option value="pending">{t('orders.pending')}</option>
              <option value="confirmed">{t('orders.confirmed')}</option>
              <option value="processing">{t('orders.processing')}</option>
              <option value="shipped">{t('orders.shipped')}</option>
              <option value="delivered">{t('orders.delivered')}</option>
              <option value="cancelled">{t('orders.cancelled')}</option>
              <option value="refunded">{t('orders.refunded')}</option>
            </select>

            {/* Payment Status Filter */}
            <select 
              value={selectedPaymentStatus} 
              onChange={(e) => {
                setSelectedPaymentStatus(e.target.value);
                setCurrentPage(1);
              }} 
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('orders.allPaymentStatuses')}</option>
              <option value="pending">{t('orders.paymentPending')}</option>
              <option value="paid">{t('orders.paid')}</option>
              <option value="failed">{t('orders.paymentFailed')}</option>
              <option value="refunded">{t('orders.paymentRefunded')}</option>
              <option value="partially_refunded">{t('orders.partiallyRefunded')}</option>
            </select>

            {/* Sort */}
            <select 
              value={`${sortBy}-${sortOrder}`} 
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }} 
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt-desc">{t('orders.sort.newest')}</option>
              <option value="createdAt-asc">{t('orders.sort.oldest')}</option>
              <option value="total-desc">{t('orders.sort.amountHigh')}</option>
              <option value="total-asc">{t('orders.sort.amountLow')}</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('orders.filters.dateRange')} - {t('orders.from')}
                </label>
                <Input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                  className="w-full" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('orders.filters.dateRange')} - {t('orders.to')}
                </label>
                <Input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                  className="w-full" 
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="w-full"
                >
                  {t('orders.filters.clearAll')}
                </Button>
              </div>
            </div>
          )}

          {/* Results and View Toggle */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('orders.showing')} {orders.length} {t('orders.of')} {totalCount} {t('orders.orders')}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t('orders.filters.title')}</span>
              </Button>
              <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <Button 
                  variant={effectiveViewMode === 'table' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('table')} 
                  className="flex items-center gap-2"
                  disabled={isMobile}
                >
                  <Bars3Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">Table</span>
                </Button>
                <Button 
                  variant={effectiveViewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('grid')} 
                  className="flex items-center gap-2"
                  disabled={isMobile}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedOrders.length} {t('orders.selected')}
              </span>
              <div className="flex flex-wrap gap-2">
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkOperation('updateStatus', { status: e.target.value });
                      e.target.value = '';
                    }
                  }} 
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('orders.updateStatus')}</option>
                  <option value="pending">{t('orders.pending')}</option>
                  <option value="processing">{t('orders.processing')}</option>
                  <option value="shipped">{t('orders.shipped')}</option>
                  <option value="delivered">{t('orders.delivered')}</option>
                  <option value="cancelled">{t('orders.cancelled')}</option>
                </select>
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkOperation('updatePaymentStatus', { paymentStatus: e.target.value });
                      e.target.value = '';
                    }
                  }} 
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('orders.updatePayment')}</option>
                  <option value="paid">{t('orders.paid')}</option>
                  <option value="failed">{t('orders.paymentFailed')}</option>
                  <option value="refunded">{t('orders.paymentRefunded')}</option>
                </select>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleBulkOperation('delete')} 
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  disabled={isSubmitting}
                >
                  {t('orders.delete')}
                </Button>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setSelectedOrders([])}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-4 w-4"/>
            </Button>
          </div>
        )}

        {/* Data Display */}
        {effectiveViewMode === 'table' ? (
          <OrdersTable
            orders={orders}
            selectedOrders={selectedOrders}
            onSelectAll={handleSelectAll}
            onSelectOrder={handleSelectOrder}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusBadgeColor={getStatusBadgeColor}
            getPaymentBadge={getPaymentBadge}
            getStatusIcon={getStatusIcon}
            t={t}
            onViewOrder={handleViewOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
            isSubmitting={isSubmitting}
          />
        ) : (
          <OrdersGrid
            orders={orders}
            selectedOrders={selectedOrders}
            onSelectOrder={handleSelectOrder}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusBadgeColor={getStatusBadgeColor}
            getPaymentBadge={getPaymentBadge}
            getStatusIcon={getStatusIcon}
            t={t}
            onViewOrder={handleViewOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            total={totalCount} 
            perPage={perPage} 
            onPage={paginate} 
            t={t} 
          />
        )}

        {/* Modals */}
        <OrderViewModal
          isOpen={showViewModal}
          order={selectedOrder}
          onClose={closeModals}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusBadgeColor={getStatusBadgeColor}
          getStatusIcon={getStatusIcon}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
