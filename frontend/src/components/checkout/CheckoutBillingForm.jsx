import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import Input from '../ui/Input';

const CheckoutBillingForm = ({ 
  billingAddress, 
  setBillingAddress, 
  sameAsShipping, 
  setSameAsShipping,
  userProfile = null
}) => {
  const { t } = useTranslation('ecommerce');

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/20">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6">
        <CreditCardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('checkout.billing.title')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {t('checkout.billing.subtitle')}
          </p>
        </div>
      </div>

      {/* Help/Explanation */}
      <div className="mb-4 sm:mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
        <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200 font-medium mb-1">
          {t('checkout.billing.helpTitle')}
        </p>
        <p className="text-xs sm:text-sm text-blue-800/90 dark:text-blue-200/90">
          {t('checkout.billing.helpDescription')}
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Same as Shipping */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sameAsShipping"
            checked={sameAsShipping}
            onChange={(e) => setSameAsShipping(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="sameAsShipping" className="ml-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {t('checkout.billing.sameAsShipping')}
          </label>
        </div>

        {!sameAsShipping && (
          <>
            {/* Pre-filled data message */}
            {userProfile && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ✅ Your profile information has been pre-filled. Please complete your address details below.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label={t('checkout.shipping.firstName')}
              value={billingAddress.firstName}
              onChange={(e) => setBillingAddress({...billingAddress, firstName: e.target.value})}
              required
            />
            <Input
              label={t('checkout.shipping.lastName')}
              value={billingAddress.lastName}
              onChange={(e) => setBillingAddress({...billingAddress, lastName: e.target.value})}
              required
            />
            <Input
              label={t('checkout.shipping.company')}
              value={billingAddress.company}
              onChange={(e) => setBillingAddress({...billingAddress, company: e.target.value})}
            />
            <Input
              label={t('checkout.shipping.phone')}
              value={billingAddress.phone}
              onChange={(e) => setBillingAddress({...billingAddress, phone: e.target.value})}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label={t('checkout.shipping.address1')}
                value={billingAddress.address1}
                onChange={(e) => setBillingAddress({...billingAddress, address1: e.target.value})}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label={t('checkout.shipping.address2')}
                value={billingAddress.address2}
                onChange={(e) => setBillingAddress({...billingAddress, address2: e.target.value})}
              />
            </div>
            <Input
              label={t('checkout.shipping.city')}
              value={billingAddress.city}
              onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
              required
            />
            <Input
              label={t('checkout.shipping.state')}
              value={billingAddress.state}
              onChange={(e) => setBillingAddress({...billingAddress, state: e.target.value})}
              required
            />
            <Input
              label={t('checkout.shipping.country')}
              value={billingAddress.country}
              onChange={(e) => setBillingAddress({...billingAddress, country: e.target.value})}
              required
            />
            <Input
              label={t('checkout.shipping.zipCode')}
              value={billingAddress.zipCode}
              onChange={(e) => setBillingAddress({...billingAddress, zipCode: e.target.value})}
              required
            />
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutBillingForm; 