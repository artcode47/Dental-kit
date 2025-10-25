import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StatCard from '../../components/admin/StatCard';
import { 
  Squares2X2Icon, 
  CheckCircleIcon, 
  TagIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { getAllPackages, createPackage as apiCreatePackage, updatePackage as apiUpdatePackage, deletePackage as apiDeletePackage, getAllProducts } from '../../services/adminApi';
import { toast } from 'react-hot-toast';

const AdminPackagesPage = () => {
  const { t } = useTranslation('admin');
  
  // Data state
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  
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
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Selection state
  const [selectedPackages, setSelectedPackages] = useState([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    packagePrice: '',
    items: [],
    isActive: true,
    startsAt: '',
    endsAt: ''
  });

  const canSubmit = useMemo(() => 
    formData.name && formData.packagePrice && Array.isArray(formData.items) && formData.items.length > 0, 
    [formData]
  );

  // Calculate stats
  const stats = useMemo(() => {
    const list = packages || [];
    const total = totalCount;
    const active = list.filter(p => p?.isActive).length;
    const avgDiscount = list.length > 0 ? Math.round(list.reduce((s, p) => s + (p?.discountPercentage || 0), 0) / list.length) : 0;
    const totalRevenue = list.reduce((sum, p) => sum + (Number(p.packagePrice) || 0), 0);
    const avgPackageValue = list.length > 0 ? totalRevenue / list.length : 0;
    
    return { total, active, avgDiscount, totalRevenue, avgPackageValue };
  }, [packages, totalCount]);

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);
      
      const params = {
        page: currentPage,
        limit: perPage,
        search: searchTerm || undefined,
        isActive: selectedStatus || undefined,
        sortBy,
        sortOrder
      };

      const response = await getAllPackages(params);
      setPackages(response.packages || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, perPage, searchTerm, selectedStatus, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts({ limit: 100 });
      setProducts(res.products || []);
    } catch {
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchProducts();
  }, [currentPage, searchTerm, selectedStatus, sortBy, sortOrder, fetchPackages]);

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      image: '', 
      packagePrice: '', 
      items: [], 
      isActive: true, 
      startsAt: '', 
      endsAt: '' 
    });
    setSelectedPackage(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const onCreate = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        packagePrice: Number(formData.packagePrice),
        items: formData.items.map(it => ({ 
          productId: it.productId, 
          quantity: Number(it.quantity || 1) 
        })),
      };
      await apiCreatePackage(payload);
      toast.success(t('packages.createSuccess'));
      closeModals();
      fetchPackages();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdate = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        packagePrice: Number(formData.packagePrice),
        items: formData.items.map(it => ({ 
          productId: it.productId, 
          quantity: Number(it.quantity || 1) 
        }))
      };
      await apiUpdatePackage(selectedPackage.id, payload);
      toast.success(t('packages.updateSuccess'));
      closeModals();
      fetchPackages();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    try {
      setIsSubmitting(true);
      await apiDeletePackage(id);
      toast.success(t('packages.deleteSuccess'));
      closeModals();
      fetchPackages();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal handlers
  const handleAddPackage = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      image: pkg.image || '',
      packagePrice: pkg.packagePrice || '',
      items: Array.isArray(pkg.items) ? pkg.items.map(it => ({ 
        productId: it.productId, 
        quantity: it.quantity || 1 
      })) : [],
      isActive: !!pkg.isActive,
      startsAt: pkg.startsAt ? new Date(pkg.startsAt).toISOString().slice(0, 16) : '',
      endsAt: pkg.endsAt ? new Date(pkg.endsAt).toISOString().slice(0, 16) : ''
    });
    setShowEditModal(true);
  };

  const handleViewPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowViewModal(true);
  };

  const handleDeletePackageClick = (pkg) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedPackage(null);
    resetForm();
  };

  // Selection handlers
  const handleSelectPackage = (id) => {
    setSelectedPackages(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPackages.length === packages.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(packages.map(p => p.id));
    }
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Pagination handler
  const paginate = (page) => setCurrentPage(page);

  // Helper functions
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'EGP' 
  }).format(amount || 0);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
              {t('packages.errorLoading')}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Button onClick={fetchPackages} className="mt-4">
              {t('packages.retry')}
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
                  {t('packages.title')}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  {t('packages.subtitle')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  {t('packages.exportCSV')}
                </Button>
                <Button 
                  className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100"
                  onClick={handleAddPackage}
                >
                  <PlusIcon className="h-5 w-5" />
                  {t('packages.addNew')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard 
            icon={Squares2X2Icon} 
            label={t('packages.totalPackages')} 
            value={stats.total} 
            color="blue"
          />
          <StatCard 
            icon={CheckCircleIcon} 
            label={t('packages.activePackages')} 
            value={stats.active} 
            color="green"
          />
          <StatCard 
            icon={TagIcon} 
            label={t('packages.avgDiscount')} 
            value={`${stats.avgDiscount}%`} 
            color="purple"
          />
          <StatCard 
            icon={CurrencyDollarIcon} 
            label={t('packages.totalRevenue')} 
            value={formatCurrency(stats.totalRevenue)} 
            color="green"
          />
          <StatCard 
            icon={ChartBarIcon} 
            label={t('packages.avgValue')} 
            value={formatCurrency(stats.avgPackageValue)} 
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
                placeholder={t('packages.searchPlaceholder')} 
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
              <option value="">{t('packages.allStatuses')}</option>
              <option value="true">{t('packages.active')}</option>
              <option value="false">{t('packages.inactive')}</option>
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
              <option value="createdAt-desc">{t('packages.sort.newest')}</option>
              <option value="createdAt-asc">{t('packages.sort.oldest')}</option>
              <option value="packagePrice-desc">{t('packages.packagePrice')} ↓</option>
              <option value="packagePrice-asc">{t('packages.packagePrice')} ↑</option>
              <option value="discountPercentage-desc">{t('packages.discountPct')} ↓</option>
              <option value="discountPercentage-asc">{t('packages.discountPct')} ↑</option>
            </select>

            {/* View Toggle */}
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

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('packages.filters.dateRange')} - {t('packages.from')}
                </label>
                <Input 
                  type="date" 
                  className="w-full" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('packages.filters.dateRange')} - {t('packages.to')}
                </label>
                <Input 
                  type="date" 
                  className="w-full" 
                />
              </div>
            </div>
          )}

          {/* Results and View Toggle */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('packages.showing')} {packages.length} {t('packages.of')} {totalCount} {t('packages.packages')}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t('packages.filters.title')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPackages.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedPackages.length} {t('packages.selected')}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {/* TODO: Implement bulk activate */}}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  {t('packages.activate')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {/* TODO: Implement bulk deactivate */}}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  {t('packages.deactivate')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {/* TODO: Implement bulk delete */}}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {t('packages.delete')}
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedPackages([])}
              className="text-blue-600 hover:text-blue-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Data Display */}
        {effectiveViewMode === 'table' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-2 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedPackages.length === packages.length && packages.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('packages.name')}
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('packages.items')}
                      </th>
                      <th 
                        className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                        onClick={() => handleSort('packagePrice')}
                      >
                        <div className="flex items-center gap-1">
                          {t('packages.packagePrice')}
                          {sortBy === 'packagePrice' && (
                            sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                        onClick={() => handleSort('discountPercentage')}
                      >
                        <div className="flex items-center gap-1">
                          {t('packages.discountPct')}
                          {sortBy === 'discountPercentage' && (
                            sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('packages.status')}
                      </th>
                      <th 
                        className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          {t('packages.created')}
                          {sortBy === 'createdAt' && (
                            sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('packages.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {packages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-2 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedPackages.includes(pkg.id)}
                            onChange={() => handleSelectPackage(pkg.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {pkg.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {(pkg.id || '').slice(-8)}
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {Array.isArray(pkg.items) ? pkg.items.length : 0}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(pkg.packagePrice || 0)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {pkg.discountPercentage || 0}%
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(pkg.isActive)}`}>
                            {pkg.isActive ? t('packages.active') : t('packages.inactive')}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {formatDate(pkg.createdAt)}
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewPackage(pkg)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                              title={t('packages.view')}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditPackage(pkg)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title={t('packages.edit')}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePackageClick(pkg)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title={t('packages.delete')}
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
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedPackages.includes(pkg.id)}
                      onChange={() => handleSelectPackage(pkg.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {pkg.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {(pkg.id || '').slice(-8)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleViewPackage(pkg)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            title={t('packages.view')}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditPackage(pkg)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title={t('packages.edit')}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePackageClick(pkg)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title={t('packages.delete')}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">{t('packages.items')}:</span>
                          <span className="text-gray-900 dark:text-white">{Array.isArray(pkg.items) ? pkg.items.length : 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">{t('packages.packagePrice')}:</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(pkg.packagePrice || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">{t('packages.discountPct')}:</span>
                          <span className="text-gray-900 dark:text-white">{pkg.discountPercentage || 0}%</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(pkg.isActive)}`}>
                              {pkg.isActive ? t('packages.active') : t('packages.inactive')}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {formatDate(pkg.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedPackages.includes(pkg.id)}
                    onChange={() => handleSelectPackage(pkg.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleViewPackage(pkg)}
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      title={t('packages.view')}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditPackage(pkg)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title={t('packages.edit')}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePackageClick(pkg)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title={t('packages.delete')}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {(pkg.id || '').slice(-8)}
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('packages.items')}:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{Array.isArray(pkg.items) ? pkg.items.length : 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('packages.packagePrice')}:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(pkg.packagePrice || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('packages.discountPct')}:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{pkg.discountPercentage || 0}%</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(pkg.isActive)}`}>
                      {pkg.isActive ? t('packages.active') : t('packages.inactive')}
                    </span>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDate(pkg.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 mt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {t('packages.previous')}
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {t('packages.next')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('packages.showing')} <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> {t('packages.to')} <span className="font-medium">{Math.min(currentPage * perPage, totalCount)}</span> {t('packages.of')} <span className="font-medium">{totalCount}</span> {t('packages.results')}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return page;
                  }).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('packages.create')}
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); onCreate(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('packages.name')} *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('packages.packagePrice')} *
                    </label>
                    <Input
                      type="number"
                      name="packagePrice"
                      value={formData.packagePrice}
                      onChange={handleFormChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('packages.description')}
                  </label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('packages.startsAt')}
                    </label>
                    <Input
                      type="datetime-local"
                      name="startsAt"
                      value={formData.startsAt}
                      onChange={handleFormChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('packages.endsAt')}
                    </label>
                    <Input
                      type="datetime-local"
                      name="endsAt"
                      value={formData.endsAt}
                      onChange={handleFormChange}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    id="isActive" 
                    type="checkbox" 
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    {t('packages.isActive')}
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('packages.items')} *
                  </label>
                  <div className="space-y-2">
                    {(formData.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                        <select 
                          value={item.productId} 
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="border rounded px-2 py-2 flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <option value="">{t('packages.selectProduct')}</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <Input 
                          type="number" 
                          min={1} 
                          className="w-24" 
                          value={item.quantity || 1} 
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))} 
                        />
                        <button 
                          type="button"
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md" 
                          onClick={() => removeItem(idx)}
                        >
                          {t('packages.remove')}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button"
                    className="mt-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md" 
                    onClick={addItem}
                  >
                    {t('packages.addItem')}
                  </button>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModals}
                    className="flex-1"
                  >
                    {t('packages.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      t('packages.create')
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('packages.update')}
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); onUpdate(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('packages.name')} *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('packages.packagePrice')} *
                    </label>
                    <Input
                      type="number"
                      name="packagePrice"
                      value={formData.packagePrice}
                      onChange={handleFormChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('packages.description')}
                  </label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('packages.startsAt')}
                    </label>
                    <Input
                      type="datetime-local"
                      name="startsAt"
                      value={formData.startsAt}
                      onChange={handleFormChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('packages.endsAt')}
                    </label>
                    <Input
                      type="datetime-local"
                      name="endsAt"
                      value={formData.endsAt}
                      onChange={handleFormChange}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    id="isActive" 
                    type="checkbox" 
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    {t('packages.isActive')}
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('packages.items')} *
                  </label>
                  <div className="space-y-2">
                    {(formData.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                        <select 
                          value={item.productId} 
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="border rounded px-2 py-2 flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <option value="">{t('packages.selectProduct')}</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <Input 
                          type="number" 
                          min={1} 
                          className="w-24" 
                          value={item.quantity || 1} 
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))} 
                        />
                        <button 
                          type="button"
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md" 
                          onClick={() => removeItem(idx)}
                        >
                          {t('packages.remove')}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button"
                    className="mt-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md" 
                    onClick={addItem}
                  >
                    {t('packages.addItem')}
                  </button>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModals}
                    className="flex-1"
                  >
                    {t('packages.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      t('packages.update')
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Package Modal */}
      {showViewModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('packages.packageDetails')}
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedPackage.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {selectedPackage.id}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('packages.packagePrice')}:</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPackage.packagePrice || 0)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('packages.discountPct')}:</span>
                    <span className="text-gray-900 dark:text-white">{selectedPackage.discountPercentage || 0}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('packages.items')}:</span>
                    <span className="text-gray-900 dark:text-white">{Array.isArray(selectedPackage.items) ? selectedPackage.items.length : 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('packages.created')}:</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(selectedPackage.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('packages.status')}:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedPackage.isActive)}`}>
                      {selectedPackage.isActive ? t('packages.active') : t('packages.inactive')}
                    </span>
                  </div>
                  
                  {selectedPackage.description && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('packages.description')}:</span>
                      <p className="text-gray-900 dark:text-white mt-1">{selectedPackage.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModals}
                    className="flex-1"
                  >
                    {t('packages.close')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      closeModals();
                      handleEditPackage(selectedPackage);
                    }}
                    className="flex-1"
                  >
                    {t('packages.edit')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('packages.confirmDeleteTitle')}
                  </h3>
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('packages.confirmDeleteMessage', { name: selectedPackage.name })}
                </p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModals}
                  className="flex-1"
                >
                  {t('packages.cancel')}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => onDelete(selectedPackage.id)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    t('packages.delete')
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPackagesPage;


