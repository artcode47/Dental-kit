import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';
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
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, getProfile, updateProfile, uploadProfileImage, deleteAccount, logout } = useAuth();
  const { isRTL } = useLanguage();
  const { currentTheme, isDark } = useTheme();

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    promotional: true
  });

  // Profile image
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Countries and governorates data
  const countries = [
    { code: 'EG', name: 'Egypt' },
    { code: 'SA', name: 'Saudi Arabia' }
  ];

  const governorates = {
    EG: [
      'Alexandria',
      'Aswan',
      'Asyut',
      'Beheira',
      'Beni Suef',
      'Cairo',
      'Dakahlia',
      'Damietta',
      'Faiyum',
      'Gharbia',
      'Giza',
      'Ismailia',
      'Kafr El Sheikh',
      'Luxor',
      'Matruh',
      'Minya',
      'Monufia',
      'New Valley',
      'North Sinai',
      'Port Said',
      'Qalyubia',
      'Qena',
      'Red Sea',
      'Sharqia',
      'Sohag',
      'South Sinai',
      'Suez'
    ],
    SA: [
      'Riyadh',
      'Jeddah',
      'Mecca',
      'Medina',
      'Dammam',
      'Taif',
      'Tabuk',
      'Abha',
      'Jizan',
      'Najran',
      'Al Bahah',
      'Al Jouf',
      'Al Qassim',
      'Hail',
      'Northern Borders',
      'Eastern Province'
    ]
  };

  // Timezones
  const timezones = [
    { value: 'EET', label: 'Eastern European Time (EET)' },
    { value: 'EEST', label: 'Eastern European Summer Time (EEST)' },
    { value: 'AST', label: 'Arabia Standard Time (AST)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' }
  ];

  // Languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' }
  ];

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        await getProfile();
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(t('profile.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have user data or if user data is incomplete
    if (!user || !user.firstName) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []); // Empty dependency array to run only once

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

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle notification preference changes
  const handleNotificationChange = useCallback((type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  }, []);

  // Handle profile image upload
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    setImagePreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      await uploadProfileImage(formData);
      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload profile image');
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  }, [uploadProfileImage]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email'];
      const missingFields = requiredFields.filter(field => !formData[field]?.trim());
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Clean up form data - remove empty strings and set to undefined for optional fields
      const cleanedData = {
        ...formData,
        company: formData.company?.trim() || undefined,
        university: formData.university?.trim() || undefined,
        governorate: formData.governorate?.trim() || undefined,
        phone: formData.phone?.trim() || undefined
      };

      await updateProfile(cleanedData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => `${err.path}: ${err.msg}`).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  }, [formData, updateProfile]);

  // Handle account deletion
  const handleDeleteAccount = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    try {
      await deleteAccount();
        toast.success('Account deleted successfully');
    } catch (error) {
        console.error('Account deletion error:', error);
        toast.error('Failed to delete account');
      }
    }
  }, [deleteAccount]);

  // Get user's full name
  const getFullName = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  };

  // Get user's role display name
  const getUserRole = () => {
    const role = user?.role || 'customer';
    return t(`roles.${role}`);
  };

  // Get country name
  const getCountryName = (code) => {
    const country = countries.find(c => c.code === code);
    return country ? country.name : code;
  };

  // Get language name
  const getLanguageName = (code) => {
    const language = languages.find(l => l.code === code);
    return language ? language.name : code;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="w-full max-w-md mx-4">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-16 h-16 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700 transition-colors">
                    <CameraIcon className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                      disabled={isUploadingImage}
                  />
                  </label>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {getFullName()}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {getUserRole()}
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getCountryName(user?.country)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                >
                  {isEditing ? (
                    <>
                      <XMarkIcon className="w-5 h-5 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PencilIcon className="w-5 h-5 mr-1" />
                      Edit
                    </>
                  )}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Required fields note */}
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="text-red-600 dark:text-red-400">*</span> Required fields
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name *"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    leftIcon={<UserIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                    className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                  <Input
                    label="Last Name *"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    leftIcon={<UserIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                    className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <Input
                  label="Email *"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={true}
                  leftIcon={<EnvelopeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                  className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />

                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  leftIcon={<PhoneIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                  className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />

                <Input
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  leftIcon={<BuildingOfficeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                  className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />

                <Input
                  label="University"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  leftIcon={<AcademicCapIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                  className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-light-300 mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-light-300 mb-2">
                      Governorate
                    </label>
                    <select
                      name="governorate"
                      value={formData.governorate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    >
                      <option value="">Select Governorate</option>
                      {governorates[formData.country]?.map(governorate => (
                        <option key={governorate} value={governorate}>
                          {governorate}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-light-300 mb-2">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    >
                      {timezones.map(timezone => (
                        <option key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-light-300 mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    >
                      {languages.map(language => (
                        <option key={language.code} value={language.code}>
                          {language.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSaving}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Sidebar - Profile Info */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-32 h-32 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                        {user?.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="w-20 h-20 text-teal-600 dark:text-teal-400" />
                        )}
                      </div>
                      <label className="absolute bottom-2 right-2 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700 transition-colors shadow-lg">
                        <CameraIcon className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploadingImage}
                        />
                      </label>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {getFullName()}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {getUserRole()}
                    </p>
                    
                    {/* Profile Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getCountryName(user?.country)}
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-center px-4 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 rounded-lg transition-colors">
                        <CogIcon className="w-5 h-5 mr-2" />
                        Settings
                      </button>
                      <button className="w-full flex items-center justify-center px-4 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 rounded-lg transition-colors">
                        <KeyIcon className="w-5 h-5 mr-2" />
                        Security
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Profile Form */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Profile Information
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        Update your personal information and preferences
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center px-4 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                    >
                      {isEditing ? (
                        <>
                          <XMarkIcon className="w-5 h-5 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <PencilIcon className="w-5 h-5 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Required fields note */}
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="text-red-600 dark:text-red-400">*</span> Required fields
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                        label="First Name *"
                        name="firstName"
                            value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        leftIcon={<UserIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                        className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                      <Input
                        label="Last Name *"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                            disabled={!isEditing}
                        leftIcon={<UserIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                        className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                          />
                      </div>

                    <Input
                      label="Email *"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={true}
                      leftIcon={<EnvelopeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                      className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                        label="Phone"
                        name="phone"
                            value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        leftIcon={<PhoneIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                        className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <Input
                        label="Company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                            disabled={!isEditing}
                        leftIcon={<BuildingOfficeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                        className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="University"
                          name="university"
                          value={formData.university}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          leftIcon={<AcademicCapIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Country
                        </label>
                          <select
                          name="country"
                            value={formData.country}
                          onChange={handleInputChange}
                            disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                          >
                            {countries.map(country => (
                              <option key={country.code} value={country.code}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Governorate
                        </label>
                          <select
                          name="governorate"
                            value={formData.governorate}
                          onChange={handleInputChange}
                            disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                        >
                          <option value="">Select Governorate</option>
                          {governorates[formData.country]?.map(governorate => (
                            <option key={governorate} value={governorate}>
                              {governorate}
                                </option>
                          ))}
                          </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Timezone
                        </label>
                          <select
                          name="timezone"
                            value={formData.timezone}
                          onChange={handleInputChange}
                            disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                        >
                          {timezones.map(timezone => (
                            <option key={timezone.value} value={timezone.value}>
                              {timezone.label}
                              </option>
                            ))}
                          </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Language
                        </label>
                          <select
                          name="language"
                            value={formData.language}
                          onChange={handleInputChange}
                            disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                        >
                          {languages.map(language => (
                            <option key={language.code} value={language.code}>
                              {language.name}
                              </option>
                            ))}
                          </select>
                    </div>
                  </div>

                  {isEditing && (
                      <div className="flex space-x-4 pt-6">
                      <Button
                          type="submit"
                          variant="primary"
                        loading={isSaving}
                          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="border-2 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white px-8 py-3 rounded-lg transition-all duration-200"
                        >
                          Cancel
                      </Button>
                    </div>
                  )}
                  </form>
                </div>

                {/* Logout Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Account Actions
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Manage your account and session
                      </p>
                    </div>
                    <Button
                      onClick={logout}
                      variant="outline"
                      className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center"
                    >
                      <CogIcon className="w-5 h-5 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 