import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { MapPinIcon } from '@heroicons/react/24/outline';
import Input from '../ui/Input';

const CheckoutShippingForm = ({ 
  shippingAddress, 
  setShippingAddress, 
  useDefaultAddresses, 
  setUseDefaultAddresses,
  userProfile = null
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/20">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6">
        <MapPinIcon className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mr-2 sm:mr-3" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('checkout.shipping.title')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {t('checkout.shipping.subtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Use Default Address */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="useDefaultAddress"
            checked={useDefaultAddresses}
            onChange={(e) => setUseDefaultAddresses(e.target.checked)}
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label htmlFor="useDefaultAddress" className="ml-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {t('checkout.shipping.useDefaultAddress')}
          </label>
        </div>

        {!useDefaultAddresses && (
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
              value={shippingAddress.firstName}
              onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
              required
            />
            <Input
              label={t('checkout.shipping.lastName')}
              value={shippingAddress.lastName}
              onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
              required
            />
            <Input
              label={t('checkout.shipping.company')}
              value={shippingAddress.company}
              onChange={(e) => setShippingAddress({...shippingAddress, company: e.target.value})}
            />
            <Input
              label={t('checkout.shipping.phone')}
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label={t('checkout.shipping.address1')}
                value={shippingAddress.address1}
                onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label={t('checkout.shipping.address2')}
                value={shippingAddress.address2}
                onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
              />
            </div>
            <Input
              label={t('checkout.shipping.city')}
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
              required
            />
            <Input
              label={t('checkout.shipping.state')}
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
              required
            />
            <Input
              label={t('checkout.shipping.country')}
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
              required
            />
            <Input
              label={t('checkout.shipping.zipCode')}
              value={shippingAddress.zipCode}
              onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
              required
            />
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutShippingForm; 