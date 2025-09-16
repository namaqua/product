import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/product.service';
import mediaService, { Media } from '../../services/media.service';
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
  Edit,
  Trash2,
  ArrowLeft,
  Archive,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Expand
} from 'lucide-react';

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [productMedia, setProductMedia] = useState<Media[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
      loadProductMedia(id);
      loadVariants(id); // Always load variants for any product
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // DIAGNOSTIC: Check raw response
      const token = localStorage.getItem('access_token');
      console.log('🔍 Token exists:', !!token, 'First 20 chars:', token?.substring(0, 20));
      
      const rawResponse = await fetch(`/api/products/${productId}?includeVariants=true&includeAttributes=true`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Response status:', rawResponse.status, 'Type:', rawResponse.headers.get('content-type'));
      const contentType = rawResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('text/html')) {
        console.error('🔍 ERROR: API returned HTML instead of JSON!');
        console.error('🔍 This means the request went to the wrong place or auth failed');
        const text = await rawResponse.text();
        console.error('🔍 HTML Response (first 200 chars):', text.substring(0, 200));
        throw new Error('API returned HTML instead of JSON. Check proxy configuration.');
      }
      
      const rawData = await rawResponse.json();
      console.log('🔍 RAW API RESPONSE:', rawData);
      console.log('🔍 Response structure path:', {
        'success': rawData.success,
        'has data': !!rawData.data,
        'data is object': typeof rawData.data === 'object',
        'data.sku': rawData.data?.sku,
        'data.data exists': !!rawData.data?.data,
        'data.data.sku': rawData.data?.data?.sku
      });
      
      const data = await productService.getProduct(productId);
      console.log('📦 PARSED product details:', data);
      console.log('📦 Product fields:', {
        sku: data?.sku,
        name: data?.name,
        status: data?.status,
        price: data?.price
      });
      setProduct(data);
      
      // Load variants for any product (moved to useEffect)
      // Variants can exist for any product type, not just configurable
    } catch (err: any) {
      console.error('Failed to load product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const loadProductMedia = async (productId: string) => {
    try {
      const response = await mediaService.getProductMedia(productId);
      const media = response.data?.items || response.items || [];
      setProductMedia(media);
      console.log('Loaded product media:', media);
    } catch (err) {
      console.error('Failed to load product media:', err);
      // Don't show error as media is optional
    }
  };
  
  const loadVariants = async (productId: string) => {
    try {
      const variantsResponse = await productService.getProducts({
        parentId: productId,
        limit: 100,
      });
      setVariants(variantsResponse.items || []);
      console.log('Loaded variants:', variantsResponse.items);
    } catch (err) {
      console.error('Failed to load variants:', err);
      setVariants([]);
    }
  };

  const handleDelete = async () => {
    if (!product || !id) return;
    
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        await productService.deleteProduct(id);
        navigate('/products');
      } catch (err) {
        console.error('Failed to delete product:', err);
        setError('Unable to delete product. Please try again.');
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const handleDuplicate = async () => {
    if (!product || !id) return;
    
    try {
      setIsDuplicating(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log('Attempting to duplicate product:', product);
      const response = await productService.duplicateProduct(id);
      const newProduct = response.item;
      
      // Navigate to edit page for the duplicated product
      navigate(`/products/${newProduct.id}/edit`, {
        state: { message: `Product duplicated successfully. You can now edit the copy.` }
      });
    } catch (err: any) {
      console.error('Failed to duplicate product:', err);
      console.error('Duplicate error response:', err.response?.data);
      console.error('Duplicate error status:', err.response?.status);
      
      // Extract detailed error message
      let errorMessage = 'Unable to duplicate product. ';
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        console.error('Duplicate validation errors:', errors);
        if (Array.isArray(errors)) {
          errorMessage += errors.map((e: any) => {
            if (typeof e === 'object' && e.constraints) {
              return Object.values(e.constraints).join(', ');
            }
            return e;
          }).join(', ');
        } else if (typeof errors === 'object') {
          errorMessage += Object.entries(errors).map(([field, msgs]: [string, any]) => {
            return `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`;
          }).join('; ');
        }
      } else if (err.message) {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 10000);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleArchive = async () => {
    if (!product || !id) return;
    
    const isArchived = product.status === 'archived';
    const action = isArchived ? 'unarchive' : 'archive';
    const actionText = isArchived ? 'restored' : 'archived';
    const newStatus = isArchived ? 'draft' : 'archived';
    
    if (confirm(`Are you sure you want to ${action} "${product.name}"?`)) {
      try {
        setIsArchiving(true);
        setError(null);
        setSuccessMessage(null);
        
        // Use the updateProduct method with just the status change
        await productService.updateProduct(id, { status: newStatus });
        
        // Reload the product to get updated data
        await loadProduct(id);
        
        // Show user-friendly success message
        setSuccessMessage(`Product ${actionText} successfully.`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        console.error(`Failed to ${action} product:`, err);
        setError(`Unable to ${action} product. Please try again.`);
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsArchiving(false);
      }
    }
  };

  const formatPrice = (price: any) => {
    if (price === null || price === undefined || price === '') return 'Not set';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'Not set';
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
    // Normalize status to handle both uppercase (from backend) and lowercase
    const normalizedStatus = status?.toLowerCase();
    
    const statusMap: any = {
      'active': { bg: 'bg-green-100', text: 'text-green-800', icon: Eye },
      'published': { bg: 'bg-green-100', text: 'text-green-800', icon: Eye },
      'draft': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FileText },
      'archived': { bg: 'bg-red-100', text: 'text-red-800', icon: Archive },
    };
    
    const config = statusMap[normalizedStatus] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Info };
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap: any = {
      'simple': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'configurable': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'bundle': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      'virtual': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
      'downloadable': { bg: 'bg-teal-100', text: 'text-teal-800' },
    };
    
    const config = typeMap[type?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded ${config.bg} ${config.text} uppercase`}>
        {type || 'SIMPLE'}
      </span>
    );
  };

  const getBooleanDisplay = (value: any, trueText = 'Yes', falseText = 'No') => {
    return value ? (
      <span className="text-green-600 font-medium">{trueText}</span>
    ) : (
      <span className="text-gray-500">{falseText}</span>
    );
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex(prev => prev > 0 ? prev - 1 : productMedia.length - 1);
    } else {
      setSelectedImageIndex(prev => prev < productMedia.length - 1 ? prev + 1 : 0);
    }
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Lightbox Modal */}
      {isLightboxOpen && productMedia.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          
          {productMedia.length > 1 && (
            <>
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          
          <img
            src={mediaService.getMediaUrl(productMedia[selectedImageIndex])}
            alt={productMedia[selectedImageIndex].alt || product.name}
            className="max-w-full max-h-full object-contain"
          />
          
          {productMedia.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {productMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Package className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-gray-600 font-mono text-sm">SKU: {product.sku}</span>
                  {product.brand && (
                    <span className="text-gray-600 text-sm">Brand: {product.brand}</span>
                  )}
                  {product.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">Featured</span>
                    </span>
                  )}
                  {getStatusBadge(product.status)}
                  {getTypeBadge(product.type)}
                  {/* Show if this is a variant */}
                  {product.parentId && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Tag className="w-3 h-3" />
                      Variant Product
                    </span>
                  )}
                  {/* Show variant count if has variants */}
                  {variants.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Box className="w-3 h-3" />
                      {variants.length} {variants.length === 1 ? 'Variant' : 'Variants'}
                    </span>
                  )}
                </div>
                {/* Show parent product link if this is a variant */}
                {product.parentId && (
                  <div className="mt-2">
                    <button
                      onClick={() => navigate(`/products/${product.parentId}`)}
                      className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      View Parent Product
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/products/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {isDuplicating ? 'Duplicating...' : 'Duplicate'}
            </button>
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className={`px-4 py-2 ${product?.status === 'archived' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2`}
            >
              <Archive className="w-4 h-4" />
              {isArchiving ? 'Processing...' : product?.status === 'archived' ? 'Unarchive' : 'Archive'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={() => navigate('/products')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Product Images Gallery */}
          {productMedia.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold">Product Images</h2>
              </div>
              
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={mediaService.getMediaUrl(productMedia[selectedImageIndex])}
                    alt={productMedia[selectedImageIndex].alt || product.name}
                    className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                  {productMedia[selectedImageIndex].isPrimary && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                      Primary
                    </span>
                  )}
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <Expand className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Thumbnail Gallery */}
                {productMedia.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {productMedia.map((media, index) => (
                      <button
                        key={media.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === selectedImageIndex 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={mediaService.getMediaUrl(media)}
                          alt={media.alt || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {media.isPrimary && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <Star className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </div>
            
            <div className="space-y-4">
              {/* Show variant axes if this is a variant */}
              {product.variantAxes && Object.keys(product.variantAxes).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Variant Properties</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(product.variantAxes).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        <span className="capitalize">{key}:</span> {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.urlKey && (
              <div>
              <label className="text-sm font-medium text-gray-500">URL Slug</label>
              <p className="mt-1 text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded">
              /{product.urlKey}
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
                  <label className="text-sm font-medium text-gray-500">Allow Backorders</label>
                  <p className="mt-1">{getBooleanDisplay(product.allowBackorder)}</p>
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
                        {formatPrice(product.compareAtPrice)}
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
              
              {product.taxRate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tax Rate</label>
                  <p className="mt-1 text-lg text-gray-900">{product.taxRate}%</p>
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

          {/* Inventory & Shipping */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Box className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Inventory & Shipping</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Stock Quantity</label>
                <p className="mt-1 text-lg font-semibold">
                  {product.quantity || 0}
                  {(product.quantity || 0) <= (product.lowStockThreshold || 10) && (
                    <span className="ml-2 text-sm text-orange-600">⚠️ Low Stock</span>
                  )}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Manage Stock</label>
                <p className="mt-1">{getBooleanDisplay(product.manageStock)}</p>
              </div>
              
              {product.barcode && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Barcode</label>
                  <p className="mt-1 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                    {product.barcode}
                  </p>
                </div>
              )}
              
              {product.minQuantity && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Min Order Quantity</label>
                  <p className="mt-1">{product.minQuantity}</p>
                </div>
              )}
              
              {product.maxQuantity && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Max Order Quantity</label>
                  <p className="mt-1">{product.maxQuantity}</p>
                </div>
              )}
              
              {product.lowStockThreshold && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Low Stock Alert</label>
                  <p className="mt-1">≤ {product.lowStockThreshold} units</p>
                </div>
              )}
            </div>

            {/* Shipping Details */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                Shipping Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {product.weight && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Weight</label>
                    <p className="mt-1">
                      {product.weight} {product.weightUnit || 'kg'}
                    </p>
                  </div>
                )}
                
                {(product.width || product.height || product.depth) && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dimensions (W×H×D)</label>
                      <p className="mt-1">
                        {product.width || 0} × {product.height || 0} × {product.depth || 0} {product.dimensionUnit || 'cm'}
                      </p>
                    </div>
                  </>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Requires Shipping</label>
                  <p className="mt-1">{getBooleanDisplay(product.requiresShipping !== false)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Variants Section */}
          {(variants.length > 0 || product.type === 'configurable') && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              {/* Variant Summary Stats */}
              {variants.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wider">Total Variants</div>
                      <div className="text-2xl font-bold text-gray-900">{variants.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wider">Total Stock</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {variants.reduce((sum, v) => sum + (v.quantity || 0), 0)}
                        <span className="text-sm font-normal text-gray-600 ml-1">units</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wider">Price Range</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {(() => {
                          const prices = variants.map(v => v.price || 0).filter(p => p > 0);
                          if (prices.length === 0) return 'Not set';
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          return min === max 
                            ? formatPrice(min)
                            : `${formatPrice(min)} - ${formatPrice(max)}`;
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wider">Stock Status</div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {variants.filter(v => v.quantity > 10).length > 0 && (
                            <span className="text-sm">
                              <span className="font-semibold text-green-600">
                                {variants.filter(v => v.quantity > 10).length}
                              </span>
                              <span className="text-gray-600"> ok</span>
                            </span>
                          )}
                          {variants.filter(v => v.quantity > 0 && v.quantity <= 10).length > 0 && (
                            <span className="text-sm">
                              <span className="font-semibold text-orange-600">
                                {variants.filter(v => v.quantity > 0 && v.quantity <= 10).length}
                              </span>
                              <span className="text-gray-600"> low</span>
                            </span>
                          )}
                          {variants.filter(v => v.quantity === 0).length > 0 && (
                            <span className="text-sm">
                              <span className="font-semibold text-red-600">
                                {variants.filter(v => v.quantity === 0).length}
                              </span>
                              <span className="text-gray-600"> out</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold">
                    Product Variants
                    {variants.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
                      </span>
                    )}
                  </h2>
                  {product.type === 'configurable' && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                      Configurable Product
                    </span>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/products/${id}/edit`)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Manage Variants →
                </button>
              </div>
              
              {variants.length > 0 ? (
                <div className="space-y-3">
                  {variants.map((variant) => {
                    const variantLabel = variant.attributes?.variantLabel || 
                                       (variant.variantAxes ? Object.values(variant.variantAxes).join(' / ') : null) ||
                                       variant.name?.split(' - ').pop() || 'Variant';
                    
                    return (
                      <div key={variant.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {variantLabel && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                                  {variantLabel}
                                </span>
                              )}
                              <h4 className="font-medium text-gray-900">{variant.name}</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">SKU:</span>
                                <span className="ml-2 font-mono text-gray-900">{variant.sku}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Price:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {formatPrice(variant.price)}
                                </span>
                                {variant.specialPrice && (
                                  <span className="ml-1 text-green-600 text-xs">
                                    (Special: {formatPrice(variant.specialPrice)})
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="text-gray-500">Stock:</span>
                                <span className={`ml-2 font-medium ${
                                  variant.quantity === 0 ? 'text-red-600' : 
                                  variant.quantity < 10 ? 'text-orange-600' : 'text-gray-900'
                                }`}>
                                  {variant.quantity || 0} units
                                  {variant.quantity === 0 && ' (Out of Stock)'}
                                  {variant.quantity > 0 && variant.quantity < 10 && ' (Low Stock)'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(variant.status)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => navigate(`/products/${variant.id}/edit`)}
                              className="p-2 text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit Variant"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/products/${variant.id}`)}
                              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Additional variant details */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {variant.barcode && (
                              <div>
                                <span className="text-gray-500">Barcode:</span>
                                <span className="ml-2 font-mono text-xs">{variant.barcode}</span>
                              </div>
                            )}
                            {variant.weight && (
                              <div>
                                <span className="text-gray-500">Weight:</span>
                                <span className="ml-2">{variant.weight} kg</span>
                              </div>
                            )}
                            {variant.cost && (
                              <div>
                                <span className="text-gray-500">Cost:</span>
                                <span className="ml-2">{formatPrice(variant.cost)}</span>
                              </div>
                            )}
                            {variant.inStock !== undefined && (
                              <div>
                                <span className="text-gray-500">In Stock:</span>
                                <span className="ml-2">
                                  {variant.inStock ? (
                                    <span className="text-green-600">✓ Yes</span>
                                  ) : (
                                    <span className="text-red-600">✗ No</span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Variant Axes */}
                          {variant.variantAxes && Object.keys(variant.variantAxes).length > 0 && (
                            <div className="mt-3">
                              <span className="text-xs text-gray-500 uppercase tracking-wider">Variant Properties:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {Object.entries(variant.variantAxes).map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                  >
                                    <span className="font-medium capitalize">{key}:</span> {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Custom Attributes */}
                          {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                            <div className="mt-3">
                              <span className="text-xs text-gray-500 uppercase tracking-wider">Custom Attributes:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {Object.entries(variant.attributes)
                                  .filter(([key]) => !key.startsWith('_') && key !== 'variantLabel')
                                  .map(([key, value]) => (
                                    <span
                                      key={key}
                                      className="px-2 py-1 bg-yellow-50 text-yellow-800 rounded text-xs"
                                    >
                                      {key}: {value}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">
                    {product.type === 'configurable' 
                      ? 'No product configurations created yet.'
                      : 'No variants created yet.'}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    {product.type === 'configurable'
                      ? 'Add product configurations to allow customers to customize their selection.'
                      : 'Create variants for different versions of this product (sizes, colors, etc.).'}
                  </p>
                  <button
                    onClick={() => navigate(`/products/${id}/edit`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add Variants →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SEO & Marketing */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">SEO & Marketing</h2>
            </div>
            
            <div className="space-y-4">
              {product.metaTitle && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Meta Title</label>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">
                    {product.metaTitle}
                  </p>
                </div>
              )}
              
              {product.metaDescription && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Meta Description</label>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">
                    {product.metaDescription}
                  </p>
                </div>
              )}
              
              {product.metaKeywords && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Meta Keywords</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(Array.isArray(product.metaKeywords) 
                      ? product.metaKeywords 
                      : product.metaKeywords.split(',')
                    ).map((keyword: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {product.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Quick Stats</h2>
            </div>
            
            <dl className="space-y-3">
              {variants.length > 0 && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Variants</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {variants.length}
                    </dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Total Stock</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {variants.reduce((sum, v) => sum + (v.quantity || 0), 0)}
                    </dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">In Stock</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {variants.filter(v => v.quantity > 0).length} / {variants.length}
                    </dd>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100" />
                </>
              )}
              
              {product.parentId && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Product Type</dt>
                    <dd className="text-sm font-medium text-blue-600">Variant</dd>
                  </div>
                  <div className="pt-2 border-t border-gray-100" />
                </>
              )}
              
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
              
              {productMedia.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Images</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {productMedia.length}
                  </dd>
                </div>
              )}
            </dl>
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

          {/* Categories */}
          <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Categories</h2>
          </div>
          {product.categories && product.categories.length > 0 ? (
          <div className="space-y-2">
          {product.categories.map((cat: any) => (
          <div key={cat.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Hash className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-900">{cat.name}</span>
              </div>
              ))}
              </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No categories assigned</p>
              )}
            </div>

          {/* Attributes */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Custom Attributes</h2>
            </div>
            {product.attributes && product.attributes.length > 0 ? (
              <dl className="space-y-3">
                {product.attributes.map((attr: any) => (
                  <div key={attr.id}>
                    <dt className="text-sm font-medium text-gray-500">
                      {attr.attribute?.name || attr.name || 'Attribute'}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {attr.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-gray-500 italic">No custom attributes defined</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
