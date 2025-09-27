import React, { useState, useEffect } from 'react';
import Seo from '../components/seo/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShieldCheckIcon,
  TruckIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  FireIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';
import AnimatedSection from '../components/animations/AnimatedSection';
import StaggeredAnimation from '../components/animations/StaggeredAnimation';
import useParallax from '../hooks/useParallax';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { getFirstImageUrl } from '../utils/imageUtils';

const HomePage = () => {
  const { t } = useTranslation('ecommerce');
  const { currentLanguage } = useLanguage();
  const { currentTheme } = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [wishlistSet, setWishlistSet] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [, setLoading] = useState(true);
  const parallaxOffset = useParallax(0.3);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse, wishlistResponse] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/categories?limit=6'),
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const stats = [
    { icon: UserGroupIcon, value: '10K+', label: t('home.stats.happyCustomers') },
    { icon: CheckCircleIcon, value: '99%', label: t('home.stats.satisfactionRate') },
    { icon: TruckIcon, value: '24/7', label: t('home.stats.fastDelivery') },
    { icon: ShieldCheckIcon, value: '100%', label: t('home.stats.qualityGuaranteed') }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <Seo
        title={t('seo.home.title', 'DentalKit - Premium Dental Supplies')}
        description={t('seo.home.description', 'Discover cutting-edge dental equipment and supplies')}
        type="website"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={currentTheme === 'dark' ? '#0B1220' : '#FFFFFF'}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
              style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
            ></div>
            <div 
              className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
              style={{ transform: `translateY(${-parallaxOffset * 0.3}px)` }}
            ></div>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fadeInUp" delay={0}>
            <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 animate-pulse">
                <SparklesIcon className="w-4 h-4 mr-2" />
                {t('home.hero.badge')}
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                {t('home.hero.mainTitle')}
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {t('home.hero.mainTitleHighlight')}
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                {t('home.hero.description')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
                  onClick={() => window.location.href = '/products'}
                >
                  {t('home.hero.exploreProducts')}
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  {t('home.hero.watchDemo')}
                </Button>
              </div>
            </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeInUp" delay={200}>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <StaggeredAnimation staggerDelay={150} className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-white/10 rounded-xl">
                      <stat.icon className="w-8 h-8 text-white mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-blue-100">{stat.label}</div>
                    </div>
                  ))}
                  </StaggeredAnimation>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </AnimatedSection>
          
          <StaggeredAnimation staggerDelay={200} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.categories.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('home.categories.subtitle')}
            </p>
          </AnimatedSection>
          
          <StaggeredAnimation staggerDelay={150} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="group block"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-white">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {category.description || t('home.categories.defaultDescription')}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    {t('home.categories.explore')}
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.featured.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('home.featured.subtitle')}
            </p>
          </AnimatedSection>
          
          <StaggeredAnimation staggerDelay={100} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id || product._id} className="group">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={getFirstImageUrl(product.images)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    
                    {/* Action Buttons - visible on mobile/tablet, hover-revealed on desktop */}
                    <div className="absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleWishlist(product.id || product._id)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                        aria-label={wishlistSet.has(product.id || product._id) ? t('products.card.removeFromWishlist') : t('products.card.addToWishlist')}
                      >
                        {wishlistSet.has(product.id || product._id) ? (
                          <HeartIconSolid className="w-5 h-5 text-red-500" />
                        ) : (
                          <HeartIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                    
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
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/products/${product.id || product._id}`}>
                      {product.name}
                    </h3>
                    
                    {product.brand && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Add to Cart Button */}
                    <Button
                      onClick={() => handleAddToCart(product.id || product._id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                    >
                      <ShoppingCartIcon className="w-5 h-5 mr-2" />
                      {t('home.featured.addToCart')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </StaggeredAnimation>
          
          <AnimatedSection animation="fadeInUp" delay={300} className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4"
              onClick={() => window.location.href = '/products'}
            >
              {t('home.featured.viewAll')}
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('home.testimonials.subtitle')}
            </p>
          </AnimatedSection>
          
          <StaggeredAnimation staggerDelay={200} className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection animation="fadeInUp" className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
              onClick={() => window.location.href = '/products'}
            >
              {t('home.cta.getStarted')}
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg"
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
