import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductList() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('ProductList component mounted');
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-gray-600">Debug version - checking if component loads</p>
      </div>
      
      <div className="bg-white p-6 rounded shadow">
        <p>If you can see this, the component is loading!</p>
        <button 
          onClick={() => navigate('/products/new')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">Debug Info:</p>
        <ul className="text-xs mt-2">
          <li>Component: ProductList</li>
          <li>Path: /products</li>
          <li>Time: {new Date().toLocaleTimeString()}</li>
        </ul>
      </div>
    </div>
  );
}
