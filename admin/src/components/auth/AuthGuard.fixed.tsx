import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated, user, isHydrated, loadUser } = useAuthStore();

  useEffect(() => {
    // Only try to load user if hydrated and not authenticated
    if (isHydrated && !isAuthenticated) {
      const token = localStorage.getItem('access_token');
      if (token) {
        console.log('[AuthGuard] Token found, loading user...');
        loadUser();
      }
    }
  }, [isHydrated, isAuthenticated, loadUser]);

  // Wait for the store to be hydrated from localStorage
  if (!isHydrated) {
    console.log('[AuthGuard] Waiting for hydration...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  // Check token existence as backup
  const token = localStorage.getItem('access_token');
  
  // Check if user is authenticated
  if (!isAuthenticated && !token) {
    console.log('[AuthGuard] Not authenticated, redirecting to login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRole && user?.role !== requiredRole) {
    console.log('[AuthGuard] Insufficient role, redirecting...');
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
