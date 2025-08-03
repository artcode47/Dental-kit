import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Import modular components
import CartHeader from '../components/cart/CartHeader';
import CartBreadcrumb from '../components/cart/CartBreadcrumb';
import CartEmptyState from '../components/cart/CartEmptyState';
import CartItemsList from '../components/cart/CartItemsList';
import CartOrderSummary from '../components/cart/CartOrderSummary';

const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <CartHeader />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <CartBreadcrumb />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <CartItemsList
              items={items}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              updatingItem={updatingItem}
            />
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
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
        </div>
      </div>
    </div>
  );
};

export default CartPage; 