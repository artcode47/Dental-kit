import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import Seo from '../components/seo/Seo';
import Button from '../components/ui/Button';

const ProfilePage = () => {
  const { t } = useTranslation('ecommerce');
  const { currentLanguage } = useLanguage();
  const { currentTheme } = useTheme();
  const { user, getProfile, updateProfile, changePassword } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await getProfile();
        if (!active) return;
        // Initialize form once user is available
        setProfileForm((prev) => ({
          ...prev,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company: user?.company || '',
          university: user?.university || '',
          country: user?.country || '',
          governorate: user?.governorate || '',
          timezone: user?.timezone || '',
          language: user?.language || 'en'
        }));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
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
        toast.error(t('validation.password.mismatch', 'Passwords do not match'));
        return;
      }
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success(t('passwordChangedSuccessfully'));
    } catch {
      toast.error(t('passwordChangeFailed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Seo
        title={t('seo.profile.title', 'Your Profile')}
        description={t('seo.profile.description', 'Manage your account settings and preferences')}
        type="profile"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={currentTheme === 'dark' ? '#0B1220' : '#FFFFFF'}
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 py-14 relative">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('profile.title', 'My Profile')}</h1>
          <p className="opacity-90">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{t('profile.title')}</h2>

          {/* Profile Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'firstName', label: t('profile.firstName') },
              { key: 'lastName', label: t('profile.lastName') },
              { key: 'email', label: t('profile.email'), disabled: true, span: 2 },
              { key: 'phone', label: t('profile.phone') },
              { key: 'company', label: t('profile.company') },
              { key: 'university', label: t('profile.university') },
              { key: 'country', label: t('profile.country') },
              { key: 'governorate', label: t('profile.governorate') },
              { key: 'timezone', label: t('profile.timezone') },
              { key: 'language', label: t('profile.language') }
            ].map(field => (
              <div key={field.key} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">{field.label}</label>
                <input
                  className={`w-full rounded-xl px-3 py-2 border transition-colors
                    bg-white dark:bg-gray-900/60
                    border-gray-200 dark:border-gray-600
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  value={profileForm[field.key]}
                  onChange={(e) => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                  disabled={field.disabled}
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button>
          </div>

          {/* Change Password */}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('profile.changePassword')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input type="password" placeholder={t('currentPassword')} className="w-full rounded-xl px-3 py-2 border bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              <input type="password" placeholder={t('newPassword')} className="w-full rounded-xl px-3 py-2 border bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              <input type="password" placeholder={t('confirmPassword')} className="w-full rounded-xl px-3 py-2 border bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
            </div>
            <div className="mt-4">
              <Button variant="secondary" onClick={handleChangePassword}>{t('common.update') || 'Update'}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

