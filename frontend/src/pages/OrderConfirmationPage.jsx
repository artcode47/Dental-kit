import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import api, { endpoints } from '../services/api';
import { toast } from 'react-hot-toast';
import PDFGenerator from '../utils/pdfGenerator';

const OrderConfirmationPage = () => {
  const { t } = useTranslation();
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
      setOrder(response);
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
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
      </Layout>
    );
  }

  const statusInfo = getOrderStatusStep(order.status);
  const estimatedDelivery = getEstimatedDelivery();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">
                {t('orderConfirmation.title')}
              </h1>
              <p className="text-xl opacity-90">
                {t('orderConfirmation.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Order Confirmation Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('orderConfirmation.thankYou')}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                {t('orderConfirmation.orderPlaced', { number: order.orderNumber })}
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-orange-800 dark:text-orange-200 text-sm">
                  {t('orderConfirmation.confirmationEmail')}
                </p>
              </div>
            </div>

            {/* Order Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                  <div className="flex items-center mb-6">
                    <ShoppingBagIcon className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('orderConfirmation.orderSummary.title')}
                    </h3>
                  </div>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {order.items.map((item) => (
                      <div key={item.product._id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {t('orderConfirmation.quantity')}: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {t('orderConfirmation.orderSummary.subtotal')}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {t('orderConfirmation.orderSummary.shipping')}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {order.shipping === 0 ? t('orderConfirmation.orderSummary.free') : formatPrice(order.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {t('orderConfirmation.orderSummary.tax')}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatPrice(order.tax)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          {t('orderConfirmation.orderSummary.discount')}
                        </span>
                        <span className="text-green-600 font-semibold">
                          -{formatPrice(order.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-3">
                      <span className="text-gray-900 dark:text-white">
                        {t('orderConfirmation.orderSummary.total')}
                      </span>
                      <span className="text-blue-600">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <div className="flex items-center mb-6">
                    <TruckIcon className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('orderConfirmation.deliveryInformation.title')}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {/* Shipping Address */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t('orderConfirmation.deliveryInformation.shippingAddress')}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                      </div>
                    </div>

                    {/* Estimated Delivery */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        {t('orderConfirmation.deliveryInformation.estimatedDelivery')}
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 font-medium">
                        {estimatedDelivery}
                      </p>
                    </div>

                    {/* Shipping Method */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('orderConfirmation.deliveryInformation.shippingMethod')}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {t(`orderConfirmation.shippingMethods.${order.shippingMethod}`)} 
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
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                            }`}>
                              {index < statusInfo.currentIndex ? '✓' : step.icon}
                            </div>
                            {index < statusInfo.steps.length - 1 && (
                              <div className={`w-8 h-0.5 mx-2 ${
                                index < statusInfo.currentIndex ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                              }`} />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                        {statusInfo.steps[statusInfo.currentIndex]?.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={() => navigate(`/orders/${order._id}/track`)}
                variant="primary"
                className="flex items-center"
              >
                <TruckIcon className="w-4 h-4 mr-2" />
                {t('orderConfirmation.trackOrder')}
              </Button>
              
              <Button
                onClick={() => navigate('/products')}
                variant="secondary"
                className="flex items-center"
              >
                <ShoppingBagIcon className="w-4 h-4 mr-2" />
                {t('orderConfirmation.continueShopping')}
              </Button>
              
              <Button
                onClick={downloadInvoice}
                disabled={downloadingInvoice}
                variant="outline"
                className="flex items-center"
              >
                {downloadingInvoice ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t('orderConfirmation.downloading')}
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    {t('orderConfirmation.downloadInvoice')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage; 