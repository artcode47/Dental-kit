import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  TagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';
import { getImageUrl } from '../../utils/imageUtils';

const CartItem = ({ 
  item, 
  onQuantityChange, 
  onRemoveItem, 
  updatingItem 
}) => {
  const { t } = useTranslation('ecommerce');
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStockStatus = (item) => {
    if (!item.inStock) {
      return { status: 'outOfStock', message: t('cart.stock.outOfStock') };
    }
    if (item.quantity > (item.maxQuantity || 99)) {
      return { 
        status: 'insufficientStock', 
        message: t('cart.stock.insufficientStock', { maxQuantity: item.maxQuantity || 99 }) 
      };
    }
    return { status: 'inStock', message: null };
  };

  const getDiscountPercentage = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const stockStatus = getStockStatus(item);
  const discountPercentage = getDiscountPercentage(item.originalPrice, item.price);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/20 hover:-translate-y-1">
      <div className="flex flex-col lg:flex-row lg:items-start space-y-4 sm:space-y-6 lg:space-y-0 lg:space-x-6 lg:space-x-8">
        {/* Product Image */}
        <div className="flex-shrink-0 relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gray-100 dark:bg-gray-700 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Product Badges */}
          <div className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 flex flex-col space-y-1">
            {item.isOnSale && discountPercentage > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center">
                <TagIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                {t('cart.badges.sale', { percentage: discountPercentage })}
              </div>
            )}
            {item.isNew && (
              <div className="bg-green-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center">
                <SparklesIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                {t('cart.badges.new')}
              </div>
            )}
          </div>
        </div>
        
        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h3 
                className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer line-clamp-2"
                onClick={() => navigate(`/products/${item.productId}`)}
              >
                {item.name}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                {item.brand || t('cart.vendor')}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(item.price)}
                </span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-sm sm:text-lg lg:text-xl text-gray-500 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={() => onRemoveItem(item.id)}
              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 sm:p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors self-start"
              aria-label={t('cart.error.removeItem')}
            >
              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          
          {/* Stock Status */}
          {stockStatus.message && (
            <div className={`mt-2 sm:mt-3 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium ${
              stockStatus.status === 'outOfStock' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
            }`}>
              <ExclamationTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              {stockStatus.message}
            </div>
          )}
          
          {/* Quantity Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 sm:mt-6 space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('cart.quantity')}:
              </label>
              <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl overflow-hidden">
                <button
                  onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1 || updatingItem === item.id}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <span className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 min-w-[2rem] sm:min-w-[3rem] text-center">
                  {updatingItem === item.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    item.quantity
                  )}
                </span>
                <button
                  onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  disabled={item.quantity >= (item.maxQuantity || 99) || updatingItem === item.id}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(item.price * item.quantity)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {formatPrice(item.price)} {t('cart.quantity').toLowerCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem; 