import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// This component will help diagnose routing issues
export default function RouteDiagnostic() {
  const location = useLocation();
  const params = useParams();
  const [componentName, setComponentName] = useState('Detecting...');
  
  useEffect(() => {
    // Determine which component is likely rendered based on the path
    const path = location.pathname;
    
    if (path === '/' || path === '/dashboard') {
      setComponentName('Dashboard');
    } else if (path === '/products') {
      setComponentName('ProductList');
    } else if (path === '/products/new') {
      setComponentName('ProductCreate');
    } else if (path.startsWith('/products/') && path.endsWith('/edit')) {
      setComponentName('ProductEdit');
    } else if (path.startsWith('/products/')) {
      setComponentName('ProductDetails');
    } else if (path === '/categories') {
      setComponentName('CategoryManagement');
    } else if (path === '/attributes') {
      setComponentName('Attributes');
    } else if (path === '/users') {
      setComponentName('Users');
    } else if (path === '/settings') {
      setComponentName('Settings');
    } else if (path === '/media') {
      setComponentName('Media');
    } else if (path === '/workflows') {
      setComponentName('Workflows');
    } else if (path === '/import-export') {
      setComponentName('Import/Export');
    } else if (path === '/channels') {
      setComponentName('Channels');
    } else {
      setComponentName('Unknown');
    }
    
    // Log to console for debugging
    console.log('Route Diagnostic - Current location:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      params: params,
      component: componentName
    });
  }, [location, params, componentName]);

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-xl max-w-sm">
      <h3 className="font-bold text-sm mb-2">🔍 Route Diagnostic</h3>
      <div className="text-xs space-y-1">
        <p><strong>Path:</strong> {location.pathname}</p>
        <p><strong>Component:</strong> {componentName}</p>
        {Object.keys(params).length > 0 && (
          <p><strong>Params:</strong> {JSON.stringify(params)}</p>
        )}
        <p><strong>Search:</strong> {location.search || 'none'}</p>
        <p><strong>Hash:</strong> {location.hash || 'none'}</p>
        <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
      </div>
      <div className="mt-2 pt-2 border-t border-blue-500">
        <p className="text-xs opacity-75">
          Click navigation links to change routes
        </p>
      </div>
    </div>
  );
}
