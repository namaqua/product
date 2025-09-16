import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import productService from '../../services/product.service';
import BulkCategoryAssignment from '../../components/products/BulkCategoryAssignment';
import CategoryFilter from '../../components/products/CategoryFilter';
import Pagination from '../../components/common/Pagination';
import { Product } from '../../types/api.types';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CubeIcon,
  TagIcon,
  FolderPlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function ProductList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [productVariants, setProductVariants] = useState<Record<string, Product[]>>({});
  const [loadingVariants, setLoadingVariants] = useState<Set<string>>(new Set());
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [filterCategoryIds, setFilterCategoryIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  
  // Pagination state - Initialize from URL params or defaults
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    } else {
      params.delete('page');
    }
    setSearchParams(params, { replace: true });
  }, [currentPage]);

  // Fetch products when dependencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, searchQuery === searchInput ? 0 : 300); // Debounce search
    
    return () => clearTimeout(timer);
  }, [filterCategoryIds, currentPage, searchQuery]);

  // Update checkbox indeterminate state
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const isIndeterminate = selectedProductIds.size > 0 && selectedProductIds.size < products.length;
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedProductIds, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams: any = {
        page: currentPage, 
        limit: itemsPerPage,
        parentId: null, // Only get parent products
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };
      
      // Add search query
      if (searchQuery.trim()) {
        queryParams.search = searchQuery.trim();
      }
      
      // Add category filter
      if (filterCategoryIds.length > 0) {
        queryParams.categoryIds = filterCategoryIds.join(',');
      }
      
      const response = await productService.getProducts(queryParams);
      
      setProducts(response.items);
      
      // Update pagination info
      if (response.meta) {
        setTotalPages(response.meta.totalPages || 1);
        setTotalItems(response.meta.totalItems || response.items.length);
        
        // Reset to page 1 if current page is out of bounds
        if (currentPage > response.meta.totalPages && response.meta.totalPages > 0) {
          setCurrentPage(1);
        }
      }
      
      // Pre-load variant counts for configurable products
      response.items.forEach(async (product: Product) => {
        if (product.type === 'configurable') {
          try {
            const variantsResponse = await productService.getProducts({
              parentId: product.id,
              limit: 100
            });
            if (variantsResponse.items.length > 0) {
              setProductVariants(prev => ({
                ...prev,
                [product.id]: variantsResponse.items
              }));
            }
          } catch (err) {
            console.error(`Failed to load variants for ${product.id}:`, err);
          }
        }
      });
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (value !== searchQuery) {
      setSearchQuery(value);
      setCurrentPage(1); // Reset to first page on search
      clearSelection();
    }
  };

  const handleDelete = async (id: string) => {
    const hasVariants = productVariants[id]?.length > 0;
    const message = hasVariants 
      ? 'This product has variants. Are you sure you want to delete it? The variants will need to be deleted separately.'
      : 'Are you sure you want to delete this product? This action cannot be undone.';
      
    if (confirm(message)) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err: any) {
        console.error('Error deleting product:', err);
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await productService.duplicateProduct(id);
      navigate(`/products/${duplicated.item.id}/edit`);
    } catch (err) {
      console.error('Error duplicating product:', err);
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm('Are you sure you want to archive this product?')) {
      try {
        await productService.archiveProduct(id);
        fetchProducts();
      } catch (err) {
        console.error('Error archiving product:', err);
      }
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProductIds);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProductIds(newSelection);
  };

  const toggleAllProducts = () => {
    if (selectedProductIds.size === products.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(products.map(p => p.id)));
    }
  };

  const clearSelection = () => {
    setSelectedProductIds(new Set());
  };

  const handleBulkCategorySuccess = () => {
    clearSelection();
    fetchProducts();
  };

  const handleCategoryFilterChange = (categoryIds: string[]) => {
    setFilterCategoryIds(categoryIds);
    setCurrentPage(1);
    clearSelection();
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      clearSelection();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleProductExpansion = async (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
      
      // Load variants if not already loaded
      if (!productVariants[productId] && !loadingVariants.has(productId)) {
        setLoadingVariants(prev => new Set(prev).add(productId));
        try {
          const variantsResponse = await productService.getProducts({
            parentId: productId,
            limit: 100
          });
          setProductVariants(prev => ({
            ...prev,
            [productId]: variantsResponse.items
          }));
        } catch (err) {
          console.error(`Failed to load variants for ${productId}:`, err);
        } finally {
          setLoadingVariants(prev => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        }
      }
    }
    
    setExpandedProducts(newExpanded);
  };

  const getVariantLabel = (variant: Product) => {
    if (variant.attributes?.variantLabel) {
      return variant.attributes.variantLabel;
    }
    if (variant.variantAxes) {
      return Object.values(variant.variantAxes).join(' / ');
    }
    const nameParts = variant.name?.split(' - ');
    return nameParts?.[nameParts.length - 1] || 'Variant';
  };

  const getSelectedProductNames = () => {
    return products
      .filter(p => selectedProductIds.has(p.id))
      .map(p => p.name);
  };

  if (loading && products.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your product catalog and inventory
            </p>
          </div>
          <button 
            onClick={() => navigate('/products/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Product
          </button>
        </div>
        
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {/* Category Filter */}
            <CategoryFilter 
              onFilterChange={handleCategoryFilterChange}
              selectedCategoryIds={filterCategoryIds}
            />
          </div>
          
          {/* Results info */}
          {!loading && totalItems > 0 && (
            <div className="text-sm text-gray-600 flex items-center">
              {searchQuery && (
                <span className="mr-2">
                  Results for "{searchQuery}"
                </span>
              )}
              <span className="font-medium">{totalItems}</span> products found
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedProductIds.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedProductIds.size} product{selectedProductIds.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkCategoryModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2 text-sm"
              >
                <FolderPlusIcon className="w-4 h-4" />
                Assign Categories
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table or Empty State */}
      {products.length === 0 && !loading ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? `No products found for "${searchQuery}"` 
              : filterCategoryIds.length > 0 
                ? 'No products found in selected categories' 
                : 'No products found'
            }
          </p>
          <div className="flex gap-2 justify-center">
            {(searchQuery || filterCategoryIds.length > 0) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setFilterCategoryIds([]);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Filters
              </button>
            )}
            <button 
              onClick={() => navigate('/products/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Your First Product
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Products Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left">
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      checked={selectedProductIds.size === products.length && products.length > 0}
                      onChange={toggleAllProducts}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name / SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const variants = productVariants[product.id] || [];
                  const hasVariants = variants.length > 0;
                  const isExpanded = expandedProducts.has(product.id);
                  
                  return (
                    <React.Fragment key={product.id}>
                      <tr className={`hover:bg-gray-50 transition-colors ${selectedProductIds.has(product.id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-3 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.has(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {hasVariants && (
                              <button
                                onClick={() => toggleProductExpansion(product.id)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {isExpanded ? (
                                  <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                  <ChevronDownIcon className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <div>
                              <button
                                onClick={() => navigate(`/products/${product.id}`)}
                                className="text-blue-600 hover:text-blue-900 hover:underline font-medium text-left"
                              >
                                {product.name}
                              </button>
                              <div className="text-xs text-gray-500">{product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${product.status?.toLowerCase() === 'active' || product.status?.toLowerCase() === 'published' ? 'bg-green-100 text-green-800' : 
                              product.status?.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.price || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={product.quantity === 0 ? 'text-red-600 font-medium' : ''}>
                            {product.quantity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <span className="capitalize">{product.type}</span>
                            {hasVariants && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <TagIcon className="h-3 w-3" />
                                {variants.length}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/products/${product.id}`)}
                              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/products/${product.id}/edit`)}
                              className="p-1 text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit Product"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(product.id)}
                              className="p-1 text-indigo-600 hover:text-indigo-900 transition-colors"
                              title="Duplicate Product"
                            >
                              <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleArchive(product.id)}
                              className="p-1 text-yellow-600 hover:text-yellow-900 transition-colors"
                              title="Archive Product"
                            >
                              <ArchiveBoxIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1 text-red-600 hover:text-red-900 transition-colors"
                              title="Delete Product"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Variants */}
                      {isExpanded && hasVariants && (
                        <tr>
                          <td colSpan={7} className="px-6 py-0">
                            <div className="bg-gray-50 rounded-lg p-4 mb-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">Product Variants:</div>
                              {loadingVariants.has(product.id) ? (
                                <div className="text-sm text-gray-500">Loading variants...</div>
                              ) : (
                                <div className="space-y-2">
                                  {variants.map((variant) => (
                                    <div key={variant.id} className="bg-white rounded border border-gray-200 p-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                            {getVariantLabel(variant)}
                                          </span>
                                          <span className="text-sm font-mono text-gray-600">
                                            SKU: {variant.sku}
                                          </span>
                                          <span className="text-sm text-gray-600">
                                            {variant.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="text-sm text-gray-600">
                                            Price: ${variant.price || '0.00'}
                                          </span>
                                          <span className={`text-sm font-medium ${
                                            variant.quantity === 0 ? 'text-red-600' : 'text-gray-600'
                                          }`}>
                                            Stock: {variant.quantity || 0}
                                          </span>
                                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${variant.status === 'published' ? 'bg-green-100 text-green-800' : 
                                              variant.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                                              'bg-red-100 text-red-800'}`}>
                                            {variant.status}
                                          </span>
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => navigate(`/products/${variant.id}/edit`)}
                                              className="p-1 text-blue-600 hover:text-blue-900"
                                              title="Edit Variant"
                                            >
                                              <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => handleDelete(variant.id)}
                                              className="p-1 text-red-600 hover:text-red-900"
                                              title="Delete Variant"
                                            >
                                              <TrashIcon className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            className="mt-4"
          />
        </>
      )}

      {/* Bulk Category Assignment Modal */}
      <BulkCategoryAssignment
        isOpen={showBulkCategoryModal}
        onClose={() => setShowBulkCategoryModal(false)}
        selectedProductIds={Array.from(selectedProductIds)}
        selectedProductNames={getSelectedProductNames()}
        onSuccess={handleBulkCategorySuccess}
      />
    </div>
  );
}
