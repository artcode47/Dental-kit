import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../ui/Button';

const ProductReviews = ({ 
  product, 
  reviews, 
  onWriteReview 
}) => {
  const { t } = useTranslation('ecommerce');

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t('products.details.reviews', { count: product.totalReviews || 0 })}
        </h3>
        <Button onClick={onWriteReview} size="lg">
          {t('products.details.writeReview')}
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-8">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                    {review.user?.name || t('products.details.anonymous')}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            i < review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </div>
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {review.title && (
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base sm:text-lg">
                  {review.title}
                </h4>
              )}
              
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t('products.details.noReviews')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews; 