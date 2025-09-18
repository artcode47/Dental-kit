import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ChevronLeftIcon, ChevronRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const CheckoutNavigation = ({ 
  currentStep, 
  onNext, 
  onPrevious, 
  onPlaceOrder, 
  placingOrder 
}) => {
  const { t } = useTranslation('ecommerce');

  return (
    <div className="flex justify-between">
      {currentStep > 1 && (
        <Button
          onClick={onPrevious}
          variant="secondary"
          className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          {t('profile.cancel')}
        </Button>
      )}
      
      {currentStep < 4 ? (
        <Button
          onClick={onNext}
          variant="primary"
          className="flex items-center ml-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
        >
          {t('checkout.steps.review')}
          <ChevronRightIcon className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button
          onClick={onPlaceOrder}
          variant="primary"
          disabled={placingOrder}
          className="flex items-center ml-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
        >
          {placingOrder ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {t('checkout.processing')}
            </>
          ) : (
            <>
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              {t('checkout.placeOrder')}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default CheckoutNavigation; 