import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VendorLayout from '../../components/layout/VendorLayout';
import api, { endpoints } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  TagIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import ProductModal from '../../components/admin/products/ProductModal';
import { getFirstImageUrl } from '../../utils/imageUtils';
import ProductViewModal from '../../components/admin/products/ProductViewModal';
import DeleteConfirmationModal from '../../components/admin/products/DeleteConfirmationModal';

const VendorProductsPage = () => {
  const { t } = useTranslation('admin');

  const [data, setData] = useState({ products: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', stock: 0, brand: '' });
  const canCreate = useMemo(() => form.name && form.description && form.price && form.categoryId, [form]);

  // Admin-like UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockRange, setStockRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sku: '',
    brand: '',
    isActive: true
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get(endpoints.vendors.me.products);
        setData(data);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // fetch categories for filter and modal
    const fetchCategories = async () => {
      try {
        const res = await api.get(endpoints.products.categories);
        setCategories(res.data?.categories || []);
      } catch {}
    };
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canCreate) return;
    try {
      setCreating(true);
      await api.post(endpoints.vendors.me.createProduct, {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock || 0, 10)
      });
      const { data } = await api.get(endpoints.vendors.me.products);
      setData(data);
      setForm({ name: '', description: '', price: '', categoryId: '', stock: 0, brand: '' });
    } finally {
      setCreating(false);
    }
  };

  const updateStock = async (id, delta) => {
    await api.patch(endpoints.vendors.me.stock(id), { quantity: Math.abs(delta), operation: delta >= 0 ? 'increase' : 'decrease' });
    const { data } = await api.get(endpoints.vendors.me.products);
    setData(data);
  };

  const deleteProduct = async (id) => {
    await api.delete(endpoints.vendors.me.deleteProduct(id));
    const { data } = await api.get(endpoints.vendors.me.products);
    setData(data);
  };

  // Filtering and sorting like admin
  useEffect(() => {
    let products = data.products || [];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      products = products.filter(p =>
        (p.name || '').toLowerCase().includes(s) ||
        (p.description || '').toLowerCase().includes(s) ||
        (p.sku || '').toLowerCase().includes(s) ||
        (p.brand || '').toLowerCase().includes(s)
      );
    }
    if (selectedCategory) {
      products = products.filter(p => p.categoryId === selectedCategory);
    }
    if (selectedStatus) {
      const isActive = selectedStatus === 'active';
      products = products.filter(p => !!p.isActive === isActive);
    }
    if (priceRange.min || priceRange.max) {
      const min = priceRange.min ? parseFloat(priceRange.min) : 0;
      const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      products = products.filter(p => (p.price || 0) >= min && (p.price || 0) <= max);
    }
    if (stockRange.min || stockRange.max) {
      const minS = stockRange.min ? parseInt(stockRange.min) : 0;
      const maxS = stockRange.max ? parseInt(stockRange.max) : Infinity;
      products = products.filter(p => (p.stock || 0) >= minS && (p.stock || 0) <= maxS);
    }
    products.sort((a, b) => {
      let av = a?.[sortBy];
      let bv = b?.[sortBy];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (sortOrder === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
    setFilteredProducts(products);
  }, [data, searchTerm, selectedCategory, selectedStatus, priceRange, stockRange, sortBy, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const products = data.products || [];
    const total = products.length;
    const active = products.filter(p => p?.isActive).length;
    const lowStock = products.filter(p => (p?.stock || 0) <= 10 && (p?.stock || 0) > 0).length;
    const totalValue = products.reduce((sum, p) => sum + ((p?.price || 0) * (p?.stock || 0)), 0);
    return { total, active, lowStock, totalValue };
  }, [data.products]);

  // Pagination helpers
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = (filteredProducts || []).slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil((filteredProducts || []).length / productsPerPage);

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      await api.put(endpoints.vendors.me.updateProduct(productId), { isActive: !currentStatus });
      const { data } = await api.get(endpoints.vendors.me.products);
      setData(data);
      toast.success(t('products.statusUpdateSuccess'));
    } catch {
      toast.error(t('products.statusUpdateError'));
    }
  };

  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleCategoryFilter = (e) => { setSelectedCategory(e.target.value); setCurrentPage(1); };
  const handleStatusFilter = (e) => { setSelectedStatus(e.target.value); setCurrentPage(1); };
  const handleSort = (field) => { if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortOrder('asc'); } };
  const paginate = (page) => setCurrentPage(page);
  const clearFilters = () => { setSearchTerm(''); setSelectedCategory(''); setSelectedStatus(''); setPriceRange({ min: '', max: '' }); setStockRange({ min: '', max: '' }); setCurrentPage(1); };
  const handleSelectProduct = (id) => setSelectedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleSelectAll = () => setSelectedProducts(currentProducts.map(p => p.id));

  const handleAddProduct = () => {
    setFormData({ name: '', nameAr: '', description: '', price: '', stock: '', category: '', sku: '', brand: '', isActive: true });
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
      sku: product.sku || '',
      brand: product.brand || '',
      isActive: product.isActive
    });
    setShowEditModal(true);
  };
  const handleViewProduct = (product) => { setSelectedProduct(product); setShowViewModal(true); };
  const handleDeleteProductClick = (product) => { setSelectedProduct(product); setShowDeleteModal(true); };
  const handleConfirmDelete = async () => {
    try {
      await api.delete(endpoints.vendors.me.deleteProduct(selectedProduct.id));
      const { data } = await api.get(endpoints.vendors.me.products);
      setData(data);
      toast.success(t('products.deleteSuccess'));
    } catch { toast.error(t('products.deleteError')); }
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock || 0),
        sku: formData.sku,
        brand: formData.brand,
        isActive: formData.isActive,
        categoryId: formData.category || undefined
      };
      if (showAddModal) {
        await api.post(endpoints.vendors.me.createProduct, payload);
        toast.success(t('products.productCreatedSuccess'));
      } else if (showEditModal) {
        await api.put(endpoints.vendors.me.updateProduct(selectedProduct.id), payload);
        toast.success(t('products.productUpdatedSuccess'));
      }
      const { data } = await api.get(endpoints.vendors.me.products);
      setData(data);
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch {
      toast.error(showAddModal ? t('products.createProductError') : t('products.updateProductError'));
    }
  };

  const handleBulkOperation = async (operation) => {
    if (selectedProducts.length === 0) return;
    try {
      if (operation === 'activate' || operation === 'deactivate') {
        const isActive = operation === 'activate';
        await Promise.all(selectedProducts.map(id => api.put(endpoints.vendors.me.updateProduct(id), { isActive })));
      } else if (operation === 'delete') {
        await Promise.all(selectedProducts.map(id => api.delete(endpoints.vendors.me.deleteProduct(id))));
      }
      const { data } = await api.get(endpoints.vendors.me.products);
      setData(data);
      setSelectedProducts([]);
      toast.success(t('products.statusUpdateSuccess'));
    } catch {
      toast.error(t('products.bulkOperationError'));
    }
  };

  return (
    <VendorLayout>
      <div className="p-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{t('products.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('products.subtitle', 'Manage your catalog and inventory')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('products.filters.title')}</span>
            </Button>
            <Button onClick={handleAddProduct} className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{t('products.addNew')}</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShoppingBagIcon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">{t('products.total')}</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckIcon className="h-5 w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">{t('products.active')}</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">{t('products.lowStock')}</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">{t('products.totalValue')}</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">${stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input type="text" placeholder={t('products.searchPlaceholder')} value={searchTerm} onChange={handleSearch} className="pl-10" />
            </div>
            {/* Category */}
            <select value={selectedCategory} onChange={handleCategoryFilter} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm">
              <option value="">{t('products.allCategories')}</option>
              {Array.isArray(categories) && categories.map((c) => {
                const id = c.id || c._id || c.value || c;
                const label = c.name || c.label || c;
                return <option key={id} value={id}>{label}</option>;
              })}
            </select>
            {/* Status */}
            <select value={selectedStatus} onChange={handleStatusFilter} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm">
              <option value="">{t('products.allStatuses')}</option>
              <option value="active">{t('products.active')}</option>
              <option value="inactive">{t('products.inactive')}</option>
            </select>
          </div>
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('products.filters.priceRange')}</label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))} className="flex-1" />
                    <Input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))} className="flex-1" />
                  </div>
                </div>
                {/* Stock Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('products.filters.stockRange')}</label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Min" value={stockRange.min} onChange={(e) => setStockRange(prev => ({ ...prev, min: e.target.value }))} className="flex-1" />
                    <Input type="number" placeholder="Max" value={stockRange.max} onChange={(e) => setStockRange(prev => ({ ...prev, max: e.target.value }))} className="flex-1" />
                  </div>
                </div>
                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('products.sort.title')}</label>
                  <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [f,o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); }} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
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
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">{t('products.filters.clearAll')}</Button>
                </div>
              </div>
            </div>
          )}
          {/* Results Count & View Switch */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('products.showing')} {(filteredProducts || []).length} {t('products.of')} {(data.products || []).length} {t('products.products')}
            </div>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')} className="flex items-center gap-2">
                <div className="grid grid-cols-2 gap-1 w-4 h-4"><div className="bg-current rounded-sm"></div><div className="bg-current rounded-sm"></div><div className="bg-current rounded-sm"></div><div className="bg-current rounded-sm"></div></div>
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')} className="flex items-center gap-2">
                <div className="flex flex-col gap-1 w-4 h-4"><div className="bg-current rounded-sm h-0.5"></div><div className="bg-current rounded-sm h-0.5"></div><div className="bg-current rounded-sm h-0.5"></div></div>
                <span className="hidden sm:inline">Table</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{selectedProducts.length} {t('products.selected')}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkOperation('activate')}>{t('products.activate')}</Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkOperation('deactivate')}>{t('products.deactivate')}</Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkOperation('delete')} className="text-red-600 hover:text-red-700">{t('products.delete')}</Button>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedProducts([])}><XMarkIcon className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* Grid/Table */}
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
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600">{t('products.previous')}</button>
              <div className="flex items-center"><span className="text-sm text-gray-700 dark:text-gray-300">{currentPage} / {totalPages}</span></div>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600">{t('products.next')}</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{t('products.showing')} <span className="font-medium">{indexOfFirst + 1}</span> {t('products.to')} <span className="font-medium">{Math.min(indexOfLast, (filteredProducts || []).length)}</span> {t('products.of')} <span className="font-medium">{(filteredProducts || []).length}</span> {t('products.results')}</p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                  <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600">{t('products.previous')}</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => paginate(page)} className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-400' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}>{page}</button>
                  ))}
                  <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600">{t('products.next')}</button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <ProductModal
          isOpen={showAddModal || showEditModal}
          mode={showAddModal ? 'add' : 'edit'}
          product={selectedProduct}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowAddModal(false); setShowEditModal(false); setSelectedProduct(null); }}
          categories={categories}
        />

        <ProductViewModal
          isOpen={showViewModal}
          product={selectedProduct}
          categories={categories}
          onClose={() => { setShowViewModal(false); setSelectedProduct(null); }}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          product={selectedProduct}
          onConfirm={handleConfirmDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedProduct(null); }}
        />
      </div>
    </VendorLayout>
  );
};

