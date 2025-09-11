import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import productService from '../../services/product.service';
import categoryService from '../../services/category.service';
import attributeService from '../../services/attribute.service';
import { 
  Product, 
  ProductStatus, 
  ProductVisibility, 
  ProductType,
  CreateProductDto,
  UpdateProductDto,
  Category,
  Attribute
} from '../../types/api.types';

// Validation schema
const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(100),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  slug: z.string().optional(),
  status: z.nativeEnum(ProductStatus),
  visibility: z.nativeEnum(ProductVisibility),
  type: z.nativeEnum(ProductType),
  price: z.number().min(0).optional().nullable(),
  compareAtPrice: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  barcode: z.string().optional(),
  trackInventory: z.boolean(),
  quantity: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  weightUnit: z.string().optional(),
  featured: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  attributeIds: z.array(z.string()).optional(),
  brandId: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  mode?: 'create' | 'edit';
}

export default function ProductForm({ mode = 'create' }: ProductFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(new Set());
  const [attributeValues, setAttributeValues] = useState<Record<string, any>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: ProductStatus.DRAFT,
      visibility: ProductVisibility.VISIBLE,
      type: ProductType.SIMPLE,
      trackInventory: true,
      featured: false,
      quantity: 0,
    }
  });

  const productType = watch('type');

  // Load categories and attributes
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, attributesRes] = await Promise.all([
          categoryService.getCategories(),
          attributeService.getAttributes()
        ]);
        setCategories(categoriesRes.items || []);
        setAttributes(attributesRes.items || []);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, []);

  // Load product data if editing
  useEffect(() => {
    if (mode === 'edit' && id) {
      loadProduct(id);
    }
  }, [mode, id]);

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      const product = await productService.getProduct(productId);
      
      // Set form values
      setValue('sku', product.sku);
      setValue('name', product.name);
      setValue('description', product.description || '');
      setValue('shortDescription', product.shortDescription || '');
      setValue('slug', product.slug || '');
      setValue('status', product.status);
      setValue('visibility', product.visibility);
      setValue('type', product.type);
      setValue('price', product.price || null);
      setValue('compareAtPrice', product.compareAtPrice || null);
      setValue('cost', product.cost || null);
      setValue('barcode', product.barcode || '');
      setValue('trackInventory', product.trackInventory ?? true);
      setValue('weight', product.weight);
      setValue('weightUnit', product.weightUnit);
      setValue('featured', product.featured || false);
      setValue('metaTitle', product.metaTitle || '');
      setValue('metaDescription', product.metaDescription || '');
      setValue('metaKeywords', product.metaKeywords || []);
      
      // Set categories and attributes
      if (product.categories) {
        setValue('categoryIds', product.categories.map(c => c.id));
      }
      if (product.attributes) {
        const attrIds = product.attributes.map(a => a.id);
        setValue('attributeIds', attrIds);
        setSelectedAttributes(new Set(attrIds));
        
        // Set attribute values
        const values: Record<string, any> = {};
        product.attributes.forEach(attr => {
          values[attr.id] = attr.value;
        });
        setAttributeValues(values);
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setError(null);
    try {
      // Prepare attribute values
      const attributeData = Array.from(selectedAttributes).map(attrId => ({
        id: attrId,
        value: attributeValues[attrId]
      }));

      const productData: CreateProductDto | UpdateProductDto = {
        ...data,
        attributes: attributeData
      };

      if (mode === 'create') {
        await productService.createProduct(productData as CreateProductDto);
      } else if (id) {
        await productService.updateProduct(id, productData as UpdateProductDto);
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleAttributeToggle = (attributeId: string) => {
    const newSelected = new Set(selectedAttributes);
    if (newSelected.has(attributeId)) {
      newSelected.delete(attributeId);
      const newValues = { ...attributeValues };
      delete newValues[attributeId];
      setAttributeValues(newValues);
    } else {
      newSelected.add(attributeId);
    }
    setSelectedAttributes(newSelected);
    setValue('attributeIds', Array.from(newSelected));
  };

  const handleAttributeValueChange = (attributeId: string, value: any) => {
    setAttributeValues(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  const renderAttributeInput = (attribute: Attribute) => {
    const value = attributeValues[attribute.id] || '';

    switch (attribute.type) {
      case 'select':
      case 'multiselect':
        return (
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
            value={value}
            onChange={(e) => handleAttributeValueChange(attribute.id, e.target.value)}
            multiple={attribute.type === 'multiselect'}
          >
            <option value="">Select...</option>
            {attribute.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-navy-800 focus:ring-navy-800"
            checked={value === true || value === 'true'}
            onChange={(e) => handleAttributeValueChange(attribute.id, e.target.checked)}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
            value={value}
            onChange={(e) => handleAttributeValueChange(attribute.id, parseFloat(e.target.value))}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
            value={value}
            onChange={(e) => handleAttributeValueChange(attribute.id, e.target.value)}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
            value={value}
            onChange={(e) => handleAttributeValueChange(attribute.id, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
            rows={3}
            value={value}
            onChange={(e) => handleAttributeValueChange(attribute.id, e.target.value)}
          />
        );

      default:
        return (
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
            value={value}
            onChange={(e) => handleAttributeValueChange(attribute.id, e.target.value)}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {mode === 'create' ? 'Create New Product' : 'Edit Product'}
          </h3>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Fill in the product information below.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* SKU */}
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('sku')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  {...register('type')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                  disabled={mode === 'edit'}
                >
                  <option value={ProductType.SIMPLE}>Simple</option>
                  <option value={ProductType.VARIABLE}>Variable</option>
                  <option value={ProductType.BUNDLE}>Bundle</option>
                  <option value={ProductType.VIRTUAL}>Virtual</option>
                  <option value={ProductType.DOWNLOADABLE}>Downloadable</option>
                  <option value={ProductType.GROUPED}>Grouped</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                >
                  <option value={ProductStatus.DRAFT}>Draft</option>
                  <option value={ProductStatus.ACTIVE}>Active</option>
                  <option value={ProductStatus.ARCHIVED}>Archived</option>
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                  Visibility
                </label>
                <select
                  {...register('visibility')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                >
                  <option value={ProductVisibility.VISIBLE}>Visible</option>
                  <option value={ProductVisibility.HIDDEN}>Hidden</option>
                </select>
              </div>

              {/* Featured */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="h-4 w-4 rounded border-gray-300 text-navy-800 focus:ring-navy-800"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Featured Product
                </label>
              </div>
            </div>

            {/* Descriptions */}
            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                  Short Description
                </label>
                <textarea
                  {...register('shortDescription')}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Full Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Pricing & Inventory
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                    />
                  )}
                />
              </div>

              {/* Compare at Price */}
              <div>
                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700">
                  Compare at Price
                </label>
                <Controller
                  name="compareAtPrice"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                    />
                  )}
                />
              </div>

              {/* Cost */}
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                    />
                  )}
                />
              </div>

              {/* Barcode */}
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                  Barcode
                </label>
                <input
                  type="text"
                  {...register('barcode')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                />
              </div>

              {/* Track Inventory */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('trackInventory')}
                  className="h-4 w-4 rounded border-gray-300 text-navy-800 focus:ring-navy-800"
                />
                <label htmlFor="trackInventory" className="ml-2 block text-sm text-gray-900">
                  Track Inventory
                </label>
              </div>

              {/* Quantity */}
              {watch('trackInventory') && (
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Categories
            </h3>
            
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={category.id}
                    className="h-4 w-4 rounded border-gray-300 text-navy-800 focus:ring-navy-800"
                    {...register('categoryIds')}
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Attributes
            </h3>
            
            <div className="space-y-4">
              {attributes.map(attribute => (
                <div key={attribute.id} className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedAttributes.has(attribute.id)}
                      onChange={() => handleAttributeToggle(attribute.id)}
                      className="h-4 w-4 rounded border-gray-300 text-navy-800 focus:ring-navy-800 mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {attribute.name}
                        {attribute.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {attribute.description && (
                        <p className="text-xs text-gray-500 mt-1">{attribute.description}</p>
                      )}
                      
                      {selectedAttributes.has(attribute.id) && (
                        <div className="mt-2">
                          {renderAttributeInput(attribute)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              SEO
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  URL Slug
                </label>
                <input
                  type="text"
                  {...register('slug')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                  placeholder="product-url-slug"
                />
              </div>

              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  {...register('metaTitle')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <textarea
                  {...register('metaDescription')}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/products')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        description={`Product has been ${mode === 'create' ? 'created' : 'updated'} successfully.`}
      />
    </div>
  );
}
