import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { uploadImage } from '../../../services/adminApi';

const CategoryModal = ({ 
  isOpen, 
  mode, 
  category, 
  formData, 
  onInputChange, 
  onSubmit, 
  onClose 
}) => {
  const { t } = useTranslation('admin');
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(formData.image || '');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadImage(formData);
      const imageUrl = response.url;
      
      setImagePreview(imageUrl);
      onInputChange({
        target: {
          name: 'image',
          value: imageUrl
        }
      });
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    onInputChange({
      target: {
        name: 'image',
        value: ''
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-xl bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? t('categories.addCategory') : t('categories.editCategory')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('categories.image')}
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Category preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                      {t('categories.uploadImage')}
                    </span>
                    <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                    disabled={isUploading}
                  />
                </div>
                {isUploading && (
                  <div className="mt-2 flex items-center justify-center">
                    <CloudArrowUpIcon className="h-5 w-5 animate-pulse text-blue-500" />
                    <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('categories.name')} *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
                className="w-full"
                placeholder="Enter category name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('categories.nameAr')}
              </label>
              <Input
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={onInputChange}
                className="w-full"
                placeholder="أدخل اسم الفئة"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('categories.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter category description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('categories.slug')}
            </label>
            <Input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={onInputChange}
              className="w-full"
              placeholder="category-slug"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={onInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-white">
              {t('categories.active')}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
            >
              {t('categories.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading}
              className="min-w-[100px]"
            >
              {isUploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                mode === 'add' ? t('categories.create') : t('categories.update')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
