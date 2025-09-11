import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/product.service';
import categoryService from '../../services/category.service';
import { 
  Package, 
  Tag, 
  DollarSign, 
  BarChart3, 
  Calendar, 
  Eye, 
  EyeOff,
  Star,
  Info,
  Box,
  Truck,
  Search,
  Shield,
  Clock,
  Hash,
  FileText,
  AlertCircle,
  Copy,
  Archive,
  Edit,
  Trash2,
  ArrowLeft,
  Image,
  Activity,
  Link,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Globe,
  Layers
} from 'lucide-react';

interface ProductDetails {
  id: string;
  sku: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  shortDescription?: string;
  price?: string | number;
  cost?: string | number;
  specialPrice?: string | number;
  effectivePrice?: string | number;
  isOnSale?: boolean;
  specialPriceFrom?: string;
  specialPriceTo?: string;
  quantity?: number;
  inventoryQuantity?: number; // Handle both field names
  manageStock?: boolean;
  inStock?: boolean;
  lowStockThreshold?: number;
  isLowStock?: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  depth?: number; // Some products may have depth instead of length
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string | string[];
  urlKey?: string;
  slug?: string; // Handle both field names
  parentId?: string;
  hasVariants?: boolean;
  isVariant?: boolean;
  attributes?: any[];
  features?: any[];
  specifications?: any[];
  tags?: string[];
  barcode?: string;
  mpn?: string;
  brand?: string;
  manufacturer?: string;
  isVisible?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
  categories?: any[];
  viewCount?: number;
  rating?: number;
  compareAtPrice?: string | number;
  taxRate?: number;
  minQuantity?: number;
  maxQuantity?: number;
  weightUnit?: string;
  dimensionUnit?: string;
  requiresShipping?: boolean;
  allowBackorder?: boolean;
  media?: any[];
}

