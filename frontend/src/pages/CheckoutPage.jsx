import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  TruckIcon,
  CreditCardIcon,
  CheckIcon,
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
  ChevronRightIcon,
  ChevronLeftIcon,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/outline';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api, { endpoints } from '../services/api';
import { toast } from 'react-hot-toast';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: 'EG',
    zipCode: '',
    phone: ''
  });
  
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: 'EG',
    zipCode: '',
    phone: ''
  });
  
  const [useDefaultAddresses, setUseDefaultAddresses] = useState(true);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [customerNotes, setCustomerNotes] = useState('');
  
  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  
  // Shipping methods with costs and delivery times
  const shippingMethods = [
    {
      id: 'standard',
      name: t('checkout.shippingMethod.standard'),
      cost: 0,
      deliveryTime: '3-5 days',
      icon: TruckIcon
    },
    {
      id: 'express',
      name: t('checkout.shippingMethod.express'),
      cost: 15,
      deliveryTime: '1-2 days',
      icon: FireIcon
    },
    {
      id: 'overnight',
      name: t('checkout.shippingMethod.overnight'),
      cost: 25,
      deliveryTime: 'Next day',
      icon: SparklesIcon
    },
    {
      id: 'pickup',
      name: t('checkout.shippingMethod.pickup'),
      cost: 0,
      deliveryTime: 'Same day',
      icon: MapPinIcon
    }
  ];
  
  // Payment methods
  const paymentMethods = [
    {
      id: 'creditCard',
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
      id: 'cashOnDelivery',
      name: t('checkout.payment.cashOnDelivery'),
      icon: CreditCardIcon,
      description: 'Pay when you receive'
    },
    {
      id: 'bankTransfer',
      name: t('checkout.payment.bankTransfer'),
      icon: CreditCardIcon,
      description: 'Bank transfer'
    }
  ];

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.cart.get);
      setCart(response);
    } catch (err) {
      setError(err.message || t('checkout.error.fetchingCart'));
      toast.error(t('checkout.error.fetchingCart'));
    } finally {
      setLoading(false);
    }
  };

  // Calculate order summary
  const calculateOrderSummary = () => {
    if (!cart) return null;
    
    const subtotal = cart.total || 0;
    const selectedShipping = shippingMethods.find(m => m.id === shippingMethod);
    const shipping = selectedShipping ? selectedShipping.cost : 0;
    const tax = subtotal * 0.14; // 14% tax
    const discount = 0; // Could be from applied coupon
    const total = subtotal + shipping + tax - discount;
    
    return {
      subtotal,
      shipping,
      tax,
      discount,
      total,
      itemCount: cart.itemCount || 0
    };
  };

  // Handle form submission
  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      
      const orderData = {
        shippingAddress: useDefaultAddresses ? null : shippingAddress,
        billingAddress: useDefaultAddresses || sameAsShipping ? null : billingAddress,
        paymentMethod,
        shippingMethod,
        customerNotes,
        useDefaultAddresses
      };
      
      const response = await api.post(endpoints.orders.checkout, orderData);
      
      toast.success(t('checkout.orderPlaced'));
      
      // Redirect to order confirmation page
      navigate(`/orders/${response._id}`);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('checkout.error.placingOrder');
      toast.error(errorMessage);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Get discount percentage
  const getDiscountPercentage = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // Handle step navigation
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Load cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate order summary
  const orderSummary = calculateOrderSummary();

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
                {t('checkout.error.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {error}
              </p>
              <Button onClick={fetchCart} variant="primary">
                {t('cart.retry')}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto text-center">
              <ShoppingCartIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('cart.empty')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('cart.emptyMessage')}
              </p>
              <Button onClick={() => navigate('/products')} variant="primary">
                {t('cart.continueShopping')}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">
                {t('checkout.title')}
              </h1>
              <p className="text-xl opacity-90">
                {t('checkout.subtitle')}
              </p>
            </div>
          </div>
        </div>

      <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                      currentStep >= step
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'
                    }`}>
                      {currentStep > step ? (
                        <CheckIcon className="w-6 h-6" />
                      ) : (
                        <span className="font-semibold">{step}</span>
                      )}
                    </div>
                    {step < 4 && (
                      <div className={`w-16 h-0.5 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4 space-x-8">
                {Object.entries(t('checkout.steps', { returnObjects: true })).map(([key, value], index) => (
                  <span
                    key={key}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      currentStep >= index + 1
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                      <MapPinIcon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {t('checkout.shipping.title')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                          {t('checkout.shipping.subtitle')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Use Default Address */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="useDefaultAddress"
                          checked={useDefaultAddresses}
                          onChange={(e) => setUseDefaultAddresses(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="useDefaultAddress" className="ml-2 text-gray-700 dark:text-gray-300">
                          {t('checkout.shipping.useDefaultAddress')}
                        </label>
                      </div>

                      {!useDefaultAddresses && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <div className="md:col-span-2">
                            <Input
                              label={t('checkout.shipping.address1')}
                              value={shippingAddress.address1}
                              onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
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
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Billing Information */}
                {currentStep === 2 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                      <CreditCardIcon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {t('checkout.billing.title')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                          {t('checkout.billing.subtitle')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sameAsShipping"
                          checked={sameAsShipping}
                          onChange={(e) => setSameAsShipping(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="sameAsShipping" className="ml-2 text-gray-700 dark:text-gray-300">
                          {t('checkout.billing.sameAsShipping')}
                        </label>
                      </div>

                      {!sameAsShipping && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <div className="md:col-span-2">
                            <Input
                              label={t('checkout.shipping.address1')}
                              value={billingAddress.address1}
                              onChange={(e) => setBillingAddress({...billingAddress, address1: e.target.value})}
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
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
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Method */}
                {currentStep === 3 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                      <CreditCardIcon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {t('checkout.payment.title')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                          {t('checkout.payment.subtitle')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Payment Method Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              paymentMethod === method.id
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            onClick={() => setPaymentMethod(method.id)}
                          >
                            <div className="flex items-center">
                              <method.icon className="w-6 h-6 text-blue-600 mr-3" />
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {method.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Credit Card Form */}
                      {paymentMethod === 'creditCard' && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                          <div className="flex items-center mb-4">
                            <LockClosedIcon className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {t('checkout.payment.paymentInfo')}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <Input
                                label={t('checkout.payment.cardholderName')}
                                value={paymentForm.cardholderName}
                                onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
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
                )}

                {/* Step 4: Shipping Method & Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Shipping Method */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                      <div className="flex items-center mb-6">
                        <TruckIcon className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('checkout.shippingMethod.title')}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300">
                            {t('checkout.shippingMethod.subtitle')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shippingMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              shippingMethod === method.id
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            onClick={() => setShippingMethod(method.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <method.icon className="w-6 h-6 text-blue-600 mr-3" />
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {method.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {t('checkout.shippingMethod.deliveryTime', { time: method.deliveryTime })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {method.cost === 0 ? t('checkout.shippingMethod.free') : formatPrice(method.cost)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Notes */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {t('checkout.customerNotes')}
                      </h3>
                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder={t('checkout.customerNotesPlaceholder')}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        rows="3"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  {currentStep > 1 && (
                    <Button
                      onClick={prevStep}
                      variant="secondary"
                      className="flex items-center"
                    >
                      <ChevronLeftIcon className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < 4 ? (
                    <Button
                      onClick={nextStep}
                      variant="primary"
                      className="flex items-center ml-auto"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePlaceOrder}
                      variant="primary"
                      disabled={placingOrder}
                      className="flex items-center ml-auto"
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
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-8">
                  <div className="flex items-center mb-6">
                    <ShoppingCartIcon className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('checkout.orderSummary.title')}
                      </h2>
        <p className="text-gray-600 dark:text-gray-300">
                        {t('checkout.orderSummary.subtitle')}
        </p>
      </div>
    </div>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart.items.map((item) => (
                      <div key={item.product._id} className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Qty: {item.quantity}
                          </p>
                          <div className="flex items-center mt-1">
                            {item.product.originalPrice && item.product.originalPrice > item.price && (
                              <span className="text-xs text-gray-500 line-through mr-2">
                                {formatPrice(item.product.originalPrice)}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  {orderSummary && (
                    <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          {t('checkout.orderSummary.items', { count: orderSummary.itemCount })}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {formatPrice(orderSummary.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          {t('checkout.orderSummary.shipping')}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {orderSummary.shipping === 0 ? t('checkout.shippingMethod.free') : formatPrice(orderSummary.shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          {t('checkout.orderSummary.tax')}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {formatPrice(orderSummary.tax)}
                        </span>
                      </div>
                      {orderSummary.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {t('checkout.orderSummary.discount')}
                          </span>
                          <span className="text-green-600 font-semibold">
                            -{formatPrice(orderSummary.discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-3">
                        <span className="text-gray-900 dark:text-white">
                          {t('checkout.orderSummary.total')}
                        </span>
                        <span className="text-blue-600">
                          {formatPrice(orderSummary.total)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Security Info */}
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-800 dark:text-green-200">
                        {t('checkout.orderSummary.orderProtection')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage; 