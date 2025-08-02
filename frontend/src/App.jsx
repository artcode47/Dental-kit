import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import ErrorBoundary from './components/ErrorBoundary';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Routes
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import VendorRoute from './components/routes/VendorRoute';
import GuestRoute from './components/routes/GuestRoute';

// Pages (to be created)
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import VerifyEmailSentPage from './pages/auth/VerifyEmailSentPage';
import MFALoginPage from './pages/auth/MFALoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminVendorsPage from './pages/admin/AdminVendorsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminGiftCardsPage from './pages/admin/AdminGiftCardsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Vendor Pages
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import VendorProductsPage from './pages/vendor/VendorProductsPage';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage';

// Create a client with enhanced error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        console.error('Query error:', error);
      }
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <ThemeProvider>
              <AuthProvider>
                <CartProvider>
                  <Router>
                    <div className="App">
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={
                          <Layout>
                            <HomePage />
                          </Layout>
                        } />
                        
                        <Route path="/products" element={
                          <Layout>
                            <ProductsPage />
                          </Layout>
                        } />
                        
                        <Route path="/products/:id" element={
                          <Layout>
                            <ProductDetailsPage />
                          </Layout>
                        } />
                        
                        <Route path="/cart" element={
                          <Layout>
                            <CartPage />
                          </Layout>
                        } />
                        
                        {/* Auth Routes */}
                        <Route path="/login" element={
                          <GuestRoute>
                            <Layout showHeader={false} showFooter={false}>
                              <LoginPage />
                            </Layout>
                          </GuestRoute>
                        } />
                        
                        <Route path="/register" element={
                          <GuestRoute>
                            <Layout showHeader={false} showFooter={false}>
                              <RegisterPage />
                            </Layout>
                          </GuestRoute>
                        } />
                        
                        <Route path="/forgot-password" element={
                          <GuestRoute>
                            <Layout showHeader={false} showFooter={false}>
                              <ForgotPasswordPage />
                            </Layout>
                          </GuestRoute>
                        } />
                        
                        <Route path="/reset-password" element={
                          <GuestRoute>
                            <Layout showHeader={false} showFooter={false}>
                              <ResetPasswordPage />
                            </Layout>
                          </GuestRoute>
                        } />
                        
                        <Route path="/verify-email" element={
                          <GuestRoute>
                            <Layout showHeader={false} showFooter={false}>
                              <VerifyEmailPage />
                            </Layout>
                          </GuestRoute>
                        } />
                        
                        <Route path="/verify-email-sent" element={
                          <GuestRoute>
                            <Layout showHeader={false} showFooter={false}>
                              <VerifyEmailSentPage />
                            </Layout>
                          </GuestRoute>
                        } />
                        
                        <Route path="/mfa-login" element={
                          <GuestRoute>
                            <Layout showHeader={false} showFooter={false}>
                              <MFALoginPage />
                            </Layout>
                          </GuestRoute>
                        } />
                        
                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <Layout showSidebar={true}>
                              <DashboardPage />
                            </Layout>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/profile" element={
                          <ProtectedRoute>
                            <Layout>
                              <ProfilePage />
                            </Layout>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/checkout" element={
                          <ProtectedRoute>
                            <Layout>
                              <CheckoutPage />
                            </Layout>
                          </ProtectedRoute>
                        } />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={
                          <AdminRoute>
                            <AdminDashboardPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/dashboard" element={
                          <AdminRoute>
                            <AdminDashboardPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/users" element={
                          <AdminRoute>
                            <AdminUsersPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/products" element={
                          <AdminRoute>
                            <AdminProductsPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/orders" element={
                          <AdminRoute>
                            <AdminOrdersPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/categories" element={
                          <AdminRoute>
                            <AdminCategoriesPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/vendors" element={
                          <AdminRoute>
                            <AdminVendorsPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/reviews" element={
                          <AdminRoute>
                            <AdminReviewsPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/coupons" element={
                          <AdminRoute>
                            <AdminCouponsPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/gift-cards" element={
                          <AdminRoute>
                            <AdminGiftCardsPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/analytics" element={
                          <AdminRoute>
                            <AdminAnalyticsPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/reports" element={
                          <AdminRoute>
                            <AdminReportsPage />
                          </AdminRoute>
                        } />
                        
                        <Route path="/admin/settings" element={
                          <AdminRoute>
                            <AdminSettingsPage />
                          </AdminRoute>
                        } />
                        
                        {/* Vendor Routes */}
                        <Route path="/vendor" element={
                          <VendorRoute>
                            <VendorDashboardPage />
                          </VendorRoute>
                        } />
                        
                        <Route path="/vendor/dashboard" element={
                          <VendorRoute>
                            <VendorDashboardPage />
                          </VendorRoute>
                        } />
                        
                        <Route path="/vendor/products" element={
                          <VendorRoute>
                            <VendorProductsPage />
                          </VendorRoute>
                        } />
                        
                        <Route path="/vendor/orders" element={
                          <VendorRoute>
                            <VendorOrdersPage />
                          </VendorRoute>
                        } />
                        
                        {/* Error Routes */}
                        <Route path="/unauthorized" element={
                          <Layout>
                            <UnauthorizedPage />
                          </Layout>
                        } />
                        
                        <Route path="*" element={
                          <Layout>
                            <NotFoundPage />
                          </Layout>
                        } />
                      </Routes>
                      
                      {/* Global Toast Notifications */}
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          style: {
                            background: '#363636',
                            color: '#fff',
                          },
                          success: {
                            duration: 3000,
                            iconTheme: {
                              primary: '#10B981',
                              secondary: '#fff',
                            },
                          },
                          error: {
                            duration: 5000,
                            iconTheme: {
                              primary: '#EF4444',
                              secondary: '#fff',
                            },
                          },
                        }}
                      />
                    </div>
                  </Router>
                </CartProvider>
              </AuthProvider>
            </ThemeProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;