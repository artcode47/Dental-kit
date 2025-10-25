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
  UserIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getAllUsers, bulkUserOperations, createUser, updateUser, deleteUser } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const AdminUsersPage = () => {
  const { t } = useTranslation('admin');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, selectedRole, selectedStatus, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder
      };

      const response = await getAllUsers(params);
      setUsers(response.users || []);
      setTotalPages(response.totalPages || 1);
      setTotalUsers(response.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e) => {
    setSelectedRole(e.target.value);
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

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleBulkOperation = async (operation) => {
    if (selectedUsers.length === 0) return;

    try {
      await bulkUserOperations(operation, selectedUsers);
      const successMessages = {
        verify: t('users.bulkVerifySuccess'),
        unverify: t('users.bulkUnverifySuccess'),
        delete: t('users.bulkDeleteSuccess')
      };
      toast.success(successMessages[operation] || `Bulk ${operation} completed successfully`);
      setSelectedUsers([]);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Bulk operation error:', error);
      toast.error(t('users.bulkOperationError'));
    }
  };



  const handleToggleVerification = async (userId, currentStatus) => {
    try {
      const operation = currentStatus ? 'unverify' : 'verify';
      await bulkUserOperations(operation, [userId]);
      toast.success(t('users.verificationUpdateSuccess'));
      fetchUsers();
    } catch (error) {
      console.error('Verification toggle error:', error);
      toast.error(t('users.verificationUpdateError'));
    }
  };

  // Modal Handlers
  const handleAddUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
      confirmPassword: ''
    });
    setShowAddModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      password: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleDeleteUserClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
      confirmPassword: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error(t('users.fillRequiredFields'));
        return;
      }

      if (showAddModal && (!formData.password || formData.password !== formData.confirmPassword)) {
        toast.error(t('users.passwordMismatch'));
        return;
      }

      // Prepare user data
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        role: formData.role
      };

      // Add password only for new users
      if (showAddModal) {
        userData.password = formData.password;
      }

      // Call API
      if (showAddModal) {
        await createUser(userData);
        toast.success(t('users.userCreatedSuccess'));
      } else {
        await updateUser(selectedUser.id, userData);
                  toast.success(t('users.userUpdatedSuccess'));
      }

      closeModals();
      fetchUsers();
    } catch (error) {
      console.error('Submit user error:', error);
              toast.error(showAddModal ? t('users.createUserError') : t('users.updateUserError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      toast.success(t('users.deleteSuccess'));
      closeModals();
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(t('users.deleteError'));
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'vendor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'dentist':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'clinic':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (isVerified) => {
    return isVerified 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
              {t('users.errorLoading')}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Button onClick={fetchUsers} className="mt-4">
              {t('users.retry')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Main Container - Aligned to Left Side */}
      <div className="pl-2 pr-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  {t('users.title')}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  {t('users.subtitle')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <EnvelopeIcon className="h-5 w-5" />
                  {t('users.exportCSV')}
                </Button>
                                 <Button 
                   className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100"
                   onClick={handleAddUser}
                 >
                   <PlusIcon className="h-5 w-5" />
                   {t('users.addNew')}
                 </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search - Mobile Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            {/* Search and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('users.searchPlaceholder')}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 sm:w-auto"
              >
                <FunnelIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Role Filter */}
                <select
                  value={selectedRole}
                  onChange={handleRoleFilter}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('users.allRoles')}</option>
                  <option value="user">{t('users.roleUser')}</option>
                  <option value="admin">{t('users.roleAdmin')}</option>
                  <option value="vendor">{t('users.roleVendor')}</option>
                  <option value="dentist">{t('users.roleDentist')}</option>
                  <option value="clinic">{t('users.roleClinic')}</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={handleStatusFilter}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('users.allStatuses')}</option>
                  <option value="verified">{t('users.verified')}</option>
                  <option value="unverified">{t('users.unverified')}</option>
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
                  <option value="createdAt-desc">{t('users.sortNewest')}</option>
                  <option value="createdAt-asc">{t('users.sortOldest')}</option>
                  <option value="firstName-asc">{t('users.sortNameAZ')}</option>
                  <option value="firstName-desc">{t('users.sortNameZA')}</option>
                  <option value="email-asc">{t('users.sortEmailAZ')}</option>
                  <option value="email-desc">{t('users.sortEmailZA')}</option>
                </select>
              </div>
            )}
            
            {/* Results Count - Always Visible */}
            <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              {t('users.showing')} {users.length} {t('users.of')} {totalUsers} {t('users.users')}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedUsers.length} {t('users.selected')}
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('verify')}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    {t('users.verify')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('unverify')}
                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                  >
                    {t('users.unverify')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('delete')}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {t('users.delete')}
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedUsers([])}
                className="text-blue-600 hover:text-blue-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Users Table - Responsive Design */}
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
                         checked={selectedUsers.length === users.length && users.length > 0}
                         onChange={handleSelectAll}
                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                       />
                     </th>
                     <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       {t('users.user')}
                     </th>
                     <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       {t('users.contact')}
                     </th>
                     <th 
                       className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                       onClick={() => handleSort('role')}
                     >
                       <div className="flex items-center gap-1">
                         {t('users.role')}
                         {sortBy === 'role' && (
                           sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                         )}
                       </div>
                     </th>
                     <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       {t('users.status')}
                     </th>
                     <th 
                       className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                       onClick={() => handleSort('createdAt')}
                     >
                       <div className="flex items-center gap-1">
                         {t('users.joined')}
                         {sortBy === 'createdAt' && (
                           sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                         )}
                       </div>
                     </th>
                     <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       {t('users.actions')}
                     </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                             <td className="px-2 py-4 whitespace-nowrap">
                         <input
                           type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                         />
                       </td>
                       <td className="px-2 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.profilePicture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.profilePicture}
                                alt={`${user.firstName} ${user.lastName}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {(user.id || '').slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                                             <td className="px-2 py-4 whitespace-nowrap">
                         <div className="space-y-1">
                           <div className="flex items-center text-sm text-gray-900 dark:text-white">
                             <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                             <span className="truncate max-w-[180px]">{user.email}</span>
                           </div>
                           {user.phone && (
                             <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                               <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                               {user.phone}
                             </div>
                           )}
                         </div>
                       </td>
                       <td className="px-2 py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                           {t(`roles.${user.role}`)}
                         </span>
                       </td>
                       <td className="px-2 py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.isVerified)}`}>
                           {user.isVerified ? t('users.verified') : t('users.unverified')}
                         </span>
                       </td>
                       <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                         <div className="flex items-center">
                           <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                           {formatDate(user.createdAt)}
                         </div>
                       </td>
                       <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleVerification(user.id, user.isVerified)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title={user.isVerified ? t('users.unverify') : t('users.verify')}
                          >
                            {user.isVerified ? (
                              <ShieldExclamationIcon className="h-4 w-4" />
                            ) : (
                              <ShieldCheckIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => handleViewUser(user)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            title={t('users.view')}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title={t('users.edit')}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUserClick(user)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title={t('users.delete')}
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
            {users.map((user) => (
              <div key={user.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.profilePicture ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profilePicture}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {(user.id || '').slice(-8)}
                        </div>
                      </div>
                                             <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleToggleVerification(user.id, user.isVerified)}
                           className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                           title={user.isVerified ? t('users.unverify') : t('users.verify')}
                         >
                           {user.isVerified ? (
                             <ShieldExclamationIcon className="h-4 w-4" />
                           ) : (
                             <ShieldCheckIcon className="h-4 w-4" />
                           )}
                         </button>
                         <button 
                           onClick={() => handleViewUser(user)}
                           className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                           title={t('users.view')}
                         >
                           <EyeIcon className="h-4 w-4" />
                         </button>
                         <button 
                           onClick={() => handleEditUser(user)}
                           className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                           title={t('users.edit')}
                         >
                           <PencilIcon className="h-4 w-4" />
                         </button>
                         <button
                           onClick={() => handleDeleteUserClick(user)}
                           className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                           title={t('users.delete')}
                         >
                           <TrashIcon className="h-4 w-4" />
                         </button>
                       </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-900 dark:text-white">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {t(`roles.${user.role}`)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.isVerified)}`}>
                            {user.isVerified ? t('users.verified') : t('users.unverified')}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  {t('users.previous')}
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  {t('users.next')}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('users.showing')} <span className="font-medium">{(currentPage - 1) * usersPerPage + 1}</span> {t('users.to')} <span className="font-medium">{Math.min(currentPage * usersPerPage, totalUsers)}</span> {t('users.of')} <span className="font-medium">{totalUsers}</span> {t('users.results')}
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
       </div>

       {/* Add User Modal */}
       {showAddModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                   {t('users.addNewUser')}
                 </h2>
                 <button
                   onClick={closeModals}
                   className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                 >
                   <XMarkIcon className="h-6 w-6" />
                 </button>
               </div>
               
               <form onSubmit={handleSubmitUser} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       {t('users.firstName')} *
                     </label>
                     <Input
                       type="text"
                       name="firstName"
                       value={formData.firstName}
                       onChange={handleFormChange}
                       required
                       className="w-full"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       {t('users.lastName')} *
                     </label>
                     <Input
                       type="text"
                       name="lastName"
                       value={formData.lastName}
                       onChange={handleFormChange}
                       required
                       className="w-full"
                     />
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {t('users.email')} *
                   </label>
                   <Input
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleFormChange}
                     required
                     className="w-full"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {t('users.phone')}
                   </label>
                   <Input
                     type="tel"
                     name="phone"
                     value={formData.phone}
                     onChange={handleFormChange}
                     className="w-full"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {t('users.role')}
                   </label>
                   <select
                     name="role"
                     value={formData.role}
                     onChange={handleFormChange}
                     className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                   >
                     <option value="user">{t('users.roleUser')}</option>
                     <option value="admin">{t('users.roleAdmin')}</option>
                     <option value="vendor">{t('users.roleVendor')}</option>
                     <option value="dentist">{t('users.roleDentist')}</option>
                     <option value="clinic">{t('users.roleClinic')}</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {t('users.password')} *
                   </label>
                   <Input
                     type="password"
                     name="password"
                     value={formData.password}
                     onChange={handleFormChange}
                     required
                     className="w-full"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {t('users.confirmPassword')} *
                   </label>
                   <Input
                     type="password"
                     name="confirmPassword"
                     value={formData.confirmPassword}
                     onChange={handleFormChange}
                     required
                     className="w-full"
                   />
                 </div>
                 
                 <div className="flex gap-3 pt-4">
                   <Button
                     type="button"
                     variant="outline"
                     onClick={closeModals}
                     className="flex-1"
                   >
                     {t('users.cancel')}
                   </Button>
                   <Button
                     type="submit"
                     disabled={isSubmitting}
                     className="flex-1"
                   >
                     {isSubmitting ? (
                       <LoadingSpinner size="sm" />
                     ) : (
                       t('users.createUser')
                     )}
                   </Button>
                 </div>
               </form>
             </div>
           </div>
         </div>
       )}

       {/* Edit User Modal */}
       {showEditModal && selectedUser && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                   {t('users.editUser')}
                 </h2>
                 <button
                   onClick={closeModals}
                   className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                 >
                   <XMarkIcon className="h-6 w-6" />
                 </button>
               </div>
               
               <form onSubmit={handleSubmitUser} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       {t('users.firstName')} *
                     </label>
                     <Input
                       type="text"
                       name="firstName"
                       value={formData.firstName}
                       onChange={handleFormChange}
                       required
                       className="w-full"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       {t('users.lastName')} *
                     </label>
                     <Input
                       type="text"
                       name="lastName"
                       value={formData.lastName}
                       onChange={handleFormChange}
                       required
                       className="w-full"
                     />
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {t('users.email')} *
                   </label>
                   <Input
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleFormChange}
                     required
                     className="w-full"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {t('users.phone')}
                   </label>
                   <Input
                     type="tel"
                     name="phone"
                     value={formData.phone}
                     onChange={handleFormChange}
                     className="w-full"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     {t('users.role')}
                   </label>
                   <select
                     name="role"
                     value={formData.role}
                     onChange={handleFormChange}
                     className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                   >
                     <option value="user">{t('users.roleUser')}</option>
                     <option value="admin">{t('users.roleAdmin')}</option>
                     <option value="vendor">{t('users.roleVendor')}</option>
                     <option value="dentist">{t('users.roleDentist')}</option>
                     <option value="clinic">{t('users.roleClinic')}</option>
                   </select>
                 </div>
                 
                 <div className="flex gap-3 pt-4">
                   <Button
                     type="button"
                     variant="outline"
                     onClick={closeModals}
                     className="flex-1"
                   >
                     {t('users.cancel')}
                   </Button>
                   <Button
                     type="submit"
                     disabled={isSubmitting}
                     className="flex-1"
                   >
                     {isSubmitting ? (
                       <LoadingSpinner size="sm" />
                     ) : (
                       t('users.updateUser')
                     )}
                   </Button>
                 </div>
               </form>
             </div>
           </div>
         </div>
       )}

       {/* View User Modal */}
       {showViewModal && selectedUser && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
             <div className="p-6">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                   {t('users.userDetails')}
                 </h2>
                 <button
                   onClick={closeModals}
                   className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                 >
                   <XMarkIcon className="h-6 w-6" />
                 </button>
               </div>
               
               <div className="space-y-4">
                 <div className="flex items-center space-x-4">
                   <div className="h-16 w-16 flex-shrink-0">
                     {selectedUser.profilePicture ? (
                       <img
                         className="h-16 w-16 rounded-full object-cover"
                         src={selectedUser.profilePicture}
                         alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                       />
                     ) : (
                       <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                         <UserIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                       </div>
                     )}
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                       {selectedUser.firstName} {selectedUser.lastName}
                     </h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                       ID: {selectedUser.id}
                     </p>
                   </div>
                 </div>
                 
                 <div className="space-y-3">
                   <div className="flex items-center">
                     <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                     <span className="text-gray-900 dark:text-white">{selectedUser.email}</span>
                   </div>
                   
                   {selectedUser.phone && (
                     <div className="flex items-center">
                       <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                       <span className="text-gray-900 dark:text-white">{selectedUser.phone}</span>
                     </div>
                   )}
                   
                   <div className="flex items-center">
                     <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                     <span className="text-gray-900 dark:text-white">
                       {t('users.joined')}: {formatDate(selectedUser.createdAt)}
                     </span>
                   </div>
                   
                   <div className="flex items-center">
                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                       {t(`roles.${selectedUser.role}`)}
                     </span>
                   </div>
                   
                   <div className="flex items-center">
                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedUser.isVerified)}`}>
                       {selectedUser.isVerified ? t('users.verified') : t('users.unverified')}
                     </span>
                   </div>
                 </div>
                 
                 <div className="flex gap-3 pt-4">
                   <Button
                     type="button"
                     variant="outline"
                     onClick={closeModals}
                     className="flex-1"
                   >
                     {t('users.close')}
                   </Button>
                   <Button
                     type="button"
                     onClick={() => {
                       closeModals();
                       handleEditUser(selectedUser);
                     }}
                     className="flex-1"
                   >
                     {t('users.edit')}
                   </Button>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteModal && selectedUser && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
             <div className="p-6">
               <div className="flex items-center mb-4">
                 <div className="flex-shrink-0">
                   <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                 </div>
                 <div className="ml-3">
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                     {t('users.confirmDeleteTitle')}
                   </h3>
                 </div>
               </div>
               
               <div className="mt-2">
                 <p className="text-sm text-gray-500 dark:text-gray-400">
                   {t('users.confirmDeleteMessage', { 
                     name: selectedUser.firstName && selectedUser.lastName 
                       ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                       : selectedUser.firstName || selectedUser.lastName || selectedUser.email || 'this user'
                   })}
                 </p>
               </div>
               
               <div className="flex gap-3 mt-6">
                 <Button
                   type="button"
                   variant="outline"
                   onClick={closeModals}
                   className="flex-1"
                 >
                   {t('users.cancel')}
                 </Button>
                 <Button
                   type="button"
                   variant="danger"
                   onClick={handleConfirmDelete}
                   className="flex-1"
                 >
                   {t('users.delete')}
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}
     </AdminLayout>
   );
 };

export default AdminUsersPage; 