export default VendorProductsPage; 

// Grid view component (vendor)
const ProductsGridView = ({ products, selectedProducts, onSelectProduct, onToggleStatus, onViewProduct, onEditProduct, onDeleteProductClick }) => {
  const { t } = useTranslation('admin');
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {(products || []).map((product) => {
        if (!product) return null;
        return (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              <img className="w-full h-full object-cover" src={product.images?.[0] || '/placeholder-product.png'} alt={product.name} />
              <div className="absolute top-2 left-2">
                <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => onSelectProduct(product.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              <div className="absolute top-2 right-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                  {product.isActive ? t('products.active') : t('products.inactive')}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
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
                  <span className="font-semibold text-gray-900 dark:text-white">${product.price}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingBagIcon className="h-3 w-3" />
                  <span className={`font-semibold ${product.stock > 10 ? 'text-green-600 dark:text-green-400' : product.stock > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{product.stock} {t('products.stock')}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => onToggleStatus(product.id, product.isActive)} className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title={product.isActive ? t('products.deactivate') : t('products.activate')}>
                    {product.isActive ? <XMarkIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                  </button>
                  <button onClick={() => onViewProduct(product)} className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300" title={t('products.view')}>
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => onEditProduct(product)} className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title={t('products.edit')}>
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={() => onDeleteProductClick(product)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title={t('products.delete')}>
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

// Table view component (vendor)
const ProductsTableView = ({ products, selectedProducts, onSelectAll, onSelectProduct, onToggleStatus, onViewProduct, onEditProduct, onDeleteProductClick, onSort, sortBy, sortOrder }) => {
  const { t } = useTranslation('admin');
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left">
                <input type="checkbox" checked={selectedProducts.length === products.length && products.length > 0} onChange={onSelectAll} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('products.product')}</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100" onClick={() => onSort('price')}>
                <div className="flex items-center gap-1">{t('products.price')}{sortBy === 'price' && (sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />)}</div>
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100" onClick={() => onSort('stock')}>
                <div className="flex items-center gap-1">{t('products.stock')}{sortBy === 'stock' && (sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />)}</div>
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('products.status')}</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('products.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {(products || []).map((product) => {
              if (!product) return null;
              return (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => onSelectProduct(product.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-lg object-cover" src={getFirstImageUrl(product.images)} alt={product.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${product.price}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{product.stock}</span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{product.isActive ? t('products.active') : t('products.inactive')}</span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onToggleStatus(product.id, product.isActive)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title={product.isActive ? t('products.deactivate') : t('products.activate')}>
                        {product.isActive ? <XMarkIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                      </button>
                      <button onClick={() => onViewProduct(product)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300" title={t('products.view')}>
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => onEditProduct(product)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title={t('products.edit')}>
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDeleteProductClick(product)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title={t('products.delete')}>
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
    </div>
  );
};