import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import debug utility (keeping for console debugging only)
import './utils/debug-auth';

// Auth components
import Login from './components/auth/Login';
import AuthGuard from './components/auth/AuthGuard';

// Layout
import ApplicationShell from './components/layouts/ApplicationShell';

// Features
import Dashboard from './features/dashboard/Dashboard';
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

function App() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  // Wait for auth store to hydrate before rendering routes
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />

          {/* Protected routes - Proper nested structure */}
          <Route path="/" element={
            <AuthGuard>
              <ApplicationShell />
            </AuthGuard>
          }>
            {/* These are child routes of ApplicationShell - they render in <Outlet /> */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductCreate />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="products/:id/edit" element={<ProductEdit />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="attributes" element={<AttributeList />} />
            <Route path="attributes/new" element={<AttributeCreate />} />
            <Route path="attributes/:id/edit" element={<AttributeEdit />} />
            <Route path="attributes/:id/options" element={<AttributeOptions />} />
            <Route path="attributes/groups" element={<AttributeGroups />} />
            <Route path="media" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold">Media Library</h1>
                <p className="mt-2 text-gray-600">Media management coming soon...</p>
              </div>
            } />
            <Route path="workflows" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold">Workflows</h1>
                <p className="mt-2 text-gray-600">Workflow management coming soon...</p>
              </div>
            } />
            <Route path="import-export" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold">Import/Export</h1>
                <p className="mt-2 text-gray-600">Bulk import/export coming soon...</p>
              </div>
            } />
            <Route path="channels" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold">Channels</h1>
                <p className="mt-2 text-gray-600">Channel management coming soon...</p>
              </div>
            } />
            <Route path="users" element={
              <div className="p-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h1 className="text-2xl font-bold mb-4">User Management</h1>
                  <p className="text-gray-600">User management interface coming soon...</p>
                  <div className="mt-6 p-4 bg-green-50 rounded">
                    <p className="text-sm text-green-800">
                      This page will allow you to manage users, roles, and permissions.
                    </p>
                  </div>
                </div>
              </div>
            } />
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
