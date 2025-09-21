import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated, user, loadUser } = useAuthStore();

  useEffect(() => {
    // Try to load user if we have a token but no auth state
    if (!isAuthenticated) {
      const token = localStorage.getItem('access_token');
      if (token) {
        console.log('[AuthGuard] Token found, loading user...');
        loadUser();
      }
    }
  }, [isAuthenticated, loadUser]);

  // Check token existence as primary auth check
  const token = localStorage.getItem('access_token');
  
  // If no token and not authenticated, redirect to login
  if (!token && !isAuthenticated) {
    console.log('[AuthGuard] No auth, redirecting to login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRole && user?.role !== requiredRole) {
    console.log('[AuthGuard] Insufficient role, redirecting...');
    return <Navigate to="/unauthorized" replace />;
  }

  // Allow access
  return <>{children}</>;
}
