import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  CogIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CreditCardIcon,
  BellIcon,
  ServerIcon,
  CloudIcon,
  KeyIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'DentalKit',
    siteDescription: 'Your Complete Dental Care Solution',
    siteUrl: 'https://dentalkit.com',
    adminEmail: 'admin@dentalkit.com',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    language: 'en'
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enableMFA: true,
    requireMFA: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableAuditLog: true,
    enableIPWhitelist: false,
    allowedIPs: '',
    enableRateLimiting: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: 'noreply@dentalkit.com',
    fromName: 'DentalKit',
    enableEmailNotifications: true,
    enableOrderNotifications: true,
    enableUserNotifications: true,
    enableMarketingEmails: false
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    enablePayments: true,
    defaultCurrency: 'USD',
    taxRate: 8.5,
    enableTaxCalculation: true,
    enableDiscounts: true,
    enableGiftCards: true,
    enableCoupons: true,
    paymentMethods: {
      stripe: true,
      paypal: false,
      bankTransfer: false
    }
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    orderNotifications: {
      newOrder: true,
      orderStatusChange: true,
      paymentReceived: true,
      orderShipped: true,
      orderDelivered: true
    },
    userNotifications: {
      newUser: true,
      userVerification: true,
      passwordReset: true
    },
    systemNotifications: {
      lowStock: true,
      systemErrors: true,
      backupComplete: true
    }
  });

  const tabs = [
    {
      id: 'general',
      name: t('admin.settings.general'),
      icon: CogIcon,
      description: t('admin.settings.generalDesc')
    },
    {
      id: 'security',
      name: t('admin.settings.security'),
      icon: ShieldCheckIcon,
      description: t('admin.settings.securityDesc')
    },
    {
      id: 'email',
      name: t('admin.settings.email'),
      icon: EnvelopeIcon,
      description: t('admin.settings.emailDesc')
    },
    {
      id: 'payment',
      name: t('admin.settings.payment'),
      icon: CreditCardIcon,
      description: t('admin.settings.paymentDesc')
    },
    {
      id: 'notifications',
      name: t('admin.settings.notifications'),
      icon: BellIcon,
      description: t('admin.settings.notificationsDesc')
    }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // Simulate loading settings from API
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would fetch settings from the backend
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (settingsType) => {
    try {
      setIsSaving(true);
      
      // Simulate saving settings to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('admin.settings.saveSuccess'));
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error(t('admin.settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneralSettingsChange = (field, value) => {
    setGeneralSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecuritySettingsChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailSettingsChange = (field, value) => {
    setEmailSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentSettingsChange = (field, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationSettingsChange = (category, field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const testEmailConnection = async () => {
    try {
      // Simulate testing email connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(t('admin.settings.emailTestSuccess'));
    } catch (err) {
      toast.error(t('admin.settings.emailTestError'));
    }
  };

  const backupDatabase = async () => {
    try {
      // Simulate database backup
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success(t('admin.settings.backupSuccess'));
    } catch (err) {
      toast.error(t('admin.settings.backupError'));
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
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
              {t('admin.settings.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.settings.subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={backupDatabase} className="flex items-center gap-2">
              <ServerIcon className="h-5 w-5" />
              {t('admin.settings.backup')}
            </Button>
            <Button 
              onClick={() => saveSettings(activeTab)}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  {t('admin.settings.saving')}
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  {t('admin.settings.save')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.siteInformation')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.siteName')}
                      </label>
                      <Input
                        value={generalSettings.siteName}
                        onChange={(e) => handleGeneralSettingsChange('siteName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.siteUrl')}
                      </label>
                      <Input
                        value={generalSettings.siteUrl}
                        onChange={(e) => handleGeneralSettingsChange('siteUrl', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.siteDescription')}
                      </label>
                      <textarea
                        value={generalSettings.siteDescription}
                        onChange={(e) => handleGeneralSettingsChange('siteDescription', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.localization')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.timezone')}
                      </label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) => handleGeneralSettingsChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.currency')}
                      </label>
                      <select
                        value={generalSettings.currency}
                        onChange={(e) => handleGeneralSettingsChange('currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.authentication')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('admin.settings.enableMFA')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.settings.enableMFADesc')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSecuritySettingsChange('enableMFA', !securitySettings.enableMFA)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          securitySettings.enableMFA ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.enableMFA ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('admin.settings.requireMFA')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.settings.requireMFADesc')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSecuritySettingsChange('requireMFA', !securitySettings.requireMFA)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          securitySettings.requireMFA ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.requireMFA ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.sessionManagement')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.sessionTimeout')} (minutes)
                      </label>
                      <Input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => handleSecuritySettingsChange('sessionTimeout', parseInt(e.target.value))}
                        min="5"
                        max="480"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.maxLoginAttempts')}
                      </label>
                      <Input
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => handleSecuritySettingsChange('maxLoginAttempts', parseInt(e.target.value))}
                        min="3"
                        max="10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.rateLimiting')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('admin.settings.enableRateLimiting')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.settings.enableRateLimitingDesc')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSecuritySettingsChange('enableRateLimiting', !securitySettings.enableRateLimiting)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          securitySettings.enableRateLimiting ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.enableRateLimiting ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {securitySettings.enableRateLimiting && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('admin.settings.rateLimitRequests')}
                          </label>
                          <Input
                            type="number"
                            value={securitySettings.rateLimitRequests}
                            onChange={(e) => handleSecuritySettingsChange('rateLimitRequests', parseInt(e.target.value))}
                            min="10"
                            max="1000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('admin.settings.rateLimitWindow')} (minutes)
                          </label>
                          <Input
                            type="number"
                            value={securitySettings.rateLimitWindow}
                            onChange={(e) => handleSecuritySettingsChange('rateLimitWindow', parseInt(e.target.value))}
                            min="1"
                            max="60"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.smtpConfiguration')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.smtpHost')}
                      </label>
                      <Input
                        value={emailSettings.smtpHost}
                        onChange={(e) => handleEmailSettingsChange('smtpHost', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.smtpPort')}
                      </label>
                      <Input
                        type="number"
                        value={emailSettings.smtpPort}
                        onChange={(e) => handleEmailSettingsChange('smtpPort', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.smtpUser')}
                      </label>
                      <Input
                        type="email"
                        value={emailSettings.smtpUser}
                        onChange={(e) => handleEmailSettingsChange('smtpUser', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.smtpPassword')}
                      </label>
                      <Input
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => handleEmailSettingsChange('smtpPassword', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" onClick={testEmailConnection} className="flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5" />
                      {t('admin.settings.testConnection')}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.emailNotifications')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('admin.settings.enableEmailNotifications')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.settings.enableEmailNotificationsDesc')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEmailSettingsChange('enableEmailNotifications', !emailSettings.enableEmailNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          emailSettings.enableEmailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            emailSettings.enableEmailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('admin.settings.enableOrderNotifications')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.settings.enableOrderNotificationsDesc')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEmailSettingsChange('enableOrderNotifications', !emailSettings.enableOrderNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          emailSettings.enableOrderNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            emailSettings.enableOrderNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.paymentConfiguration')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('admin.settings.enablePayments')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.settings.enablePaymentsDesc')}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePaymentSettingsChange('enablePayments', !paymentSettings.enablePayments)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          paymentSettings.enablePayments ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            paymentSettings.enablePayments ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.paymentMethods')}
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(paymentSettings.paymentMethods).map(([method, enabled]) => (
                      <div key={method} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {method}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePaymentSettingsChange('paymentMethods', {
                            ...paymentSettings.paymentMethods,
                            [method]: !enabled
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.taxAndDiscounts')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.settings.taxRate')} (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={paymentSettings.taxRate}
                        onChange={(e) => handlePaymentSettingsChange('taxRate', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('admin.settings.enableTaxCalculation')}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePaymentSettingsChange('enableTaxCalculation', !paymentSettings.enableTaxCalculation)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          paymentSettings.enableTaxCalculation ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            paymentSettings.enableTaxCalculation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('admin.settings.enableDiscounts')}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePaymentSettingsChange('enableDiscounts', !paymentSettings.enableDiscounts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          paymentSettings.enableDiscounts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            paymentSettings.enableDiscounts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.notificationChannels')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('admin.settings.enablePushNotifications')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.settings.enablePushNotificationsDesc')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingsChange('enablePushNotifications', !notificationSettings.enablePushNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.enablePushNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.enablePushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('admin.settings.enableEmailNotifications')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('admin.settings.enableEmailNotificationsDesc')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingsChange('enableEmailNotifications', !notificationSettings.enableEmailNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.enableEmailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.enableEmailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('admin.settings.orderNotifications')}
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings.orderNotifications).map(([notification, enabled]) => (
                      <div key={notification} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {t(`admin.settings.${notification}`)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationSettingsChange('orderNotifications', notification, !enabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage; 