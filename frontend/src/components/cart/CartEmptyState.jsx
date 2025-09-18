import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const CartEmptyState = () => {
  const { t } = useTranslation('ecommerce');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center shadow-2xl border border-white/20 dark:border-gray-700/20">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <ShoppingCartIcon className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-blue-500 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('cart.empty')}
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
            {t('cart.emptyMessage')}
          </p>
          <Button 
            onClick={() => navigate('/products')} 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {t('cart.continueShopping')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartEmptyState; 