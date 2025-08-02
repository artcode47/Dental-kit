import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowLeftIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  LockClosedIcon,
  SparklesIcon,
  FireIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, updateCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/cart');
      updateCart(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateOrderSummary = (cartData) => {
    if (!cartData || !cartData.items) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    
    const subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    const discount = appliedPromo ? appliedPromo.discountAmount : 0;
    const total = subtotal + shipping + tax - discount;
    
    return { subtotal, shipping, tax, total };
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItem(productId);
      const response = await api.put('/cart/update', { productId, quantity: newQuantity });
      updateCart(response.data);
      toast.success(t('cart.quantityUpdated'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('cart.error.updateQuantity'));
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      updateCart(response.data);
      toast.success(t('cart.itemRemoved'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('cart.error.removeItem'));
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      setApplyingPromo(true);
      const response = await api.post('/cart/apply-promo', { code: promoCode });
      setAppliedPromo(response.data);
      toast.success(t('cart.promoCodeApplied'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('cart.error.applyPromo'));
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    toast.success(t('cart.promoCodeRemoved'));
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStockStatus = (item) => {
    if (item.product.stock === 0) {
      return { status: 'outOfStock', message: 'Out of stock' };
    }
    if (item.quantity > item.product.stock) {
      return { status: 'insufficientStock', message: `Only ${item.product.stock} available` };
    }
    return { status: 'inStock', message: null };
  };

  const getDiscountPercentage = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const orderSummary = calculateOrderSummary(cart);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('cart.error.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <Button onClick={fetchCart}>
            {t('cart.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 text-white py-16 lg:py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <ShoppingCartIcon className="w-4 h-4 mr-2" />
              Shopping Cart
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              {t('cart.title')}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Review your items and proceed to secure checkout
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-full flex items-center justify-center shadow-teal">
                  <ShoppingCartIcon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {t('cart.steps.cart')}
                </span>
              </div>
              
              <div className="w-24 h-1 bg-gradient-to-r from-teal-600 to-teal-500 rounded-full"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center">
                  <TruckIcon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('cart.steps.shipping')}
                </span>
              </div>
              
              <div className="w-24 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center">
                  <CreditCardIcon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('cart.steps.payment')}
                </span>
              </div>
              
              <div className="w-24 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('cart.steps.confirm')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            {!cart || cart.items.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-16 text-center shadow-2xl border border-white/20 dark:border-gray-700/20">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShoppingCartIcon className="h-16 w-16 text-blue-500 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('cart.empty')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-10 text-xl leading-relaxed">
                  {t('cart.emptyMessage')}
                </p>
                <Button 
                  onClick={() => navigate('/products')} 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('cart.continueShopping')}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.items.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const discountPercentage = getDiscountPercentage(item.product.originalPrice, item.price);
                  
                  return (
                    <div key={item.product._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/20 hover:-translate-y-1">
                      <div className="flex items-start space-x-8">
                        {/* Product Image */}
                        <div className="flex-shrink-0 relative">
                          <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg">
                            <img
                              src={item.product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Product'}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Product Badges */}
                          <div className="absolute -top-2 -left-2 flex flex-col space-y-1">
                            {item.product.isOnSale && discountPercentage > 0 && (
                              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                                <TagIcon className="h-3 w-3 mr-1" />
                                {discountPercentage}% OFF
                              </div>
                            )}
                            {item.product.isNew && (
                              <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                                <SparklesIcon className="h-3 w-3 mr-1" />
                                NEW
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                  onClick={() => navigate(`/products/${item.product._id}`)}>
                                {item.product.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">
                                {item.product.vendor?.name || t('cart.vendor')}
                              </p>
                              <div className="flex items-center space-x-4">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {formatPrice(item.price)}
                                </span>
                                {item.product.originalPrice && item.product.originalPrice > item.price && (
                                  <span className="text-lg text-gray-500 line-through">
                                    {formatPrice(item.product.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.product._id)}
                              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                          
                          {/* Stock Status */}
                          {stockStatus.message && (
                            <div className={`mt-3 px-4 py-2 rounded-xl text-sm font-medium ${
                              stockStatus.status === 'outOfStock' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
                            }`}>
                              <ExclamationTriangleIcon className="h-4 w-4 inline mr-2" />
                              {stockStatus.message}
                            </div>
                          )}
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center space-x-4">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('cart.quantity')}:
                              </label>
                              <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                                <button
                                  onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updatingItem === item.product._id}
                                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="px-6 py-2 text-lg font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                                  {updatingItem === item.product._id ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock || updatingItem === item.product._id}
                                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                {t('cart.orderSummary')}
              </h2>
              
              {/* Price Breakdown */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t('cart.subtotal')}
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatPrice(orderSummary.subtotal)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t('cart.shipping')}
                  </span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {orderSummary.shipping === 0 ? t('cart.free') : formatPrice(orderSummary.shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t('cart.estimatedTax')}
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatPrice(orderSummary.tax)}
                  </span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between items-center py-2 text-green-600 dark:text-green-400">
                    <span>{t('cart.discount')}</span>
                    <span className="text-lg font-semibold">-{formatPrice(appliedPromo.discountAmount)}</span>
                  </div>
                )}
              </div>
              
              {/* Promo Code Section */}
              <div className="mb-8">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="DENTALPROMO20"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={applyingPromo}
                  />
                  <Button
                    onClick={handleApplyPromoCode}
                    disabled={!promoCode.trim() || applyingPromo}
                    size="sm"
                  >
                    {applyingPromo ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      t('cart.apply')
                    )}
                  </Button>
                </div>
                
                {appliedPromo && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          {t('cart.promoCodeAppliedSuccess')} (-{formatPrice(appliedPromo.discountAmount)})
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromoCode}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Total */}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('cart.total')}
                  </span>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(orderSummary.total)}
                  </span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Button
                onClick={handleProceedToCheckout}
                disabled={!cart || cart.items.length === 0}
                className="w-full mb-6 py-4 text-lg font-semibold"
                size="lg"
              >
                {t('cart.proceedToCheckout')}
              </Button>
              
              {/* Delivery Information */}
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <LockClosedIcon className="h-4 w-4" />
                  <ShieldCheckIcon className="h-4 w-4" />
                </div>
                <span>{t('cart.estimatedDelivery')}: Aug 2-4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 