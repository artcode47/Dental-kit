import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const ProductDescription = ({ product }) => {
  const { t } = useTranslation('ecommerce');

  return (
    <div className="prose max-w-none dark:prose-invert">
      <div className="mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('products.details.description')}
        </h3>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {product.description}
        </p>
      </div>
      
      {product.shortDescription && (
        <div className="mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('products.details.shortDescription')}
          </h3>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>
      )}

      {product.features && product.features.length > 0 && (
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('products.details.features')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDescription; 