export default function ProductDetailsEnhanced() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'inventory' | 'seo' | 'activity'>('overview');
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
      loadCategories();
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productService.getProduct(productId);
      console.log('Loaded product details:', data);
      
      // Normalize field names
      const normalizedProduct: ProductDetails = {
        ...data,
        inventoryQuantity: data.quantity || data.inventoryQuantity || 0,
        slug: data.urlKey || data.slug || '',
      };
      
      setProduct(normalizedProduct);
    } catch (err: any) {
      console.error('Failed to load product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.items || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleDelete = async () => {
    if (!product || !id) return;
    
    const confirmed = confirm(
      `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await productService.deleteProduct(id);
        navigate('/products', { 
          state: { message: `Product "${product.name}" has been deleted.` }
        });
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleDuplicate = async () => {
    if (!product || !id) return;
    
    try {
      setIsDuplicating(true);
      const response = await productService.duplicateProduct(id);
      const newProduct = response.item;
      
      navigate(`/products/${newProduct.id}/edit`, {
        state: { message: `Product duplicated successfully. You can now edit the copy.` }
      });
    } catch (err) {
      console.error('Failed to duplicate product:', err);
      alert('Failed to duplicate product. Please try again.');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleArchive = async () => {
    if (!product || !id) return;
    
    const action = product.status === 'archived' ? 'unarchive' : 'archive';
    const confirmed = confirm(
      `Are you sure you want to ${action} "${product.name}"?`
    );
    
    if (confirmed) {
      try {
        setIsArchiving(true);
        const newStatus = product.status === 'archived' ? 'draft' : 'archived';
        await productService.updateProduct(id, { status: newStatus });
        await loadProduct(id);
      } catch (err) {
        console.error(`Failed to ${action} product:`, err);
        alert(`Failed to ${action} product. Please try again.`);
      } finally {
        setIsArchiving(false);
      }
    }
  };

  const formatPrice = (price: any) => {
    if (!price && price !== 0) return 'Not set';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      'published': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Published' },
      'draft': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FileText, label: 'Draft' },
      'archived': { bg: 'bg-gray-100', text: 'text-gray-800', icon: Archive, label: 'Archived' },
    };
    
    const config = statusMap[status?.toLowerCase()] || statusMap['draft'];
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap: any = {
      'simple': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
      'configurable': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Layers },
      'bundle': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Package },
      'virtual': { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: Globe },
      'downloadable': { bg: 'bg-teal-100', text: 'text-teal-800', icon: Link },
    };
    
    const config = typeMap[type?.toLowerCase()] || typeMap['simple'];
    const Icon = config.icon;
    
    return (
      <span className={`px-2.5 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-medium rounded-md ${config.bg} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {type?.toUpperCase() || 'SIMPLE'}
      </span>
    );
  };

  const getStockStatus = () => {
    const quantity = product?.inventoryQuantity || product?.quantity || 0;
    const threshold = product?.lowStockThreshold || 10;
    
    if (quantity === 0) {
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Out of Stock' };
    } else if (quantity <= threshold) {
      return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', label: `Low Stock (${quantity})` };
    } else {
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: `In Stock (${quantity})` };
    }
  };

  const getBooleanDisplay = (value: any, trueText = 'Yes', falseText = 'No') => {
    return value ? (
      <span className="text-green-600 font-medium flex items-center gap-1">
        <CheckCircle className="w-3.5 h-3.5" />
        {trueText}
      </span>
    ) : (
      <span className="text-gray-500 flex items-center gap-1">
        <XCircle className="w-3.5 h-3.5" />
        {falseText}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-gray-500">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error Loading Product</h3>
            <p className="text-sm mt-1">{error || 'Product not found'}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                      {product.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-xs font-semibold">Featured</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-mono text-gray-600">SKU: {product.sku}</span>
                      {product.brand && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Building2 className="w-3.5 h-3.5" />
                          {product.brand}
                        </span>
                      )}
                      {getStatusBadge(product.status)}
                      {getTypeBadge(product.type)}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${stockStatus.bg} ${stockStatus.color}`}>
                        <stockStatus.icon className="w-3.5 h-3.5" />
                        {stockStatus.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/products/${id}/edit`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                
                <button
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Copy className="w-4 h-4" />
                  {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                </button>
                
                <button
                  onClick={handleArchive}
                  disabled={isArchiving}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" />
                  {isArchiving ? 'Processing...' : product.status === 'archived' ? 'Unarchive' : 'Archive'}
                </button>
                
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                
                <div className="w-px h-8 bg-gray-300 mx-2" />
                
                <button
                  onClick={() => navigate('/products')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-6 border-t -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'details', label: 'Details', icon: Info },
              { id: 'inventory', label: 'Inventory & Shipping', icon: Box },
              { id: 'seo', label: 'SEO & Marketing', icon: Search },
              { id: 'activity', label: 'Activity', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Product Images */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Image className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold">Product Images</h2>
                </div>
                
                {product.media && product.media.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {product.media.map((media: any, idx: number) => (
                      <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={media.url} 
                          alt={`${product.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-1">No images uploaded</p>
                    <p className="text-xs text-gray-400">Upload images to showcase your product</p>
                    <button
                      onClick={() => navigate(`/products/${id}/edit`)}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                    >
                      Upload Images
                    </button>
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold">Basic Information</h2>
                </div>
                
                <div className="space-y-4">
                  {(product.slug || product.urlKey) && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">URL Slug</label>
                      <p className="mt-1 text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded">
                        /{product.slug || product.urlKey}
                      </p>
                    </div>
                  )}

                  {product.shortDescription && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Short Description</label>
                      <p className="mt-1 text-gray-900">{product.shortDescription}</p>
                    </div>
                  )}

                  {product.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Description</label>
                      <div className="mt-1 text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                        {product.description}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Visibility</label>
                      <p className="mt-1 flex items-center gap-2">
                        {product.isVisible ? (
                          <>
                            <Eye className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">Hidden</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Available for Sale</label>
                      <p className="mt-1">{getBooleanDisplay(product.isAvailable)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold">Pricing Information</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Regular Price</label>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  
                  {product.specialPrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Special Price</label>
                      <div className="mt-1">
                        <p className="text-2xl font-semibold text-green-600">
                          {formatPrice(product.specialPrice)}
                        </p>
                        {product.compareAtPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            Compare at {formatPrice(product.compareAtPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {product.cost && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cost</label>
                      <p className="mt-1 text-lg text-gray-900">{formatPrice(product.cost)}</p>
                    </div>
                  )}
                  
                  {product.effectivePrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Effective Price</label>
                      <p className="mt-1 text-lg text-gray-900">{formatPrice(product.effectivePrice)}</p>
                    </div>
                  )}
                </div>

                {(product.specialPriceFrom || product.specialPriceTo) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Special Price Period:</span>
                      {product.specialPriceFrom && (
                        <span> From {new Date(product.specialPriceFrom).toLocaleDateString()}</span>
                      )}
                      {product.specialPriceTo && (
                        <span> To {new Date(product.specialPriceTo).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold">Quick Stats</h2>
                </div>
                
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Stock Level</dt>
                    <dd className="text-sm font-semibold">
                      <span className={`${stockStatus.color}`}>
                        {product.inventoryQuantity || product.quantity || 0} units
                      </span>
                    </dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Views</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {product.viewCount || 0}
                    </dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Sort Order</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {product.sortOrder || 0}
                    </dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Rating</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {product.rating ? `${product.rating}/5` : 'No ratings'}
                    </dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">On Sale</dt>
                    <dd className="text-sm font-medium">
                      {product.isOnSale ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Categories */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold">Categories</h2>
                </div>
                
                {product.categories && product.categories.length > 0 ? (
                  <div className="space-y-2">
                    {product.categories.map((cat: any) => (
                      <div key={cat.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Hash className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No categories assigned</p>
                )}
              </div>

              {/* System Information */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold">System Information</h2>
                </div>
                
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Product ID</dt>
                    <dd className="mt-1 text-xs text-gray-900 font-mono break-all">
                      {product.id}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(product.createdAt)}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(product.updatedAt)}
                    </dd>
                  </div>
                  
                  {product.publishedAt && (
                    <div>
                      <dt className="text-sm text-gray-500">Published</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(product.publishedAt)}
                      </dd>
                    </div>
                  )}
                  
                  <div>
                    <dt className="text-sm text-gray-500">Version</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      v{product.version || 1}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">SKU</dt>
                  <dd className="mt-1 text-gray-900">{product.sku}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Barcode</dt>
                  <dd className="mt-1 text-gray-900">{product.barcode || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">MPN</dt>
                  <dd className="mt-1 text-gray-900">{product.mpn || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Brand</dt>
                  <dd className="mt-1 text-gray-900">{product.brand || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
                  <dd className="mt-1 text-gray-900">{product.manufacturer || 'Not set'}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Custom Attributes</h3>
              {product.attributes && product.attributes.length > 0 ? (
                <dl className="space-y-4">
                  {product.attributes.map((attr: any) => (
                    <div key={attr.id}>
                      <dt className="text-sm font-medium text-gray-500">
                        {attr.attribute?.name || attr.name || 'Attribute'}
                      </dt>
                      <dd className="mt-1 text-gray-900">{attr.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-gray-500">No custom attributes</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-gray-400" />
                Inventory Management
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Stock Quantity</dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {product.inventoryQuantity || product.quantity || 0} units
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Manage Stock</dt>
                  <dd className="mt-1">{getBooleanDisplay(product.manageStock)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Allow Backorders</dt>
                  <dd className="mt-1">{getBooleanDisplay(product.allowBackorder)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Low Stock Threshold</dt>
                  <dd className="mt-1">{product.lowStockThreshold || 10} units</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Min Order Quantity</dt>
                  