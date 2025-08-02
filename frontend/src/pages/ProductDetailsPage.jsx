import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import ProductImageGallery from '../components/products/ProductImageGallery';
import ProductInfo from '../components/products/ProductInfo';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useErrorHandler } from '../hooks/useErrorHandler';
import SecurityUtils from '../utils/security';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();

  // State
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSort, setReviewSort] = useState('newest');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  // Refs for cleanup
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch product data with proper cleanup
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        abortControllerRef.current = new AbortController();

        // Fetch product details
        const productResponse = await api.get(`/products/${id}`, {
          signal: abortControllerRef.current.signal
        });

        // Sanitize product data
        const sanitizedProduct = {
          ...productResponse.data,
          name: SecurityUtils.sanitizeInput(productResponse.data.name, 'text'),
          description: SecurityUtils.sanitizeInput(productResponse.data.description, 'html'),
          shortDescription: SecurityUtils.sanitizeInput(productResponse.data.shortDescription, 'text')
        };

        setProduct(sanitizedProduct);
        
        // Fetch reviews
        const reviewsResponse = await api.get(`/reviews/product/${id}`, {
          signal: abortControllerRef.current.signal,
          params: {
            page: reviewPage,
            limit: 10,
            sortBy: reviewSort === 'newest' ? 'createdAt' : 'rating',
            sortOrder: reviewSort === 'newest' ? 'desc' : 'desc'
          }
        });
        
        // Sanitize review data
        const sanitizedReviews = reviewsResponse.data.reviews?.map(review => ({
          ...review,
          title: SecurityUtils.sanitizeInput(review.title, 'text'),
          comment: SecurityUtils.sanitizeInput(review.comment, 'html'),
          userName: SecurityUtils.sanitizeInput(review.userName, 'text')
        })) || [];
        
        setReviews(sanitizedReviews);
        
        // Fetch related products (simulated for now)
        setRelatedProducts([]);
        
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        
        console.error('Error fetching product data:', error);
        setError(error.message || 'Failed to load product');
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [id, reviewPage, reviewSort, handleError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Debounced quantity change handler
  const handleQuantityChange = useCallback((newQuantity) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setQuantity(Math.max(1, Math.min(newQuantity, product?.stock || 1)));
    }, 300);
  }, [product?.stock]);

  // Add to cart with error handling
  const handleAddToCart = useCallback(async () => {
    try {
      setAddingToCart(true);
      
      if (quantity < 1 || quantity > (product?.stock || 1)) {
        toast.error(t('cart.invalidQuantity'));
        return;
      }
      
      await api.post('/cart/add', { 
        productId: id, 
        quantity,
        variantId: selectedVariant?.id 
      });
      
      toast.success(t('cart.added'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || t('cart.error.add'));
      handleError(error);
    } finally {
      setAddingToCart(false);
    }
  }, [id, quantity, selectedVariant, product?.stock, t, handleError]);

  // Toggle wishlist
  const toggleWishlist = useCallback(async () => {
    try {
      await api.post('/wishlist/toggle', { productId: id });
      setIsInWishlist(!isInWishlist);
      toast.success(isInWishlist ? t('wishlist.removed') : t('wishlist.added'));
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(error.response?.data?.message || t('wishlist.error.toggle'));
      handleError(error);
    }
  }, [id, isInWishlist, t, handleError]);

  // Submit review
  const handleReviewSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      const validatedTitle = SecurityUtils.validateInput(reviewForm.title, {
        required: true,
        minLength: 3,
        maxLength: 100
      });
      
      const validatedComment = SecurityUtils.validateInput(reviewForm.comment, {
        required: true,
        minLength: 10,
        maxLength: 1000
      });
      
      if (!validatedTitle.isValid) {
        toast.error(validatedTitle.message || 'Invalid title');
        return;
      }
      
      if (!validatedComment.isValid) {
        toast.error(validatedComment.message || 'Invalid comment');
        return;
      }
      
      await api.post('/reviews', {
        productId: id,
        rating: reviewForm.rating,
        title: validatedTitle.value,
        comment: validatedComment.value
      });
      
      toast.success(t('products.details.reviewSubmitted'));
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || t('products.details.reviewError'));
      handleError(error);
    }
  }, [id, reviewForm, t, handleError]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('products.details.error.notFound')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || t('products.details.error.productNotFound')}
          </p>
          <Button onClick={() => navigate('/products')}>
            {t('products.details.backToProducts')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {t('common.home')}
                </button>
              </li>
              <li>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li>
                <button 
                  onClick={() => navigate('/products')}
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {t('products.title')}
                </button>
              </li>
              <li>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li className="text-gray-900 dark:text-white font-semibold truncate max-w-xs">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <ProductImageGallery 
            images={product.images} 
            productName={product.name} 
          />

          {/* Product Info */}
          <ProductInfo
            product={product}
            quantity={quantity}
            setQuantity={setQuantity}
            addingToCart={addingToCart}
            onAddToCart={handleAddToCart}
            onToggleWishlist={toggleWishlist}
            isInWishlist={isInWishlist}
          />
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-8">
                {[
                  { id: 'description', label: t('products.details.tabs.description') },
                  { id: 'specifications', label: t('products.details.tabs.specifications') },
                  { id: 'reviews', label: t('products.details.tabs.reviews') },
                  { id: 'related', label: t('products.details.tabs.related') }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-6 px-1 border-b-2 font-medium text-lg transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="prose max-w-none dark:prose-invert">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {t('products.details.description')}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                  
                  {product.shortDescription && (
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('products.details.shortDescription')}
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>
                  )}

                  {product.features && product.features.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {t('products.details.features')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === 'specifications' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    {t('products.details.specifications')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {key}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {value}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <XMarkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                          {t('products.details.noSpecifications')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('products.details.reviews')} ({product.totalReviews || 0})
                    </h3>
                    <Button onClick={() => setShowReviewForm(true)} size="lg">
                      {t('products.details.writeReview')}
                    </Button>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-8">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {review.user?.name || t('products.details.anonymous')}
                              </p>
                              <div className="flex items-center space-x-3 mt-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </div>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {review.title && (
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                              {review.title}
                            </h4>
                          )}
                          
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">💬</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                          {t('products.details.noReviews')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Related Products Tab */}
              {activeTab === 'related' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    {t('products.details.relatedProducts')}
                  </h3>
                  {relatedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {relatedProducts.map((relatedProduct) => (
                        <div key={relatedProduct._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                             onClick={() => navigate(`/products/${relatedProduct._id}`)}>
                          <img
                            src={relatedProduct.images?.[0]?.url || '/placeholder-product.svg'}
                            alt={relatedProduct.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {relatedProduct.name}
                          </h4>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ${relatedProduct.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🛍️</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {t('products.details.noRelatedProducts')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('products.details.writeReview')}
                </h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('products.details.reviewRating')}
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        {star <= reviewForm.rating ? (
                          <span className="text-yellow-400">★</span>
                        ) : (
                          <span className="text-gray-300">★</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('products.details.reviewTitle')}
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder={t('products.details.reviewTitlePlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('products.details.reviewComment')}
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder={t('products.details.reviewCommentPlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  />
                </div>
                
                <div className="flex space-x-4">
                  <Button type="submit" className="flex-1" size="lg">
                    {t('products.details.submitReview')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1"
                    size="lg"
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage; 