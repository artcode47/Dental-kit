import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiHelpers, endpoints } from '../services/api';

const PackagesAndDiscountsPage = () => {
  const { t } = useTranslation('ecommerce');
  const [packages, setPackages] = useState([]);
  const [discounted, setDiscounted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiHelpers.get(endpoints.packages.combined);
        setPackages(res.packages || []);
        setDiscounted(res.discountedProducts || []);
      } catch (_) {
        setPackages([]);
        setDiscounted([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('packages.title')}</h1>
      {loading ? (
        <div>{t('common.loading')}</div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3">{t('packages.packages')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map(pkg => (
                <div key={pkg.id} className="border rounded p-4">
                  <div className="font-medium text-lg">{pkg.name}</div>
                  <div className="text-sm text-gray-500 mb-2">{pkg.description}</div>
                  <div className="text-sm mb-1">{t('packages.packages')}: {Array.isArray(pkg.items) ? pkg.items.length : 0}</div>
                  <div className="text-sm mb-1">{t('products.price')}: ${(pkg.packagePrice || 0).toFixed(2)}</div>
                  <div className="text-sm font-semibold text-green-700">{t('products.badges.sale', { percentage: pkg.discountPercentage || 0 })}</div>
                </div>
              ))}
              {packages.length === 0 && (
                <div className="text-gray-500">{t('packages.noPackages')}</div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('packages.discountedProducts')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounted.map(p => (
                <div key={p.id} className="border rounded p-4">
                  <div className="font-medium text-lg">{p.name}</div>
                  {p.compareAtPrice && p.price && p.compareAtPrice > p.price ? (
                    <div className="text-sm">
                      <span className="line-through mr-2 text-gray-500">${p.compareAtPrice.toFixed(2)}</span>
                      <span className="text-green-700 font-semibold">${p.price.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="text-sm">${(p.price || 0).toFixed(2)}</div>
                  )}
                </div>
              ))}
              {discounted.length === 0 && (
                <div className="text-gray-500">{t('packages.noDiscounted')}</div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default PackagesAndDiscountsPage;


