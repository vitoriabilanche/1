
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading indicator while checking authentication status
    // This prevents the flash of the login page if the user is already logged in
    // but the initial session check hasn't finished.
    return <div className="flex justify-center items-center h-screen">Verificando autenticação...</div>;
  }

  if (!user) {
    // If not loading and no user, redirect to login page
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not loading and user exists, render the children components (the protected route)
  return children;
};

export default ProtectedRoute;
