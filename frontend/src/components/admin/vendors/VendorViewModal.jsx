import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  XMarkIcon, 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  GlobeAltIcon, 
  MapPinIcon, 
  UserIcon, 
  CalendarIcon, 
  CheckIcon, 
  XMarkIcon as XMark,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CubeIcon,
  TagIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

const VendorViewModal = ({ isOpen, vendor, onClose }) => {
  const { t } = useTranslation('admin');

  if (!isOpen || !vendor) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-auto sm:max-w-4xl bg-white dark:bg-gray-800 sm:rounded-2xl sm:shadow-2xl sm:mx-4 overflow-hidden max-h-[100vh] sm:max-h-[90vh]">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('vendors.vendorDetails')}
            </h2>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 overflow-y-auto space-y-6">
          {/* Vendor Header */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {vendor.logo ? (
                <img
                  className="h-20 w-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  src={vendor.logo}
                  alt={vendor.name}
                />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <BuildingOfficeIcon className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {vendor.name}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  vendor.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {vendor.isActive ? (
                    <>
                      <CheckIcon className="h-3 w-3 mr-1" />
                      {t('vendors.active')}
                    </>
                  ) : (
                    <>
                      <XMark className="h-3 w-3 mr-1" />
                      {t('vendors.inactive')}
                    </>
                  )}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  vendor.isVerified 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {vendor.isVerified ? (
                    <>
                      <ShieldCheckIcon className="h-3 w-3 mr-1" />
                      {t('vendors.verified')}
                    </>
                  ) : (
                    <>
                      <ShieldExclamationIcon className="h-3 w-3 mr-1" />
                      {t('vendors.unverified')}
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {vendor._id?.slice(-8) || vendor.id?.slice(-8)}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <EnvelopeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
              </div>
              <p className="text-gray-900 dark:text-white">
                {vendor.email || '-'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <PhoneIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
              </div>
              <p className="text-gray-900 dark:text-white">
                {vendor.phone || '-'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <GlobeAltIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Website
                </label>
              </div>
              <p className="text-gray-900 dark:text-white">
                {vendor.website ? (
                  <a 
                    href={vendor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {vendor.website}
                  </a>
                ) : '-'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
              </div>
              <p className="text-gray-900 dark:text-white">
                {vendor.address || '-'}
              </p>
            </div>
          </div>

          {/* Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contact Person
                </label>
              </div>
              <p className="text-gray-900 dark:text-white">
                {vendor.contactPerson || '-'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TagIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tax ID
                </label>
              </div>
              <p className="text-gray-900 dark:text-white font-mono text-sm">
                {vendor.taxId || '-'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Commission Rate
                </label>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {vendor.commissionRate || 0}%
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CubeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Products
                </label>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {vendor.productCount || vendor.totalProducts || 0}
              </p>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ChartBarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Sales
                </label>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(vendor.totalSales || 0)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Created
                </label>
              </div>
              <p className="text-gray-900 dark:text-white">
                {vendor.createdAt ? formatDate(vendor.createdAt) : '-'}
              </p>
            </div>
          </div>

          {/* Description */}
          {vendor.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white leading-relaxed">
                  {vendor.description}
                </p>
              </div>
            </div>
          )}

          {/* Logo Preview */}
          {vendor.logo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo
              </label>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="max-w-full h-auto max-h-32 rounded-lg object-contain mx-auto"
                />
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex justify-end">
            <Button onClick={onClose}>
              {t('vendors.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorViewModal;
