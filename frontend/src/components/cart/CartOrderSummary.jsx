import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import {
  CheckCircleIcon,
  XMarkIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const CartOrderSummary = ({
  subtotal,
  tax,
  shipping,
  discount,
  total,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onProceedToCheckout,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      setApplyingPromo(true);
      await onApplyCoupon(promoCode);
      setPromoCode('');
    } catch {
      // Error is already handled in CartContext
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    onRemoveCoupon();
    setPromoCode('');
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/20 sticky top-8">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        {t('cart.orderSummary')}
      </h2>
      
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        <div className="flex justify-between items-center py-1.5 sm:py-2">
          <span className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300">
            {t('cart.subtotal')}
          </span>
          <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
            {formatPrice(subtotal)}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-1.5 sm:py-2">
          <span className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300">
            {t('cart.shipping')}
          </span>
          <span className="text-sm sm:text-base lg:text-lg font-semibold text-green-600 dark:text-green-400">
            {shipping === 0 ? t('cart.free') : formatPrice(shipping)}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-1.5 sm:py-2">
          <span className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300">
            {t('cart.estimatedTax')}
          </span>
          <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
            {formatPrice(tax)}
          </span>
        </div>
        
        {appliedCoupon && (
          <div className="flex justify-between items-center py-1.5 sm:py-2 text-green-600 dark:text-green-400">
            <span className="text-xs sm:text-sm lg:text-base">{t('cart.discount')}</span>
            <span className="text-sm sm:text-base lg:text-lg font-semibold">-{formatPrice(discount)}</span>
          </div>
        )}
      </div>
      
      {/* Promo Code Section */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex space-x-2 sm:space-x-3">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="DENTALPROMO20"
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
            disabled={applyingPromo}
          />
          <Button
            onClick={handleApplyPromoCode}
            disabled={!promoCode.trim() || applyingPromo}
            size="sm"
          >
            {applyingPromo ? (
              <LoadingSpinner size="sm" />
            ) : (
              t('cart.apply')
            )}
          </Button>
        </div>
        
        {appliedCoupon && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
                  {t('cart.promoCodeAppliedSuccess')} (-{formatPrice(discount)})
                </span>
              </div>
              <button
                onClick={handleRemovePromoCode}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                aria-label="Remove promo code"
              >
                <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Total */}
      <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex justify-between items-center">
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            {t('cart.total')}
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {formatPrice(total)}
          </span>
        </div>
      </div>
      
      {/* Checkout Button */}
      <Button
        onClick={onProceedToCheckout}
        disabled={disabled}
        className="w-full mb-4 sm:mb-6 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold"
        size="lg"
      >
        {t('cart.proceedToCheckout')}
      </Button>
      
      {/* Delivery Information */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg sm:rounded-xl">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <LockClosedIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          <ShieldCheckIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
        <span>{t('cart.estimatedDelivery')}: Aug 2-4</span>
      </div>
    </div>
  );
};

export default CartOrderSummary; 