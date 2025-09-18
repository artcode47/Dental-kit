import React, { useState, useEffect, useMemo } from 'react';
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
import ProductModal from '../../components/admin/products/ProductModal';
import ProductViewModal from '../../components/admin/products/ProductViewModal';
import DeleteConfirmationModal from '../../components/admin/products/DeleteConfirmationModal';
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
  const [productsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  
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

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchVendors();
  }, []);

  // Refetch products when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchProducts();
    }
  }, [selectedCategory, selectedVendor, selectedStatus, searchTerm, sortBy, sortOrder, currentPage]);

  // Filter and sort products when dependencies change
  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedVendor, priceRange, stockRange, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build parameters object, only including non-empty values
      const params = {
        page: currentPage,
        limit: productsPerPage,
        sortBy,
        sortOrder
      };
      
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (selectedCategory && selectedCategory.trim() && selectedCategory !== '') {
        params.category = selectedCategory.trim();
      }
      if (selectedVendor && selectedVendor.trim() && selectedVendor !== '') {
        params.vendor = selectedVendor.trim();
      }
      if (selectedStatus && selectedStatus.trim() && selectedStatus !== '') {
        params.status = selectedStatus.trim();
      }
      
      const response = await getAllProducts(params);
      // Normalize to array of product objects
      setProducts(response.products || response || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.categories || response || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await getAllVendors();
      setVendors(response.vendors || response || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const filterAndSortProducts = () => {
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
  };

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
      fetchProducts();
    } catch {
      toast.error(t('products.bulkOperationError'));
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      await bulkProductOperations('update', [productId], { isActive: !currentStatus });
      toast.success(t('products.statusUpdateSuccess'));
      fetchProducts();
    } catch {
      toast.error(t('products.statusUpdateError'));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedVendor('');
    setPriceRange({ min: '', max: '' });
    setStockRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = (filteredProducts || []).slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil((filteredProducts || []).length / productsPerPage);

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
      fetchProducts();
    } catch (error) {
      toast.error(showAddModal ? t('products.createProductError') : t('products.updateProductError'));
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(selectedProduct.id);
      toast.success(t('products.deleteSuccess'));
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
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
          <Button onClick={fetchProducts} className="mt-4">
            {t('products.retry')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {t('products.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('products.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('products.filters.title')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('products.exportCSV')}</span>
            </Button>
            <Button onClick={handleAddProduct} className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{t('products.addNew')}</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
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

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('products.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={handleCategoryFilter}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
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
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
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
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="">{t('products.allStatuses')}</option>
              <option value="active">{t('products.active')}</option>
              <option value="inactive">{t('products.inactive')}</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('products.filters.priceRange')}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Stock Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('products.filters.stockRange')}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={stockRange.min}
                      onChange={(e) => setStockRange(prev => ({ ...prev, min: e.target.value }))}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={stockRange.max}
                      onChange={(e) => setStockRange(prev => ({ ...prev, max: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('products.sort.title')}
                  </label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="createdAt-desc">{t('products.sort.newest')}</option>
                    <option value="createdAt-asc">{t('products.sort.oldest')}</option>
                    <option value="name-asc">{t('products.sort.nameAZ')}</option>
                    <option value="name-desc">{t('products.sort.nameZA')}</option>
                    <option value="price-asc">{t('products.sort.priceLowHigh')}</option>
                    <option value="price-desc">{t('products.sort.priceHighLow')}</option>
                    <option value="stock-asc">{t('products.sort.stockLowHigh')}</option>
                    <option value="stock-desc">{t('products.sort.stockHighLow')}</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    {t('products.filters.clearAll')}
                  </Button>
                </div>
              </div>
            </div>
          )}

            {/* Results Count */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('products.showing')} {(filteredProducts || []).length} {t('products.of')} {(products || []).length} {t('products.products')}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2"
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex items-center gap-2"
              >
                <div className="flex flex-col gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm h-0.5"></div>
                  <div className="bg-current rounded-sm h-0.5"></div>
                  <div className="bg-current rounded-sm h-0.5"></div>
                </div>
                <span className="hidden sm:inline">Table</span>
              </Button>
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
                    className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    {t('products.previous')}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-400'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    {t('products.next')}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Modular Modals */}
        <ProductModal
          isOpen={showAddModal || showEditModal}
          mode={showAddModal ? 'add' : 'edit'}
          product={selectedProduct}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          categories={categories}
          vendors={vendors}
        />

        <ProductViewModal
          isOpen={showViewModal}
          product={selectedProduct}
          categories={categories}
          vendors={vendors}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProduct(null);
          }}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          product={selectedProduct}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProduct(null);
          }}
        />
      </div>
    </AdminLayout>
  );
};

// Products Grid View Component
const ProductsGridView = ({ products, selectedProducts, onSelectProduct, onToggleStatus, onViewProduct, onEditProduct, onDeleteProductClick }) => {
  const { t } = useTranslation('admin');
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {(products || []).map((product) => {
        if (!product) return null;
        return (
        <div
          key={product.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          {/* Product Image */}
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
            <img
              className="w-full h-full object-cover"
              src={product.images?.[0] || '/placeholder-product.png'}
              alt={product.name}
            />
            <div className="absolute top-2 left-2">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => onSelectProduct(product.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="absolute top-2 right-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                product.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {product.isActive ? t('products.active') : t('products.inactive')}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                {product.name}
              </h3>
            </div>
            
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <TagIcon className="h-3 w-3" />
                <span>{product.categoryName || product.category?.name || '-'}</span>
              </div>
              <div className="flex items-center gap-1">
                <CubeIcon className="h-3 w-3" />
                <span>SKU: {product.sku}</span>
              </div>
              <div className="flex items-center gap-1">
                <CurrencyDollarIcon className="h-3 w-3" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${product.price}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ShoppingBagIcon className="h-3 w-3" />
                <span className={`font-semibold ${
                  product.stock > 10 
                    ? 'text-green-600 dark:text-green-400'
                    : product.stock > 0
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {product.stock} {t('products.stock')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleStatus(product.id, product.isActive)}
                  className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
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
                  className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  title={t('products.view')}
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => onEditProduct(product)}
                  className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title={t('products.edit')}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => onDeleteProductClick(product)}
                className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                title={t('products.delete')}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
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
                        src={product.images?.[0] || '/placeholder-product.png'}
                        alt={product.name}
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
                  src={product.images?.[0] || '/placeholder-product.png'}
                  alt={product.name}
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