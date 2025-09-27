import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, CloudArrowUpIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const VendorModal = ({ 
  isOpen, 
  mode, // 'add' or 'edit'
  vendor, 
  formData, 
  onInputChange, 
  onSubmit, 
  onClose 
}) => {
  const { t } = useTranslation('admin');
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(formData.logo || vendor?.logo || null);

  if (!isOpen) return null;

  const handleLogoSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Set the file for upload (this will be handled by the form submission)
      onInputChange({ target: { name: 'logoFile', value: file } });
      
    } catch (error) {
      console.error('Logo preview failed', error);
      alert('Failed to process logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    onInputChange({ target: { name: 'logo', value: null } });
    onInputChange({ target: { name: 'logoFile', value: null } });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:w-auto sm:max-w-2xl bg-white dark:bg-gray-800 sm:rounded-2xl sm:shadow-2xl sm:mx-4 overflow-hidden max-h-[100vh] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'add' ? t('vendors.addNewVendor') : t('vendors.editVendor')}
            </h2>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-5 max-h-[calc(100vh-120px)] sm:max-h-[calc(90vh-120px)]">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('vendors.logo')}
              </label>
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-20 w-20 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <div className="mt-2">
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {uploading ? t('vendors.uploadingLogo') : t('vendors.uploadLogo')}
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelected}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Name fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('vendors.name')} *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={onInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('vendors.nameAr', 'Name (Arabic)')}
                </label>
                <Input
                  type="text"
                  name="nameAr"
                  value={formData.nameAr || ''}
                  onChange={onInputChange}
                  className="w-full"
                />
              </div>

              {/* Contact fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('vendors.email')} *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={onInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('vendors.phone')}
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={onInputChange}
                  className="w-full"
                />
              </div>

              {/* Company fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('vendors.website')}
                </label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website || ''}
                  onChange={onInputChange}
                  placeholder="https://example.com"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('vendors.taxId')}
                </label>
                <Input
                  type="text"
                  name="taxId"
                  value={formData.taxId || ''}
                  onChange={onInputChange}
                  className="w-full"
                />
              </div>

              {/* Business terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('vendors.paymentTerms')}
                </label>
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms || 'net30'}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="net30">Net 30</option>
                  <option value="net15">Net 15</option>
                  <option value="net60">Net 60</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="prepaid">Prepaid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('vendors.commissionRate')} (%)
                </label>
                <Input
                  type="number"
                  name="commissionRate"
                  value={formData.commissionRate || ''}
                  onChange={onInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vendors.address')}
              </label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={onInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                placeholder={t('vendors.addressPlaceholder')}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vendors.description')}
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={onInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                placeholder={t('vendors.descriptionPlaceholder')}
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vendors.contactPerson')}
              </label>
              <Input
                type="text"
                name="contactPerson"
                value={formData.contactPerson || ''}
                onChange={onInputChange}
                className="w-full"
                placeholder={t('vendors.contactPersonPlaceholder')}
              />
            </div>

            {/* Status toggles */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive !== false}
                  onChange={onInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('vendors.active')}
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified === true}
                  onChange={onInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('vendors.verified')}
                </label>
              </div>
            </div>

            {/* Spacer for sticky footer */}
            <div className="h-2" />
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('vendors.cancel')}
            </Button>
            <Button 
              type="submit" 
              onClick={handleFormSubmit} 
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              {uploading 
                ? t('vendors.uploading') 
                : mode === 'add' 
                  ? t('vendors.createVendor') 
                  : t('vendors.updateVendor')
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorModal;
