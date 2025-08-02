import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  ShoppingCartIcon,
  BellIcon,
  UserIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  ChevronDownIcon,
  XMarkIcon,
  StarIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const ProductsPage = () => {
  const { t } = useTranslation();
  
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

  // State for UI
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(null);

  // Fetch products with filters
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategories.length > 0) params.append('category', selectedCategories.join(','));
      if (selectedBrands.length > 0) params.append('brand', selectedBrands.join(','));
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (availability !== 'all') params.append('isActive', availability === 'inStock' ? 'true' : 'false');
      if (sortBy !== 'popularity') {
        const [field, order] = sortBy.split('-');
        params.append('sortBy', field);
        params.append('sortOrder', order);
      }

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError(error.message);
      toast.error(t('products.error.fetch'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories and brands
  const fetchFilters = async () => {
    try {
      const [categoriesResponse, brandsResponse] = await Promise.all([
        api.get('/categories'),
        api.get('/products/brands')
      ]);
      
      // Ensure categories is always an array
      const categoriesData = Array.isArray(categoriesResponse.data) 
        ? categoriesResponse.data 
        : categoriesResponse.data?.categories || categoriesResponse.data?.data || [];
      
      // Ensure brands is always an array
      const brandsData = Array.isArray(brandsResponse.data) 
        ? brandsResponse.data 
        : brandsResponse.data?.brands || brandsResponse.data?.data || [];
      
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching filters:', error);
      // Set empty arrays as fallback
      setCategories([]);
      setBrands([]);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchProducts();
    fetchFilters();
  }, [currentPage, searchTerm, selectedCategories, selectedBrands, priceRange, availability, sortBy]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        setCurrentPage(1);
        break;
      case 'category':
        setSelectedCategories(prev => 
          prev.includes(value) 
            ? prev.filter(cat => cat !== value)
            : [...prev, value]
        );
        setCurrentPage(1);
        break;
      case 'brand':
        setSelectedBrands(prev => 
          prev.includes(value) 
            ? prev.filter(brand => brand !== value)
            : [...prev, value]
        );
        setCurrentPage(1);
        break;
      case 'priceMin':
        setPriceRange(prev => ({ ...prev, min: value }));
        setCurrentPage(1);
        break;
      case 'priceMax':
        setPriceRange(prev => ({ ...prev, max: value }));
        setCurrentPage(1);
        break;
      case 'availability':
        setAvailability(value);
        setCurrentPage(1);
        break;
      case 'rating':
        // This case is no longer used, but keeping it for now
        break;
      case 'sortBy':
        setSortBy(value);
        setCurrentPage(1);
        break;
      case 'page':
        setCurrentPage(value);
        break;
      default:
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: '', max: '' });
    setAvailability('all');
    setSortBy('popularity'); // Reset sortBy to default
    setCurrentPage(1);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // Toggle wishlist
  const toggleWishlist = async (productId) => {
    try {
      await api.post('/wishlist/toggle', { productId });
      setWishlistItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(productId)) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });
      toast.success(t('wishlist.toggled'));
    } catch {
      toast.error(t('wishlist.error.toggle'));
    }
  };

  // Add to cart
  const handleAddToCart = async (productId) => {
    try {
      setAddingToCart(productId);
      await api.post('/cart/add', { productId, quantity: 1 });
      toast.success(t('cart.added'));
    } catch {
      toast.error(t('cart.error.add'));
    } finally {
      setAddingToCart(null);
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

  // Filter section component
  const FilterSection = ({ title, children }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        className="flex items-center justify-between w-full py-4 text-left text-sm font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
      >
        {title}
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      <div className="pb-4">
        {children}
      </div>
    </div>
  );

  // Filter checkbox component
  const FilterCheckbox = ({ label, checked, onChange, count, icon: Icon }) => (
    <label className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
      />
      <div className="flex items-center space-x-2 flex-1">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400">({count})</span>
      )}
    </label>
  );

  // Product card component
  const ProductCard = ({ product }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images?.[0]?.url || '/placeholder-product.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Product Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.isOnSale && getDiscountPercentage(product.originalPrice, product.price) > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {getDiscountPercentage(product.originalPrice, product.price)}% OFF
            </div>
          )}
          {product.isNew && (
            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              NEW
            </div>
          )}
          {product.isFeatured && (
            <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              FEATURED
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => toggleWishlist(product._id)}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              wishlistItems.has(product._id)
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-gray-600 hover:text-red-500'
            }`}
          >
            {wishlistItems.has(product._id) ? (
              <HeartIconSolid className="h-4 w-4" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
          </button>
          
          <button
            onClick={() => handleAddToCart(product._id)}
            disabled={addingToCart === product._id}
            className="p-2 bg-white text-gray-600 hover:text-teal-600 rounded-full shadow-lg transition-colors disabled:opacity-50"
          >
            {addingToCart === product._id ? (
              <LoadingSpinner size="sm" />
            ) : (
              <ShoppingCartIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {product.brand}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
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
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({product.totalReviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            product.stock > 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          
          <Link
            to={`/products/${product._id}`}
            className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error loading products</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchProducts}>
            {t('products.error.retry')}
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
              <SparklesIcon className="w-4 h-4 mr-2" />
              {t('products.premiumBadge')}
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              {t('products.title')}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              {t('products.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('products.search.placeholder')}
                  className="pl-12 pr-4 py-4 w-full text-lg bg-white/50 dark:bg-gray-700/50 border-0 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-gray-700"
                />
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="lg:hidden bg-white/50 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/20 hover:bg-white dark:hover:bg-gray-700"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                {t('products.filters.title')}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/50 dark:bg-gray-700/50 rounded-xl p-1 border border-white/20 dark:border-gray-600/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ViewColumnsIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="popularity">{t('products.sort.popularity')}</option>
                  <option value="price-asc">{t('products.sort.priceLowToHigh')}</option>
                  <option value="price-desc">{t('products.sort.priceHighToLow')}</option>
                  <option value="name-asc">{t('products.sort.nameAZ')}</option>
                  <option value="name-desc">{t('products.sort.nameZA')}</option>
                  <option value="createdAt-desc">{t('products.sort.newest')}</option>
                  <option value="createdAt-asc">{t('products.sort.oldest')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('products.filters.title')}
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                >
                  {t('products.filters.clear')}
                </button>
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <FilterSection title={t('products.filters.categories')}>
                  <div className="space-y-2">
                    {Array.isArray(categories) && categories.map((category) => (
                      <FilterCheckbox
                        key={category._id}
                        label={category.name}
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleFilterChange('category', category._id)}
                        count={category.productCount}
                        icon={TagIcon}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Brands */}
                <FilterSection title={t('products.filters.brands')}>
                  <div className="space-y-2">
                    {Array.isArray(brands) && brands.map((brand) => (
                      <FilterCheckbox
                        key={brand}
                        label={brand}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleFilterChange('brand', brand)}
                        icon={FireIcon}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection title={t('products.filters.priceRange')}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('products.filters.minPrice')}
                      </label>
                      <Input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                        placeholder="0"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('products.filters.maxPrice')}
                      </label>
                      <Input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                        placeholder="1000"
                        className="w-full"
                      />
                    </div>
                  </div>
                </FilterSection>

                {/* Availability */}
                <FilterSection title={t('products.filters.availability')}>
                  <div className="space-y-2">
                    <FilterCheckbox
                      label={t('products.filters.inStock')}
                      checked={availability === 'inStock'}
                      onChange={() => handleFilterChange('availability', 'inStock')}
                    />
                    <FilterCheckbox
                      label={t('products.filters.outOfStock')}
                      checked={availability === 'outOfStock'}
                      onChange={() => handleFilterChange('availability', 'outOfStock')}
                    />
                  </div>
                </FilterSection>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {t('products.results', { count: totalProducts })}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-12">
                <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('products.error.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                <Button onClick={fetchProducts}>
                  {t('products.error.retry')}
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('products.noProducts')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Try adjusting your filters or search terms
                    </p>
                    <Button onClick={clearFilters}>
                      {t('products.clearFilters')}
                    </Button>
                  </div>
                ) : (
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-12">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFilterChange('page', currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handleFilterChange('page', page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                page === currentPage
                                  ? 'bg-teal-600 text-white'
                                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-3 py-2 text-sm text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => handleFilterChange('page', currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 