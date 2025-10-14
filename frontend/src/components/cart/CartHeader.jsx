import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const CartHeader = ({ title, subtitle, showBadge = true }) => {
  const { t } = useTranslation('ecommerce');

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 text-white py-12 sm:py-16 lg:py-20">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>
      <div className="relative container mx-auto px-4">
        <div className="text-center">
          {showBadge && (
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              {t('cart.title')}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
            {title || t('cart.title')}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl opacity-90 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4">
            {subtitle || t('cart.emptyMessage')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartHeader; 