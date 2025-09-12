import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import productService from '../../services/product.service';
import categoryService from '../../services/category.service';
import { Category } from '../../types/api.types';
import MediaUpload from '../../components/media/MediaUpload';
import { Media } from '../../services/media.service';

// Validation schema matching backend expectations exactly
const productSchema = z.object({
  sku: z.string().min(3, 'SKU must be at least 3 characters').max(100),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived', 'pending_review', 'approved']),
  type: z.enum(['simple', 'configurable', 'bundle', 'virtual']),
  price: z.number().min(0).optional().nullable(),
  specialPrice: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  barcode: z.string().max(50).optional(),
  manageStock: z.boolean(),
  quantity: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  isFeatured: z.boolean(),
  isVisible: z.boolean(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  urlKey: z.string().max(255).optional(),
  brand: z.string().max(255).optional(),
  manufacturer: z.string().max(255).optional(),
  mpn: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.any()).optional(),
  attributes: z.record(z.any()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'draft',
      type: 'simple',
      manageStock: true,
      isFeatured: false,
      isVisible: true,
      quantity: 0,
      price: null,
      specialPrice: null,
      cost: null,
    }
  });

  const manageStock = watch('manageStock');
  const productType = watch('type');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      // Handle wrapped response format based on API standards
      const categoriesData = response.data?.items || response.items || [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Clean the data - remove any empty optional fields
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key as keyof ProductFormData] = value;
        }
        return acc;
      }, {} as ProductFormData);
      
      console.log('Creating product with cleaned data:', cleanData);
      
      const response = await productService.createProduct(cleanData);
      
      // Handle new API response format (ActionResponseDto)
      console.log('Product created:', response);
      
      const createdProduct = response.data?.item || response.item;
      const message = response.data?.message || 'Product created successfully!';
      
      // Store the created product ID for media association
      if (createdProduct?.id) {
        setCreatedProductId(createdProduct.id);
      }
      
      setSuccessMessage(message);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 1500);
      
    } catch (err: any) {
      console.error('Failed to create product:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create product';
      const errorDetails = err.response?.data?.errors;
      
      if (errorDetails) {
        console.error('Validation errors:', errorDetails);
        const errorList = Object.entries(errorDetails)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        setError(`Validation failed:\n${errorList}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle media upload completion
  const handleMediaUpload = (media: Media[]) => {
    setUploadedMedia(prev => [...prev, ...media]);
  };

  // Handle media removal
  const handleMediaRemove = (mediaId: string) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  // Generate a unique SKU
  const generateSKU = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    setValue('sku', `PROD-${timestamp}-${random}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Product</h1>
        <p className="text-sm text-gray-600">Add a new product to your catalog</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg whitespace-pre-line">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  {...register('sku')}
                  type="text"
                  placeholder="e.g., PROD-001"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={generateSKU}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Generate
                </button>
              </div>
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Product name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">Simple</option>
                <option value="configurable">Configurable</option>
                <option value="bundle">Bundle</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                {...register('brand')}
                type="text"
                placeholder="e.g., Sony"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                {...register('manufacturer')}
                type="text"
                placeholder="e.g., Sony Corporation"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              {...register('shortDescription')}
              rows={2}
              placeholder="Brief product description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Detailed product description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mr-2"
                  />
                )}
              />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
            
            <label className="flex items-center">
              <Controller
                name="isVisible"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mr-2"
                  />
                )}
              />
              <span className="text-sm font-medium text-gray-700">Visible in Catalog</span>
            </label>
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Product Images & Media</h2>
          <MediaUpload
            productId={createdProductId || undefined}
            existingMedia={uploadedMedia}
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
            Upload product images. The first image will be set as the primary image.
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
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    value={field.value || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Price
              </label>
              <Controller
                name="specialPrice"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    value={field.value || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost
              </label>
              <Controller
                name="cost"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    value={field.value || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <input
                {...register('barcode')}
                type="text"
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MPN (Part Number)
              </label>
              <input
                {...register('mpn')}
                type="text"
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    value={field.value || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (cm)
              </label>
              <Controller
                name="length"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    value={field.value || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (cm)
              </label>
              <Controller
                name="width"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    value={field.value || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <Controller
                name="height"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    value={field.value || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <label className="flex items-center mb-4">
              <Controller
                name="manageStock"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mr-2"
                  />
                )}
              />
              <span className="text-sm font-medium text-gray-700">Track Inventory</span>
            </label>
            
            {manageStock && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Stock Quantity
                </label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      value={field.value || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {/* Note about Categories and Variants */}
        <div className="space-y-3">
          {categories.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Category assignment will be available after the product is created. 
                You can assign categories by editing the product after creation.
              </p>
            </div>
          )}
          
          {productType === 'configurable' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Configurable Product:</strong> This creates a product builder where customers can customize 
                their purchase (like choosing computer components). After creation, you'll define configuration 
                options that affect the final price.
              </p>
              <p className="text-xs text-purple-600 mt-2">
                Note: For simple inventory variations (like T-shirt sizes), keep the product as "Simple" and add variants after creation.
              </p>
            </div>
          )}
          
          {productType === 'simple' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Simple Product:</strong> After creation, you can add variants for inventory variations 
                (sizes, colors, etc.). Each variant will have its own SKU and stock level.
              </p>
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">SEO</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Key (slug)
              </label>
              <input
                {...register('urlKey')}
                type="text"
                placeholder="product-url-slug"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate from product name</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                {...register('metaTitle')}
                type="text"
                placeholder="Page title for search engines"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                {...register('metaDescription')}
                rows={3}
                placeholder="Page description for search engines"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Keywords
              </label>
              <input
                {...register('metaKeywords')}
                type="text"
                placeholder="Comma-separated keywords"
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
            disabled={loading || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
