import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

const ProductRelated = ({ relatedProducts }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-8">
        {t('products.details.relatedProducts')}
      </h3>
      {relatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {relatedProducts.map((relatedProduct) => (
            <div 
              key={relatedProduct._id} 
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800"
              onClick={() => navigate(`/products/${relatedProduct._id}`)}
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                <img
                  src={relatedProduct.images?.[0]?.url || '/placeholder-product.svg'}
                  alt={relatedProduct.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
                {relatedProduct.name}
              </h4>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(relatedProduct.price)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛍️</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {t('products.details.noRelatedProducts')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductRelated; 