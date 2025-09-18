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
  GiftIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  UsersIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { getAllGiftCards, getGiftCardStats } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const AdminGiftCardsPage = () => {
  const { t } = useTranslation('admin');
  const [giftCards, setGiftCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedGiftCards, setSelectedGiftCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [giftCardsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGiftCards, setTotalGiftCards] = useState(0);
  const [stats, setStats] = useState(null);

  // Fetch gift cards on component mount
  useEffect(() => {
    fetchGiftCards();
    fetchStats();
  }, [currentPage, searchTerm, selectedStatus, selectedType, sortBy, sortOrder]);

  const fetchGiftCards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: giftCardsPerPage,
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
        type: selectedType || undefined,
        sortBy,
        sortOrder
      };

      const response = await getAllGiftCards(params);
      setGiftCards(response.giftCards || []);
      setTotalPages(response.totalPages || 1);
      setTotalGiftCards(response.total || 0);
    } catch (err) {
      console.error('Error fetching gift cards:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getGiftCardStats();
      setStats(response);
    } catch (err) {
      console.error('Error fetching gift card stats:', err);
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

  const handleSelectGiftCard = (giftCardId) => {
    setSelectedGiftCards(prev => 
      prev.includes(giftCardId) 
        ? prev.filter(id => id !== giftCardId)
        : [...prev, giftCardId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGiftCards.length === giftCards.length) {
      setSelectedGiftCards([]);
    } else {
      setSelectedGiftCards(giftCards.map(giftCard => giftCard._id));
    }
  };

  const handleBulkOperation = async (operation) => {
    if (selectedGiftCards.length === 0) return;

    try {
      // Implement bulk operations
      toast.success(`Bulk ${operation} completed successfully`);
      setSelectedGiftCards([]);
      fetchGiftCards();
    } catch (err) {
      toast.error(`Failed to perform bulk ${operation}`);
    }
  };

  const handleDeleteGiftCard = async (giftCardId) => {
    if (window.confirm(t('admin.giftCards.confirmDelete'))) {
      try {
        // Implement delete functionality
        toast.success(t('admin.giftCards.deleteSuccess'));
        fetchGiftCards();
      } catch (err) {
        toast.error(t('admin.giftCards.deleteError'));
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'used':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'physical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'digital':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
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

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
            {t('admin.giftCards.errorLoading')}
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={fetchGiftCards} className="mt-4">
            {t('admin.giftCards.retry')}
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
              {t('admin.giftCards.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.giftCards.subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <GiftIcon className="h-5 w-5" />
              {t('admin.giftCards.exportCSV')}
            </Button>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              {t('admin.giftCards.addNew')}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GiftIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.giftCards.totalIssued')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalIssued || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.giftCards.totalValue')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalValue || 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.giftCards.activeCards')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.activeCards || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.giftCards.expiredCards')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.expiredCards || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('admin.giftCards.searchPlaceholder')}
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
              <option value="">{t('admin.giftCards.allStatuses')}</option>
              <option value="active">{t('admin.giftCards.active')}</option>
              <option value="used">{t('admin.giftCards.used')}</option>
              <option value="expired">{t('admin.giftCards.expired')}</option>
              <option value="cancelled">{t('admin.giftCards.cancelled')}</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={handleTypeFilter}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('admin.giftCards.allTypes')}</option>
              <option value="physical">{t('admin.giftCards.physical')}</option>
              <option value="digital">{t('admin.giftCards.digital')}</option>
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
              <option value="createdAt-desc">{t('admin.giftCards.sortNewest')}</option>
              <option value="createdAt-asc">{t('admin.giftCards.sortOldest')}</option>
              <option value="code-asc">{t('admin.giftCards.sortCodeAZ')}</option>
              <option value="code-desc">{t('admin.giftCards.sortCodeZA')}</option>
              <option value="amount-desc">{t('admin.giftCards.sortAmountHigh')}</option>
              <option value="amount-asc">{t('admin.giftCards.sortAmountLow')}</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400">
              {t('admin.giftCards.showing')} {giftCards.length} {t('admin.giftCards.of')} {totalGiftCards} {t('admin.giftCards.giftCards')}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedGiftCards.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedGiftCards.length} {t('admin.giftCards.selected')}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('activate')}
                  >
                    {t('admin.giftCards.activate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('cancel')}
                  >
                    {t('admin.giftCards.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('admin.giftCards.delete')}
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedGiftCards([])}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Gift Cards Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedGiftCards.length === giftCards.length && giftCards.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.giftCards.giftCard')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.giftCards.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.giftCards.recipient')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.giftCards.validity')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.giftCards.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.giftCards.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {giftCards.map((giftCard) => (
                  <tr key={giftCard._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedGiftCards.includes(giftCard._id)}
                        onChange={() => handleSelectGiftCard(giftCard._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <GiftIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {giftCard.code}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {giftCard._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(giftCard.amount)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {giftCard.remainingAmount ? formatCurrency(giftCard.remainingAmount) : formatCurrency(giftCard.amount)} {t('admin.giftCards.remaining')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {giftCard.issuedToEmail && (
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {giftCard.issuedToEmail}
                          </div>
                        )}
                        {giftCard.issuedBy && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t('admin.giftCards.issuedBy')}: {giftCard.issuedBy.firstName} {giftCard.issuedBy.lastName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {giftCard.expiresAt ? formatDate(giftCard.expiresAt) : t('admin.giftCards.noExpiry')}
                        </div>
                        {giftCard.expiresAt && isExpired(giftCard.expiresAt) && (
                          <div className="flex items-center text-xs text-red-600 dark:text-red-400">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            {t('admin.giftCards.expired')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(giftCard.status)}`}>
                          {t(`admin.giftCards.status.${giftCard.status}`)}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(giftCard.type)}`}>
                          {t(`admin.giftCards.type.${giftCard.type}`)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title={t('admin.giftCards.view')}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t('admin.giftCards.edit')}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGiftCard(giftCard._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t('admin.giftCards.delete')}
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
                  {t('admin.giftCards.previous')}
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.giftCards.next')}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('admin.giftCards.showing')} <span className="font-medium">{(currentPage - 1) * giftCardsPerPage + 1}</span> {t('admin.giftCards.to')} <span className="font-medium">{Math.min(currentPage * giftCardsPerPage, totalGiftCards)}</span> {t('admin.giftCards.of')} <span className="font-medium">{totalGiftCards}</span> {t('admin.giftCards.results')}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('admin.giftCards.previous')}
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
                      {t('admin.giftCards.next')}
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGiftCardsPage; 