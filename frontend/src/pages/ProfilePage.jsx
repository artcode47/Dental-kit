import React, { useState, useCallback, useEffect } from 'react';
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
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileForm from '../components/profile/ProfileForm';
import AccountActions from '../components/profile/AccountActions';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, getProfile, updateProfile, uploadProfileImage, deleteAccount, logout } = useAuth();

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

  // Countries and governorates data
  const countries = [
    { code: 'EG', name: 'Egypt' },
    { code: 'SA', name: 'Saudi Arabia' }
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
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' }
  ];
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
    if (!user || !user.firstName) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [getProfile, t, user]);

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

  // Handle profile image upload
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.invalidImageFile'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageSizeError'));
      return;
    }
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      await uploadProfileImage(formData);
      toast.success(t('profile.imageUploadSuccess'));
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(t('profile.imageUploadFailed'));
    } finally {
      setIsUploadingImage(false);
    }
  }, [uploadProfileImage, t]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const requiredFields = ['firstName', 'lastName', 'email'];
      const missingFields = requiredFields.filter(field => !formData[field]?.trim());
      if (missingFields.length > 0) {
        toast.error(t('profile.fillRequiredFields', { fields: missingFields.join(', ') }));
        return;
      }
      const cleanedData = {
        ...formData,
        company: formData.company?.trim() || undefined,
        university: formData.university?.trim() || undefined,
        governorate: formData.governorate?.trim() || undefined,
        phone: formData.phone?.trim() || undefined
      };
      await updateProfile(cleanedData);
      setIsEditing(false);
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => `${err.path}: ${err.msg}`).join(', ');
        toast.error(t('profile.validationErrors', { errors: errorMessages }));
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('profile.updateFailed'));
      }
    } finally {
      setIsSaving(false);
    }
  }, [formData, updateProfile, t]);

  // Handle account deletion
  const handleDeleteAccount = useCallback(async () => {
    if (window.confirm(t('profile.deleteAccountConfirm'))) {
      try {
        await deleteAccount();
        toast.success(t('profile.deleteAccountSuccess'));
      } catch (error) {
        console.error('Account deletion error:', error);
        toast.error(t('profile.deleteAccountFailed'));
      }
    }
  }, [deleteAccount, t]);

  // Get user's full name
  const getFullName = useCallback(() => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName} ${lastName}`.trim() || t('profile.title');
  }, [user, t]);

  // Get user's role display name
  const getUserRole = useCallback(() => {
    const role = user?.role || 'customer';
    return t(`roles.${role}`);
  }, [user, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 text-white py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              {t('profile.title')}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              {t('profile.title')}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl opacity-90 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4">
              {t('profile.updatePersonalInfo')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Header Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
              <ProfileHeader
                user={user}
                isEditing={isEditing}
                onEditToggle={() => setIsEditing(!isEditing)}
                onImageUpload={handleImageUpload}
                isUploadingImage={isUploadingImage}
                getFullName={getFullName}
                getUserRole={getUserRole}
              />
            </div>
          </div>

          {/* Profile Form Section */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
              <ProfileForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                isEditing={isEditing}
                isSaving={isSaving}
                onCancel={() => setIsEditing(false)}
                countries={countries}
                governorates={governorates}
                timezones={timezones}
                languages={languages}
              />
            </div>

            {/* Account Actions */}
            <AccountActions
              onLogout={logout}
              onDeleteAccount={handleDeleteAccount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 