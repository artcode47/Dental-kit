import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  XMarkIcon, 
  FolderIcon, 
  CubeIcon, 
  CalendarIcon, 
  CheckIcon, 
  XMarkIcon as XMark,
  TagIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

const CategoryViewModal = ({ isOpen, category, onClose }) => {
  const { t } = useTranslation('admin');

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-auto sm:max-w-2xl bg-white dark:bg-gray-800 sm:rounded-2xl sm:shadow-2xl sm:mx-4 overflow-hidden max-h-[100vh] sm:max-h-[90vh]">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('categories.categoryDetails')}
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
          {/* Category Header */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {category.image ? (
                <img
                  className="h-20 w-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  src={category.image}
                  alt={category.name}
                />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <FolderIcon className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {category.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {category.isActive ? (
                    <>
                      <CheckIcon className="h-3 w-3 mr-1" />
                      {t('categories.active')}
                    </>
                  ) : (
                    <>
                      <XMark className="h-3 w-3 mr-1" />
                      {t('categories.inactive')}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Category Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TagIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('categories.slug')}
                </label>
              </div>
              <p className="text-gray-900 dark:text-white font-mono text-sm">
                {category.slug || '-'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CubeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('categories.products')}
                </label>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {category.productCount || 0}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('categories.created')}
                </label>
              </div>
              <p className="text-gray-900 dark:text-white">
                {category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Updated
                </label>
              </div>
              <p className="text-gray-900 dark:text-white">
                {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </p>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('categories.description')}
              </label>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {category.image && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('categories.image')}
              </label>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <img
                  src={category.image}
                  alt={category.name}
                  className="max-w-full h-auto max-h-64 rounded-lg object-cover mx-auto"
                />
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex justify-end">
            <Button onClick={onClose}>
              {t('categories.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryViewModal;
