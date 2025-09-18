import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Seo from '../components/seo/Seo';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/animations/AnimatedSection';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  ShoppingCartIcon,
  XMarkIcon,
  StarIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  ChevronDownIcon,
  CubeIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useCart } from '../contexts/CartContext';
import ecommerceService from '../services/ecommerceService';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

const getImageUrl = (img) => (typeof img === 'string' ? img : (img && img.url) || '/placeholder-product.jpg');

const ProductsPage = () => {
  const { t } = useTranslation('ecommerce');
  const { t: tSeo } = useTranslation('ecommerce');
  const { addToCart } = useCart();
  const { currentLanguage } = useLanguage();
  const { isDark } = useTheme();
  
  // State for products and data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');
  // Rating filter state (unused for now but kept for future implementation)
  const [ratingFilter, setRatingFilter] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // State for UI
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);


  // Memoized filter parameters to prevent unnecessary re-renders
  const filterParams = useMemo(() => ({
    page: currentPage,
    limit: 12,
    search: searchTerm || undefined,
    category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
    brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
    minPrice: priceRange.min || undefined,
    maxPrice: priceRange.max || undefined,
    inStock: availability === 'inStock' ? true : availability === 'outOfStock' ? false : undefined,
    sortBy: sortBy !== 'popularity' ? sortBy.split('-')[0] : undefined,
    sortOrder: sortBy !== 'popularity' ? sortBy.split('-')[1] : undefined
  }), [currentPage, searchTerm, selectedCategories, selectedBrands, priceRange, availability, sortBy]);

  // Fetch products with filters using e-commerce service
  const fetchProducts = useCallback(async (forceRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (isLoading && !forceRefresh) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Clean up filter params (remove undefined values)
      const cleanParams = Object.fromEntries(
        Object.entries(filterParams).filter(([_, value]) => value !== undefined)
      );

      const result = await ecommerceService.getProducts({
        ...cleanParams,
        forceRefresh
      });
      
      // Only update state if we got valid data
      if (result && (result.products || result.total !== undefined)) {
        setProducts(result.products || []);
        setTotalProducts(result.total || 0);
        setTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError(error.message);
      toast.error(t('products.error.fetch'));
    } finally {
      setIsLoading(false);
    }
  }, [filterParams, t, isLoading]);

  // Fetch categories and brands on mount (only once)
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      try {
        // Only load if we don't have data yet
        if (categories.length > 0 && brands.length > 0) {
          return;
        }

        const [categoriesResult, brandsResult] = await Promise.allSettled([
          ecommerceService.getCategories(),
          ecommerceService.getVendors() // Using vendors as brands for now
        ]);

        if (isMounted) {
          if (categoriesResult.status === 'fulfilled') {
            const categoriesData = categoriesResult.value.categories || [];
            setCategories(categoriesData);
          }

          if (brandsResult.status === 'fulfilled') {
            const brandsData = brandsResult.value.vendors || [];
            setBrands(brandsData);
          }
          
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once

  // Fetch products when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filterParams]); // Only depend on filterParams

  // Separate effect for initial products load (only once)
  useEffect(() => {
    if (initialLoadComplete && products.length === 0) {
      fetchProducts(true); // Force refresh for initial load
    }
  }, [initialLoadComplete]); // Only depend on initialLoadComplete

  // Remove preload - let the specific data loading handle it

  // Handle search with debouncing (memoized)
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Handle category selection
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setCurrentPage(1);
  }, []);

  // Handle brand selection
  const handleBrandChange = useCallback((brandId) => {
    setSelectedBrands(prev => {
      if (prev.includes(brandId)) {
        return prev.filter(id => id !== brandId);
      } else {
        return [...prev, brandId];
      }
    });
    setCurrentPage(1);
  }, []);

  // Handle price range change
  const handlePriceRangeChange = useCallback((field, value) => {
    setPriceRange(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  }, []);

  // Handle availability change
  const handleAvailabilityChange = useCallback((value) => {
    setAvailability(value);
    setCurrentPage(1);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle add to cart
  const handleAddToCart = useCallback(async (product, quantity = 1) => {
    if (addingToCart === product.id) return;

    try {
      setAddingToCart(product.id);
      await addToCart(product, quantity);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  }, [addToCart, addingToCart]);

  // Handle add to wishlist
  const handleToggleWishlist = useCallback(async (productId) => {
    try {
      setWishlistItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(productId)) {
          newSet.delete(productId);
          ecommerceService.removeFromWishlist(productId);
        } else {
          newSet.add(productId);
          ecommerceService.addToWishlist(productId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('❌ Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: '', max: '' });
    setAvailability('all');
    setSortBy('popularity');
    setCurrentPage(1);
  }, []);

  // Get search suggestions
  const getSearchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setShowSearchSuggestions(false);
      return;
    }

    try {
      const result = await ecommerceService.getSearchSuggestions(query);
      setSearchHistory(result.suggestions || []);
      setShowSearchSuggestions(true);
    } catch (error) {
      console.error('❌ Error getting search suggestions:', error);
    }
  }, []);

  // Format price (memoized)
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }, []);

  // Get discount percentage (memoized)
  const getDiscountPercentage = useCallback((product) => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, []);

  // Loading state
  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to load products
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => fetchProducts(true)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Seo
        title={tSeo('seo.products.title', 'Products')}
        description={tSeo('seo.products.description', 'Browse our premium dental products')}
        type="website"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={isDark ? '#0B1220' : '#FFFFFF'}
      />
      
      {/* Header Section */}
      <AnimatedSection animation="fadeInDown" delay={0}>
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-gray-700/50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('products.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {totalProducts} {t('products.available')}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-96">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <Input
                    type="text"
                    placeholder={t('products.search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => getSearchSuggestions(searchTerm)}
                    className="pl-10 pr-4 w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>

                {/* Search Suggestions */}
                {showSearchSuggestions && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-blue-200 dark:border-blue-800 rounded-xl shadow-xl z-10 mt-1">
                    {searchHistory.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleSearch(suggestion);
                          setShowSearchSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <AnimatedSection animation="fadeInLeft" delay={100} className="lg:col-span-1">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FunnelIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  {t('products.filters.title')}
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
                >
                  {t('products.filters.clear')}
                </button>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                  {t('products.filters.categories')}
                </h4>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {currentLanguage === 'ar' && category.nameAr ? category.nameAr : category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                  {t('products.filters.brands')}
                </h4>
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => handleBrandChange(brand.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {currentLanguage === 'ar' && brand.nameAr ? brand.nameAr : brand.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                  {t('products.filters.priceRange')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                    className="text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                    className="text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Availability Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                  {t('products.filters.availability')}
                </h4>
                <select
                  value={availability}
                  onChange={(e) => handleAvailabilityChange(e.target.value)}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('products.filters.all')}</option>
                  <option value="inStock">{t('products.filters.inStock')}</option>
                  <option value="outOfStock">{t('products.filters.outOfStock')}</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                  {t('products.filters.sortBy')}
                </h4>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="popularity">{t('products.filters.popularity')}</option>
                  <option value="price-asc">{t('products.filters.priceLowToHigh')}</option>
                  <option value="price-desc">{t('products.filters.priceHighToLow')}</option>
                  <option value="createdAt-desc">{t('products.filters.newest')}</option>
                  <option value="rating-desc">{t('products.filters.rating')}</option>
                </select>
              </div>
            </div>
          </AnimatedSection>

          {/* Products Grid */}
          <AnimatedSection animation="fadeInRight" delay={200} className="lg:col-span-3">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-lg'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <ViewColumnsIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-lg'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                {t('products.showing', { 
                  from: (currentPage - 1) * 12 + 1, 
                  to: Math.min(currentPage * 12, totalProducts), 
                  total: totalProducts 
                })}
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl mb-4"></div>
                    <div className="space-y-3">
                      <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded-lg"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded-lg w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <AnimatedSection key={product.id} animation="fadeInUp" delay={index * 100}>
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onToggleWishlist={handleToggleWishlist}
                          addingToCart={addingToCart === product.id}
                          isInWishlist={wishlistItems.has(product.id)}
                          formatPrice={formatPrice}
                          getDiscountPercentage={getDiscountPercentage}
                          currentLanguage={currentLanguage}
                        />
                      </AnimatedSection>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product, index) => (
                      <AnimatedSection key={product.id} animation="fadeInUp" delay={index * 50}>
                        <ProductListItem
                          product={product}
                          onAddToCart={handleAddToCart}
                          onToggleWishlist={handleToggleWishlist}
                          addingToCart={addingToCart === product.id}
                          isInWishlist={wishlistItems.has(product.id)}
                          formatPrice={formatPrice}
                          getDiscountPercentage={getDiscountPercentage}
                          currentLanguage={currentLanguage}
                        />
                      </AnimatedSection>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <AnimatedSection animation="fadeInUp" delay={300} className="mt-12">
                    <div className="flex items-center justify-center">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 text-sm font-medium text-gray-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {t('pagination.previous')}
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          const isCurrentPage = page === currentPage;
                          
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                                isCurrentPage
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                  : 'text-gray-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 text-sm font-medium text-gray-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {t('pagination.next')}
                        </button>
                      </nav>
                    </div>
                  </AnimatedSection>
                )}
              </>
            )}
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  addingToCart, 
  isInWishlist,
  formatPrice,
  getDiscountPercentage,
  currentLanguage
}) => {
  const { t } = useTranslation('ecommerce');
  const navigate = useNavigate();
  const displayName = currentLanguage === 'ar' && product.nameAr ? product.nameAr : product.name;
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.images?.[0]];
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    if (hovered) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, [images, hovered]);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div 
      className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <img
          src={getImageUrl(images[index] || images[0])}
          alt={displayName}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={handleImageClick}
        />
        
        {/* Product Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.isOnSale && getDiscountPercentage(product) > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              -{getDiscountPercentage(product)}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              NEW
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              FEATURED
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
        >
          {isInWishlist ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-lg">
          {displayName}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIconSolid
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.averageRating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            ({product.totalReviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCartClick}
          disabled={addingToCart || !product.inStock}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          loading={addingToCart}
        >
          {addingToCart ? (
            <LoadingSpinner size="sm" />
          ) : !product.inStock ? (
            t('products.outOfStock')
          ) : (
            <>
              <ShoppingCartIcon className="h-4 w-4 mr-2" />
              {t('products.addToCart')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Product List Item Component
const ProductListItem = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  addingToCart, 
  isInWishlist,
  formatPrice,
  getDiscountPercentage,
  currentLanguage
}) => {
  const { t } = useTranslation('ecommerce');
  const navigate = useNavigate();
  const displayName = currentLanguage === 'ar' && product.nameAr ? product.nameAr : product.name;
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.images?.[0]];
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    if (hovered) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, [images, hovered]);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div 
      className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex space-x-6">
        {/* Product Image */}
        <div className="relative flex-shrink-0" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <img
            src={getImageUrl(images[index] || images[0])}
            alt={displayName}
            className="w-32 h-32 object-cover rounded-xl cursor-pointer"
            onClick={handleImageClick}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute -top-2 -right-2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
          >
            {isInWishlist ? (
              <HeartIconSolid className="h-4 w-4 text-red-500" />
            ) : (
              <HeartIcon className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" />
            )}
          </button>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-xl">
            {displayName}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIconSolid
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.averageRating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({product.totalReviews || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCartClick}
            disabled={addingToCart || !product.inStock}
            size="lg"
            loading={addingToCart}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          >
            {addingToCart ? (
              <LoadingSpinner size="sm" />
            ) : !product.inStock ? (
              t('products.outOfStock')
            ) : (
              <>
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                {t('products.addToCart')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
