import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import ProductImageGallery from '../components/products/ProductImageGallery';
import ProductInfo from '../components/products/ProductInfo';
import ProductBreadcrumb from '../components/products/ProductBreadcrumb';
import ProductTabs from '../components/products/ProductTabs';
import ProductDescription from '../components/products/ProductDescription';
import ProductSpecifications from '../components/products/ProductSpecifications';
import ProductReviews from '../components/products/ProductReviews';
import ProductRelated from '../components/products/ProductRelated';
import ReviewFormModal from '../components/products/ReviewFormModal';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useErrorHandler } from '../hooks/useErrorHandler';
import SecurityUtils from '../utils/security';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const { addToCart } = useCart();

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
        
        // Abort any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();

        // Fetch product details
        const productResponse = await api.get(`/products/${id}`, {
          signal: abortControllerRef.current.signal
        });

        // Check if component is still mounted
        if (!isMounted) return;

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
        
        // Check if component is still mounted
        if (!isMounted) return;
        
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
        // Don't handle AbortError or CanceledError as they're expected
        if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          return;
        }
        
        // Only set error if component is still mounted
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

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return <ProductDescription product={product} />;
      case 'specifications':
        return <ProductSpecifications product={product} />;
      case 'reviews':
        return (
          <ProductReviews 
            product={product}
            reviews={reviews}
            onWriteReview={() => setShowReviewForm(true)}
          />
        );
      case 'related':
        return <ProductRelated relatedProducts={relatedProducts} />;
      default:
        return <ProductDescription product={product} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Breadcrumb */}
      <ProductBreadcrumb productName={product.name} />

      <div className="container mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
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

        {/* Product Tabs Section */}
        <div className="mt-16">
          <ProductTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Review Form Modal */}
        <ReviewFormModal
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          onSubmit={handleReviewSubmit}
        />
      </div>
    </div>
  );
};

export default ProductDetailsPage; 