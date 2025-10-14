import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Seo from '../components/seo/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import AnimatedSection from '../components/animations/AnimatedSection';

// Import modular components
import CartHeader from '../components/cart/CartHeader';
import CartBreadcrumb from '../components/cart/CartBreadcrumb';
import CartEmptyState from '../components/cart/CartEmptyState';
import CartItemsList from '../components/cart/CartItemsList';
import CartOrderSummary from '../components/cart/CartOrderSummary';

const CartPage = () => {
  const { t } = useTranslation('ecommerce');
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { currentTheme } = useTheme();
  const { 
    items, 
    subtotal, 
    tax, 
    shipping, 
    discount, 
    total,
    isLoading,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon
  } = useCart();
  
  const [updatingItem, setUpdatingItem] = useState(null);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItem(itemId);
      await updateQuantity(itemId, newQuantity);
      toast.success(t('cart.quantityUpdated'));
    } catch {
      toast.error(t('cart.error.updateQuantity'));
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success(t('cart.itemRemoved'));
    } catch {
      toast.error(t('cart.error.removeItem'));
    }
  };

  const handleApplyCoupon = async (promoCode) => {
    try {
      await applyCoupon(promoCode);
    } catch {
      // Error is already handled in CartContext
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Seo
        title={t('seo.cart.title', 'Cart')}
        description={t('seo.cart.description', 'View items in your cart and proceed to checkout')}
        type="website"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={currentTheme === 'dark' ? '#0B1220' : '#FFFFFF'}
      />
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-300/25 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Header Section */}
      <CartHeader />

      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <AnimatedSection animation="fadeInDown" delay={0}>
          <div className="mb-4 sm:mb-6">
            <CartBreadcrumb />
          </div>
        </AnimatedSection>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items Section */}
          <AnimatedSection animation="fadeInUp" delay={100} className="lg:col-span-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 p-4 sm:p-6">
              <CartItemsList
                items={items}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={handleRemoveItem}
                updatingItem={updatingItem}
              />
            </div>
          </AnimatedSection>

          {/* Order Summary Section */}
          <AnimatedSection animation="fadeInUp" delay={200} className="lg:col-span-1">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 p-4 sm:p-6 sticky top-6">
              <CartOrderSummary
                subtotal={subtotal}
                tax={tax}
                shipping={shipping}
                discount={discount}
                total={total}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                onProceedToCheckout={handleProceedToCheckout}
                disabled={!items || items.length === 0}
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 