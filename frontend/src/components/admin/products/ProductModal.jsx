import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { uploadProductImages } from '../../../services/adminApi';

const ProductModal = ({ 
  isOpen, 
  mode, // 'add' or 'edit'
  product, 
  formData, 
  onInputChange, 
  onSubmit, 
  onClose, 
  categories = [], 
  vendors = [] 
}) => {
  const { t } = useTranslation('admin');
  const [uploading, setUploading] = useState(false);
  const [imagesPreview, setImagesPreview] = useState(formData.images || []);

  if (!isOpen) return null;

  const handleImagesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setUploading(true);
      const { images } = await uploadProductImages(files);
      const newImages = imagesPreview.concat(images);
      setImagesPreview(newImages);
      // propagate into formData via synthetic event
      onInputChange({ target: { name: 'images', value: newImages } });
    } catch (error) {
      console.error('Images upload failed', error);
      alert(error.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (idx) => {
    const next = imagesPreview.filter((_, i) => i !== idx);
    setImagesPreview(next);
    onInputChange({ target: { name: 'images', value: next } });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:w-auto sm:max-w-3xl bg-white dark:bg-gray-800 sm:rounded-2xl sm:shadow-2xl sm:mx-4 overflow-hidden max-h-[100vh] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'add' ? t('products.addNewProduct') : t('products.editProduct')}
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
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Name fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('products.name')} *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('products.nameAr', 'Name (Arabic)')}
                </label>
                <Input
                  type="text"
                  name="nameAr"
                  value={formData.nameAr || ''}
                  onChange={onInputChange}
                  className="w-full"
                />
              </div>
              {/* SKU, price, stock, category, vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('products.sku')}
                </label>
                <Input type="text" name="sku" value={formData.sku} onChange={onInputChange} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('products.price')} *
                </label>
                <Input type="number" name="price" value={formData.price} onChange={onInputChange} required step="0.01" className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('products.stock')} *
                </label>
                <Input type="number" name="stock" value={formData.stock} onChange={onInputChange} required className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('products.category')}
                </label>
                <select name="category" value={formData.category} onChange={onInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">{t('products.selectCategory')}</option>
                  {Array.isArray(categories) && categories.map((category, index) => {
                    const id = category.id || category._id || category.value || '';
                    const label = category.name || category.label || 'Unnamed Category';
                    return (
                      <option key={id || `category-${index}`} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('products.vendor')}
                </label>
                <select name="vendor" value={formData.vendor} onChange={onInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">{t('products.selectVendor')}</option>
                  {Array.isArray(vendors) && vendors.map((vendor, index) => {
                    const id = vendor.id || vendor._id || vendor.value || '';
                    const label = vendor.name || vendor.label || 'Unnamed Vendor';
                    return (
                      <option key={id || `vendor-${index}`} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Images uploader */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('products.images', 'Images')}
              </label>
              <input type="file" multiple accept="image/*" onChange={handleImagesSelected} className="block w-full text-sm" />
              {uploading && <div className="text-sm text-gray-500 mt-1">{t('products.uploading', 'Uploading...')}</div>}
              {imagesPreview && imagesPreview.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {imagesPreview.map((img, idx) => (
                    <div key={idx} className="relative group rounded overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <div className="aspect-square w-full">
                        <img src={img.url || img} alt={`product-${idx}`} className="w-full h-full object-cover" />
                      </div>
                      <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {t('products.remove', 'Remove')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('products.description')}
              </label>
              <textarea name="description" value={formData.description} onChange={onInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            
            <div className="flex items-center">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={onInputChange} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('products.active')}</label>
            </div>
            {/* Spacer for sticky footer */}
            <div className="h-2" />
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('products.cancel')}
            </Button>
            <Button type="submit" onClick={onSubmit} className="w-full sm:w-auto">
              {mode === 'add' ? t('products.createProduct') : t('products.updateProduct')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal; 