import React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

const ProductViewModal = ({ isOpen, product, categories = [], onClose }) => {
  const { t } = useTranslation('admin');

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-auto sm:max-w-3xl bg-white dark:bg-gray-800 sm:rounded-2xl sm:shadow-2xl sm:mx-4 overflow-hidden max-h-[100vh] sm:max-h-[90vh]">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('products.productDetails')}
            </h2>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 overflow-y-auto space-y-5">
          <div className="flex items-center space-x-4">
            <img
              className="h-20 w-20 rounded-lg object-cover"
              src={product.images?.[0] || '/placeholder-product.png'}
              alt={product.name}
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                SKU: {product.sku}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('products.price')}
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ${product.price}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('products.stock')}
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {product.stock}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('products.category')}
              </label>
               <p className="text-gray-900 dark:text-white">
                {product.categoryName || (categories.find(c => (c.id || c._id) === product.categoryId)?.name) || product.category?.name || '-'}
               </p>
            </div>
            {/* Vendor display removed - implied by vendor context/brand */}
          </div>
          
          {product.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('products.description')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {product.description}
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex justify-end">
            <Button onClick={onClose}>
              {t('products.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal; 