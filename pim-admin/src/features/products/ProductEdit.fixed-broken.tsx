import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import productService from '../../services/product.service';
import categoryService from '../../services/category.service';
import { Category } from '../../types/api.types';

// Validation schema matching backend expectations
const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(100),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived', 'pending_review', 'approved']),
  type: z.enum(['simple', 'configurable', 'bundle', 'virtual', 'grouped', 'downloadable']),
  price: z.number().min(0).optional().nullable(),
  specialPrice: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  barcode: z.string().optional(),
  manageStock: z.boolean(),
  quantity: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  isFeatured: z.boolean(),
  isVisible: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  brandId: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    }
  });

  const manageStock = watch('manageStock');

  // Load categories and product data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const categoriesResponse = await categoryService.getCategories();
        setCategories(categoriesResponse.items || []);

        // Load product if ID is provided
        if (id) {
          const product = await productService.getProduct(id);
          console.log('Loaded product:', product);
          
          // Map backend fields to form fields
          setValue('sku', product.sku);
          setValue('name', product.name);
          setValue('description', product.description || '');
          setValue('shortDescription', product.shortDescription || '');
          setValue('status', product.status || 'draft');
          setValue('type', product.type || 'simple');
          setValue('price', product.price ? parseFloat(product.price) : null);
          setValue('specialPrice', product.specialPrice ? parseFloat(product.specialPrice) : null);
          setValue('cost', product.cost ? parseFloat(product.cost) : null);
          setValue('barcode', product.barcode || '');
          setValue('manageStock', product.manageStock ?? true);
          setValue('quantity', product.quantity || 0);
          setValue('weight', product.weight);
          setValue('isFeatured', product.isFeatured || false);
          setValue('isVisible', product.isVisible ?? true);
          setValue('metaTitle', product.metaTitle || '');
          setValue('metaDescription', product.metaDescription || '');
          setValue('metaKeywords', product.metaKeywords || '');
          setValue('brandId', product.brandId || '');
          
          // Set category IDs if product has categories
          if (product.categories && Array.isArray(product.categories)) {
            const categoryIds = product.categories.map((cat: any) => cat.id);
            setValue('categoryIds', categoryIds);
          }
        }
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError('Failed to load product. ' + (err.message || ''));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    if (!id) return;
    
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Convert form data to backend format
      const updateData: any = {
        sku: data.sku,
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        status: data.status,
        type: data.type,
        price: data.price,
        specialPrice: data.specialPrice, // Backend uses specialPrice, not compareAtPrice
        cost: data.cost,
        barcode: data.barcode,
        manageStock: data.manageStock,
        quantity: data.quantity,
        weight: data.weight,
        isFeatured: data.isFeatured,
        isVisible: data.isVisible,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        categoryIds: data.categoryIds,
        brandId: data.brandId,
      };

      console.log('Updating product with:', updateData);
      
      const response = await productService.updateProduct(id, updateData);
      console.log('Product updated:', response);
      
      setSuccessMessage('Product updated successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 1500);
      
    } catch (err: any) {
      console.error('Failed to update product:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update product';
      setError(errorMessage);
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                {...register('sku')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
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
                disabled // Type cannot be changed after creation
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="simple">Simple</option>
                <option value="configurable">Configurable</option>
                <option value="bundle">Bundle</option>
                <option value="virtual">Virtual</option>
                <option value="grouped">Grouped</option>
                <option value="downloadable">Downloadable</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Product type cannot be changed</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              {...register('shortDescription')}
              rows={2}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isVisible')}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Visible in Catalog</span>
            </label>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regular Price
              </label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Price (Sale Price)
              </label>
              <Controller
                name="specialPrice"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
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
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
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
                type="text"
                {...register('barcode')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="flex items-center mt-6">
                <input
                  type="checkbox"
                  {...register('manageStock')}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Manage Stock</span>
              </label>
            </div>
            
            {manageStock && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      {...field}
                      value={field.value || 0}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
            

          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Categories</h2>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map(category => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={category.id}
                    {...register('categoryIds')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    {category.path ? category.path : category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
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
                {...register('metaTitle')}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                {...register('metaKeywords')}
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
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
