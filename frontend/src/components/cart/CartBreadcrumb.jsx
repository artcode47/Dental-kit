import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CartBreadcrumb = () => {
  const { t } = useTranslation('ecommerce');

  const steps = [
    { key: 'cart', label: t('cart.steps.cart'), active: true },
    { key: 'shipping', label: t('cart.steps.shipping'), active: false },
    { key: 'payment', label: t('cart.steps.payment'), active: false },
    { key: 'confirm', label: t('cart.steps.confirm'), active: false }
  ];

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 overflow-x-auto pb-2 sm:pb-0">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            {index > 0 && (
              <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 rotate-180 flex-shrink-0" />
            )}
            <span 
              className={`flex-shrink-0 ${
                step.active 
                  ? 'text-gray-900 dark:text-white font-medium' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {step.key === 'cart' ? (
                <Link 
                  to="/" 
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {step.label}
                </Link>
              ) : (
                step.label
              )}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CartBreadcrumb; 