import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/product.service';

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productService.getProduct(productId);
      console.log('Loaded product details:', data);
      setProduct(data);
    } catch (err: any) {
      console.error('Failed to load product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !id) return;
    
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await productService.deleteProduct(id);
        navigate('/products');
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product');
      }
    }
  };

  const formatPrice = (price: any) => {
    if (!price) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'published': 'bg-green-100 text-green-800',
      'DRAFT': 'bg-gray-100 text-gray-800',
      'draft': 'bg-gray-100 text-gray-800',
      'ARCHIVED': 'bg-red-100 text-red-800',
      'archived': 'bg-red-100 text-red-800',
    };
    
    const colorClass = statusMap[status] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error || 'Product not found'}
        </div>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-600 mt-1">SKU: {product.sku}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/products/${id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Basic Information</h2>
            
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">{getStatusBadge(product.status)}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.type || 'SIMPLE'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Featured</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.featured || product.isFeatured ? '⭐ Yes' : 'No'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.visibility || (product.isVisible ? 'Visible' : 'Hidden')}
                </dd>
              </div>
            </dl>

            {product.shortDescription && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">Short Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.shortDescription}</dd>
              </div>
            )}

            {product.description && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{product.description}</dd>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Pricing & Inventory</h2>
            
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatPrice(product.price)}
                </dd>
              </div>
              
              {(product.compareAtPrice || product.specialPrice) && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Compare at Price</dt>
                  <dd className="mt-1 text-lg text-gray-500 line-through">
                    {formatPrice(product.compareAtPrice || product.specialPrice)}
                  </dd>
                </div>
              )}
              
              {product.cost && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cost</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatPrice(product.cost)}</dd>
                </div>
              )}
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Stock Quantity</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.quantity || product.inventoryQuantity || 0}
                </dd>
              </div>
              
              {product.barcode && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Barcode</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{product.barcode}</dd>
                </div>
              )}
              
              {product.weight && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Weight</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.weight} {product.weightUnit || 'kg'}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* SEO */}
          {(product.metaTitle || product.metaDescription) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">SEO</h2>
              
              {product.metaTitle && (
                <div className="mb-4">
                  <dt className="text-sm font-medium text-gray-500">Meta Title</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.metaTitle}</dd>
                </div>
              )}
              
              {product.metaDescription && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Meta Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.metaDescription}</dd>
                </div>
              )}
              
              {product.metaKeywords && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-gray-500">Keywords</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {Array.isArray(product.metaKeywords) 
                      ? product.metaKeywords.join(', ') 
                      : product.metaKeywords}
                  </dd>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Quick Info</h2>
            
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-xs text-gray-900 font-mono">{product.id}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString()}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              
              {product.publishedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Published</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(product.publishedAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Categories</h2>
              <ul className="space-y-2">
                {product.categories.map((cat: any) => (
                  <li key={cat.id} className="text-sm text-gray-900">
                    • {cat.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Attributes</h2>
              <dl className="space-y-2">
                {product.attributes.map((attr: any) => (
                  <div key={attr.id}>
                    <dt className="text-sm font-medium text-gray-500">
                      {attr.attribute?.name || attr.name || 'Attribute'}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{attr.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
