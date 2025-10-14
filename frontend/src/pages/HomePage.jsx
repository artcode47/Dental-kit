import React, { useState, useEffect, useRef } from 'react';
import Seo from '../components/seo/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  TruckIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';
import AnimatedSection from '../components/animations/AnimatedSection';
import StaggeredAnimation from '../components/animations/StaggeredAnimation';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { getFirstImageUrl } from '../utils/imageUtils';
import { getCategoryIcon } from '../utils/categoryIcons';

const HomePage = () => {
  const { t } = useTranslation('ecommerce');
  const { currentLanguage } = useLanguage();
  const { currentTheme } = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [wishlistSet, setWishlistSet] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [, setLoading] = useState(true);
  const categoriesRef = useRef(null);
  const featuredRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse, wishlistResponse] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/categories?limit=12'),
          api.get('/wishlist').catch(() => ({ data: {} }))
        ]);
        
        setFeaturedProducts(productsResponse.data.products || []);
        setCategories(categoriesResponse.data.categories || []);
        const items = wishlistResponse.data?.items || wishlistResponse.data?.wishlist?.items || [];
        setWishlistSet(new Set(items.map(it => it.productId)));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      toast.success(t('cart.added'));
    } catch {
      toast.error(t('cart.error.add'));
    }
  };

  const handleWishlist = async (productId) => {
    try {
      const { data } = await api.post('/wishlist/toggle', { productId });
      setWishlistSet(prev => {
        const next = new Set(prev);
        if (data?.inWishlist) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
      toast.success(data?.action === 'added' ? t('wishlist.added') : t('wishlist.removed'));
    } catch {
      toast.error(t('wishlist.error.add'));
    }
  };

  const features = [
    {
      icon: ShieldCheckIcon,
      title: t('home.features.premiumQuality.title'),
      description: t('home.features.premiumQuality.description')
    },
    {
      icon: TruckIcon,
      title: t('home.features.fastShipping.title'),
      description: t('home.features.fastShipping.description')
    },
    {
      icon: ClockIcon,
      title: t('home.features.support.title'),
      description: t('home.features.support.description')
    },
    {
      icon: UserGroupIcon,
      title: t('home.features.expertTeam.title'),
      description: t('home.features.expertTeam.description')
    }
  ];

  const testimonials = [
    {
      name: t('home.testimonials.drSarah.name'),
      role: t('home.testimonials.drSarah.role'),
      content: t('home.testimonials.drSarah.content'),
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: t('home.testimonials.drMichael.name'),
      role: t('home.testimonials.drMichael.role'),
      content: t('home.testimonials.drMichael.content'),
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: t('home.testimonials.drEmily.name'),
      role: t('home.testimonials.drEmily.role'),
      content: t('home.testimonials.drEmily.content'),
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <Seo
        title={t('seo.home.title', 'DentalKit - Premium Dental Supplies')}
        description={t('seo.home.description', 'Discover cutting-edge dental equipment and supplies')}
        type="website"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={currentTheme === 'dark' ? '#0B1220' : '#FFFFFF'}
      />
      
      {/* Features Section - Why Choose Dental Kit */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
              {t('home.features.subtitle')}
            </p>
          </AnimatedSection>
          
          <StaggeredAnimation staggerDelay={200} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('home.categories.title')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-4">
              {t('home.categories.subtitle')}
            </p>
          </AnimatedSection>
          
          <div className="relative">
            <div ref={categoriesRef} className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <Link
                    key={category._id || category.id}
                    to={`/products?category=${category._id || category.id}`}
                    className="group block snap-start w-[280px] sm:w-[300px] min-w-[280px] sm:min-w-[300px] max-w-[280px] sm:max-w-[300px]"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 h-[240px] sm:h-[260px] flex flex-col">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                        {Icon ? <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" /> : (
                          <span className="text-xl font-bold text-white">{(category.name || '?').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {category.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2">
                        {category.description || t('home.categories.defaultDescription')}
                      </p>
                      <div className="mt-auto flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base">
                        {t('home.categories.explore')}
                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('home.featured.title')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-4">
              {t('home.featured.subtitle')}
            </p>
          </AnimatedSection>
          
          {/* Featured Products Grid */}
          <div className="relative">
            <div ref={featuredRef} className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {featuredProducts.map((product) => (
                <div key={product.id || product._id} className="group snap-start w-[280px] sm:w-[300px] min-w-[280px] sm:min-w-[300px] max-w-[280px] sm:max-w-[300px]">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={getFirstImageUrl(product.images)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                      {/* Discount Badge */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="p-4 sm:p-6">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/products/${product.id || product._id}`}>
                        {product.name}
                      </h3>
                      {product.brand && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                          {product.brand}
                        </p>
                      )}
                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`w-4 h-4 ${
                                i < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-2">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                      {/* Price */}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">${product.price?.toFixed(2)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs sm:text-sm line-through text-gray-400">${product.originalPrice?.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatedSection animation="fadeInUp" delay={300} className="text-center mt-6 sm:mt-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4"
              onClick={() => window.location.href = '/products'}
            >
              {t('home.featured.viewAll')}
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-4">
              {t('home.testimonials.subtitle')}
            </p>
          </AnimatedSection>
          
          <StaggeredAnimation staggerDelay={200} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4"
                  />
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIconSolid key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-8 pb-4 sm:pt-12 sm:pb-6 lg:pt-16 lg:pb-8 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection animation="fadeInUp" className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                onClick={() => window.location.href = '/products'}
              >
                {t('home.cta.getStarted')}
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
              >
                {t('home.cta.contactSales')}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default HomePage;