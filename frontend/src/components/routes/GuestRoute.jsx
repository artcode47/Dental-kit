import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const GuestRoute = ({ 
  children, 
  redirectTo = '/',
  fallback = null 
}) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    let redirectPath = redirectTo;
    // Redirect to role-specific landing pages that actually exist
    if (userRole === 'admin' || userRole === 'super_admin') {
      redirectPath = '/admin/dashboard';
    } else if (userRole === 'vendor') {
      redirectPath = '/vendor/dashboard';
    } else {
      redirectPath = '/profile';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default GuestRoute; 