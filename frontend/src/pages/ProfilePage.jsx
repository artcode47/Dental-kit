import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import Seo from '../components/seo/Seo';
import Button from '../components/ui/Button';
import AnimatedSection from '../components/animations/AnimatedSection';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  MapPinIcon,
  ClockIcon,
  LanguageIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  BellIcon,
  HeartIcon,
  ShoppingBagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { UserIcon as UserIconSolid, HeartIcon as HeartIconSolid, ShoppingBagIcon as ShoppingBagIconSolid } from '@heroicons/react/24/solid';

const ProfilePage = () => {
  const { t } = useTranslation('ecommerce');
  const { currentLanguage } = useLanguage();
  const { currentTheme } = useTheme();
  const { user, getProfile, updateProfile, changePassword } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    university: '',
    country: '',
    governorate: '',
    timezone: '',
    language: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    language: 'en',
    theme: 'light'
  });

  // Initial data loading effect - only run once on mount
  useEffect(() => {
    let active = true;
    
    const loadProfileData = async () => {
      try {
        await getProfile();
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfileData();
    
    return () => { 
      active = false; 
    };
  }, []); // Empty dependency array - only run once on mount

  // Update form when user data changes (but only after initial load)
  useEffect(() => {
    if (user && !loading) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        university: user.university || '',
        country: user.country || '',
        governorate: user.governorate || '',
        timezone: user.timezone || '',
        language: user.language || 'en'
      });
      
      setPreferences(prev => ({
        ...prev,
        language: user.language || 'en',
        theme: currentTheme
      }));
    }
  }, [user, currentTheme, loading]); // Update when user data, theme, or loading state changes

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        company: profileForm.company,
        university: profileForm.university,
        country: profileForm.country,
        governorate: profileForm.governorate,
        timezone: profileForm.timezone,
        language: profileForm.language
      });
      toast.success(t('profile.updated'));
    } catch {
      toast.error(t('profile.error.update'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error(t('validation.password.mismatch'));
        return;
      }
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success(t('passwordChangedSuccessfully'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error(t('passwordChangeFailed'));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle image upload logic here
      toast.success(t('profile.imageUpdated'));
    }
  };

  const tabs = [
    { id: 'profile', label: t('profile.title'), icon: UserIcon },
    { id: 'security', label: t('profile.security'), icon: ShieldCheckIcon },
    { id: 'preferences', label: t('profile.preferences'), icon: Cog6ToothIcon },
    { id: 'activity', label: t('profile.activity'), icon: ChartBarIcon }
  ];

  const stats = [
    { label: t('profile.totalOrders'), value: '12', icon: ShoppingBagIconSolid, color: 'text-blue-600' },
    { label: t('profile.wishlistItems'), value: '8', icon: HeartIconSolid, color: 'text-red-500' },
    { label: t('profile.memberSince'), value: '2023', icon: UserIconSolid, color: 'text-green-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Seo
        title={t('seo.profile.title', 'Your Profile')}
        description={t('seo.profile.description', 'Manage your account settings and preferences')}
        type="profile"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={currentTheme === 'dark' ? '#0B1220' : '#FFFFFF'}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <div className="text-center text-white">
            <AnimatedSection animation="fadeInUp" delay={0}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {t('profile.title')}
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
                {t('profile.subtitle')}
              </p>
            </AnimatedSection>
        </div>
      </div>
      </section>

      {/* Profile Content */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <AnimatedSection animation="fadeInLeft" delay={100}>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6 mb-6">
                    {/* Profile Avatar */}
                    <div className="text-center mb-6">
                      <div className="relative inline-block">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          {user?.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.firstName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-sky-600 hover:bg-sky-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                        >
                          <CameraIcon className="w-4 h-4" />
                        </button>
                <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="space-y-4">
                      {stats.map((stat, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center">
                            <stat.icon className={`w-5 h-5 ${stat.color} mr-3`} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg p-2">
                    <nav className="space-y-1">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                        >
                          <tab.icon className="w-5 h-5 mr-3" />
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </AnimatedSection>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <AnimatedSection animation="fadeInRight" delay={200}>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6 sm:p-8">
                    
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('profile.personalInfo')}
                          </h3>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            size="sm"
                            className="flex items-center"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <PencilIcon className="w-4 h-4 mr-2" />
                            )}
                            {saving ? t('common.saving') : t('common.save')}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* First Name */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <UserIcon className="w-4 h-4 inline mr-2" />
                              {t('profile.firstName')}
                            </label>
                            <input
                              type="text"
                              value={profileForm.firstName}
                              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                              placeholder={t('profile.firstName')}
                            />
                          </div>

                          {/* Last Name */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <UserIcon className="w-4 h-4 inline mr-2" />
                              {t('profile.lastName')}
                            </label>
                            <input
                              type="text"
                              value={profileForm.lastName}
                              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                              placeholder={t('profile.lastName')}
                            />
                          </div>

                          {/* Email */}
                          <div className="space-y-2 sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                              {t('profile.email')}
                            </label>
                            <input
                              type="email"
                              value={profileForm.email}
                              disabled
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              placeholder={t('profile.email')}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('profile.emailNote')}
                            </p>
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <PhoneIcon className="w-4 h-4 inline mr-2" />
                              {t('profile.phone')}
                            </label>
                            <input
                              type="tel"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                              placeholder={t('profile.phone')}
                            />
                          </div>

                          {/* Company */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <BuildingOfficeIcon className="w-4 h-4 inline mr-2" />
                              {t('profile.company')}
                            </label>
                            <input
                              type="text"
                              value={profileForm.company}
                              onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                              placeholder={t('profile.company')}
                            />
                          </div>

                          {/* University */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <AcademicCapIcon className="w-4 h-4 inline mr-2" />
                              {t('profile.university')}
                            </label>
                            <input
                              type="text"
                              value={profileForm.university}
                              onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                              placeholder={t('profile.university')}
                            />
                          </div>

                          {/* Country */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                              {t('profile.country')}
                            </label>
                            <input
                              type="text"
                              value={profileForm.country}
                              onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                              placeholder={t('profile.country')}
                            />
                          </div>

                          {/* Governorate */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <MapPinIcon className="w-4 h-4 inline mr-2" />
                              {t('profile.governorate')}
                            </label>
                            <input
                              type="text"
                              value={profileForm.governorate}
                              onChange={(e) => setProfileForm({ ...profileForm, governorate: e.target.value })}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                              placeholder={t('profile.governorate')}
                            />
                          </div>

                          {/* Timezone */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <ClockIcon className="w-4 h-4 inline mr-2" />
                              {t('profile.timezone')}
                            </label>
                            <select
                              value={profileForm.timezone}
                              onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                            >
                              <option value="">{t('profile.selectTimezone')}</option>
                              <option value="UTC">UTC</option>
                              <option value="America/New_York">Eastern Time</option>
                              <option value="America/Chicago">Central Time</option>
                              <option value="America/Denver">Mountain Time</option>
                              <option value="America/Los_Angeles">Pacific Time</option>
                              <option value="Europe/London">London</option>
                              <option value="Europe/Paris">Paris</option>
                              <option value="Asia/Dubai">Dubai</option>
                              <option value="Asia/Tokyo">Tokyo</option>
                            </select>
                          </div>

                          {/* Language */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <LanguageIcon className="w-4 h-4 inline mr-2" />
                              {t('profile.language')}
                            </label>
                            <select
                              value={profileForm.language}
                              onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                            >
                              <option value="en">English</option>
                              <option value="ar">العربية</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('profile.changePassword')}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {t('profile.passwordDescription')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {/* Current Password */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('profile.currentPassword')}
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword.current ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                placeholder={t('profile.currentPassword')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {showPassword.current ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {/* New Password */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('profile.newPassword')}
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword.new ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                placeholder={t('profile.newPassword')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {showPassword.new ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {/* Confirm Password */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('profile.confirmPassword')}
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword.confirm ? 'text' : 'password'}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                placeholder={t('profile.confirmPassword')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {showPassword.confirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl">
                          <div className="flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {t('profile.passwordWarning')}
                            </p>
                          </div>
                        </div>

                        <Button onClick={handleChangePassword} className="flex items-center">
                          <ShieldCheckIcon className="w-4 h-4 mr-2" />
                          {t('profile.updatePassword')}
                        </Button>
                      </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('profile.preferences')}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {t('profile.preferencesDescription')}
                          </p>
                        </div>

                        <div className="space-y-6">
                          {/* Notifications */}
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <BellIcon className="w-5 h-5 mr-2" />
                              {t('profile.notifications')}
                            </h4>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {t('profile.emailNotifications')}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {t('profile.emailNotificationsDesc')}
                                  </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={preferences.emailNotifications}
                                    onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600"></div>
                                </label>
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {t('profile.smsNotifications')}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {t('profile.smsNotificationsDesc')}
                                  </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={preferences.smsNotifications}
                                    onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600"></div>
                                </label>
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {t('profile.marketingEmails')}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {t('profile.marketingEmailsDesc')}
                                  </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={preferences.marketingEmails}
                                    onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600"></div>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Appearance */}
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <Cog6ToothIcon className="w-5 h-5 mr-2" />
                              {t('profile.appearance')}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t('profile.language')}
                                </label>
                                <select
                                  value={preferences.language}
                                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                  className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                >
                                  <option value="en">English</option>
                                  <option value="ar">العربية</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t('profile.theme')}
                                </label>
                                <select
                                  value={preferences.theme}
                                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                                  className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                >
                                  <option value="light">{t('profile.lightTheme')}</option>
                                  <option value="dark">{t('profile.darkTheme')}</option>
                                  <option value="system">{t('profile.systemTheme')}</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button className="flex items-center">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          {t('profile.savePreferences')}
                        </Button>
                      </div>
                    )}

                    {/* Activity Tab */}
                    {activeTab === 'activity' && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('profile.activity')}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {t('profile.activityDescription')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Recent Orders */}
                          <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700/30">
                            <div className="flex items-center mb-4">
                              <ShoppingBagIconSolid className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t('profile.recentOrders')}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {t('profile.recentOrdersDesc')}
                            </p>
                            <Button variant="outline" size="sm" className="w-full">
                              {t('profile.viewAll')}
                            </Button>
          </div>

                          {/* Wishlist */}
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700/30">
                            <div className="flex items-center mb-4">
                              <HeartIconSolid className="w-8 h-8 text-red-600 dark:text-red-400 mr-3" />
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t('profile.wishlist')}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {t('profile.wishlistDesc')}
                            </p>
                            <Button variant="outline" size="sm" className="w-full">
                              {t('profile.viewAll')}
                            </Button>
          </div>

                          {/* Account Stats */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700/30">
                            <div className="flex items-center mb-4">
                              <ChartBarIcon className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t('profile.accountStats')}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {t('profile.accountStatsDesc')}
                            </p>
                            <Button variant="outline" size="sm" className="w-full">
                              {t('profile.viewDetails')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedSection>
            </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;