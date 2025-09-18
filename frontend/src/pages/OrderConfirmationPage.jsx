import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckIcon,
  TruckIcon,
  CreditCardIcon,
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  StarIcon as StarIconSolid,
  DocumentArrowDownIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import api, { endpoints } from '../services/api';
import { toast } from 'react-hot-toast';
import { PDFGenerator } from '../utils/pdfGenerator';

const OrderConfirmationPage = () => {
  const { t } = useTranslation('ecommerce');
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  
  // Fetch order data
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.orders.get(orderId));
      // apiHelpers.get returns data; api.get returns axios response. Handle both.
      const data = response?.data ?? response;
      setOrder(data.order ?? data);
    } catch (err) {
      setError(err.message || t('orderConfirmation.error.fetchingOrder'));
      toast.error(t('orderConfirmation.error.fetchingOrder'));
    } finally {
      setLoading(false);
    }
  };

  // Download PDF Invoice
  const downloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      
      // Generate PDF using the PDF generator
      const pdfGenerator = new PDFGenerator();
      const pdfDoc = pdfGenerator.generateInvoice(order);
      
      // Download the PDF
      pdfDoc.save(`invoice-${order.orderNumber}.pdf`);
      
      toast.success(t('orderConfirmation.invoiceDownloaded'));
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error(t('orderConfirmation.error.downloadingInvoice'));
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Get order status step
  const getOrderStatusStep = (status) => {
    const steps = [
      { id: 'pending', label: t('orderConfirmation.status.pending'), icon: '⏳' },
      { id: 'confirmed', label: t('orderConfirmation.status.confirmed'), icon: '✅' },
      { id: 'processing', label: t('orderConfirmation.status.processing'), icon: '⚙️' },
      { id: 'shipped', label: t('orderConfirmation.status.shipped'), icon: '📦' },
      { id: 'delivered', label: t('orderConfirmation.status.delivered'), icon: '🎉' }
    ];
    
    const currentIndex = steps.findIndex(step => step.id === status);
    return { steps, currentIndex };
  };

  // Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    if (!order) return null;
    
    const orderDate = new Date(order.createdAt);
    const deliveryDays = order.shippingMethod === 'express' ? 2 : 
                        order.shippingMethod === 'overnight' ? 1 : 5;
    
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
    
    return estimatedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load order on component mount
  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('orderConfirmation.error.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <Button onClick={fetchOrder} variant="primary">
              {t('orderConfirmation.retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('orderConfirmation.orderNotFound')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('orderConfirmation.orderNotFoundMessage')}
            </p>
            <Button onClick={() => navigate('/orders')} variant="primary">
              {t('orderConfirmation.viewOrders')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getOrderStatusStep(order.status);
  const estimatedDelivery = getEstimatedDelivery();

  // Safe shipping method label
  const shippingMethodLabel = t(`orderConfirmation.shippingMethods.${order?.shippingMethod || 'standard'}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-white/10 rounded-full"></div>
          </div>
          <div className="container mx-auto px-4 py-16 relative">
            <div className="text-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm animate-pulse">
                <CheckIcon className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {t('orderConfirmation.title')}
              </h1>
              <p className="text-lg sm:text-xl opacity-95 max-w-2xl mx-auto px-4">
                {t('orderConfirmation.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Order Confirmation Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-fadeIn">
                <CheckIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('orderConfirmation.thankYou')}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
                {t('orderConfirmation.orderPlaced', { number: order.orderNumber })}
              </p>
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-6 max-w-md mx-auto border border-indigo-200/50 dark:border-indigo-700/30">
                <div className="flex items-center justify-center space-x-2">
                  <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <p className="text-indigo-800 dark:text-indigo-200 text-sm font-medium">
                    {t('orderConfirmation.confirmationEmail')}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Details Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                {/* Order Summary */}
                <div>
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-xl flex items-center justify-center mr-4">
                      <ShoppingBagIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t('orderConfirmation.orderSummary.title')}
                    </h3>
                  </div>

                  {/* Items */}
                  <div className="space-y-4 mb-8">
                    {(order.items || []).map((item) => {
                      const imageUrl = item?.image?.url || '/placeholder-product.svg';
                      const imageAlt = item?.image?.alt || item?.name || 'Product image';
                      return (
                        <div key={item.productId || item.id} className="flex items-center space-x-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-600/30 hover:shadow-md transition-shadow">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-600 rounded-xl overflow-hidden shadow-sm">
                            <img
                              src={imageUrl}
                              alt={imageAlt}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = '/placeholder-product.svg'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
                              {item.name || 'Product'}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {t('orderConfirmation.quantity')}: {item.quantity ?? 1}
                            </p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(item.price || 0)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-6">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {t('orderConfirmation.orderSummary.subtotal')}
                      </span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {t('orderConfirmation.orderSummary.shipping')}
                      </span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {order.shipping === 0 ? t('orderConfirmation.orderSummary.free') : formatPrice(order.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {t('orderConfirmation.orderSummary.tax')}
                      </span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {formatPrice(order.tax)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-base">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                          {t('orderConfirmation.orderSummary.discount')}
                        </span>
                        <span className="text-green-600 font-bold">
                          -{formatPrice(order.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold border-t-2 border-indigo-200 dark:border-indigo-700 pt-4">
                      <span className="text-gray-900 dark:text-white">
                        {t('orderConfirmation.orderSummary.total')}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-800/30 rounded-xl flex items-center justify-center mr-4">
                      <TruckIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t('orderConfirmation.deliveryInformation.title')}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {/* Shipping Address */}
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-600/30">
                      <div className="flex items-center mb-4">
                        <MapPinIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                          {t('orderConfirmation.deliveryInformation.shippingAddress')}
                        </h4>
                      </div>
                      <div className="space-y-2 text-base text-gray-700 dark:text-gray-300">
                        <p className="font-semibold">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        {order.shippingAddress.phone && (
                          <div className="flex items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <PhoneIcon className="w-4 h-4 text-gray-500 mr-2" />
                            <p>{order.shippingAddress.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Estimated Delivery */}
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/30">
                      <div className="flex items-center mb-3">
                        <FireIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg">
                          {t('orderConfirmation.deliveryInformation.estimatedDelivery')}
                        </h4>
                      </div>
                      <p className="text-indigo-800 dark:text-indigo-200 font-semibold text-lg">
                        {estimatedDelivery}
                      </p>
                    </div>

                    {/* Shipping Method */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('orderConfirmation.deliveryInformation.shippingMethod')}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {shippingMethodLabel} 
                        {order.shipping === 0 && ` (${t('orderConfirmation.orderSummary.free')})`}
                      </p>
                    </div>

                    {/* Payment Method */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('orderConfirmation.deliveryInformation.paymentMethod')}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {t(`orderConfirmation.paymentMethods.${order.paymentMethod}`)}
                        {order.paymentMethod === 'creditCard' && ' (**** 1234)'}
                      </p>
                    </div>

                    {/* Order Status */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                        {t('orderConfirmation.deliveryInformation.orderStatus')}
                      </h4>
                      <div className="flex items-center space-x-4">
                        {statusInfo.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                              index <= statusInfo.currentIndex
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                            }`}>
                              {index < statusInfo.currentIndex ? '✓' : step.icon}
                            </div>
                            {index < statusInfo.steps.length - 1 && (
                            <div className={`w-8 h-0.5 mx-2 ${
                                index < statusInfo.currentIndex ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                              }`} />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 animate-fadeIn">
                        {statusInfo.steps[statusInfo.currentIndex]?.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('orderConfirmation.nextSteps')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('orderConfirmation.nextStepsDescription')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Button
                  onClick={() => navigate(`/orders/${order._id}/track`)}
                  variant="primary"
                  className="flex items-center justify-center p-4 sm:p-6 h-auto text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800"
                >
                                      <TruckIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  {t('orderConfirmation.trackOrder')}
                </Button>
                
                <Button
                  onClick={() => navigate('/products')}
                  variant="secondary"
                  className="flex items-center justify-center p-4 sm:p-6 h-auto text-base sm:text-lg font-semibold bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700"
                >
                                      <ShoppingBagIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  {t('orderConfirmation.continueShopping')}
                </Button>
                
                <Button
                  onClick={downloadInvoice}
                  disabled={downloadingInvoice}
                  variant="outline"
                  className="flex items-center justify-center p-4 sm:p-6 h-auto text-base sm:text-lg font-semibold border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  {downloadingInvoice ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2 sm:mr-3" />
                      {t('orderConfirmation.downloading')}
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      {t('orderConfirmation.downloadInvoice')}
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 animate-fadeIn">
                <div className="flex items-center justify-center space-x-2">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                    {t('orderConfirmation.orderProtection')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default OrderConfirmationPage; 