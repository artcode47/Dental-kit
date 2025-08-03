import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  HeartIcon, 
  HeartIcon as HeartIconSolid,
  StarIcon,
  ShoppingCartIcon,
  CheckIcon,
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  FireIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProductInfo = ({ 
  product, 
  quantity, 
  setQuantity, 
  addingToCart, 
  onAddToCart, 
  onToggleWishlist,
  isInWishlist 
}) => {
  const { t } = useTranslation();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (!product?.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Product Title and Brand */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {product.name}
        </h1>
        {product.brand && (
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Brand: {product.brand}
          </p>
        )}
      </div>

      {/* Product Badges */}
      <div className="flex flex-wrap gap-2">
        {product.isOnSale && getDiscountPercentage() > 0 && (
          <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center">
            <TagIcon className="h-4 w-4 mr-1" />
            {getDiscountPercentage()}% OFF
          </div>
        )}
        {product.isNew && (
          <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center">
            <SparklesIcon className="h-4 w-4 mr-1" />
            NEW
          </div>
        )}
        {product.isFeatured && (
          <div className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center">
            <FireIcon className="h-4 w-4 mr-1" />
            FEATURED
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <StarIconSolid
              key={i}
              className={`h-5 w-5 ${
                i < Math.floor(product.averageRating || 0)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-gray-600 dark:text-gray-300">
          ({product.totalReviews || 0} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center space-x-4">
          <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-lg sm:text-xl text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        {product.isOnSale && (
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <p className="text-lg text-red-600 dark:text-red-400 font-medium">
              Save {formatPrice(product.originalPrice - product.price)}!
            </p>
          </div>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center space-x-2">
        {product.stock > 0 ? (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <CheckIcon className="h-5 w-5" />
            <span className="font-medium">In Stock ({product.stock} available)</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <XMarkIcon className="h-5 w-5" />
            <span className="font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Variants
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant, index) => (
              <button
                key={index}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center space-x-4">
        <label className="font-medium text-gray-700 dark:text-gray-300">
          Quantity:
        </label>
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-lg font-semibold">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(quantity + 1, product.stock))}
            disabled={quantity >= product.stock}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <Button
          onClick={onAddToCart}
          disabled={product.stock === 0 || addingToCart}
          className="flex-1 flex items-center justify-center py-3"
          size="lg"
        >
          {addingToCart ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
        
        <button
          onClick={onToggleWishlist}
          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
            isInWishlist
              ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-600 dark:border-gray-600 dark:text-gray-400'
          }`}
        >
          {isInWishlist ? (
            <HeartIconSolid className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Description
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductInfo; 