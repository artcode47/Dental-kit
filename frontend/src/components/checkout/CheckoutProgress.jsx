import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { CheckIcon } from '@heroicons/react/24/outline';

const CheckoutProgress = ({ currentStep }) => {
  const { t } = useTranslation();

  const steps = [
    { key: 'shipping', label: t('checkout.steps.shipping') },
    { key: 'billing', label: t('checkout.steps.billing') },
    { key: 'payment', label: t('checkout.steps.payment') },
    { key: 'review', label: t('checkout.steps.review') }
  ];

  return (
    <div className="mb-6 sm:mb-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-200 ${
              currentStep >= index + 1
                ? 'bg-teal-600 border-teal-600 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'
            }`}>
              {currentStep > index + 1 ? (
                <CheckIcon className="w-4 h-4 sm:w-6 sm:h-6" />
              ) : (
                <span className="font-semibold text-xs sm:text-base">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                currentStep > index + 1 ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-center mt-3 sm:mt-4 space-x-4 sm:space-x-8">
        {steps.map((step, index) => (
          <span
            key={step.key}
            className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
              currentStep >= index + 1
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CheckoutProgress; 