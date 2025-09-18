import React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

const DeleteConfirmationModal = ({ isOpen, product, onConfirm, onClose }) => {
  const { t } = useTranslation('admin');

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-auto sm:max-w-md bg-white dark:bg-gray-800 sm:rounded-2xl sm:shadow-2xl sm:mx-4 overflow-hidden">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('products.confirmDeleteTitle')}
            </h2>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('products.confirmDeleteMessage', { name: product.name })}
          </p>
        </div>

        <div className="sticky bottom-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('products.cancel')}
            </Button>
            <Button variant="destructive" onClick={onConfirm} className="w-full sm:w-auto">
              {t('products.delete')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 