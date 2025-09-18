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
  BellIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const AdminNotificationsPage = () => {
  const { t } = useTranslation('admin');
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  
  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'email',
    isActive: true
  });
  const [sendFormData, setSendFormData] = useState({
    template: '',
    recipients: '',
    subject: '',
    message: '',
    type: 'email'
  });

  // Mock data for development
  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, [currentPage, searchTerm, selectedType, selectedStatus, sortBy, sortOrder]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data for development
      const mockNotifications = [
        {
          _id: '1',
          type: 'email',
          title: 'New Order Notification',
          message: 'Order #ORD-001 has been placed by John Doe',
          recipient: 'admin@dental.com',
          status: 'sent',
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 4 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          type: 'sms',
          title: 'Low Stock Alert',
          message: 'Dental Scaler is running low (3 items left)',
          recipient: '+1234567890',
          status: 'pending',
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          type: 'push',
          title: 'New User Registration',
          message: 'Jane Smith has registered a new account',
          recipient: 'all',
          status: 'sent',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 29 * 60 * 1000).toISOString()
        },
        {
          _id: '4',
          type: 'email',
          title: 'Payment Failed',
          message: 'Payment for order #ORD-002 has failed',
          recipient: 'admin@dental.com',
          status: 'failed',
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          error: 'Invalid payment method'
        }
      ];

      setNotifications(mockNotifications);
      setTotalPages(1);
      setTotalNotifications(mockNotifications.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      // Mock data for development
      const mockTemplates = [
        {
          _id: '1',
          name: 'Order Confirmation',
          subject: 'Order Confirmation - #{orderNumber}',
          content: 'Dear {customerName}, your order #{orderNumber} has been confirmed...',
          type: 'email',
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          name: 'Low Stock Alert',
          subject: 'Low Stock Alert - {productName}',
          content: 'The product {productName} is running low on stock ({stock} items left)...',
          type: 'email',
          isActive: true,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          name: 'Welcome Message',
          subject: 'Welcome to Dental Store',
          content: 'Welcome {customerName}! Thank you for joining our dental store...',
          type: 'email',
          isActive: true,
          createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
        }
      ];

      setTemplates(mockTemplates);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (e) => {
    setSelectedType(e.target.value);
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

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(notification => notification._id));
    }
  };

  const handleResendNotification = async (notificationId) => {
    try {
      // TODO: Implement resend notification API call
      toast.success(t('admin.notifications.resendSuccess'));
      fetchNotifications();
    } catch (err) {
      toast.error(t('admin.notifications.resendError'));
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm(t('admin.notifications.confirmDelete'))) {
      try {
        // TODO: Implement delete notification API call
        toast.success(t('admin.notifications.deleteSuccess'));
        fetchNotifications();
      } catch (err) {
        toast.error(t('admin.notifications.deleteError'));
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    if (window.confirm(t('admin.notifications.confirmBulkDelete'))) {
      try {
        // TODO: Implement bulk delete API call
        toast.success(t('admin.notifications.bulkDeleteSuccess'));
        setSelectedNotifications([]);
        fetchNotifications();
      } catch (err) {
        toast.error(t('admin.notifications.bulkDeleteError'));
      }
    }
  };

  const openTemplateModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateFormData({
        name: template.name || '',
        subject: template.subject || '',
        content: template.content || '',
        type: template.type || 'email',
        isActive: template.isActive !== false
      });
    } else {
      setEditingTemplate(null);
      setTemplateFormData({
        name: '',
        subject: '',
        content: '',
        type: 'email',
        isActive: true
      });
    }
    setShowTemplateModal(true);
  };

  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setEditingTemplate(null);
    setTemplateFormData({
      name: '',
      subject: '',
      content: '',
      type: 'email',
      isActive: true
    });
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // TODO: Implement template create/update API call
      toast.success(editingTemplate ? t('admin.notifications.templateUpdateSuccess') : t('admin.notifications.templateCreateSuccess'));
      closeTemplateModal();
      fetchTemplates();
    } catch (err) {
      toast.error(editingTemplate ? t('admin.notifications.templateUpdateError') : t('admin.notifications.templateCreateError'));
    }
  };

  const handleTemplateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplateFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openSendModal = () => {
    setShowSendModal(true);
  };

  const closeSendModal = () => {
    setShowSendModal(false);
    setSendFormData({
      template: '',
      recipients: '',
      subject: '',
      message: '',
      type: 'email'
    });
  };

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // TODO: Implement send notification API call
      toast.success(t('admin.notifications.sendSuccess'));
      closeSendModal();
      fetchNotifications();
    } catch (err) {
      toast.error(t('admin.notifications.sendError'));
    }
  };

  const handleSendInputChange = (e) => {
    const { name, value } = e.target;
    setSendFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sms':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'push':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'sms':
        return <BellIcon className="h-4 w-4" />;
      case 'push':
        return <PaperAirplaneIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
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
            {t('admin.notifications.errorLoading')}
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={fetchNotifications} className="mt-4">
            {t('admin.notifications.retry')}
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
              {t('admin.notifications.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.notifications.subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2" onClick={openTemplateModal}>
              <CogIcon className="h-5 w-5" />
              {t('admin.notifications.manageTemplates')}
            </Button>
            <Button className="flex items-center gap-2" onClick={openSendModal}>
              <PaperAirplaneIcon className="h-5 w-5" />
              {t('admin.notifications.sendNotification')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('admin.notifications.totalSent')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {notifications.filter(n => n.status === 'sent').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('admin.notifications.pending')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {notifications.filter(n => n.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('admin.notifications.failed')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {notifications.filter(n => n.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <CogIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('admin.notifications.templates')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {templates.length}
                </p>
              </div>
            </div>
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
                placeholder={t('admin.notifications.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={handleTypeFilter}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('admin.notifications.allTypes')}</option>
              <option value="email">{t('admin.notifications.email')}</option>
              <option value="sms">{t('admin.notifications.sms')}</option>
              <option value="push">{t('admin.notifications.push')}</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('admin.notifications.allStatuses')}</option>
              <option value="sent">{t('admin.notifications.sent')}</option>
              <option value="pending">{t('admin.notifications.pending')}</option>
              <option value="failed">{t('admin.notifications.failed')}</option>
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
              <option value="createdAt-desc">{t('admin.notifications.sortNewest')}</option>
              <option value="createdAt-asc">{t('admin.notifications.sortOldest')}</option>
              <option value="type-asc">{t('admin.notifications.sortTypeAZ')}</option>
              <option value="status-asc">{t('admin.notifications.sortStatusAZ')}</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400">
              {t('admin.notifications.showing')} {notifications.length} {t('admin.notifications.of')} {totalNotifications} {t('admin.notifications.notifications')}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedNotifications.length} {t('admin.notifications.selected')}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('admin.notifications.delete')}
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedNotifications([])}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Notifications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.notifications.notification')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.notifications.recipient')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.notifications.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.notifications.status')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      {t('admin.notifications.date')}
                      {sortBy === 'createdAt' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.notifications.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <tr key={notification._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => handleSelectNotification(notification._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                          {notification.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {notification.recipient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                          <span className="ml-1">{t(`admin.notifications.${notification.type}`)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(notification.status)}`}>
                          {getStatusIcon(notification.status)}
                          <span className="ml-1">{t(`admin.notifications.${notification.status}`)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(notification.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title={t('admin.notifications.view')}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {notification.status === 'failed' && (
                          <button
                            onClick={() => handleResendNotification(notification._id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title={t('admin.notifications.resend')}
                          >
                            <PaperAirplaneIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t('admin.notifications.delete')}
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
                  {t('admin.notifications.previous')}
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.notifications.next')}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('admin.notifications.showing')} <span className="font-medium">{(currentPage - 1) * notificationsPerPage + 1}</span> {t('admin.notifications.to')} <span className="font-medium">{Math.min(currentPage * notificationsPerPage, totalNotifications)}</span> {t('admin.notifications.of')} <span className="font-medium">{totalNotifications}</span> {t('admin.notifications.results')}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('admin.notifications.previous')}
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
                      {t('admin.notifications.next')}
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingTemplate ? t('admin.notifications.editTemplate') : t('admin.notifications.addTemplate')}
                </h3>
                <form onSubmit={handleTemplateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.notifications.templateName')}
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={templateFormData.name}
                      onChange={handleTemplateInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.notifications.subject')}
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={templateFormData.subject}
                      onChange={handleTemplateInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.notifications.content')}
                    </label>
                    <textarea
                      name="content"
                      value={templateFormData.content}
                      onChange={handleTemplateInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.notifications.type')}
                    </label>
                    <select
                      name="type"
                      value={templateFormData.type}
                      onChange={handleTemplateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="email">{t('admin.notifications.email')}</option>
                      <option value="sms">{t('admin.notifications.sms')}</option>
                      <option value="push">{t('admin.notifications.push')}</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={templateFormData.isActive}
                      onChange={handleTemplateInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                      {t('admin.notifications.active')}
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeTemplateModal}
                    >
                      {t('admin.notifications.cancel')}
                    </Button>
                    <Button type="submit">
                      {editingTemplate ? t('admin.notifications.update') : t('admin.notifications.create')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Send Notification Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('admin.notifications.sendNotification')}
                </h3>
                <form onSubmit={handleSendSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.notifications.template')}
                    </label>
                    <select
                      name="template"
                      value={sendFormData.template}
                      onChange={handleSendInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{t('admin.notifications.selectTemplate')}</option>
                      {templates.map(template => (
                        <option key={template._id} value={template._id}>{template.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.notifications.recipients')}
                    </label>
                    <Input
                      type="text"
                      name="recipients"
                      value={sendFormData.recipients}
                      onChange={handleSendInputChange}
                      placeholder={t('admin.notifications.recipientsPlaceholder')}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.notifications.subject')}
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={sendFormData.subject}
                      onChange={handleSendInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.notifications.message')}
                    </label>
                    <textarea
                      name="message"
                      value={sendFormData.message}
                      onChange={handleSendInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.notifications.type')}
                    </label>
                    <select
                      name="type"
                      value={sendFormData.type}
                      onChange={handleSendInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="email">{t('admin.notifications.email')}</option>
                      <option value="sms">{t('admin.notifications.sms')}</option>
                      <option value="push">{t('admin.notifications.push')}</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeSendModal}
                    >
                      {t('admin.notifications.cancel')}
                    </Button>
                    <Button type="submit">
                      {t('admin.notifications.send')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage; 