import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Input from '../ui/Input';

const CheckoutPaymentForm = ({ 
  paymentMethod, 
  setPaymentMethod, 
  paymentForm, 
  setPaymentForm 
}) => {
  const { t } = useTranslation();

  const paymentMethods = [
    {
      id: 'stripe',
      name: t('checkout.payment.creditCard'),
      icon: CreditCardIcon,
      description: t('checkout.payment.securePayment')
    },
    {
      id: 'paypal',
      name: t('checkout.payment.paypal'),
      icon: CreditCardIcon,
      description: 'Pay with PayPal'
    },
    {
      id: 'cash_on_delivery',
      name: t('checkout.payment.cashOnDelivery'),
      icon: CreditCardIcon,
      description: 'Pay when you receive'
    },
    {
      id: 'bank_transfer',
      name: t('checkout.payment.bankTransfer'),
      icon: CreditCardIcon,
      description: 'Bank transfer'
    }
  ];

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/20">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6">
        <CreditCardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mr-2 sm:mr-3" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('checkout.payment.title')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {t('checkout.payment.subtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Payment Method Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                paymentMethod === method.id
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => setPaymentMethod(method.id)}
            >
              <div className="flex items-center">
                <method.icon className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mr-2 sm:mr-3" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                    {method.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {method.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Credit Card Form */}
        {paymentMethod === 'stripe' && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {t('checkout.payment.paymentInfo')}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <Input
                  label={t('checkout.payment.cardholderName')}
                  value={paymentForm.cardholderName}
                  onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label={t('checkout.payment.cardNumber')}
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <Input
                label={t('checkout.payment.expiryDate')}
                value={paymentForm.expiryDate}
                onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                placeholder="MM/YY"
                required
              />
              <Input
                label={t('checkout.payment.cvv')}
                value={paymentForm.cvv}
                onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                placeholder="123"
                required
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPaymentForm; 