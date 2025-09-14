import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PhotoIcon,
  FilmIcon,
  DocumentTextIcon,
  DocumentIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { MediaListParams } from '../../services/media.service';
import productService from '../../services/product.service';

interface MediaFiltersProps {
  filters: Partial<MediaListParams>;
  onChange: (filters: Partial<MediaListParams>) => void;
  stats: any;
}

export default function MediaFilters({ filters, onChange, stats }: MediaFiltersProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Load products for filter
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productService.getProducts({ limit: 100 });
      if (response.success) {
        setProducts(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleTypeChange = (type: string | undefined) => {
    onChange({ ...filters, type: type as any });
  };

  const handleProductChange = (productId: string | undefined) => {
    onChange({ ...filters, productId });
  };

  const handlePrimaryChange = (isPrimary: boolean | undefined) => {
    onChange({ ...filters, isPrimary });
  };

  const clearFilters = () => {
    onChange({});
  };

  const activeFiltersCount = Object.keys(filters).filter(k => filters[k as keyof typeof filters]).length;

  // Filter products based on search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <h3 className="font-medium text-gray-900">Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Media Type Filter */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Media Type</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              checked={!filters.type}
              onChange={() => handleTypeChange(undefined)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">All Types</span>
            {stats && (
              <span className="ml-auto text-xs text-gray-500">{stats.totalFiles}</span>
            )}
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="image"
              checked={filters.type === 'image'}
              onChange={() => handleTypeChange('image')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <PhotoIcon className="h-4 w-4 ml-2 text-green-500" />
            <span className="ml-1 text-sm text-gray-700">Images</span>
            {stats?.byType?.image && (
              <span className="ml-auto text-xs text-gray-500">{stats.byType.image}</span>
            )}
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="video"
              checked={filters.type === 'video'}
              onChange={() => handleTypeChange('video')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <FilmIcon className="h-4 w-4 ml-2 text-purple-500" />
            <span className="ml-1 text-sm text-gray-700">Videos</span>
            {stats?.byType?.video && (
              <span className="ml-auto text-xs text-gray-500">{stats.byType.video}</span>
            )}
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="document"
              checked={filters.type === 'document'}
              onChange={() => handleTypeChange('document')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <DocumentTextIcon className="h-4 w-4 ml-2 text-blue-500" />
            <span className="ml-1 text-sm text-gray-700">Documents</span>
            {stats?.byType?.document && (
              <span className="ml-auto text-xs text-gray-500">{stats.byType.document}</span>
            )}
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="other"
              checked={filters.type === 'other'}
              onChange={() => handleTypeChange('other')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <DocumentIcon className="h-4 w-4 ml-2 text-gray-500" />
            <span className="ml-1 text-sm text-gray-700">Other</span>
            {stats?.byType?.other && (
              <span className="ml-auto text-xs text-gray-500">{stats.byType.other}</span>
            )}
          </label>
        </div>
      </div>

      {/* Product Association Filter */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Product Association</h4>
        
        {/* Product Search */}
        <input
          type="text"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />

        {/* Product Selection */}
        <div className="space-y-1 max-h-48 overflow-y-auto">
          <label className="flex items-center p-1 hover:bg-gray-50 rounded">
            <input
              type="radio"
              name="product"
              checked={!filters.productId}
              onChange={() => handleProductChange(undefined)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">All Products</span>
          </label>

          {loadingProducts ? (
            <div className="text-sm text-gray-500 text-center py-2">Loading products...</div>
          ) : (
            filteredProducts.map((product) => (
              <label key={product.id} className="flex items-center p-1 hover:bg-gray-50 rounded">
                <input
                  type="radio"
                  name="product"
                  value={product.id}
                  checked={filters.productId === product.id}
                  onChange={() => handleProductChange(product.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 truncate">
                  {product.name}
                </span>
                <span className="ml-1 text-xs text-gray-500">
                  ({product.sku})
                </span>
              </label>
            ))
          )}
        </div>

        {/* Orphaned Media Option */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.productId === 'orphaned'}
              onChange={(e) => handleProductChange(e.target.checked ? 'orphaned' : undefined)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Show orphaned media only</span>
          </label>
        </div>
      </div>

      {/* Primary Media Filter */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Primary Media</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="primary"
              checked={filters.isPrimary === undefined}
              onChange={() => handlePrimaryChange(undefined)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">All Media</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="primary"
              checked={filters.isPrimary === true}
              onChange={() => handlePrimaryChange(true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Primary Only</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="primary"
              checked={filters.isPrimary === false}
              onChange={() => handlePrimaryChange(false)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Non-Primary</span>
          </label>
        </div>
      </div>

      {/* Date Range Filter - Placeholder for future implementation */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Date Range</h4>
        <button className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
          Select date range...
        </button>
      </div>

      {/* File Size Filter - Placeholder for future implementation */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">File Size</h4>
        <div className="text-sm text-gray-500">
          Coming soon...
        </div>
      </div>
    </div>
  );
}
