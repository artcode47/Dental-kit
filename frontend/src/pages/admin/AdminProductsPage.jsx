import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  TagIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { getAllProducts, bulkProductOperations, createProduct, updateProduct, deleteProduct, getAllCategories, getAllVendors } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminProductsPage = () => {
  const { t } = useTranslation('admin');
  const { currentLanguage } = useLanguage();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockRange, setStockRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20); // Quota-friendly: small batches
  const [viewMode] = useState('grid'); // 'grid' or 'table' - Currently only grid is implemented
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form states for add/edit modal
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    vendor: '',
    sku: '',
    brand: '',
    isActive: true
  });
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Function to fetch all products with large limit
  const fetchProductsQuotaFriendly = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use a large limit to fetch all products in one request
      const requestParams = {
        page: 1,
        limit: 1000, // Large limit to get all products
        sortBy: params.sortBy || sortBy,
        sortOrder: params.sortOrder || sortOrder,
        ...params
      };
      
      if (searchTerm && searchTerm.trim()) {
        requestParams.search = searchTerm.trim();
      }
      if (selectedCategory && selectedCategory.trim() && selectedCategory !== '') {
        requestParams.category = selectedCategory.trim();
      }
      if (selectedVendor && selectedVendor.trim() && selectedVendor !== '') {
        requestParams.vendor = selectedVendor.trim();
      }
      if (selectedStatus && selectedStatus.trim() && selectedStatus !== '') {
        requestParams.status = selectedStatus.trim();
      }
      
      console.log('Fetching products with params:', requestParams);
      const response = await getAllProducts(requestParams);
      const products = response.products || response || [];
      
      console.log(`Total products fetched: ${products.length}`);
      console.log(`Response total: ${response.total}`);
      console.log(`Response totalPages: ${response.totalPages}`);
      
      return products;
    } catch (err) {
      console.error('Error fetching products:', err);
      throw err;
    }
  };

  const _fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.categories || response || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const _fetchVendors = async () => {
    try {
      const response = await getAllVendors();
      setVendors(response.vendors || response || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const filterAndSortProducts = useCallback(() => {
    let filtered = [...(products || [])];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product && (
          (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.nameAr || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product && (product.categoryId === selectedCategory));
    }

    if (selectedVendor) {
      filtered = filtered.filter(product => product && (product.vendorId === selectedVendor));
    }

    if (selectedStatus) {
      filtered = filtered.filter(product => product && product.isActive === (selectedStatus === 'active'));
    }

    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        const price = parseFloat(product.price);
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    if (stockRange.min || stockRange.max) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        const stock = parseInt(product.stock);
        const min = stockRange.min ? parseInt(stockRange.min) : 0;
        const max = stockRange.max ? parseInt(stockRange.max) : Infinity;
        return stock >= min && stock <= max;
      });
    }

    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'category') {
        aValue = currentLanguage === 'ar' ? (a.category?.nameAr || a.category?.name || '') : (a.category?.name || '');
        bValue = currentLanguage === 'ar' ? (b.category?.nameAr || b.category?.name || '') : (b.category?.name || '');
      }
      if (sortBy === 'vendor') {
        aValue = currentLanguage === 'ar' ? (a.vendor?.nameAr || a.vendor?.name || '') : (a.vendor?.name || '');
        bValue = currentLanguage === 'ar' ? (b.vendor?.nameAr || b.vendor?.name || '') : (b.vendor?.name || '');
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedVendor, priceRange, stockRange, sortBy, sortOrder, currentLanguage]);

  // Initial data load - only runs once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [allProducts, categoriesResponse, vendorsResponse] = await Promise.all([
          fetchProductsQuotaFriendly({ sortBy: 'createdAt', sortOrder: 'desc' }),
          getAllCategories(),
          getAllVendors()
        ]);
        
        setProducts(allProducts);
        setCategories(categoriesResponse.categories || categoriesResponse || []);
        setVendors(vendorsResponse.vendors || vendorsResponse || []);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []); // Empty dependency array - only runs once

  // Handle filter changes - only refetch when filters actually change
  useEffect(() => {
    if (products.length > 0) { // Only refetch if we have initial data
      const refetchProducts = async () => {
        try {
          const allProducts = await fetchProductsQuotaFriendly({ sortBy, sortOrder });
          setProducts(allProducts);
        } catch (err) {
          console.error('Error refetching products:', err);
          setError(err.message);
        }
      };
      
      refetchProducts();
    }
  }, [selectedCategory, selectedVendor, selectedStatus, searchTerm, sortBy, sortOrder, products.length]);

  // Filter and sort products when dependencies change
  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedVendor, priceRange, stockRange, sortBy, sortOrder, filterAndSortProducts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleVendorFilter = (e) => {
    setSelectedVendor(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map(product => product.id));
    }
  };

  const handleBulkOperation = async (operation) => {
    if (selectedProducts.length === 0) return;

    try {
      await bulkProductOperations(operation, selectedProducts);
      toast.success(t(`products.bulk${operation.charAt(0).toUpperCase() + operation.slice(1)}Success`));
      setSelectedProducts([]);
      fetchProductsQuotaFriendly();
    } catch {
      toast.error(t('products.bulkOperationError'));
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      await bulkProductOperations('update', [productId], { isActive: !currentStatus });
      toast.success(t('products.statusUpdateSuccess'));
      fetchProductsQuotaFriendly();
    } catch {
      toast.error(t('products.statusUpdateError'));
    }
  };

  // Clear filters function for future use
  const _clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedVendor('');
    setPriceRange({ min: '', max: '' });
    setStockRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  // Frontend pagination for display (since we fetch all products)
  const displayPerPage = 12; // Display 12 products per page
  const indexOfLastProduct = currentPage * displayPerPage;
  const indexOfFirstProduct = indexOfLastProduct - displayPerPage;
  const currentProducts = (filteredProducts || []).slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil((filteredProducts || []).length / displayPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Modal handlers
  const handleAddProduct = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      vendor: '',
      sku: '',
      brand: '',
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      nameAr: product.nameAr || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      category: product.categoryId || '',
      vendor: product.vendorId || '',
      sku: product.sku || '',
      brand: product.brand || '',
      isActive: product.isActive
    });
    setShowEditModal(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleDeleteProductClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sku: formData.sku,
        brand: formData.brand,
        isActive: formData.isActive,
        categoryId: formData.category || undefined,
        vendorId: formData.vendor || undefined,
      };

      if (showAddModal) {
        await createProduct(formattedData);
        toast.success(t('products.productCreatedSuccess'));
      } else if (showEditModal) {
        await updateProduct(selectedProduct.id, formattedData);
        toast.success(t('products.productUpdatedSuccess'));
      }
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedProduct(null);
      fetchProductsQuotaFriendly();
    } catch {
      toast.error(showAddModal ? t('products.createProductError') : t('products.updateProductError'));
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(selectedProduct.id);
      toast.success(t('products.deleteSuccess'));
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProductsQuotaFriendly();
    } catch {
      toast.error(t('products.deleteError'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  // Quick stats
  const stats = useMemo(() => {
    const productsArray = products || [];
    const total = productsArray.length;
    const active = productsArray.filter(p => p && p.isActive).length;
    const lowStock = productsArray.filter(p => p && p.stock <= 10 && p.stock > 0).length;
    const outOfStock = productsArray.filter(p => p && p.stock === 0).length;
    const totalValue = productsArray.reduce((sum, p) => p ? sum + (p.price * p.stock) : sum, 0);

    return { total, active, lowStock, outOfStock, totalValue };
  }, [products]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-2">
            {t('products.errorLoading')}
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={fetchProductsQuotaFriendly} className="mt-4">
            {t('products.retry')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Main Container - Aligned to Left Side */}
      <div className="pl-2 pr-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              {t('products.title')}
            </h1>
                <p className="text-green-100 text-sm sm:text-base">
              {t('products.subtitle')}
            </p>
          </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  {t('products.exportCSV')}
            </Button>
            <Button
                  className="flex items-center gap-2 bg-white text-green-600 hover:bg-gray-100"
                  onClick={handleAddProduct}
            >
              <PlusIcon className="h-5 w-5" />
                  {t('products.addNew')}
            </Button>
          </div>
        </div>
            </div>
          </div>

        {/* Filters and Search - Mobile Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            {/* Search and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('products.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 sm:w-auto"
              >
                <FunnelIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={handleCategoryFilter}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('products.allCategories')}</option>
              {Array.isArray(categories) && categories.map((category, index) => {
                if (!category) return null;
                const id = category.id || category._id || category.value || category;
                const label = category.name || category.label || category;
                return (
                  <option key={id || `category-${index}`} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>

            {/* Vendor Filter */}
            <select
              value={selectedVendor}
              onChange={handleVendorFilter}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('products.allVendors')}</option>
              {Array.isArray(vendors) && vendors.map((vendor, index) => {
                if (!vendor) return null;
                const id = vendor.id || vendor._id || vendor.value || vendor;
                const label = vendor.name || vendor.label || vendor;
                return (
                  <option key={id || `vendor-${index}`} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('products.allStatuses')}</option>
              <option value="active">{t('products.active')}</option>
              <option value="inactive">{t('products.inactive')}</option>
            </select>

                {/* Sort By */}
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="createdAt-desc">{t('products.sortNewest')}</option>
                  <option value="createdAt-asc">{t('products.sortOldest')}</option>
                  <option value="name-asc">{t('products.sortNameAZ')}</option>
                  <option value="name-desc">{t('products.sortNameZA')}</option>
                  <option value="price-asc">{t('products.sortPriceLow')}</option>
                  <option value="price-desc">{t('products.sortPriceHigh')}</option>
                  </select>
              </div>
            )}
          </div>
                </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShoppingBagIcon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('products.total')}
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
            </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('products.active')}
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.active}
                </p>
                </div>
                </div>
            </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('products.lowStock')}
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.lowStock}
                </p>
              </div>
          </div>
        </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('products.totalValue')}
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedProducts.length} {t('products.selected')}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('activate')}
                  >
                    {t('products.activate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('deactivate')}
                  >
                    {t('products.deactivate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('products.delete')}
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedProducts([])}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Products Grid/Table */}
        <div className="px-2">
        {viewMode === 'grid' ? (
                      <ProductsGridView
              products={currentProducts}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onToggleStatus={handleToggleStatus}
              onViewProduct={handleViewProduct}
              onEditProduct={handleEditProduct}
              onDeleteProductClick={handleDeleteProductClick}
            />
        ) : (
                      <ProductsTableView
              products={currentProducts}
              selectedProducts={selectedProducts}
              onSelectAll={handleSelectAll}
              onSelectProduct={handleSelectProduct}
              onToggleStatus={handleToggleStatus}
              onViewProduct={handleViewProduct}
              onEditProduct={handleEditProduct}
              onDeleteProductClick={handleDeleteProductClick}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
        )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-xl shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {t('products.previous')}
              </button>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </span>
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {t('products.next')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('products.showing')} <span className="font-medium">{indexOfFirstProduct + 1}</span> {t('products.to')} <span className="font-medium">{Math.min(indexOfLastProduct, (filteredProducts || []).length)}</span> {t('products.of')} <span className="font-medium">{(filteredProducts || []).length}</span> {t('products.results')}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    {t('products.previous')}
                  </button>
                  
                  {/* Current Page Info */}
                  <div className="relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    {currentPage} / {totalPages}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    {t('products.next')}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('products.addNewProduct')}
                  </h2>
                  <button
                    onClick={closeModals}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.name')} *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.nameAr')}
                      </label>
                      <Input
                        type="text"
                        name="nameAr"
                        value={formData.nameAr}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.description')}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.price')} *
                      </label>
                      <Input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.stock')} *
                      </label>
                      <Input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.category')} *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">{t('products.selectCategory')}</option>
                        {categories.map((category) => (
                          <option key={category.id || category._id} value={category.id || category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.vendor')} *
                      </label>
                      <select
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">{t('products.selectVendor')}</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id || vendor._id} value={vendor.id || vendor._id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.sku')}
                      </label>
                      <Input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.brand')}
                      </label>
                      <Input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      {t('products.isActive')}
                    </label>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModals}
                      className="flex-1"
                    >
                      {t('products.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                    >
                      {t('products.create')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('products.editProduct')}
                  </h2>
                  <button
                    onClick={closeModals}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.name')} *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.nameAr')}
                      </label>
                      <Input
                        type="text"
                        name="nameAr"
                        value={formData.nameAr}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.description')}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.price')} *
                      </label>
                      <Input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.stock')} *
                      </label>
                      <Input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.category')} *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">{t('products.selectCategory')}</option>
                        {categories.map((category) => (
                          <option key={category.id || category._id} value={category.id || category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.vendor')} *
                      </label>
                      <select
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">{t('products.selectVendor')}</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id || vendor._id} value={vendor.id || vendor._id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.sku')}
                      </label>
                      <Input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.brand')}
                      </label>
                      <Input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      {t('products.isActive')}
                    </label>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModals}
                      className="flex-1"
                    >
                      {t('products.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                    >
                      {t('products.update')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Product Modal */}
        {showViewModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('products.productDetails')}
                  </h2>
                  <button
                    onClick={closeModals}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.name')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.nameAr')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedProduct.nameAr || '-'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.description')}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedProduct.description || '-'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.price')}
                      </label>
                      <p className="text-gray-900 dark:text-white">${selectedProduct.price}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.stock')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedProduct.stock}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.category')}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {categories.find(c => (c.id || c._id) === selectedProduct.categoryId)?.name || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.vendor')}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {vendors.find(v => (v.id || v._id) === selectedProduct.vendorId)?.name || '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.sku')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedProduct.sku || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('products.brand')}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedProduct.brand || '-'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.status')}
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedProduct.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedProduct.isActive ? t('products.active') : t('products.inactive')}
                    </span>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModals}
                      className="flex-1"
                    >
                      {t('products.close')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t('products.confirmDeleteTitle')}
                    </h3>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('products.confirmDeleteMessage', { name: selectedProduct.name })}
                  </p>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModals}
                    className="flex-1"
                  >
                    {t('products.cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleConfirmDelete}
                    className="flex-1"
                  >
                    {t('products.delete')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Products Grid View Component
const ProductsGridView = ({ products, selectedProducts, onSelectProduct, onToggleStatus, onViewProduct, onEditProduct, onDeleteProductClick }) => {
  const { t } = useTranslation('admin');
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
      {(products || []).map((product) => {
        if (!product) return null;
        return (
        <div
          key={product.id}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 h-[30rem] flex flex-col group"
        >
          {/* Product Image - Enhanced Design */}
          <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex-shrink-0 overflow-hidden">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              src={product.images?.[0]?.url || '/placeholder-product.png'}
              alt={product.images?.[0]?.alt || product.name}
            />
            <div className="absolute top-3 left-3">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => onSelectProduct(product.id)}
                className="rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div className="absolute top-3 right-3">
              <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                product.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}>
                {product.isActive ? t('products.active') : t('products.inactive')}
              </span>
            </div>
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Product Info - Enhanced Design */}
          <div className="px-4 pt-4 pb-3 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem] leading-tight">
                {product.name}
              </h3>
            </div>
            
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 flex-1 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <TagIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
                <span className="truncate font-medium">{product.categoryName || product.category?.name || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                  <CubeIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="truncate font-medium">SKU: {product.sku}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <CurrencyDollarIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {product.price} EGP
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                  <ShoppingBagIcon className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                  product.stock > 10 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                    : product.stock > 0
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                }`}>
                  {product.stock} {t('products.stock')}
                </span>
              </div>
            </div>

            {/* Actions - Enhanced Design */}
            <div className="mt-auto pt-2 pb-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleStatus(product.id, product.isActive)}
                    className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
                  title={product.isActive ? t('products.deactivate') : t('products.activate')}
                >
                  {product.isActive ? (
                    <XMarkIcon className="h-4 w-4" />
                  ) : (
                    <CheckIcon className="h-4 w-4" />
                  )}
                </button>
                <button 
                  onClick={() => onViewProduct(product)}
                    className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  title={t('products.view')}
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => onEditProduct(product)}
                    className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
                  title={t('products.edit')}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => onDeleteProductClick(product)}
                  className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
                title={t('products.delete')}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              </div>
            </div>
          </div>
        </div>
      );
      })}
    </div>
  );
};

// Products Table View Component
const ProductsTableView = ({ products, selectedProducts, onSelectAll, onSelectProduct, onToggleStatus, onViewProduct, onEditProduct, onDeleteProductClick, onSort, sortBy, sortOrder }) => {
  const { t } = useTranslation('admin');
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('products.product')}
              </th>
              <th 
                className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                onClick={() => onSort('category')}
              >
                <div className="flex items-center gap-1">
                  {t('products.category')}
                  {sortBy === 'category' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                onClick={() => onSort('price')}
              >
                <div className="flex items-center gap-1">
                  {t('products.price')}
                  {sortBy === 'price' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                onClick={() => onSort('stock')}
              >
                <div className="flex items-center gap-1">
                  {t('products.stock')}
                  {sortBy === 'stock' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                onClick={() => onSort('vendor')}
              >
                <div className="flex items-center gap-1">
                  {t('products.vendor')}
                  {sortBy === 'vendor' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('products.status')}
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('products.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {(products || []).map((product) => {
              if (!product) return null;
              return (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => onSelectProduct(product.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={product.images?.[0]?.url || '/placeholder-product.png'}
                        alt={product.images?.[0]?.alt || product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        SKU: {product.sku}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {product.categoryName || product.category?.name || '-'}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${product.price}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.stock > 10 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : product.stock > 0
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {product.vendorName || product.vendor?.name || '-'}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {product.isActive ? t('products.active') : t('products.inactive')}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleStatus(product.id, product.isActive)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title={product.isActive ? t('products.deactivate') : t('products.activate')}
                    >
                      {product.isActive ? (
                        <XMarkIcon className="h-4 w-4" />
                      ) : (
                        <CheckIcon className="h-4 w-4" />
                      )}
                    </button>
                                         <button 
                       onClick={() => onViewProduct(product)}
                       className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                       title={t('products.view')}
                     >
                       <EyeIcon className="h-4 w-4" />
                     </button>
                     <button 
                       onClick={() => onEditProduct(product)}
                       className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                       title={t('products.edit')}
                     >
                       <PencilIcon className="h-4 w-4" />
                     </button>
                                         <button
                       onClick={() => onDeleteProductClick(product)}
                       className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                       title={t('products.delete')}
                     >
                       <TrashIcon className="h-4 w-4" />
                     </button>
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

            {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {(products || []).map((product) => {
          if (!product) return null;
          return (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => onSelectProduct(product.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 flex-shrink-0"
              />
              <div className="h-16 w-16 flex-shrink-0">
                <img
                  className="h-16 w-16 rounded-lg object-cover"
                  src={product.images?.[0]?.url || '/placeholder-product.png'}
                  alt={product.images?.[0]?.alt || product.name}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      SKU: {product.sku}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => onToggleStatus(product.id, product.isActive)}
                      className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title={product.isActive ? t('products.deactivate') : t('products.activate')}
                    >
                      {product.isActive ? (
                        <XMarkIcon className="h-4 w-4" />
                      ) : (
                        <CheckIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button 
                      onClick={() => onViewProduct(product)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                      title={t('products.view')}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onEditProduct(product)}
                      className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title={t('products.edit')}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProductClick(product)}
                      className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      title={t('products.delete')}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {product.isActive ? t('products.active') : t('products.inactive')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                      {t('products.stock')}: {product.stock}
                    </span>
                    <span className="truncate">
                      {t('products.category')}: {product.categoryName || product.category?.name || '-'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {t('products.vendor')}: {product.vendorName || product.vendor?.name || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default AdminProductsPage; 