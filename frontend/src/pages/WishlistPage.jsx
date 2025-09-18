import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  EyeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';

const WishlistPage = () => {
  const { t } = useTranslation('ecommerce');
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [removingFromWishlist, setRemovingFromWishlist] = useState(null);

  // Fetch wishlist items
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/wishlist');
      setWishlistItems(response.data.items || []);
    } catch (err) {
      setError(err.message || t('wishlist.error.fetch'));
      toast.error(t('wishlist.error.fetch'));
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const handleAddToCart = async (product) => {
    try {
      setAddingToCart(product._id);
      await addToCart(product, 1);
      toast.success(t('cart.added'));
    } catch (err) {
      toast.error(t('cart.error.add'));
    } finally {
      setAddingToCart(null);
    }
  };

  // Remove item from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    try {
      setRemovingFromWishlist(productId);
      const response = await api.post('/wishlist/toggle', { productId });
      
      // Update wishlist items from the API response
      setWishlistItems(response.data.wishlist.items || []);
      toast.success(t('wishlist.removed'));
    } catch (err) {
      toast.error(t('wishlist.error.remove'));
    } finally {
      setRemovingFromWishlist(null);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Get discount percentage
  const getDiscountPercentage = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <HeartIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('wishlist.error.title')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchWishlist}>
            {t('wishlist.error.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>{t('common.back')}</span>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <HeartIconSolid className="h-8 w-8 text-red-500" />
                  <span>{t('wishlist.title')}</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {wishlistItems.length} {t('wishlist.items')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('wishlist.empty')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {t('wishlist.emptyMessage')}
            </p>
            <Button onClick={() => navigate('/products')}>
              {t('wishlist.startShopping')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              const discountPercentage = getDiscountPercentage(product.originalPrice, product.price);
              
              return (
                <div key={item._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || '/placeholder-product.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {t('products.badges.sale', { percentage: discountPercentage })}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        disabled={removingFromWishlist === product._id}
                        className="bg-white/90 dark:bg-gray-800/90 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {product.originalPrice && product.originalPrice > product.price ? (
                          <>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      
                      <span className={`text-sm font-medium ${
                        product.stock > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {product.stock > 0 ? t('products.card.inStock') : t('products.card.outOfStock')}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart === product._id || product.stock <= 0}
                        className="flex-1"
                        size="sm"
                      >
                        <ShoppingCartIcon className="h-4 w-4 mr-2" />
                        {addingToCart === product._id ? t('common.adding') : t('products.card.addToCart')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage; 