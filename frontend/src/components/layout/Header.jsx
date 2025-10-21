import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import LanguageSwitcher from '../common/LanguageSwitcher';
import SearchBar from '../common/SearchBar';
import CartBadge from '../cart/CartBadge';
// NotificationBell removed per requirement to stop notification calls

const Header = () => {
  const { t } = useTranslation('ecommerce');
  const { isAuthenticated, user, logout } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setIsUserMenuOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setIsMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const logoSrc = currentTheme === 'dark' ? '/Logo Page Darkmode.png' : '/Logo Page Lightmode.png';

  const navItems = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.products'), to: '/products' },
    { label: t('nav.categories'), to: '/categories' }
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 w-full ${
        isScrolled ? 'bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur supports-[backdrop-filter]:backdrop-blur' : 'bg-white/80 dark:bg-gray-900/80'
      } border-b border-transparent`}
      >
        <div className="w-full px-3 xs:px-3 sm:px-4">
          <div className="mx-auto w-full max-w-[100%] sm:max-w-7xl">
            <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
              <div>
                <Link to="/" className="flex items-center min-w-0 gap-2 group">
                  <img src={logoSrc} alt="Dental Kit" className="h-8 w-auto sm:h-10 group-hover:scale-105 transition-transform duration-200" />
                  <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 truncate">{t('brand.tagline')}</span>
                </Link>
              </div>

              <div className="hidden lg:flex">
                <nav className="flex items-center gap-1">
                  {navItems.map((item) => (
                    <Link 
                      key={item.to} 
                      to={item.to} 
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110 transition-all duration-200" aria-label={t('nav.search')}>
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>

                  <Link to="/wishlist" className="hidden md:inline-flex p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110 transition-all duration-200" aria-label={t('nav.wishlist')}>
                    <HeartIcon className="h-5 w-5" />
                  </Link>

                  {/* Notifications removed */}

                  <CartBadge />

                  <span className="hidden lg:inline">
                    <LanguageSwitcher variant="button" />
                  </span>

                  <button onClick={toggleTheme} className="p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700/60 hover:scale-110 transition-all duration-200" aria-label={currentTheme === 'dark' ? t('nav.switchToLight') : t('nav.switchToDark')}>
                    {currentTheme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                  </button>

                {isAuthenticated ? (
                  <div className="relative hidden md:block" ref={userMenuRef}>
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl z-[9999]">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.firstName || user?.email?.split('@')[0] || 'User'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">{t('nav.profile')}</Link>
                          <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">{t('nav.orders')}</Link>
                          <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">{t('nav.wishlist')}</Link>
                          
                          {/* Dashboard Navigation */}
                          {user?.role === 'admin' && (
                            <Link 
                              to="/admin/dashboard" 
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <ShieldCheckIcon className="h-4 w-4 mr-2 text-teal-600" />
                              Admin Dashboard
                            </Link>
                          )}
                          {user?.role === 'vendor' && (
                            <Link 
                              to="/vendor/dashboard" 
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <BuildingStorefrontIcon className="h-4 w-4 mr-2 text-blue-600" />
                              Vendor Dashboard
                            </Link>
                          )}
                          
                          {/* Settings removed from nav */}
                          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">{t('nav.logout')}</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link to="/login" className="px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700/60">{t('nav.login')}</Link>
                    <Link to="/register" className="px-3 py-2 text-sm text-white rounded-md bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow">
                      {t('nav.register')}
                    </Link>
                  </div>
                )}

                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700/60 hover:scale-110 transition-all duration-200" aria-label="Menu" aria-expanded={isMobileMenuOpen} aria-controls="mobile-menu">
                    {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {isSearchOpen && (
            <div className="w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3">
              <div className="mx-auto w-full max-w-[100%] sm:max-w-7xl px-3 xs:px-3 sm:px-4">
                <SearchBar onClose={() => setIsSearchOpen(false)} />
              </div>
            </div>
          )}
        </div>
      </header>

      {isMobileMenuOpen && (
        <div id="mobile-menu" ref={mobileMenuRef} className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)} />
          <div className={`absolute right-0 top-0 h-full w-[88vw] max-w-[380px] bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-sky-500 to-blue-600 text-white">
              <span className="text-sm font-semibold">{t('nav.menu')}</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md hover:bg-white/10">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="text-xs mb-2 text-gray-500 dark:text-gray-400">{t('language') || 'Language'}</div>
              <LanguageSwitcher variant="button" />
            </div>

            <nav className="p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <div className="mt-2 h-px bg-gray-200 dark:bg-gray-700" />
                  <Link to="/profile" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.profile')}</Link>
                  <Link to="/orders" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.orders')}</Link>
                  <Link to="/wishlist" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.wishlist')}</Link>
                  
                  {/* Dashboard Navigation for Mobile */}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin/dashboard" 
                      className="flex items-center px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShieldCheckIcon className="h-4 w-4 mr-2 text-teal-600" />
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === 'vendor' && (
                    <Link 
                      to="/vendor/dashboard" 
                      className="flex items-center px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BuildingStorefrontIcon className="h-4 w-4 mr-2 text-blue-600" />
                      Vendor Dashboard
                    </Link>
                  )}
                  
                  {/* Settings removed from mobile nav */}
                  <button onClick={handleLogout} className="w-full text-left px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm">{t('nav.logout')}</button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link to="/login" className="px-3 py-2 rounded-md text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.login')}</Link>
                  <Link to="/register" className="px-3 py-2 rounded-md text-center text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-sm" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.register')}</Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;