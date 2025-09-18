import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  GlobeAltIcon,
  BellIcon,
  ShieldCheckIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  LanguageIcon,
  EnvelopeIcon,
  UserIcon,
  CogIcon,
  KeyIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  HeartIcon,
  CreditCardIcon,
  TruckIcon,
  StarIcon,
  EyeIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolidFilled,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';

const DashboardPage = () => {
  const { t } = useTranslation('ecommerce');
  const { user, getProfile, updateProfile, uploadProfileImage } = useAuth();

  // Dashboard states
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    reviewsCount: 0
  });

  // Profile states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    university: '',
    country: '',
    governorate: '',
    timezone: '',
    language: 'en'
  });

  // Countries and governorates data
  const countries = [
    { code: 'EG', name: 'Egypt' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'QA', name: 'Qatar' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'OM', name: 'Oman' },
    { code: 'JO', name: 'Jordan' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' }
  ];

  const governorates = {
    EG: [
      'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia',
      'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh',
      'Luxor', 'Matruh', 'Minya', 'Monufia', 'New Valley', 'North Sinai',
      'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag',
      'South Sinai', 'Suez'
    ],
    SA: [
      'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif', 'Tabuk',
      'Abha', 'Jizan', 'Najran', 'Al Bahah', 'Al Jouf', 'Al Qassim',
      'Hail', 'Northern Borders', 'Eastern Province'
    ]
  };

  const timezones = [
    { value: 'EET', label: 'Eastern European Time (EET)' },
    { value: 'EEST', label: 'Eastern European Summer Time (EEST)' },
    { value: 'AST', label: 'Arabia Standard Time (AST)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'EST', label: 'Eastern Standard Time (EST)' },
    { value: 'PST', label: 'Pacific Standard Time (PST)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' }
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user profile
      await getProfile();
      
      // Fetch orders
      const ordersResponse = await api.get('/orders?limit=5');
      setOrders(ordersResponse.data.orders || []);
      
      // Fetch wishlist
      const wishlistResponse = await api.get('/wishlist');
      setWishlistItems(wishlistResponse.data.items || []);
      
      // Fetch stats
      const statsResponse = await api.get('/users/stats');
      setStats(statsResponse.data || {
        totalOrders: 0,
        totalSpent: 0,
        wishlistCount: 0,
        reviewsCount: 0
      });
      
      // Fetch recent activity
      const activityResponse = await api.get('/users/activity');
      setRecentActivity(activityResponse.data.activities || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error(t('dashboard.error.loadData'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        university: user.university || '',
        country: user.country || 'EG',
        governorate: user.governorate || '',
        timezone: user.timezone || 'EET',
        language: user.language || 'en'
      });
    }
  }, [user]);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      setIsEditing(false);
      toast.success(t('profile.updated'));
    } catch {
      toast.error(t('profile.error.update'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      await uploadProfileImage(file);
      toast.success(t('profile.imageUpdated'));
    } catch {
      toast.error(t('profile.error.imageUpload'));
    } finally {
      setIsUploadingImage(false);
    }
  };



  // Get order status icon and color
  const getOrderStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { icon: ClockIconSolidFilled, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'processing':
        return { icon: ClockIconSolidFilled, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'shipped':
        return { icon: TruckIcon, color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case 'delivered':
        return { icon: CheckCircleIconSolid, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'cancelled':
        return { icon: ExclamationTriangleIconSolid, color: 'text-red-600', bgColor: 'bg-red-100' };
      default:
        return { icon: ClockIconSolidFilled, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dashboard.welcome')}, {user?.firstName || user?.email}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('dashboard.stats.totalOrders')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('dashboard.stats.totalSpent')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(stats.totalSpent)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <HeartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('dashboard.stats.wishlistItems')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.wishlistCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <StarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('dashboard.stats.reviews')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.reviewsCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex overflow-x-auto space-x-2 sm:space-x-8 px-4 sm:px-6">
              {[
                { id: 'overview', label: t('dashboard.tabs.overview'), icon: EyeIcon },
                { id: 'profile', label: t('dashboard.tabs.profile'), icon: UserIcon },
                { id: 'orders', label: t('dashboard.tabs.orders'), icon: ShoppingBagIcon },
                { id: 'wishlist', label: t('dashboard.tabs.wishlist'), icon: HeartIcon },
                { id: 'activity', label: t('dashboard.tabs.activity'), icon: ClockIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Orders */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('dashboard.recentOrders')}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('orders')}
                    >
                      {t('dashboard.viewAll')}
                    </Button>
                  </div>
                  {orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => {
                        const statusInfo = getOrderStatusInfo(order.status);
                        return (
                          <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                                <statusInfo.icon className={`h-4 w-4 ${statusInfo.color}`} />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {t('dashboard.order')} #{order.orderNumber}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatPrice(order.total)}
                              </p>
                              <p className={`text-xs ${statusInfo.color}`}>
                                {order.status}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {t('dashboard.noOrders')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Wishlist Preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('dashboard.wishlistPreview')}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('wishlist')}
                    >
                      {t('dashboard.viewAll')}
                    </Button>
                  </div>
                  {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistItems.slice(0, 3).map((item) => (
                        <div key={item._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-12 w-12 object-cover rounded-lg"
                            />
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {item.product.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatPrice(item.product.price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {t('dashboard.noWishlistItems')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600">
                      <CameraIcon className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.firstName')}
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.lastName')}
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.email')}
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.phone')}
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.company')}
                    </label>
                    <Input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.university')}
                    </label>
                    <Input
                      type="text"
                      value={formData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.country')}
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.governorate')}
                    </label>
                    <select
                      value={formData.governorate}
                      onChange={(e) => handleInputChange('governorate', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{t('profile.selectGovernorate')}</option>
                      {governorates[formData.country]?.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.timezone')}
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.language')}
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="flex justify-end space-x-4">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form data
                          if (user) {
                            setFormData({
                              firstName: user.firstName || '',
                              lastName: user.lastName || '',
                              email: user.email || '',
                              phone: user.phone || '',
                              company: user.company || '',
                              university: user.university || '',
                              country: user.country || 'EG',
                              governorate: user.governorate || '',
                              timezone: user.timezone || 'EET',
                              language: user.language || 'en'
                            });
                          }
                        }}
                        disabled={isSaving}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? t('common.saving') : t('common.save')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                    >
                      {t('profile.edit')}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('dashboard.orders')}
                </h3>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusInfo = getOrderStatusInfo(order.status);
                      return (
                        <div key={order._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                                <statusInfo.icon className={`h-5 w-5 ${statusInfo.color}`} />
                              </div>
                              <div className="ml-3">
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {t('dashboard.order')} #{order.orderNumber}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatPrice(order.total)}
                              </p>
                              <p className={`text-sm font-medium ${statusInfo.color}`}>
                                {order.status}
                              </p>
                            </div>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t('dashboard.shippingAddress')}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {order.shippingAddress?.address1}, {order.shippingAddress?.city}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t('dashboard.items')}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {order.items?.length || 0} {t('dashboard.items')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {t('dashboard.noOrders')}
                    </p>
                    <Button onClick={() => window.location.href = '/products'}>
                      {t('dashboard.startShopping')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('dashboard.wishlist')}
                </h3>
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <div key={item._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {item.product.name}
                        </h4>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                          {formatPrice(item.product.price)}
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => window.location.href = `/products/${item.product._id}`}
                          >
                            {t('dashboard.viewProduct')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Add to cart logic
                              toast.success(t('cart.added'));
                            }}
                          >
                            {t('dashboard.addToCart')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {t('dashboard.noWishlistItems')}
                    </p>
                    <Button onClick={() => window.location.href = '/products'}>
                      {t('dashboard.startShopping')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('dashboard.recentActivity')}
                </h3>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('dashboard.noActivity')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 