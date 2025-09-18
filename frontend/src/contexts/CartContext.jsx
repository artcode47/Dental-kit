import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import api from '../services/api';

const CartContext = createContext();

const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  isLoading: false,
  isUpdating: false,
  appliedCoupon: null,
  appliedGiftCard: null,
  shippingAddress: null,
  billingAddress: null,
  paymentMethod: null,
  estimatedDelivery: null,
  cartId: null,
  lastUpdated: null,
  isCartOpen: false,
  savedForLater: [],
  recentlyViewed: [],
  recommendations: [],
  cartExpiry: null
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_UPDATING':
      return { ...state, isUpdating: action.payload };
    
    case 'SET_CART':
      return {
        ...state,
        ...action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => 
        item.productId === action.payload.productId && 
        item.variantId === action.payload.variantId
      );
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.productId === action.payload.productId && item.variantId === action.payload.variantId
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          lastUpdated: new Date().toISOString()
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
          lastUpdated: new Date().toISOString()
        };
      }
    
    case 'UPDATE_ITEM_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        lastUpdated: new Date().toISOString()
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        appliedCoupon: null,
        appliedGiftCard: null,
        lastUpdated: new Date().toISOString()
      };
    
    case 'APPLY_COUPON':
      return {
        ...state,
        appliedCoupon: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case 'REMOVE_COUPON':
      return {
        ...state,
        appliedCoupon: null,
        lastUpdated: new Date().toISOString()
      };
    
    case 'APPLY_GIFT_CARD':
      return {
        ...state,
        appliedGiftCard: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case 'REMOVE_GIFT_CARD':
      return {
        ...state,
        appliedGiftCard: null,
        lastUpdated: new Date().toISOString()
      };
    
    case 'SET_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case 'SET_BILLING_ADDRESS':
      return {
        ...state,
        billingAddress: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case 'SET_ESTIMATED_DELIVERY':
      return {
        ...state,
        estimatedDelivery: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isCartOpen: !state.isCartOpen
      };
    
    case 'SET_CART_OPEN':
      return {
        ...state,
        isCartOpen: action.payload
      };
    
    case 'ADD_TO_SAVED_FOR_LATER':
      return {
        ...state,
        savedForLater: [...state.savedForLater, action.payload],
        lastUpdated: new Date().toISOString()
      };
    
    case 'REMOVE_FROM_SAVED_FOR_LATER':
      return {
        ...state,
        savedForLater: state.savedForLater.filter(item => item.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };
    
    case 'ADD_TO_RECENTLY_VIEWED':
      const existingViewed = state.recentlyViewed.find(item => item.id === (action.payload._id || action.payload.id));
      const updatedRecentlyViewed = existingViewed
        ? state.recentlyViewed.filter(item => item.id !== (action.payload._id || action.payload.id))
        : state.recentlyViewed;
      
      return {
        ...state,
        recentlyViewed: [action.payload, ...updatedRecentlyViewed.slice(0, 9)],
        lastUpdated: new Date().toISOString()
      };
    
    case 'SET_RECOMMENDATIONS':
      return {
        ...state,
        recommendations: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case 'UPDATE_TOTALS':
      const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.15; // 15% tax rate
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const discount = state.appliedCoupon ? subtotal * (state.appliedCoupon.discountPercent / 100) : 0;
      const giftCardDiscount = state.appliedGiftCard ? state.appliedGiftCard.balance : 0;
      const total = Math.max(0, subtotal + tax + shipping - discount - giftCardDiscount);
      
      return {
        ...state,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        totalItems: state.items.reduce((sum, item) => sum + item.quantity, 0)
      };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount with proper error handling
  useEffect(() => {
    const loadCartFromStorage = async () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          
          // Validate cart structure
          if (cartData && typeof cartData === 'object' && Array.isArray(cartData.items)) {
            // Check if cart is not too old (7 days)
            const cartAge = cartData.lastUpdated ? 
              Date.now() - new Date(cartData.lastUpdated).getTime() : 
              Infinity;
            
            if (cartAge < 7 * 24 * 60 * 60 * 1000) { // 7 days
              dispatch({ type: 'SET_CART', payload: cartData });
            } else {
              // Cart is too old, clear it
              localStorage.removeItem('cart');
              dispatch({ type: 'CLEAR_CART' });
            }
          } else {
            // Invalid cart structure, clear it
            localStorage.removeItem('cart');
            dispatch({ type: 'CLEAR_CART' });
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
        dispatch({ type: 'CLEAR_CART' });
      }
    };

    loadCartFromStorage();
  }, []);

  // Listen for logout events to clear cart
  useEffect(() => {
    const handleLogout = () => {
      dispatch({ type: 'CLEAR_CART' });
    };

    window.addEventListener('userLogout', handleLogout);
    return () => window.removeEventListener('userLogout', handleLogout);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0 || state.savedForLater.length > 0) {
      const cartData = {
        items: state.items,
        savedForLater: state.savedForLater,
        recentlyViewed: state.recentlyViewed,
        appliedCoupon: state.appliedCoupon,
        appliedGiftCard: state.appliedGiftCard,
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        lastUpdated: state.lastUpdated
      };
      localStorage.setItem('cart', JSON.stringify(cartData));
    } else {
      localStorage.removeItem('cart');
    }
  }, [state.items, state.savedForLater, state.recentlyViewed, state.appliedCoupon, state.appliedGiftCard, state.shippingAddress, state.billingAddress, state.lastUpdated]);

  // Update totals whenever items change
  useEffect(() => {
    dispatch({ type: 'UPDATE_TOTALS' });
  }, [state.items, state.appliedCoupon, state.appliedGiftCard]);

  // Note: Cart sync with backend is disabled since we're using localStorage-based cart management
  // If you need backend sync, implement the /cart/sync endpoint on the backend

  // Race condition protection
  const operationQueue = new Map();
  
  const addToCart = async (product, quantity = 1, variantId = null) => {
    const operationId = `${product._id || product.id}-${variantId || 'default'}`;
    
    // Check if operation is already in progress
    if (operationQueue.has(operationId)) {
      toast.error('Operation in progress, please wait...');
      return;
    }
    
    try {
      operationQueue.set(operationId, true);
      dispatch({ type: 'SET_UPDATING', payload: true });
      
      // Validate product data
      if (!product || !(product._id || product.id)) {
        throw new Error('Invalid product data');
      }
      
      const cartItem = {
        id: `${product._id || product.id}-${variantId || 'default'}`,
        productId: product._id || product.id,
        variantId,
        name: product.name,
        price: variantId ? product.variants.find(v => v.id === variantId)?.price : product.price,
        originalPrice: variantId ? product.variants.find(v => v.id === variantId)?.originalPrice : product.originalPrice,
        quantity: Math.max(1, quantity), // Ensure quantity is at least 1
        image: product.images?.[0],
        category: product.category,
        brand: product.brand,
        vendor: product.vendor?._id || product.vendor,
        sku: variantId ? product.variants.find(v => v.id === variantId)?.sku : product.sku,
        weight: variantId ? product.variants.find(v => v.id === variantId)?.weight : product.weight,
        dimensions: variantId ? product.variants.find(v => v.id === variantId)?.dimensions : product.dimensions,
        inStock: variantId ? product.variants.find(v => v.id === variantId)?.inStock : (product.stock > 0),
        maxQuantity: variantId ? product.variants.find(v => v.id === variantId)?.maxQuantity : product.stock
      };

      // Validate cart item
      if (!cartItem.price || cartItem.price <= 0) {
        throw new Error('Invalid product price');
      }

      dispatch({ type: 'ADD_ITEM', payload: cartItem });
      
      // Add to recently viewed
      dispatch({ type: 'ADD_TO_RECENTLY_VIEWED', payload: product });
      
      toast.success(`${product.name} added to cart`);
      
    } catch (error) {
      toast.error(error.message || 'Failed to add item to cart');
      console.error('Add to cart error:', error);
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
      operationQueue.delete(operationId);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }
      
      dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { itemId, quantity } });
      
      // Note: Backend sync is disabled. If needed, implement the /cart/update endpoint
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error('Update quantity error:', error);
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      
      // Note: Backend sync is disabled. If needed, implement the /cart/remove endpoint
      
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error('Remove from cart error:', error);
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      
      dispatch({ type: 'CLEAR_CART' });
      
      // Note: Backend sync is disabled. If needed, implement the /cart/clear endpoint
      
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
      console.error('Clear cart error:', error);
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  };

  const clearCartOnLogout = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cart');
  };

  const applyCoupon = async (couponCode) => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      
      const response = await api.post('/coupons/apply', { code: couponCode });
      const coupon = response.data;
      
      dispatch({ type: 'APPLY_COUPON', payload: coupon });
      toast.success(`Coupon "${couponCode}" applied successfully`);
      
      return { success: true, coupon };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
    toast.success('Coupon removed');
  };

  const applyGiftCard = async (giftCardCode) => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      
      const response = await api.post('/gift-cards/apply', { code: giftCardCode });
      const giftCard = response.data;
      
      dispatch({ type: 'APPLY_GIFT_CARD', payload: giftCard });
      toast.success(`Gift card applied successfully`);
      
      return { success: true, giftCard };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid gift card code';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  };

  const removeGiftCard = () => {
    dispatch({ type: 'REMOVE_GIFT_CARD' });
    toast.success('Gift card removed');
  };

  const saveForLater = (item) => {
    dispatch({ type: 'ADD_TO_SAVED_FOR_LATER', payload: item });
    dispatch({ type: 'REMOVE_ITEM', payload: item.id });
    toast.success('Item saved for later');
  };

  const moveToCart = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    dispatch({ type: 'REMOVE_FROM_SAVED_FOR_LATER', payload: item.id });
    toast.success('Item moved to cart');
  };

  const removeFromSavedForLater = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_SAVED_FOR_LATER', payload: itemId });
    toast.success('Item removed from saved for later');
  };

  const setShippingAddress = (address) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address });
  };

  const setBillingAddress = (address) => {
    dispatch({ type: 'SET_BILLING_ADDRESS', payload: address });
  };

  const setPaymentMethod = (method) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  };

  const calculateShipping = async (address) => {
    try {
      const response = await api.post('/cart/calculate-shipping', { address });
      const { shipping, estimatedDelivery } = response.data;
      
      dispatch({ type: 'SET_ESTIMATED_DELIVERY', payload: estimatedDelivery });
      return shipping;
    } catch (error) {
      console.error('Shipping calculation error:', error);
      return 10; // Default shipping cost
    }
  };

  const getRecommendations = async () => {
    try {
      const response = await api.get('/products/recommendations', {
        params: {
          cartItems: state.items.map(item => item.productId),
          recentlyViewed: state.recentlyViewed.map(item => item.id)
        }
      });
      
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: response.data });
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    }
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const setCartOpen = (isOpen) => {
    dispatch({ type: 'SET_CART_OPEN', payload: isOpen });
  };

  const getCartSummary = () => {
    return {
      totalItems: state.totalItems,
      subtotal: state.subtotal,
      tax: state.tax,
      shipping: state.shipping,
      discount: state.discount,
      total: state.total,
      appliedCoupon: state.appliedCoupon,
      appliedGiftCard: state.appliedGiftCard
    };
  };

  const isCartEmpty = () => {
    return state.items.length === 0;
  };

  const getItemCount = () => {
    return state.totalItems;
  };

  const value = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearCartOnLogout,
    applyCoupon,
    removeCoupon,
    applyGiftCard,
    removeGiftCard,
    saveForLater,
    moveToCart,
    removeFromSavedForLater,
    setShippingAddress,
    setBillingAddress,
    setPaymentMethod,
    calculateShipping,
    getRecommendations,
    toggleCart,
    setCartOpen,
    getCartSummary,
    isCartEmpty,
    getItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 