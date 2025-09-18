import React, { useEffect, useMemo, useState } from 'react';
import Seo from '../components/seo/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import ecommerceService from '../services/ecommerceService';

const PAGE_SIZE = 4;

const CategoriesPage = () => {
  const { t } = useTranslation('ecommerce');
  const { currentLanguage } = useLanguage();
  const { currentTheme } = useTheme();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((categories?.length || 0) / PAGE_SIZE)), [categories]);
  const pagedCategories = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return (categories || []).slice(start, start + PAGE_SIZE);
  }, [categories, page]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await ecommerceService.getCategories();
        if (!active) return;
        const list = res?.categories || res || [];
        setCategories(Array.isArray(list) ? list : []);
      } catch (e) {
        if (active) setError('Failed to load categories');
      } finally {
        if (active) setLoading(false);
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
            const res = await ecommerceService.getProductsByCategory(slug, { limit: 12 });
            const items = res?.products || res || [];
            return { id: slug, items: Array.isArray(items) ? items : [] };
          });
        const results = await Promise.allSettled(queries);
        if (!active) return;
        const next = { ...productsByCategory };
        results.forEach(r => {
          if (r.status === 'fulfilled' && r.value) {
            next[r.value.id] = r.value.items;
          }
        });
        setProductsByCategory(next);
      } finally {
        if (active) setLoadingProducts(false);
      }
    })();
    return () => { active = false; };
  }, [page, pagedCategories]);

  const scrollRow = (containerId, dir = 1) => {
    const el = document.getElementById(containerId);
    if (el) el.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Seo
        title={t('categories.title', 'Categories')}
        description={t('categories.description', 'Browse categories and featured products')}
        type="website"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={currentTheme === 'dark' ? '#0B1220' : '#FFFFFF'}
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 py-14 relative">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('categories.title', 'Categories')}</h1>
          <p className="opacity-90">{t('categories.subtitle', 'Explore our catalog by category')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {loading && (
          <div className="flex items-center justify-center min-h-[300px]"><LoadingSpinner size="lg" /></div>
        )}

        {!loading && error && (
          <div className="max-w-xl mx-auto text-center bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow p-6">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="primary">{t('orders.error.retry')}</Button>
          </div>
        )}

        {!loading && !error && pagedCategories.map((cat) => {
          const slug = cat.slug || cat.id || cat._id;
          const products = productsByCategory[slug] || [];
          const rowId = `cat-row-${slug}`;
          return (
            <section key={id} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{cat.name || cat.title || t('categories.untitled', 'Untitled')}</h2>
                <div className="space-x-2 hidden sm:flex">
                  <Button variant="outline" onClick={() => scrollRow(rowId, -1)}>{t('common.previous')}</Button>
                  <Button variant="outline" onClick={() => scrollRow(rowId, 1)}>{t('common.next')}</Button>
                </div>
              </div>
              <div className="relative">
                <div id={rowId} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {loadingProducts && products.length === 0 && (
                    <div className="flex items-center justify-center w-full min-h-[120px]"><LoadingSpinner /></div>
                  )}
                  {products.map((p) => (
                    <div key={p.id || p._id} className="min-w-[260px] max-w-[260px] snap-start bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow hover:shadow-lg transition-all">
                      <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-700">
                        <img src={p.images?.[0] || p.image?.url || '/placeholder-product.svg'} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{cat.name}</p>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{p.name}</h3>
                        <div className="mt-2 text-indigo-600 dark:text-indigo-400 font-bold">${(p.price || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Pagination controls for categories */}
        {!loading && !error && categories.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>{t('common.previous')}</Button>
            <span className="text-sm text-gray-600 dark:text-gray-300">{page} / {totalPages}</span>
            <Button variant="outline" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>{t('common.next')}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;


