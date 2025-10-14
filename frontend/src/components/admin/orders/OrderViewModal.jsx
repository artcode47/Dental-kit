import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  XMarkIcon, 
  ShoppingCartIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  TagIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

const OrderViewModal = ({ isOpen, order, onClose, formatCurrency, formatDate, getStatusBadgeColor, getStatusIcon }) => {
  const { t } = useTranslation('admin');

  if (!isOpen || !order) return null;

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash_on_delivery':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'credit_card':
      case 'stripe':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'paypal':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'bank_transfer':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      default:
        return <CreditCardIcon className="h-5 w-5" />;
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash_on_delivery':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'credit_card':
      case 'stripe':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paypal':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'bank_transfer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-auto sm:max-w-4xl bg-white dark:bg-gray-800 sm:rounded-2xl sm:shadow-2xl sm:mx-4 overflow-hidden max-h-[100vh] sm:max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('orders.orderDetails')}
            </h2>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 px-4 sm:px-6 py-4 overflow-y-auto space-y-6">
          {/* Order Header */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <ShoppingCartIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                #{order.orderNumber || (order.id || '').slice(-8)}
              </h3>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{t(`orders.${order.status}`)}</span>
                </span>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {formatDate(order.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                {t('orders.customer')}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400 w-20">{t('orders.name')}:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {order.user?.firstName && order.user?.lastName 
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : t('orders.noCustomerInfo')
                    }
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {order.user?.email || t('orders.noEmail')}
                  </span>
                </div>
                {order.user?.phone && (
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {order.user.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                {t('orders.payment')}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('orders.paymentMethod')}:</span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getPaymentMethodColor(order.paymentMethod)}`}>
                    {getPaymentMethodIcon(order.paymentMethod)}
                    <span className="ml-1">{t(`orders.${order.paymentMethod}`)}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('orders.total')}:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <ShoppingCartIcon className="h-4 w-4 mr-2" />
              {t('orders.items')} ({order.items?.length || 0})
            </h4>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  {item.image?.url ? (
                    <img
                      className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                      src={item.image.url}
                      alt={item.name}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <TagIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h5>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('orders.quantity')}: {item.quantity}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('orders.orderSummary')}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('orders.subtotal')}:</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('orders.tax')}:</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(order.tax)}</span>
                </div>
              )}
              {order.shipping > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('orders.shipping')}:</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(order.shipping)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('orders.discount')}:</span>
                  <span className="text-green-600 dark:text-green-400">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex items-center justify-between text-base font-semibold">
                  <span className="text-gray-900 dark:text-white">{t('orders.total')}:</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {t('orders.shippingAddress')}
              </h4>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                {order.shippingAddress.company && <div>{order.shippingAddress.company}</div>}
                <div>{order.shippingAddress.address1}</div>
                {order.shippingAddress.address2 && <div>{order.shippingAddress.address2}</div>}
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </div>
                <div>{order.shippingAddress.country}</div>
                {order.shippingAddress.phone && <div>{order.shippingAddress.phone}</div>}
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('orders.orderTimeline')}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-white font-medium">{t('orders.orderPlaced')}</div>
                  <div className="text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</div>
                </div>
              </div>
              {order.updatedAt !== order.createdAt && (
                <div className="flex items-center text-sm">
                  <div className="flex-shrink-0 w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-white font-medium">{t('orders.lastUpdated')}</div>
                    <div className="text-gray-500 dark:text-gray-400">{formatDate(order.updatedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              variant="secondary"
              className="px-4 py-2"
            >
              {t('orders.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewModal;
