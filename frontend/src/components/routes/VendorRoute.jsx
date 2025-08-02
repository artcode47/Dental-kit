import React from 'react';
import ProtectedRoute from './ProtectedRoute';

const VendorRoute = ({ children, fallback = null }) => {
  return (
    <ProtectedRoute
      requiredRoles={['vendor', 'admin', 'super_admin']}
      requiredPermissions={['vendor_access']}
      redirectTo="/vendor/login"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

export default VendorRoute; 