import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/product.service';

export default function ProductEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    shortDescription: '',
    status: 'DRAFT',
    type: 'SIMPLE',
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
    if (id) {
      loadProduct(id);
    }
  }, [id]);

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
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        status: product.status || 'DRAFT',
        type: product.type || 'SIMPLE',
        price: product.price?.toString() || '',
        compareAtPrice: product.compareAtPrice?.toString() || product.specialPrice?.toString() || '',
        cost: product.cost?.toString() || '',
        barcode: product.barcode || '',
        quantity: product.quantity || product.inventoryQuantity || 0,
        featured: product.featured || product.isFeatured || false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Prepare the update data
      const updateData: any = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        status: formData.status,
        type: formData.type,
        barcode: formData.barcode,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
      };
      
      // Add numeric fields if they have values
      if (formData.price) {
        updateData.price = parseFloat(formData.price);
      }
      if (formData.compareAtPrice) {
        updateData.compareAtPrice = parseFloat(formData.compareAtPrice);
        updateData.specialPrice = parseFloat(formData.compareAtPrice); // Backend might use this name
      }
      if (formData.cost) {
        updateData.cost = parseFloat(formData.cost);
      }
      if (formData.quantity !== undefined) {
        updateData.quantity = parseInt(formData.quantity.toString());
      }
      
      // Map featured field
      updateData.featured = formData.featured;
      updateData.isFeatured = formData.featured; // Backend might use this name
      
      console.log('Updating product with:', updateData);
      
      await productService.updateProduct(id, updateData);
      
      setSuccessMessage('Product updated successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 1500);
      
    } catch (err: any) {
      console.error('Failed to update product:', err);
      setError('Failed to update product. ' + (err.response?.data?.message || err.message || ''));
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
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-gray-600">Update product information</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {successMessage}
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
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
                <option value="published">Published</option>
                <option value="draft">Draft (lowercase)</option>
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
                <option value="SIMPLE">Simple</option>
                <option value="VARIABLE">Variable</option>
                <option value="simple">Simple (lowercase)</option>
                <option value="configurable">Configurable</option>
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
                Compare at Price
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
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
