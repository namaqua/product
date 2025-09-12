import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

// Import debug utility
import './utils/debug-auth';
import { RouteDebugger } from './utils/RouteDebugger';

// Auth components
import Login from './components/auth/Login';
import AuthGuard from './components/auth/AuthGuard';

// Layout
import ApplicationShell from './components/layouts/ApplicationShell';

// Features
import Dashboard from './features/dashboard/Dashboard';
import ProductDashboard from './features/product-dashboard/ProductDashboard';
import ProductList from './features/products/ProductList';
import ProductCreate from './features/products/ProductCreate';
import ProductEdit from './features/products/ProductEdit';
import ProductDetails from './features/products/ProductDetails';
import CategoryManagement from './features/categories/CategoryManagement';
import AttributeList from './features/attributes/AttributeList';
import AttributeCreate from './features/attributes/AttributeCreate';
import AttributeEdit from './features/attributes/AttributeEdit';
import { AttributeOptions } from './features/attributes/AttributeOptions';
import { AttributeGroups } from './features/attributes/AttributeGroups';
import UserList from './features/users/UserList';
import UserCreate from './features/users/UserCreate';
import UserEdit from './features/users/UserEdit';
import UserProfile from './features/users/UserProfile';
import RoleManager from './features/users/RoleManager';

// Stores
import { useAuthStore } from './stores/auth.store';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Add debugging to window
if (typeof window !== 'undefined') {
  (window as any).checkRoute = () => {
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
  };
}

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  // Debug log route changes
  useEffect(() => {
    console.log('📍 Route changed to:', location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />

      {/* Protected routes with ApplicationShell wrapper */}
      <Route path="/" element={
        <AuthGuard>
          <ApplicationShell />
        </AuthGuard>
      }>
        {/* Dashboard */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Product Engine */}
        <Route path="product-dashboard" element={<ProductDashboard />} />
        
        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductCreate />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="products/:id/edit" element={<ProductEdit />} />
        
        {/* Categories */}
        <Route path="categories" element={<CategoryManagement />} />
        
        {/* Attributes */}
        <Route path="attributes" element={<AttributeList />} />
        <Route path="attributes/new" element={<AttributeCreate />} />
        <Route path="attributes/:id/edit" element={<AttributeEdit />} />
        <Route path="attributes/:id/options" element={<AttributeOptions />} />
        <Route path="attributes/groups" element={<AttributeGroups />} />
        
        {/* Media */}
        <Route path="media" element={
          <div className="p-8">
            <h1 className="text-2xl font-bold">Media Library</h1>
            <p className="mt-2 text-gray-600">Media management coming soon...</p>
          </div>
        } />
        
        {/* Workflows */}
        <Route path="workflows" element={
          <div className="p-8">
            <h1 className="text-2xl font-bold">Workflows</h1>
            <p className="mt-2 text-gray-600">Workflow management coming soon...</p>
          </div>
        } />
        
        {/* Import/Export */}
        <Route path="import-export" element={
          <div className="p-8">
            <h1 className="text-2xl font-bold">Import/Export</h1>
            <p className="mt-2 text-gray-600">Bulk import/export coming soon...</p>
          </div>
        } />
        
        {/* Channels */}
        <Route path="channels" element={
          <div className="p-8">
            <h1 className="text-2xl font-bold">Channels</h1>
            <p className="mt-2 text-gray-600">Channel management coming soon...</p>
          </div>
        } />
        
        {/* Users */}
        <Route path="users" element={<UserList />} />
        <Route path="users/new" element={<UserCreate />} />
        <Route path="users/:id" element={<UserProfile />} />
        <Route path="users/:id/edit" element={<UserEdit />} />
        <Route path="users/roles" element={<RoleManager />} />
        
        {/* Settings */}
        <Route path="settings" element={
          <div className="p-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold mb-4">System Settings</h1>
              <p className="text-gray-600">Settings configuration coming soon...</p>
              <div className="mt-6 p-4 bg-yellow-50 rounded">
                <p className="text-sm text-yellow-800">
                  This page will allow you to configure system settings, integrations, and preferences.
                </p>
              </div>
            </div>
          </div>
        } />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  // Log when component mounts
  useEffect(() => {
    console.log('🚀 App mounted', { isAuthenticated, isHydrated });
  }, []);

  // Wait for auth store to hydrate
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <RouteDebugger />
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
