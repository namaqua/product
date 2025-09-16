import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/product.service';
import { Product, PaginatedResponse } from '../../types/api.types';
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
  TagIcon
} from '@heroicons/react/24/outline';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [productVariants, setProductVariants] = useState<Record<string, Product[]>>({});
  const [loadingVariants, setLoadingVariants] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get parent products only (not variants)
      const response = await productService.getProducts({ 
        page: 1, 
        limit: 20,
        parentId: null // Only get parent products
      });
      
      // DIAGNOSTIC: Check what we got
      console.log('📊 LIST - Response from getProducts:', response);
      console.log('📊 LIST - First item structure:', response.items?.[0]);
      console.log('📊 LIST - First item fields:', {
        sku: response.items?.[0]?.sku,
        name: response.items?.[0]?.name,
        status: response.items?.[0]?.status,
        price: response.items?.[0]?.price
      });
      
      setProducts(response.items);
      
      // Pre-load variant counts for products that might have them
      const variantPromises = response.items.map(async (product: Product) => {
        if (product.type === 'configurable' || product.id) {
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
      
      // Load variants in parallel but don't wait
      Promise.all(variantPromises).catch(console.error);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
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
      navigate(`/products/${duplicated.id}/edit`);
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
    // Try to extract variant label from attributes or name
    if (variant.attributes?.variantLabel) {
      return variant.attributes.variantLabel;
    }
    if (variant.variantAxes) {
      return Object.values(variant.variantAxes).join(' / ');
    }
    // Extract from name (e.g., "Product Name - Small" -> "Small")
    const nameParts = variant.name?.split(' - ');
    return nameParts?.[nameParts.length - 1] || 'Variant';
  };

  if (loading) {
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
      <div className="mb-6 flex justify-between items-center">
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

      {products.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No products found</p>
          <button 
            onClick={() => navigate('/products/new')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Your First Product
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
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type / Variants
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
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                          {product.sku}
                        </div>
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="text-blue-600 hover:text-blue-900 hover:underline font-medium text-left"
                    >
                      {product.name}
                    </button>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{product.type}</span>
                          {hasVariants && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <TagIcon className="h-3 w-3" />
                              {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
                            </span>
                          )}
                          {product.type === 'configurable' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <CubeIcon className="h-3 w-3" />
                              Configurable
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
                    
                    {/* Expanded Variants Section */}
                    {isExpanded && hasVariants && (
                      <tr>
                        <td colSpan={6} className="px-6 py-0">
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
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigate(`/products/${variant.id}/edit`);
                                            }}
                                            className="p-1 text-blue-600 hover:text-blue-900"
                                            title="Edit Variant"
                                          >
                                            <PencilIcon className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(variant.id);
                                            }}
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
      )}
    </div>
  );
}
