import React from 'react';
import ProtectedRoute from './ProtectedRoute';

const AdminRoute = ({ children, fallback = null }) => {
  return (
    <ProtectedRoute
      requiredRoles={['admin', 'super_admin']}
      requiredPermissions={['admin_access']}
      redirectTo="/login"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute; 