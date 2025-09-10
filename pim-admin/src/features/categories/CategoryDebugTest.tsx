import React, { useState } from 'react';
import categoryService from '../../services/category.service';

const CategoryDebugTest: React.FC = () => {
  const [name, setName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = {
        name: name,
        description: 'Test category from debug component',
        isVisible: true,
        showInMenu: false,
        isFeatured: false,
      };

      console.log('Submitting data:', data);
      const response = await categoryService.createCategory(data);
      console.log('Response:', response);
      
      setResult(response);
      setName(''); // Clear form
    } catch (err: any) {
      console.error('Error:', err);
      console.error('Error response:', err.response);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Category Creation Debug Test</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Category Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter category name"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !name}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>

      {/* Success Result */}
      {result && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Success!</h3>
          <p className="text-sm text-green-700 mb-2">{result.message}</p>
          <pre className="text-xs bg-white p-2 rounded overflow-auto">
            {JSON.stringify(result.item, null, 2)}
          </pre>
        </div>
      )}

      {/* Error Result */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error!</h3>
          <p className="text-sm text-red-700 mb-2">
            {error.response?.data?.message || error.message || 'Unknown error'}
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-red-600">View full error</summary>
            <pre className="text-xs bg-white p-2 rounded overflow-auto mt-2">
              {JSON.stringify(error.response?.data || error, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Debug Information</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Backend URL: http://localhost:3010/api/v1</li>
          <li>• Endpoint: POST /categories</li>
          <li>• Token: {localStorage.getItem('access_token') ? 'Present' : 'Missing'}</li>
          <li>• Check browser console for detailed logs</li>
        </ul>
      </div>
    </div>
  );
};

export default CategoryDebugTest;
