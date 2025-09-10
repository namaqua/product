import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/product.service';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Fetching products...');
      
      const response = await productService.getProducts({
        page: 1,
        limit: 20,
      });
      
      console.log('✅ Products API Response:', response);
      setDebugInfo(`Response received: ${JSON.stringify(response, null, 2)}`);
      
      if (response && response.items) {
        setProducts(response.items);
        setDebugInfo(`Found ${response.items.length} products`);
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
        setProducts([]);
        setDebugInfo('No items in response');
      }
    } catch (err: any) {
      console.error('❌ Error fetching products:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load products';
      setError(errorMsg);
      setDebugInfo(`Error: ${errorMsg}`);
      
      // Check if it's an auth issue
      if (err.response?.status === 401) {
        setError('Not authenticated. Please login.');
        // Optionally redirect to login
        // navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        await fetchProducts(); // Refresh the list
      } catch (err: any) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const formatPrice = (price: any) => {
    if (!price) return '$0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    let colorClass = 'bg-gray-100 text-gray-800';
    
    if (statusLower === 'published' || statusLower === 'active') {
      colorClass = 'bg-green-100 text-green-800';
    } else if (statusLower === 'draft') {
      colorClass = 'bg-yellow-100 text-yellow-800';
    } else if (statusLower === 'archived') {
      colorClass = 'bg-red-100 text-red-800';
    }
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
        {status}
      </span>
    );
  };

  // Debug panel
  const DebugPanel = () => (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-bold text-blue-800 mb-2">Debug Info:</h3>
      <pre className="text-xs text-blue-700 whitespace-pre-wrap">{debugInfo}</pre>
      <button 
        onClick={fetchProducts}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        Retry Fetch
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <DebugPanel />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <DebugPanel />
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DebugPanel />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-600">
            {products.length > 0 ? `${products.length} products loaded` : 'No products found'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/products/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No products found in the database</p>
          <button 
            onClick={() => navigate('/products/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Your First Product
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.type || 'simple'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.quantity ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
