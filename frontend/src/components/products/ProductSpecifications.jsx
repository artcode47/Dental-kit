import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ProductSpecifications = ({ product }) => {
  const { t } = useTranslation('ecommerce');

  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-8">
        {t('products.details.specifications')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  {key}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1 sm:mt-0">
                  {value}
                </span>
              </div>
            ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <XMarkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t('products.details.noSpecifications')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSpecifications; 