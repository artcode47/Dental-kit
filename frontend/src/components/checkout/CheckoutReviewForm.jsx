import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { TruckIcon, MapPinIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline';

const CheckoutReviewForm = ({ 
  shippingMethod, 
  setShippingMethod, 
  customerNotes, 
  setCustomerNotes 
}) => {
  const { t } = useTranslation('ecommerce');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  const shippingMethods = [
    {
      id: 'standard',
      name: t('checkout.shippingMethod.standard'),
      cost: 0,
      deliveryTime: '3-5 days',
      icon: TruckIcon
    },
    {
      id: 'express',
      name: t('checkout.shippingMethod.express'),
      cost: 15,
      deliveryTime: '1-2 days',
      icon: FireIcon
    },
    {
      id: 'overnight',
      name: t('checkout.shippingMethod.overnight'),
      cost: 25,
      deliveryTime: 'Next day',
      icon: SparklesIcon
    },
    {
      id: 'pickup',
      name: t('checkout.shippingMethod.pickup'),
      cost: 0,
      deliveryTime: 'Same day',
      icon: MapPinIcon
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Shipping Method */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/20">
        <div className="flex items-center mb-4 sm:mb-6">
          <TruckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {t('checkout.shippingMethod.title')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              {t('checkout.shippingMethod.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {shippingMethods.map((method) => (
            <div
              key={method.id}
              className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                shippingMethod === method.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => setShippingMethod(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <method.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      {method.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {t('checkout.shippingMethod.deliveryTime', { time: method.deliveryTime })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                    {method.cost === 0 ? t('checkout.shippingMethod.free') : formatPrice(method.cost)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Notes */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/20">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          {t('checkout.customerNotes')}
        </h3>
        <textarea
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          placeholder={t('checkout.customerNotesPlaceholder')}
          className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
          rows="3"
        />
      </div>
    </div>
  );
};

export default CheckoutReviewForm; 