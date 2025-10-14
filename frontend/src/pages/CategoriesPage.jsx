import React, { useEffect, useMemo, useState } from 'react';
import Seo from '../components/seo/Seo';
import { getCategoryIcon } from '../utils/categoryIcons';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  TagIcon, 
  GiftIcon, 
  SparklesIcon,
  FireIcon,
  ShoppingBagIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, FireIcon as FireIconSolid } from '@heroicons/react/24/solid';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import AnimatedSection from '../components/animations/AnimatedSection';
import ecommerceService from '../services/ecommerceService';
import { apiHelpers, endpoints } from '../services/api';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 4;

const CategoriesPage = () => {
  const { t } = useTranslation('ecommerce');
  const { currentLanguage } = useLanguage();
  const { currentTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [productLoadState, setProductLoadState] = useState({}); // slug -> 'loading' | 'loaded'
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Error boundary state
  const [hasError, setHasError] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((categories?.length || 0) / PAGE_SIZE)), [categories]);
  const pagedCategories = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return (categories || []).slice(start, start + PAGE_SIZE);
  }, [categories, page]);

  // Load categories
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await ecommerceService.getCategories();
        if (!active) return;
        const list = res?.categories || res || [];
        setCategories(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error loading categories:', error);
        if (active) {
          setError('Failed to load categories');
          setCategories([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Load packages and discounted products
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingPackages(true);
        setLoadingDiscounts(true);
        const res = await apiHelpers.get(endpoints.packages.combined);
        if (!active) return;
        setPackages(res?.packages || res?.data?.packages || []);
        setDiscountedProducts(res?.discountedProducts || res?.data?.discountedProducts || []);
      } catch (error) {
        console.error('Error loading packages:', error);
        if (!active) return;
        // Set empty arrays as fallback
        setPackages([]);
        setDiscountedProducts([]);
      } finally {
        if (active) {
          setLoadingPackages(false);
          setLoadingDiscounts(false);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  // Load products for categories on current page
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingProducts(true);
        const queries = pagedCategories
          .filter(cat => (cat?.slug || cat?.id || cat?._id))
          .map(async (cat) => {
            const slug = cat.slug || cat.id || cat._id;
            if (productsByCategory[slug]) return; // cached
            try {
              setProductLoadState(prev => ({ ...prev, [slug]: 'loading' }));
              const res = await ecommerceService.getProductsByCategory(slug, { limit: 12 });
              const items = res?.products || res || [];
              return { id: slug, items: Array.isArray(items) ? items : [] };
            } catch (error) {
              console.error(`Error loading products for category ${slug}:`, error);
              return { id: slug, items: [] };
            }
          });
        const results = await Promise.allSettled(queries);
        if (!active) return;
        const next = { ...productsByCategory };
        results.forEach(r => {
          if (r.status === 'fulfilled' && r.value) {
            next[r.value.id] = r.value.items;
            setProductLoadState(prev => ({ ...prev, [r.value.id]: 'loaded' }));
          }
          if (r.status === 'rejected' && r.reason?.id) {
            setProductLoadState(prev => ({ ...prev, [r.reason.id]: 'loaded' }));
          }
        });
        setProductsByCategory(next);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        if (active) setLoadingProducts(false);
      }
    })();
    return () => { active = false; };
  }, [page, pagedCategories, productsByCategory]);

  const scrollRow = (containerId, dir = 1) => {
    const el = document.getElementById(containerId);
    if (el) el.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  const tabs = [
    { 
      id: 'categories', 
      label: t('categories.title'), 
      icon: ShoppingBagIcon,
      count: categories.length,
      color: 'text-blue-600'
    },
    { 
      id: 'packages', 
      label: t('packages.packages'), 
      icon: GiftIcon,
      count: packages.length,
      color: 'text-purple-600'
    },
    { 
      id: 'discounts', 
      label: t('packages.discountedProducts'), 
      icon: FireIconSolid,
      count: discountedProducts.length,
      color: 'text-red-600'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getDiscountPercentage = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg p-8">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('common.error')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('categories.error.loading')}
          </p>
          <Button 
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            variant="primary"
          >
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Seo
        title={t('categories.title', 'Categories & Packages')}
        description={t('categories.description', 'Browse categories, packages, and discounted products')}
        type="website"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={currentTheme === 'dark' ? '#0B1220' : '#FFFFFF'}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <div className="text-center text-white">
            <AnimatedSection animation="fadeInUp" delay={0}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {t('categories.title')}
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
                {t('categories.subtitle')}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" delay={100}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg p-2 mb-8">
                <nav className="flex space-x-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 mr-2 ${tab.color}`} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </AnimatedSection>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto">
              
              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-8">
                  {loading && (
                    <div className="space-y-8">
                      {Array.from({ length: PAGE_SIZE }).map((_, rowIdx) => (
                        <div key={`sk-row-${rowIdx}`} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-gray-700 dark:to-gray-700 rounded-xl mr-4 animate-pulse" />
                              <div>
                                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              </div>
                            </div>
                            <div className="hidden sm:block h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="flex gap-4 overflow-x-hidden pb-2">
                            {Array.from({ length: 4 }).map((__, i) => (
                              <div key={`sk-card-${i}`} className="min-w-[260px] max-w-[260px] snap-start bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/10 dark:border-gray-700/10 rounded-2xl shadow">
                                <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
                                <div className="p-4">
                                  <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!loading && error && (
                    <div className="max-w-xl mx-auto text-center bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow p-6">
                      <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                      <Button onClick={() => window.location.reload()} variant="primary">
                        {t('orders.error.retry')}
                      </Button>
                    </div>
                  )}

                  {!loading && !error && pagedCategories.map((cat) => {
                    const slug = cat.slug || cat.id || cat._id;
                    const products = productsByCategory[slug] || [];
                    const isRowLoading = productLoadState[slug] === 'loading';
                    const rowId = `cat-row-${slug}`;
                    return (
                      <div key={slug} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                              {(() => {
                                const Icon = getCategoryIcon(cat);
                                return Icon ? <Icon className="w-6 h-6 text-white" /> : (
                                  <ShoppingBagIcon className="w-6 h-6 text-white" />
                                );
                              })()}
                            </div>
                            <div>
                              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                {cat.name || cat.title || t('categories.untitled', 'Untitled')}
                              </h2>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {products.length} {t('products.title')}
                              </p>
                            </div>
                          </div>
                          <Link
                            to={`/products?category=${slug}`}
                            className="hidden sm:flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium"
                          >
                            {t('categories.viewAll')}
                            <ChevronRightIcon className="w-4 h-4 ml-1" />
                          </Link>
                        </div>

                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white/90 to-transparent dark:from-gray-900/90 hidden sm:block" />
                          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/90 to-transparent dark:from-gray-900/90 hidden sm:block" />
                          
                          <div className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 pl-1">
                            <button
                              aria-label="Scroll left"
                              onClick={() => scrollRow(rowId, -1)}
                              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-sky-600 hover:bg-blue-600 text-white border border-sky-700/40"
                            >
                              <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 pr-1">
                            <button
                              aria-label="Scroll right"
                              onClick={() => scrollRow(rowId, 1)}
                              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-sky-600 hover:bg-blue-600 text-white border border-sky-700/40"
                            >
                              <ChevronRightIcon className="w-5 h-5" />
                            </button>
                          </div>

                          <div id={rowId} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                            {isRowLoading && products.length === 0 && (
                              Array.from({ length: 4 }).map((__, i) => (
                                <div key={`prod-sk-${i}`} className="min-w-[260px] max-w-[260px] snap-start bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/10 dark:border-gray-700/10 rounded-2xl shadow">
                                  <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
                                  <div className="p-4">
                                    <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                  </div>
                                </div>
                              ))
                            )}
                            {products.map((p) => (
                              <Link
                                key={p.id || p._id}
                                to={`/products/${p.id || p._id}`}
                                className="min-w-[260px] max-w-[260px] snap-start bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow hover:shadow-lg transition-all group"
                              >
                                <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-700">
                                  <img 
                                    src={p.images?.[0] || p.image?.url || '/placeholder-product.svg'} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                  />
                                </div>
                                <div className="p-4">
                                  <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                    {p.name}
                                  </h3>
                                  <div className="flex items-center justify-between">
                                    <div className="text-sky-600 dark:text-sky-400 font-bold">
                                      {formatPrice(p.price || 0)}
                                    </div>
                                    {p.rating && (
                                      <div className="flex items-center">
                                        <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          {p.rating.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                            {!isRowLoading && products.length === 0 && (
                              <div className="w-full min-h-[120px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                {t('categories.noProductsInCategory', { defaultValue: 'No products found in this category' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {!loading && !error && categories.length > 0 && (
                    <div className="flex items-center justify-center gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setPage(Math.max(1, page - 1))} 
                        disabled={page === 1}
                      >
                        {t('common.previous')}
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {page} / {totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        onClick={() => setPage(Math.min(totalPages, page + 1))} 
                        disabled={page === totalPages}
                      >
                        {t('common.next')}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Packages Tab */}
              {activeTab === 'packages' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('packages.packages')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('packages.subtitle')}
                    </p>
                  </div>

                  {loadingPackages ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={`pkg-sk-${i}`} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 mr-4 animate-pulse" />
                            <div>
                              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : packages.length === 0 ? (
                    <div className="text-center py-12">
                      <GiftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">{t('packages.noPackages', 'No packages available right now')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {packages.map((pkg) => (
                        <div key={pkg.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6 hover:shadow-xl transition-all group">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                              <GiftIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {pkg.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {Array.isArray(pkg.items) ? pkg.items.length : 0} {t('products.title')}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {pkg.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {formatPrice(pkg.packagePrice || 0)}
                            </div>
                            {pkg.discountPercentage > 0 && (
                              <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                                -{pkg.discountPercentage}%
                              </div>
                            )}
                          </div>
                          
                          <Button className="w-full">
                            {t('packages.viewPackage')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Discounts Tab */}
              {activeTab === 'discounts' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('packages.discountedProducts')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('packages.discountsSubtitle')}
                    </p>
                  </div>

                  {loadingDiscounts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={`disc-sk-${i}`} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg">
                          <div className="aspect-square w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
                          <div className="p-4">
                            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                            <div className="flex items-center justify-between">
                              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : discountedProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <FireIconSolid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">{t('packages.noDiscounted', 'No discounted products right now')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {discountedProducts.map((product) => {
                        const discountPercentage = getDiscountPercentage(product.compareAtPrice, product.price);
                        return (
                          <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all group"
                          >
                            <div className="relative">
                              <div className="aspect-square w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-700">
                                <img 
                                  src={product.images?.[0] || product.image?.url || '/placeholder-product.svg'} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                              </div>
                              {discountPercentage > 0 && (
                                <div className="absolute top-3 left-3">
                                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
                                    <FireIconSolid className="w-4 h-4 mr-1" />
                                    -{discountPercentage}%
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                {product.name}
                              </h3>
                              
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  {product.rating && (
                                    <>
                                      <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {product.rating.toFixed(1)}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {product.reviewCount || 0} {t('products.reviews')}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                  {formatPrice(product.price || 0)}
                                </div>
                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                  <div className="text-sm line-through text-gray-400">
                                    {formatPrice(product.compareAtPrice)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;