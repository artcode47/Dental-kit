import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { XMarkIcon, MinusIcon, PlusIcon, CheckIcon, ExclamationTriangleIcon, HeartIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import ecommerceService from '../services/ecommerceService';
import { toast } from 'react-hot-toast';
import { useErrorHandler } from '../hooks/useErrorHandler';
import SecurityUtils from '../utils/security';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Seo from '../components/seo/Seo';
import { getAllImageUrls, getImageAlt } from '../utils/imageUtils';

// Inline, mobile-first components for this page only
const BreadcrumbInline = ({ productName, onBack }) => (
  <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 overflow-x-auto" aria-label="Breadcrumb">
    <button onClick={onBack} className="shrink-0 hover:underline">←</button>
    <span className="shrink-0 hover:underline" onClick={onBack}>Home</span>
    <span className="shrink-0">/</span>
    <span className="shrink-0 hover:underline" onClick={onBack}>Products</span>
    <span className="shrink-0">/</span>
    <span className="truncate max-w-[60vw] sm:max-w-[40vw]" title={productName}>{productName}</span>
  </nav>
);

const GalleryInline = ({ images, productName, onOpen }) => {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400 text-sm">No image available</span>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="aspect-square bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <img src={images[0]?.url} alt={images[0]?.alt || productName} className="w-full h-full object-contain" onClick={onOpen} />
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
          {images.map((img, idx) => (
            <div key={idx} className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
              <img src={img.url} alt={img.alt || productName} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const InfoInline = ({ product, quantity, setQuantity, addingToCart, onAddToCart, onToggleWishlist, isInWishlist, t, currentLanguage }) => {
  const locale = currentLanguage === 'ar' ? 'ar-EG' : 'en-US';
  const currency = product?.currency || 'USD';
  const formatPrice = (price) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);
  return (
    <div className="space-y-4">
      <div className="text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">{currentLanguage === 'ar' && product.nameAr ? product.nameAr : product.name}</h1>
        {product.brand && (
          <div className="inline-flex items-center bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1.5 mt-2">
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('products.details.brand')}: <span className="font-semibold">{product.brand}</span></span>
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          {product.sku && (
            <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2.5 py-1 border border-gray-200 dark:border-gray-600">{t('products.details.sku')}: {product.sku}</span>
          )}
          {product.categoryName && (
            <span className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full px-2.5 py-1 border border-blue-200 dark:border-blue-700">{t('products.details.category')}: {product.categoryName}</span>
          )}
          {product.vendorName && (
            <span className="inline-flex items-center bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full px-2.5 py-1 border border-purple-200 dark:border-purple-700">{t('products.details.vendor')}: {product.vendorName}</span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center md:justify-start gap-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <StarIconSolid key={i} className={`h-4 w-4 ${i < Math.floor(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
          ))}
        </div>
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('products.details.reviews', { count: product.totalReviews || 0 })}</span>
      </div>
      <div className="space-y-2 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3">
          <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-base sm:text-lg text-gray-500 dark:text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        {product.isOnSale && product.originalPrice && (
          <div className="inline-flex items-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-full px-3 py-1.5">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-xs sm:text-sm text-red-600 dark:text-red-400">{t('products.details.saveAmount', { amount: formatPrice(product.originalPrice - product.price) })}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center md:justify-start">
        {product.stock > 0 ? (
          <div className="flex items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-full px-4 py-2">
            <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="font-semibold text-green-700 dark:text-green-300">{t('products.details.inStock')} ({t('products.details.availableCount', { count: product.stock })})</span>
          </div>
        ) : (
          <div className="flex items-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-full px-4 py-2">
            <XMarkIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="font-semibold text-red-700 dark:text-red-300">{t('products.details.outOfStock')}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center md:justify-start gap-3">
        <label className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{t('products.details.quantity')}:</label>
        <div className="flex items-center border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="px-4 py-3 text-gray-600 dark:text-gray-300 disabled:opacity-50"><MinusIcon className="h-5 w-5" /></button>
          <span className="px-5 py-3 bg-white dark:bg-gray-800 text-lg font-bold text-gray-900 dark:text-white select-none">{quantity}</span>
          <button onClick={() => setQuantity(Math.min(quantity + 1, product.stock))} disabled={quantity >= product.stock} className="px-4 py-3 text-gray-600 dark:text-gray-300 disabled:opacity-50"><PlusIcon className="h-5 w-5" /></button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onAddToCart} disabled={product.stock === 0 || addingToCart} className="flex-1" size="lg">
          {addingToCart ? <LoadingSpinner size="sm" /> : (<span className="flex items-center justify-center"><ShoppingCartIcon className="h-5 w-5 mr-2" />{t('products.details.addToCart')}</span>)}
        </Button>
        <button onClick={onToggleWishlist} className={`p-3 rounded-xl border-2 ${isInWishlist ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
          {isInWishlist ? <HeartIconSolid className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
        </button>
      </div>
      {Array.isArray(product.features) && product.features.length > 0 && (
        <div className="pt-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{t('products.details.features')}</h3>
          <div className="flex flex-wrap gap-2">
            {product.features.map((feature, idx) => (
              <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs sm:text-sm border border-gray-200 dark:border-gray-600">
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
      {product.description && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('products.details.description')}</h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{product.description}</p>
        </div>
      )}
    </div>
  );
};

const TabsInline = ({ activeTab, setActiveTab, t }) => {
  const tabs = [
    { id: 'description', label: t('products.details.tabs.description') },
    { id: 'specifications', label: t('products.details.tabs.specifications') },
    { id: 'reviews', label: t('products.details.tabs.reviews') }
  ];
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex gap-2 px-2 sm:px-4 overflow-x-auto -mx-2 sm:-mx-4">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-3 px-3 sm:px-5 border-b-2 text-sm sm:text-base whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>{tab.label}</button>
        ))}
      </nav>
    </div>
  );
};

const ReviewModalInline = ({ isOpen, onClose, reviewForm, setReviewForm, onSubmit, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('products.details.writeReview')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('products.details.reviewRating')}</label>
            <div className="flex space-x-2">
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="text-2xl sm:text-3xl transition-transform hover:scale-110">{star <= reviewForm.rating ? <span className="text-yellow-400">★</span> : <span className="text-gray-300">★</span>}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('products.details.reviewTitle')}</label>
            <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder={t('products.details.reviewTitlePlaceholder')} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('products.details.reviewComment')}</label>
            <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder={t('products.details.reviewCommentPlaceholder')} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="4" required />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="flex-1" size="lg">{t('products.details.submitReview')}</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" size="lg">{t('common.cancel')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('ecommerce');
  const { handleError } = useErrorHandler();
  const { addToCart } = useCart();
  const { currentLanguage } = useLanguage();
  const { currentTheme } = useTheme();

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
    let isMounted = true;
    
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();

        const productData = await ecommerceService.getProductById(id, {
          signal: abortControllerRef.current.signal
        });

        if (!isMounted) return;

        const sanitizedProduct = {
          ...productData,
          name: SecurityUtils.sanitizeInput(productData.name, 'text'),
          nameAr: SecurityUtils.sanitizeInput(productData.nameAr || '', 'text'),
          description: SecurityUtils.sanitizeInput(productData.description, 'html'),
          shortDescription: SecurityUtils.sanitizeInput(productData.shortDescription || '', 'text'),
          // Map API fields to component expected fields
          averageRating: productData.rating || 0,
          totalReviews: productData.reviewCount || 0,
          inStock: productData.stock > 0,
          isOnSale: productData.originalPrice && productData.originalPrice > productData.price,
          isNew: false, // Add logic if needed
          isFeatured: productData.isFeatured || false,
          // Process images using the utility function
          images: getAllImageUrls(productData.images).map((url, index) => ({
            url,
            alt: getImageAlt(productData.images?.[index], `${productData.name} - Image ${index + 1}`)
          }))
        };

        setProduct(sanitizedProduct);
        // Check wishlist status for this product (ignore errors silently)
        try {
          const wl = await api.get(`/wishlist/check/${id}`, {
            signal: abortControllerRef.current.signal
          });
          if (isMounted && typeof wl.data?.isInWishlist === 'boolean') {
            setIsInWishlist(wl.data.isInWishlist);
          }
        } catch (_) {
          // no-op if unauthenticated or endpoint not available
        }
        
        const reviewsResponse = await api.get(`/reviews/product/${id}`, {
          signal: abortControllerRef.current.signal,
          params: {
            page: reviewPage,
            limit: 10,
            sortBy: reviewSort === 'newest' ? 'createdAt' : 'rating',
            sortOrder: reviewSort === 'newest' ? 'desc' : 'desc'
          }
        });
        
        if (!isMounted) return;
        
        const sanitizedReviews = reviewsResponse.data.reviews?.map(review => ({
          ...review,
          title: SecurityUtils.sanitizeInput(review.title, 'text'),
          comment: SecurityUtils.sanitizeInput(review.comment, 'html'),
          userName: SecurityUtils.sanitizeInput(review.userName, 'text')
        })) || [];
        
        setReviews(sanitizedReviews);
        setRelatedProducts([]);
        
      } catch (error) {
        if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          return;
        }
        if (isMounted) {
          console.error('Error fetching product data:', error);
          setError(error.message || 'Failed to load product');
          handleError(error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProductData();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [id, reviewPage, reviewSort]);

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

  const handleQuantityChange = useCallback((newQuantity) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setQuantity(Math.max(1, Math.min(newQuantity, product?.stock || 1)));
    }, 300);
  }, [product?.stock]);

  const handleAddToCart = useCallback(async () => {
    try {
      setAddingToCart(true);
      
      if (quantity < 1 || quantity > (product?.stock || 1)) {
        toast.error(t('cart.invalidQuantity'));
        return;
      }
      
      if (product) {
        await addToCart(product, quantity, selectedVariant?.id);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('cart.error.add'));
    } finally {
      setAddingToCart(false);
    }
  }, [product, quantity, selectedVariant, addToCart, t]);

  const toggleWishlist = useCallback(async () => {
    try {
      const response = await api.post('/wishlist/toggle', { productId: id });
      setIsInWishlist(response.data.inWishlist);
      toast.success(response.data.action === 'added' ? t('wishlist.added') : t('wishlist.removed'));
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(error.response?.data?.message || t('wishlist.error.toggle'));
      handleError(error);
    }
  }, [id, t, handleError]);

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

  const displayName = currentLanguage === 'ar' && product.nameAr ? product.nameAr : product.name;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
        );
      case 'specifications':
        return (
          <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            {product.specifications && Object.keys(product.specifications).length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                    <span className="font-medium capitalize text-gray-600 dark:text-gray-300">{key}</span>
                    <span className="text-gray-900 dark:text-white">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              t('products.details.noSpecifications')
            )}
          </div>
        );
      case 'reviews':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{t('products.details.reviews', { count: product.totalReviews || 0 })}</h3>
              <Button onClick={() => setShowReviewForm(true)} size="lg">{t('products.details.writeReview')}</Button>
            </div>
            <div className="space-y-4">
              {reviews.length ? reviews.map((review) => (
                <div key={review._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{review.user?.name || t('products.details.anonymous')}</div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.title && <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">{review.title}</div>}
                  <div className="text-sm text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: review.comment }} />
                </div>
              )) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">{t('products.details.noReviews')}</div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Seo
        title={displayName}
        description={product?.shortDescription || product?.description}
        image={product?.images?.[0]?.url}
        type="product"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={currentTheme === 'dark' ? '#0B1220' : '#FFFFFF'}
      />

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <BreadcrumbInline productName={displayName} onBack={() => navigate('/products')} />
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Gallery */}
          <section className="min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
              <GalleryInline images={product.images} productName={displayName} onOpen={() => setShowReviewForm(false)} />
            </div>
          </section>

          {/* Info */}
          <section className="min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
              <InfoInline
                product={product}
                quantity={quantity}
                setQuantity={setQuantity}
                addingToCart={addingToCart}
                onAddToCart={handleAddToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist}
                t={t}
                currentLanguage={currentLanguage}
              />
            </div>
          </section>
        </div>

        {/* Tabs */}
        <section className="mt-6 sm:mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <TabsInline activeTab={activeTab} setActiveTab={setActiveTab} t={t} />
            <div className="p-3 sm:p-4 md:p-6">
              {renderTabContent()}
            </div>
          </div>
        </section>

        {/* Review Modal */}
        <ReviewModalInline
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          onSubmit={handleReviewSubmit}
          t={t}
        />
      </div>
    </div>
  );
};

export default ProductDetailsPage; 