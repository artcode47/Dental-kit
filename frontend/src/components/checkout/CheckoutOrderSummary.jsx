import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ShoppingCartIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const CheckoutOrderSummary = ({ cart, orderSummary }) => {
  const { t } = useTranslation('ecommerce');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!cart || !orderSummary) {
    return null;
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/20 sticky top-8">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6">
        <ShoppingCartIcon className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mr-2 sm:mr-3" />
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {t('checkout.orderSummary.title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {t('checkout.orderSummary.subtitle')}
          </p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {cart.map((item) => (
          <div key={item.productId} className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={item.image || '/placeholder-product.svg'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {t('cart.quantity')}: {item.quantity}
              </p>
              <div className="flex items-center mt-1">
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-xs text-gray-500 line-through mr-2">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="space-y-2 sm:space-y-3 border-t border-gray-200 dark:border-gray-600 pt-3 sm:pt-4">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            {t('checkout.orderSummary.items', { count: orderSummary.itemCount })}
          </span>
          <span className="text-gray-900 dark:text-white">
            {formatPrice(orderSummary.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            {t('checkout.orderSummary.shipping')}
          </span>
          <span className="text-gray-900 dark:text-white">
            {orderSummary.shipping === 0 ? t('checkout.shippingMethod.free') : formatPrice(orderSummary.shipping)}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            {t('checkout.orderSummary.tax')}
          </span>
          <span className="text-gray-900 dark:text-white">
            {formatPrice(orderSummary.tax)}
          </span>
        </div>
        {orderSummary.discount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {t('checkout.orderSummary.discount')}
            </span>
            <span className="text-green-600 font-semibold">
              -{formatPrice(orderSummary.discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm sm:text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2 sm:pt-3">
          <span className="text-gray-900 dark:text-white">
            {t('checkout.orderSummary.total')}
          </span>
          <span className="text-teal-600">
            {formatPrice(orderSummary.total)}
          </span>
        </div>
      </div>

      {/* Security Info */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl">
        <div className="flex items-center">
          <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
          <span className="text-xs sm:text-sm text-green-800 dark:text-green-200">
            {t('checkout.orderSummary.orderProtection')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary; 