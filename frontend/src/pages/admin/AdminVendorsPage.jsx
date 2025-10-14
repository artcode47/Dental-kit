import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { VendorModal } from '../../components/admin/vendors';
import VendorViewModal from '../../components/admin/vendors/VendorViewModal';
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
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  GlobeAltIcon,
  StarIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  Squares2X2Icon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { getAllVendors, bulkVendorOperations, toggleVendorStatus, verifyVendor, deleteVendor, createVendor, updateVendor } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const AdminVendorsPage = () => {
  const { t } = useTranslation('admin');
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [vendorsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendors, setTotalVendors] = useState(0);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    unverified: 0,
    totalProducts: 0,
    totalSales: 0
  });

  // View state
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: '',
    contactPerson: '',
    taxId: '',
    paymentTerms: 'net30',
    commissionRate: 10,
    isActive: true,
    isVerified: false,
    logo: null,
    logoFile: null
  });

  const fetchVendors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: vendorsPerPage,
        search: searchTerm || undefined,
        isActive: selectedStatus === 'active' ? 'true' : selectedStatus === 'inactive' ? 'false' : undefined,
        isVerified: selectedRating === 'verified' ? 'true' : selectedRating === 'unverified' ? 'false' : undefined,
        sortBy,
        sortOrder
      };

      const response = await getAllVendors(params);
      const vendorsData = response.vendors || [];
      setVendors(vendorsData);
      setTotalPages(response.totalPages || 1);
      setTotalVendors(response.total || 0);

      // Calculate stats
      const newStats = {
        total: vendorsData.length,
        active: vendorsData.filter(v => v.isActive).length,
        inactive: vendorsData.filter(v => !v.isActive).length,
        verified: vendorsData.filter(v => v.isVerified).length,
        unverified: vendorsData.filter(v => !v.isVerified).length,
        totalProducts: vendorsData.reduce((sum, v) => sum + (v.productCount || v.totalProducts || 0), 0),
        totalSales: vendorsData.reduce((sum, v) => sum + (v.totalSales || 0), 0)
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, vendorsPerPage, searchTerm, selectedStatus, selectedRating, sortBy, sortOrder]);

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Auto-switch to grid view on mobile devices
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      } else {
        setViewMode('table');
      }
    };

    // Set initial view mode
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleRatingFilter = (e) => {
    setSelectedRating(e.target.value);
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

  const handleSelectVendor = (vendorId) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVendors.length === vendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(vendors.map(vendor => vendor._id));
    }
  };

  const handleBulkOperation = async (operation) => {
    if (selectedVendors.length === 0) return;

    try {
      await bulkVendorOperations(operation, selectedVendors);
      toast.success(`Bulk ${operation} completed successfully`);
      setSelectedVendors([]);
      fetchVendors(); // Refresh the list
    } catch (error) {
      console.error(`Error performing bulk ${operation}:`, error);
      toast.error(`Failed to perform bulk ${operation}`);
    }
  };

  const handleToggleStatus = async (vendorId) => {
    try {
      await toggleVendorStatus(vendorId);
      toast.success(t('vendors.statusUpdateSuccess'));
      fetchVendors();
    } catch (error) {
      console.error('Error toggling vendor status:', error);
      toast.error(t('vendors.statusUpdateError'));
    }
  };

  const handleToggleVerification = async (vendorId) => {
    try {
      await verifyVendor(vendorId);
      toast.success(t('vendors.verificationUpdateSuccess'));
      fetchVendors();
    } catch (error) {
      console.error('Error toggling vendor verification:', error);
      toast.error(t('vendors.verificationUpdateError'));
    }
  };

  // Modal handlers
  const handleAddVendor = () => {
    setFormData({
      name: '',
      nameAr: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      description: '',
      contactPerson: '',
      taxId: '',
      paymentTerms: 'net30',
      commissionRate: 10,
      isActive: true,
      isVerified: false,
      logo: null,
      logoFile: null
    });
    setSelectedVendor(null);
    setShowAddModal(true);
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name || '',
      nameAr: vendor.nameAr || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      website: vendor.website || '',
      address: vendor.address || '',
      description: vendor.description || '',
      contactPerson: vendor.contactPerson || '',
      taxId: vendor.taxId || '',
      paymentTerms: vendor.paymentTerms || 'net30',
      commissionRate: vendor.commissionRate || 10,
      isActive: vendor.isActive !== false,
      isVerified: vendor.isVerified === true,
      logo: vendor.logo || null,
      logoFile: null
    });
    setShowEditModal(true);
  };

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setShowViewModal(true);
  };

  const handleDeleteVendorClick = (vendor) => {
    setSelectedVendor(vendor);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedVendor(null);
    setFormData({
      name: '',
      nameAr: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      description: '',
      contactPerson: '',
      taxId: '',
      paymentTerms: 'net30',
      commissionRate: 10,
      isActive: true,
      isVerified: false,
      logo: null,
      logoFile: null
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedVendor) return;
    
    try {
      setIsSubmitting(true);
      await deleteVendor(selectedVendor._id || selectedVendor.id);
      toast.success(t('vendors.deleteSuccess'));
      handleCloseModal();
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error(t('vendors.deleteError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const payload = { ...formData };
      
      if (showAddModal) {
        await createVendor(payload);
        toast.success(t('vendors.createSuccess'));
      } else if (showEditModal) {
        await updateVendor(selectedVendor._id || selectedVendor.id, payload);
        toast.success(t('vendors.updateSuccess'));
      }
      
      handleCloseModal();
      fetchVendors();
    } catch (error) {
      console.error('Error in form submit:', error);
      toast.error(showAddModal ? t('vendors.createError') : t('vendors.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedRating('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getVerificationBadgeColor = (isVerified) => {
    return isVerified 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
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
            {t('vendors.errorLoading')}
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={fetchVendors} className="mt-4">
            {t('vendors.retry')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  {t('vendors.title')}
            </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  {t('vendors.subtitle')}
            </p>
          </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  {t('vendors.exportCSV')}
            </Button>
                <Button 
                  className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100"
                  onClick={handleAddVendor}
                >
              <PlusIcon className="h-5 w-5" />
                  {t('vendors.addNew')}
            </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.verified}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <CubeIcon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('vendors.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('vendors.allStatuses')}</option>
              <option value="active">{t('vendors.active')}</option>
              <option value="inactive">{t('vendors.inactive')}</option>
            </select>

            {/* Verification Filter */}
            <select
              value={selectedRating}
              onChange={handleRatingFilter}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('vendors.allRatings')}</option>
              <option value="verified">{t('vendors.verified')}</option>
              <option value="unverified">{t('vendors.unverified')}</option>
            </select>

            {/* Sort By */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="createdAt-desc">{t('vendors.sortNewest')}</option>
              <option value="createdAt-asc">{t('vendors.sortOldest')}</option>
              <option value="name-asc">{t('vendors.sortNameAZ')}</option>
              <option value="name-desc">{t('vendors.sortNameZA')}</option>
              <option value="totalProducts-desc">{t('vendors.sortProductsHigh')}</option>
              <option value="totalProducts-asc">{t('vendors.sortProductsLow')}</option>
            </select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              Clear Filters
            </Button>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex items-center gap-1"
              >
                <Bars3Icon className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-1"
              >
                <Squares2X2Icon className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedVendors.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedVendors.length} {t('vendors.selected')}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('activate')}
                  >
                    {t('vendors.activate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('deactivate')}
                  >
                    {t('vendors.deactivate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('verify')}
                  >
                    {t('vendors.verify')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('vendors.delete')}
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedVendors([])}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Vendors Display */}
        {viewMode === 'table' ? (
          /* Vendors Table */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedVendors.length === vendors.length && vendors.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('vendors.vendor')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('vendors.contact')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('vendors.company')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                    onClick={() => handleSort('totalProducts')}
                  >
                    <div className="flex items-center gap-1">
                      {t('vendors.totalProducts')}
                      {sortBy === 'totalProducts' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                    onClick={() => handleSort('totalSales')}
                  >
                    <div className="flex items-center gap-1">
                      {t('vendors.totalSales')}
                      {sortBy === 'totalSales' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('vendors.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('vendors.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor._id)}
                        onChange={() => handleSelectVendor(vendor._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {vendor.logo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={vendor.logo}
                              alt={vendor.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <BuildingOfficeIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {vendor.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {vendor._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {vendor.email}
                        </div>
                        {vendor.phone && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {vendor.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {vendor.companyName || vendor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <span className="font-medium">{vendor.totalProducts || 0}</span>
                        {vendor.website && (
                          <a 
                            href={vendor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <GlobeAltIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(vendor.totalSales || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(vendor.isActive)}`}>
                          {vendor.isActive ? t('vendors.active') : t('vendors.inactive')}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationBadgeColor(vendor.isVerified)}`}>
                          {vendor.isVerified ? t('vendors.verified') : t('vendors.unverified')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(vendor._id || vendor.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={vendor.isActive ? t('vendors.deactivate') : t('vendors.activate')}
                        >
                          {vendor.isActive ? (
                            <XMarkIcon className="h-4 w-4" />
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleVerification(vendor._id || vendor.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title={vendor.isVerified ? t('vendors.unverify') : t('vendors.verify')}
                        >
                          {vendor.isVerified ? (
                            <ShieldExclamationIcon className="h-4 w-4" />
                          ) : (
                            <ShieldCheckIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleViewVendor(vendor)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title={t('vendors.view')}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t('vendors.edit')}
                          onClick={() => handleEditVendor(vendor)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVendorClick(vendor)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t('vendors.delete')}
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
                  {t('vendors.previous')}
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('vendors.next')}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('vendors.showing')} <span className="font-medium">{(currentPage - 1) * vendorsPerPage + 1}</span> {t('vendors.to')} <span className="font-medium">{Math.min(currentPage * vendorsPerPage, totalVendors)}</span> {t('vendors.of')} <span className="font-medium">{totalVendors}</span> {t('vendors.results')}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('vendors.previous')}
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
                      {t('vendors.next')}
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        ) : (
          /* Vendors Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {vendors.map((vendor) => (
              <div key={vendor._id || vendor.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                {/* Vendor Logo */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700">
                  {vendor.logo ? (
                    <img 
                      src={vendor.logo} 
                      alt={vendor.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900">
                      <BuildingOfficeIcon className="h-12 w-12 text-blue-500 dark:text-blue-400" />
            </div>
          )}
        </div>

                {/* Vendor Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {vendor.name}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        vendor.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {vendor.isActive ? (
                          <>
                            <CheckIcon className="h-3 w-3 mr-1" />
                            {t('vendors.active')}
                          </>
                        ) : (
                          <>
                            <XMarkIcon className="h-3 w-3 mr-1" />
                            {t('vendors.inactive')}
                          </>
                        )}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        vendor.isVerified 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {vendor.isVerified ? (
                          <>
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            {t('vendors.verified')}
                          </>
                        ) : (
                          <>
                            <ShieldExclamationIcon className="h-3 w-3 mr-1" />
                            {t('vendors.unverified')}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {vendor.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {vendor.description}
                    </p>
                  )}

                  {/* Vendor Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <CubeIcon className="h-4 w-4" />
                      <span>{vendor.productCount || vendor.totalProducts || 0} {t('vendors.totalProducts')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span>{formatCurrency(vendor.totalSales || 0)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewVendor(vendor)}
                      className="flex-1 flex items-center justify-center gap-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('vendors.view')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVendor(vendor)}
                      className="flex-1 flex items-center justify-center gap-1"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('vendors.edit')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVendorClick(vendor)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('vendors.showing')} {((currentPage - 1) * vendorsPerPage) + 1} {t('vendors.of')} {Math.min(currentPage * vendorsPerPage, totalVendors)} {t('vendors.of')} {totalVendors} {t('vendors.vendors')}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <VendorModal
          isOpen={showAddModal || showEditModal}
          mode={showAddModal ? 'add' : 'edit'}
          vendor={selectedVendor}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onClose={handleCloseModal}
        />

        <VendorViewModal
          isOpen={showViewModal}
          vendor={selectedVendor}
          onClose={handleCloseModal}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                  <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('vendors.confirmDelete')}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminVendorsPage; 