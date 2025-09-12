import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import productService from '../../services/product.service';
import mediaService, { Media } from '../../services/media.service';
import MediaUpload from '../../components/media/MediaUpload';
import ProductVariants from './ProductVariants';
import ConfigurableProduct from './ConfigurableProduct';

export default function ProductEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [productMedia, setProductMedia] = useState<Media[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    urlKey: '',  // Add urlKey field
    description: '',
    shortDescription: '',
    status: 'draft',
    type: 'simple',
    price: '',
    compareAtPrice: '',
    cost: '',
    barcode: '',
    quantity: 0,
    featured: false,
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    // Check for message from navigation state (e.g., from duplicate action)
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from history state
      window.history.replaceState({}, document.title);
    }
    
    if (id) {
      loadProduct(id);
      loadProductMedia(id);
    }
  }, [id, location.state]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const product = await productService.getProduct(productId);
      console.log('Loaded product:', product);
      
      // Map the product data to form fields
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        urlKey: product.urlKey || '',  // Map urlKey
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        status: product.status || 'draft',  // Use lowercase
        type: product.type || 'simple',     // Use lowercase
        price: product.price?.toString() || '',
        compareAtPrice: product.specialPrice?.toString() || '',  // Map specialPrice to compareAtPrice for UI
        cost: product.cost?.toString() || '',
        barcode: product.barcode || '',
        quantity: product.quantity || 0,
        featured: product.isFeatured || false,  // Map isFeatured to featured for UI
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
      });
    } catch (err: any) {
      console.error('Failed to load product:', err);
      setError('Failed to load product. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const loadProductMedia = async (productId: string) => {
    try {
      const response = await mediaService.getProductMedia(productId);
      const media = response.data?.items || response.items || response || [];
      console.log('Loaded product media:', media);
      setProductMedia(Array.isArray(media) ? media : []);
    } catch (err) {
      console.error('Failed to load product media:', err);
      // Don't show error as media is optional
      setProductMedia([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Generate URL slug from product name
  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-');       // Replace multiple hyphens with single hyphen
    setFormData(prev => ({ ...prev, urlKey: slug }));
  };

  // Handle media upload completion
  const handleMediaUpload = async (media: Media[]) => {
    // Associate new media with the product
    if (id) {
      try {
        for (const item of media) {
          await mediaService.associateWithProducts(item.id, [id]);
        }
        // Reload product media to get updated list
        await loadProductMedia(id);
      } catch (err) {
        console.error('Failed to associate media with product:', err);
        setError('Failed to associate images with product');
      }
    }
  };

  // Handle media removal
  const handleMediaRemove = async (mediaId: string) => {
    // Update local state immediately for better UX
    setProductMedia(prev => prev.filter(m => m.id !== mediaId));
    
    // The actual dissociation is handled in MediaUpload component
    // But we can reload to ensure sync with backend
    if (id) {
      setTimeout(() => {
        loadProductMedia(id);
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent, shouldClose = false) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Prepare the update data - use correct field names for backend
      const updateData: any = {
        sku: formData.sku,
        name: formData.name,
        status: formData.status.toLowerCase(),  // Ensure lowercase
        type: formData.type.toLowerCase(),      // Ensure lowercase
        isFeatured: formData.featured,  // Backend expects isFeatured, not featured
        quantity: parseInt(formData.quantity.toString()) || 0,
      };
      
      // Add urlKey if provided
      if (formData.urlKey?.trim()) {
        updateData.urlKey = formData.urlKey.trim();
      }
      
      // Add optional string fields only if they have values
      if (formData.description?.trim()) {
        updateData.description = formData.description.trim();
      }
      if (formData.shortDescription?.trim()) {
        updateData.shortDescription = formData.shortDescription.trim();
      }
      if (formData.barcode?.trim()) {
        updateData.barcode = formData.barcode.trim();
      }
      if (formData.metaTitle?.trim()) {
        updateData.metaTitle = formData.metaTitle.trim();
      }
      if (formData.metaDescription?.trim()) {
        updateData.metaDescription = formData.metaDescription.trim();
      }
      
      // Add numeric fields if they have values
      if (formData.price && formData.price !== '') {
        updateData.price = parseFloat(formData.price);
      }
      if (formData.compareAtPrice && formData.compareAtPrice !== '') {
        updateData.specialPrice = parseFloat(formData.compareAtPrice);  // Backend expects specialPrice
      }
      if (formData.cost && formData.cost !== '') {
        updateData.cost = parseFloat(formData.cost);
      }
      
      console.log('Updating product with:', updateData);
      
      await productService.updateProduct(id, updateData);
      
      setSuccessMessage('Product updated successfully!');
      setLastSaved(new Date());
      
      // Only redirect if explicitly requested (e.g., via a "Save and Close" button)
      if (shouldClose) {
        setTimeout(() => {
          navigate('/products');
        }, 1000);
      } else {
        // Clear success message after a delay when staying on the page
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
      
    } catch (err: any) {
      console.error('Failed to update product:', err);
      console.error('Error response:', err.response?.data);
      
      // Extract detailed error message
      let errorMessage = 'Failed to update product. ';
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else if (err.response?.data?.errors) {
        // Handle validation errors array
        const errors = err.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage += errors.join(', ');
        } else if (typeof errors === 'object') {
          errorMessage += Object.values(errors).flat().join(', ');
        }
      } else if (err.message) {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading product...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-sm text-gray-600">Update product information</p>
          </div>
          {lastSaved && (
            <div className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-800"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="urlKey"
                value={formData.urlKey}
                onChange={handleInputChange}
                placeholder="product-url-slug"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                title="Generate from product name"
              >
                Generate from Name
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">This will be used in the product URL: /products/{formData.urlKey || 'url-slug'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">Simple</option>
                <option value="configurable">Configurable</option>
                <option value="bundle">Bundle</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Product Images & Media</h2>
          <MediaUpload
            productId={id}
            existingMedia={productMedia}
            onUploadComplete={handleMediaUpload}
            onMediaRemove={handleMediaRemove}
            multiple={true}
            maxFiles={10}
            acceptedFileTypes={{
              'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
            }}
            maxFileSize={5 * 1024 * 1024} // 5MB
          />
          <p className="mt-2 text-sm text-gray-500">
            Upload or manage product images. You can set a primary image and reorder them.
            Supported formats: JPEG, PNG, GIF, WebP (max 5MB each)
          </p>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Price
              </label>
              <input
                type="number"
                name="compareAtPrice"
                value={formData.compareAtPrice}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Product Variants - For inventory management (sizes, colors, etc.) */}
        {/* Show for all products except configurable */}
        {id && formData.type !== 'configurable' && (
          <ProductVariants 
            productId={id} 
            productType={formData.type}
            productSku={formData.sku}
            productName={formData.name}
            onTypeChange={(newType) => {
              setFormData(prev => ({ ...prev, type: newType }));
            }}
          />
        )}
        
        {/* Configurable Product - For product builders/customizers */}
        {/* Show only for configurable products */}
        {id && (
          <ConfigurableProduct
            productId={id}
            productType={formData.type}
          />
        )}

        {/* SEO */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">SEO</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            ← Back to Products
          </button>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Close'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
