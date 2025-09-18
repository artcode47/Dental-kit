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
  StarIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { getAllReviews } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const AdminReviewsPage = () => {
  const { t } = useTranslation('admin');
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, [currentPage, searchTerm, selectedRating, selectedStatus, sortBy, sortOrder]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: reviewsPerPage,
        search: searchTerm || undefined,
        rating: selectedRating || undefined,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder
      };

      const response = await getAllReviews(params);
      setReviews(response.reviews || []);
      setTotalPages(response.totalPages || 1);
      setTotalReviews(response.total || 0);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRatingFilter = (e) => {
    setSelectedRating(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
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

  const handleSelectReview = (reviewId) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(review => review._id));
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      // TODO: Implement approve review API call
      toast.success(t('admin.reviews.approveSuccess'));
      fetchReviews();
    } catch (err) {
      toast.error(t('admin.reviews.approveError'));
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      // TODO: Implement reject review API call
      toast.success(t('admin.reviews.rejectSuccess'));
      fetchReviews();
    } catch (err) {
      toast.error(t('admin.reviews.rejectError'));
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm(t('admin.reviews.confirmDelete'))) {
      try {
        // TODO: Implement delete review API call
        toast.success(t('admin.reviews.deleteSuccess'));
        fetchReviews();
      } catch (err) {
        toast.error(t('admin.reviews.deleteError'));
      }
    }
  };

  const handleBulkApprove = async () => {
    if (selectedReviews.length === 0) return;

    try {
      // TODO: Implement bulk approve API call
      toast.success(t('admin.reviews.bulkApproveSuccess'));
      setSelectedReviews([]);
      fetchReviews();
    } catch (err) {
      toast.error(t('admin.reviews.bulkApproveError'));
    }
  };

  const handleBulkReject = async () => {
    if (selectedReviews.length === 0) return;

    try {
      // TODO: Implement bulk reject API call
      toast.success(t('admin.reviews.bulkRejectSuccess'));
      setSelectedReviews([]);
      fetchReviews();
    } catch (err) {
      toast.error(t('admin.reviews.bulkRejectError'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) return;

    if (window.confirm(t('admin.reviews.confirmBulkDelete'))) {
      try {
        // TODO: Implement bulk delete API call
        toast.success(t('admin.reviews.bulkDeleteSuccess'));
        setSelectedReviews([]);
        fetchReviews();
      } catch (err) {
        toast.error(t('admin.reviews.bulkDeleteError'));
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            {t('admin.reviews.errorLoading')}
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={fetchReviews} className="mt-4">
            {t('admin.reviews.retry')}
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
              {t('admin.reviews.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.reviews.subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <ChatBubbleLeftIcon className="h-5 w-5" />
              {t('admin.reviews.exportCSV')}
            </Button>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              {t('admin.reviews.addReview')}
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('admin.reviews.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={selectedRating}
              onChange={handleRatingFilter}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('admin.reviews.allRatings')}</option>
              <option value="5">5 {t('admin.reviews.stars')}</option>
              <option value="4">4 {t('admin.reviews.stars')}</option>
              <option value="3">3 {t('admin.reviews.stars')}</option>
              <option value="2">2 {t('admin.reviews.stars')}</option>
              <option value="1">1 {t('admin.reviews.star')}</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('admin.reviews.allStatuses')}</option>
              <option value="pending">{t('admin.reviews.pending')}</option>
              <option value="approved">{t('admin.reviews.approved')}</option>
              <option value="rejected">{t('admin.reviews.rejected')}</option>
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
              <option value="createdAt-desc">{t('admin.reviews.sortNewest')}</option>
              <option value="createdAt-asc">{t('admin.reviews.sortOldest')}</option>
              <option value="rating-desc">{t('admin.reviews.sortRatingHigh')}</option>
              <option value="rating-asc">{t('admin.reviews.sortRatingLow')}</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400">
              {t('admin.reviews.showing')} {reviews.length} {t('admin.reviews.of')} {totalReviews} {t('admin.reviews.reviews')}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedReviews.length} {t('admin.reviews.selected')}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkApprove}
                    className="text-green-600 hover:text-green-700"
                  >
                    {t('admin.reviews.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkReject}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('admin.reviews.reject')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('admin.reviews.delete')}
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedReviews([])}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Reviews Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReviews.length === reviews.length && reviews.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.reviews.review')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.reviews.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.reviews.product')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center gap-1">
                      {t('admin.reviews.rating')}
                      {sortBy === 'rating' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.reviews.status')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      {t('admin.reviews.date')}
                      {sortBy === 'createdAt' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.reviews.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review._id)}
                        onChange={() => handleSelectReview(review._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                          {review.title || t('admin.reviews.noTitle')}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {review.comment || t('admin.reviews.noComment')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          {review.user?.profilePicture ? (
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={review.user.profilePicture}
                              alt={`${review.user.firstName} ${review.user.lastName}`}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.user?.firstName} {review.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {review.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {review.product?.name || t('admin.reviews.productNotFound')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {review.product?.category?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRatingStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          ({review.rating}/5)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(review.status)}`}>
                        {t(`admin.reviews.${review.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(review.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title={t('admin.reviews.view')}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveReview(review._id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title={t('admin.reviews.approve')}
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectReview(review._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title={t('admin.reviews.reject')}
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => openModal(review)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t('admin.reviews.edit')}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t('admin.reviews.delete')}
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
                  {t('admin.reviews.previous')}
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.reviews.next')}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('admin.reviews.showing')} <span className="font-medium">{(currentPage - 1) * reviewsPerPage + 1}</span> {t('admin.reviews.to')} <span className="font-medium">{Math.min(currentPage * reviewsPerPage, totalReviews)}</span> {t('admin.reviews.of')} <span className="font-medium">{totalReviews}</span> {t('admin.reviews.results')}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('admin.reviews.previous')}
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
                      {t('admin.reviews.next')}
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

export default AdminReviewsPage; 