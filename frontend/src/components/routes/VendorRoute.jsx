import React from 'react';
import ProtectedRoute from './ProtectedRoute';

const VendorRoute = ({ children, fallback = null }) => {
  return (
    <ProtectedRoute
      requiredRoles={['vendor', 'admin', 'super_admin']}
      redirectTo="/unauthorized"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

export default VendorRoute;