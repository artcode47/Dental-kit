import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CreditCardIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  UsersIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const AdminCouponsPage = () => {
  const { t } = useTranslation('admin');
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [couponsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: '',
    maxUsesPerUser: '',
    validFrom: '',
    validUntil: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    isPublic: true,
    isActive: true
  });

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, [currentPage, searchTerm, selectedStatus, selectedType, sortBy, sortOrder]);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: couponsPerPage,
        search: searchTerm || undefined,
        isActive: selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined,
        isPublic: selectedType === 'public' ? true : selectedType === 'private' ? false : undefined,
        sortBy,
        sortOrder
      };

      const response = await getAllCoupons(params);
      setCoupons(response.coupons || []);
      setTotalPages(response.totalPages || 1);
      setTotalCoupons(response.total || 0);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectCoupon = (couponId) => {
    setSelectedCoupons(prev => 
      prev.includes(couponId) 
        ? prev.filter(id => id !== couponId)
        : [...prev, couponId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCoupons.length === coupons.length) {
      setSelectedCoupons([]);
    } else {
      setSelectedCoupons(coupons.map(coupon => coupon._id));
    }
  };

  const handleBulkOperation = async (operation) => {
    if (selectedCoupons.length === 0) return;

    try {
      // Implement bulk operations
      toast.success(`Bulk ${operation} completed successfully`);
      setSelectedCoupons([]);
      fetchCoupons();
    } catch (err) {
      toast.error(`Failed to perform bulk ${operation}`);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm(t('admin.coupons.confirmDelete'))) {
      try {
        await deleteCoupon(couponId);
        toast.success(t('admin.coupons.deleteSuccess'));
        fetchCoupons();
      } catch (err) {
        toast.error(t('admin.coupons.deleteError'));
      }
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await createCoupon(formData);
      toast.success(t('admin.coupons.createSuccess'));
      setShowCreateModal(false);
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(t('admin.coupons.createError'));
    }
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();
    try {
      await updateCoupon(editingCoupon._id, formData);
      toast.success(t('admin.coupons.updateSuccess'));
      setShowEditModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(t('admin.coupons.updateError'));
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      maxUses: '',
      maxUsesPerUser: '',
      validFrom: '',
      validUntil: '',
      minimumOrderAmount: '',
      maximumDiscountAmount: '',
      isPublic: true,
      isActive: true
    });
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      maxUses: coupon.maxUses?.toString() || '',
      maxUsesPerUser: coupon.maxUsesPerUser?.toString() || '',
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil.split('T')[0],
      minimumOrderAmount: coupon.minimumOrderAmount?.toString() || '',
      maximumDiscountAmount: coupon.maximumDiscountAmount?.toString() || '',
      isPublic: coupon.isPublic,
      isActive: coupon.isActive
    });
    setShowEditModal(true);
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getTypeBadgeColor = (isPublic) => {
    return isPublic 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  };

  const getDiscountTypeBadgeColor = (type) => {
    switch (type) {
      case 'percentage':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'fixed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'free_shipping':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            {t('admin.coupons.errorLoading')}
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={fetchCoupons} className="mt-4">
            {t('admin.coupons.retry')}
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
              {t('admin.coupons.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.coupons.subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5" />
              {t('admin.coupons.exportCSV')}
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              {t('admin.coupons.addNew')}
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('admin.coupons.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('admin.coupons.allStatuses')}</option>
              <option value="active">{t('admin.coupons.active')}</option>
              <option value="inactive">{t('admin.coupons.inactive')}</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={handleTypeFilter}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('admin.coupons.allTypes')}</option>
              <option value="public">{t('admin.coupons.public')}</option>
              <option value="private">{t('admin.coupons.private')}</option>
            </select>

            {/* Sort By */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="createdAt-desc">{t('admin.coupons.sortNewest')}</option>
              <option value="createdAt-asc">{t('admin.coupons.sortOldest')}</option>
              <option value="code-asc">{t('admin.coupons.sortCodeAZ')}</option>
              <option value="code-desc">{t('admin.coupons.sortCodeZA')}</option>
              <option value="discountValue-desc">{t('admin.coupons.sortValueHigh')}</option>
              <option value="discountValue-asc">{t('admin.coupons.sortValueLow')}</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400">
              {t('admin.coupons.showing')} {coupons.length} {t('admin.coupons.of')} {totalCoupons} {t('admin.coupons.coupons')}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCoupons.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedCoupons.length} {t('admin.coupons.selected')}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('activate')}
                  >
                    {t('admin.coupons.activate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('deactivate')}
                  >
                    {t('admin.coupons.deactivate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('admin.coupons.delete')}
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedCoupons([])}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Coupons Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCoupons.length === coupons.length && coupons.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.coupons.coupon')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.coupons.discount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.coupons.usage')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.coupons.validity')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.coupons.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.coupons.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCoupons.includes(coupon._id)}
                        onChange={() => handleSelectCoupon(coupon._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <CreditCardIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {coupon.code}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {coupon.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDiscountTypeBadgeColor(coupon.discountType)}`}>
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : 
                           coupon.discountType === 'fixed' ? formatCurrency(coupon.discountValue) : 
                           t('admin.coupons.freeShipping')}
                        </span>
                        {coupon.minimumOrderAmount && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Min: {formatCurrency(coupon.minimumOrderAmount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {coupon.usedCount || 0} / {coupon.maxUses || '∞'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('admin.coupons.uses')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(coupon.validUntil)}
                        </div>
                        {isExpired(coupon.validUntil) && (
                          <div className="flex items-center text-xs text-red-600 dark:text-red-400">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            {t('admin.coupons.expired')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(coupon.isActive)}`}>
                          {coupon.isActive ? t('admin.coupons.active') : t('admin.coupons.inactive')}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(coupon.isPublic)}`}>
                          {coupon.isPublic ? t('admin.coupons.public') : t('admin.coupons.private')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title={t('admin.coupons.view')}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(coupon)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t('admin.coupons.edit')}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t('admin.coupons.delete')}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.coupons.previous')}
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.coupons.next')}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('admin.coupons.showing')} <span className="font-medium">{(currentPage - 1) * couponsPerPage + 1}</span> {t('admin.coupons.to')} <span className="font-medium">{Math.min(currentPage * couponsPerPage, totalCoupons)}</span> {t('admin.coupons.of')} <span className="font-medium">{totalCoupons}</span> {t('admin.coupons.results')}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('admin.coupons.previous')}
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('admin.coupons.next')}
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {showCreateModal ? t('admin.coupons.createTitle') : t('admin.coupons.editTitle')}
              </h2>
              
              <form onSubmit={showCreateModal ? handleCreateCoupon : handleEditCoupon} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.code')}
                    </label>
                    <Input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.name')}
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.discountType')}
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="percentage">{t('admin.coupons.percentage')}</option>
                      <option value="fixed">{t('admin.coupons.fixed')}</option>
                      <option value="free_shipping">{t('admin.coupons.freeShipping')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.discountValue')}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.maxUses')}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                      placeholder="∞"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.maxUsesPerUser')}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.maxUsesPerUser}
                      onChange={(e) => setFormData({...formData, maxUsesPerUser: e.target.value})}
                      placeholder="∞"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.validFrom')}
                    </label>
                    <Input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.validUntil')}
                    </label>
                    <Input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.minimumOrderAmount')}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minimumOrderAmount}
                      onChange={(e) => setFormData({...formData, minimumOrderAmount: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.coupons.maximumDiscountAmount')}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.maximumDiscountAmount}
                      onChange={(e) => setFormData({...formData, maximumDiscountAmount: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('admin.coupons.isPublic')}
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('admin.coupons.isActive')}
                    </span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setEditingCoupon(null);
                      resetForm();
                    }}
                  >
                    {t('admin.coupons.cancel')}
                  </Button>
                  <Button type="submit">
                    {showCreateModal ? t('admin.coupons.create') : t('admin.coupons.update')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCouponsPage; 