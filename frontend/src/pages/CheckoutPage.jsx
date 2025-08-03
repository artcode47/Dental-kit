import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import api, { endpoints } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Import modular checkout components
import CheckoutHeader from '../components/checkout/CheckoutHeader';
import CheckoutProgress from '../components/checkout/CheckoutProgress';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary';
import CheckoutNavigation from '../components/checkout/CheckoutNavigation';
import CheckoutShippingForm from '../components/checkout/CheckoutShippingForm';
import CheckoutBillingForm from '../components/checkout/CheckoutBillingForm';
import CheckoutPaymentForm from '../components/checkout/CheckoutPaymentForm';
import CheckoutReviewForm from '../components/checkout/CheckoutReviewForm';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState(null);
  
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
  
  const [useDefaultAddresses, setUseDefaultAddresses] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [customerNotes, setCustomerNotes] = useState('');
  
  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  


  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await api.get(endpoints.users.profile);
      setUserProfile(response.data);
      
      // Pre-fill shipping address with user data
      const userData = response.data;
      setShippingAddress(prev => ({
        ...prev,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        company: userData.company || '',
        phone: userData.phone || '',
        country: userData.country || 'EG'
      }));
      
      // Pre-fill billing address with same data
      setBillingAddress(prev => ({
        ...prev,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        company: userData.company || '',
        phone: userData.phone || '',
        country: userData.country || 'EG'
      }));
      
    } catch (err) {
      console.error('Profile fetch error:', err);
      // Don't show error toast for profile fetch, just use empty forms
    }
  };

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.cart.get);
      console.log('Cart response:', response); // Debug log
      setCart(response.data || response); // Handle both response.data and direct response
    } catch (err) {
      console.error('Cart fetch error:', err); // Debug log
      setError(err.message || t('checkout.error.fetchingCart'));
      toast.error(t('checkout.error.fetchingCart'));
    } finally {
      setLoading(false);
    }
  };
  
  // Shipping methods with costs and delivery times
  const shippingMethods = [
    {
      id: 'standard',
      name: t('checkout.shippingMethod.standard'),
      cost: 0,
      deliveryTime: '3-5 days'
    },
    {
      id: 'express',
      name: t('checkout.shippingMethod.express'),
      cost: 15,
      deliveryTime: '1-2 days'
    },
    {
      id: 'overnight',
      name: t('checkout.shippingMethod.overnight'),
      cost: 25,
      deliveryTime: 'Next day'
    },
    {
      id: 'pickup',
      name: t('checkout.shippingMethod.pickup'),
      cost: 0,
      deliveryTime: 'Same day'
    }
  ];

  // Generate unique order number
  const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
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
      
      // Validate required fields
      if (!paymentMethod) {
        toast.error('Please select a payment method');
        return;
      }
      
      // Validate shipping address if not using default
      if (!useDefaultAddresses) {
        if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.address1 || !shippingAddress.city || !shippingAddress.country) {
          toast.error('Please fill in all required shipping information');
          return;
        }
      }
      
      // Validate billing address if not using default and not same as shipping
      if (!sameAsShipping && !useDefaultAddresses) {
        if (!billingAddress.firstName || !billingAddress.lastName || !billingAddress.address1 || !billingAddress.city || !billingAddress.country) {
          toast.error('Please fill in all required billing information');
          return;
        }
      }
      
      const orderData = {
        shippingAddress: useDefaultAddresses ? {} : shippingAddress,
        billingAddress: (useDefaultAddresses || sameAsShipping) ? {} : billingAddress,
        paymentMethod: paymentMethod,
        shippingMethod: shippingMethod,
        customerNotes: customerNotes || '',
        useDefaultAddresses: useDefaultAddresses || false,
        sameAsShipping: sameAsShipping || false
      };
      
      console.log('Sending order data:', orderData); // Debug log
      
      const response = await api.post(endpoints.orders.checkout, orderData);
      
      toast.success(t('checkout.orderPlaced'));
      
      // Redirect to order confirmation page
      navigate(`/orders/${response.data._id || response._id}`);
      
    } catch (err) {
      console.error('Order placement error:', err.response?.data); // Debug log
      const errorMessage = err.response?.data?.message || t('checkout.error.placingOrder');
      toast.error(errorMessage);
    } finally {
      setPlacingOrder(false);
    }
  };



  // Handle step navigation
  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      // Validate shipping information
      if (!useDefaultAddresses) {
        if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.address1 || !shippingAddress.city || !shippingAddress.country) {
          toast.error('Please fill in all required shipping information');
          return;
        }
      }
    } else if (currentStep === 2) {
      // Validate billing information
      if (!sameAsShipping && !useDefaultAddresses) {
        if (!billingAddress.firstName || !billingAddress.lastName || !billingAddress.address1 || !billingAddress.city || !billingAddress.country) {
          toast.error('Please fill in all required billing information');
          return;
        }
      }
    } else if (currentStep === 3) {
      // Validate payment method
      if (!paymentMethod) {
        toast.error('Please select a payment method');
        return;
      }
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Load cart and user profile on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchCart(),
        fetchUserProfile()
      ]);
    };
    loadData();
  }, []);

  // Calculate order summary
  const orderSummary = calculateOrderSummary();

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
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <CheckoutHeader />

      <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Progress Steps */}
          <CheckoutProgress currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <CheckoutShippingForm
                    shippingAddress={shippingAddress}
                    setShippingAddress={setShippingAddress}
                    useDefaultAddresses={useDefaultAddresses}
                    setUseDefaultAddresses={setUseDefaultAddresses}
                    userProfile={userProfile}
                  />
                )}

                                {/* Step 2: Billing Information */}
                {currentStep === 2 && (
                  <CheckoutBillingForm
                    billingAddress={billingAddress}
                    setBillingAddress={setBillingAddress}
                    sameAsShipping={sameAsShipping}
                    setSameAsShipping={setSameAsShipping}
                    userProfile={userProfile}
                  />
                )}

                {/* Step 3: Payment Method */}
                {currentStep === 3 && (
                <CheckoutPaymentForm
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  paymentForm={paymentForm}
                  setPaymentForm={setPaymentForm}
                />
                )}

                {/* Step 4: Shipping Method & Review */}
                {currentStep === 4 && (
                <CheckoutReviewForm
                  shippingMethod={shippingMethod}
                  setShippingMethod={setShippingMethod}
                  customerNotes={customerNotes}
                  setCustomerNotes={setCustomerNotes}
                />
              )}

              {/* Navigation */}
              <CheckoutNavigation
                currentStep={currentStep}
                onNext={nextStep}
                onPrevious={prevStep}
                onPlaceOrder={handlePlaceOrder}
                placingOrder={placingOrder}
              />
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
              <CheckoutOrderSummary
                cart={cart}
                orderSummary={orderSummary}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 