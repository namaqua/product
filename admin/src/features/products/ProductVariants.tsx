import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  CubeIcon,
  TagIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  TableCellsIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import productService from '../../services/product.service';
import variantService from '../../services/variant.service';
import { Product } from '../../types/dto/products';
import VariantWizard from './variants/VariantWizard';
import VariantMatrix from './variants/VariantMatrix';
import TemplateManager from './variants/TemplateManager';

interface Variant extends Product {
  variantLabel?: string; // e.g., "Small", "Blue", "32GB"
}

interface ProductVariantsProps {
  productId: string;
  productType: string;
  productSku: string;
  productName: string;
  onTypeChange?: (type: string) => void;
}

// Simple Master-Variant relationship for inventory management
// Not for configurable products (which are product builders)
export default function ProductVariants({ 
  productId, 
  productType, 
  productSku,
  productName,
  onTypeChange 
}: ProductVariantsProps) {
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showVariantWizard, setShowVariantWizard] = useState(false);
  const [showMatrixView, setShowMatrixView] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasVariantGroup, setHasVariantGroup] = useState(false);
  const [productPrice, setProductPrice] = useState<number>(0);

  // Form state for new/edit variant
  const [variantForm, setVariantForm] = useState({
    variantLabel: '', // What makes this variant different (e.g., "Small", "Blue", "1TB")
    sku: '',
    name: '',
    price: '',
    specialPrice: '',
    cost: '',
    quantity: 0,
    barcode: '',
    weight: '',
    status: 'draft',
  });

  // Load templates from localStorage + default templates
  const loadVariantTemplates = () => {
    const stored = localStorage.getItem('variantTemplates');
    const customTemplates = stored ? JSON.parse(stored) : [];
    
    // Merge custom templates with defaults
    const allTemplates: Record<string, string[]> = {
      // Default templates
    // Apparel & Fashion
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'],
    euSizes: ['36', '38', '40', '42', '44', '46', '48', '50'],
    shoeSizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
    colors: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray', 'Navy', 'Pink', 'Purple', 'Orange', 'Brown'],
    materials: ['Cotton', 'Polyester', 'Wool', 'Leather', 'Synthetic', 'Silk', 'Linen', 'Denim', 'Canvas'],
    
    // Electronics
    storage: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB'],
    memory: ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'],
    processors: ['i3', 'i5', 'i7', 'i9', 'Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9'],
    screenSizes: ['13"', '14"', '15.6"', '17"', '21"', '24"', '27"', '32"'],
    
    // Food & Beverage
    flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Mint', 'Caramel', 'Coffee', 'Banana', 'Mango'],
    packSizes: ['Single', '3-Pack', '6-Pack', '12-Pack', '24-Pack', 'Bulk'],
    weights: ['100g', '250g', '500g', '1kg', '2kg', '5kg'],
    
    // Furniture & Home
    finishes: ['Matte', 'Glossy', 'Satin', 'Textured', 'Polished', 'Brushed', 'Natural'],
    roomTypes: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Outdoor'],
    dimensions: ['Small', 'Medium', 'Large', 'X-Large', 'Compact', 'Standard', 'Oversized'],
    
    // Jewelry & Accessories
    ringSizes: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
    chainLengths: ['16"', '18"', '20"', '22"', '24"', '30"'],
    metalTypes: ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Stainless Steel', 'Titanium'],
    
    // General
    conditions: ['New', 'Like New', 'Good', 'Fair', 'Refurbished'],
    warranties: ['No Warranty', '30 Days', '90 Days', '1 Year', '2 Years', '3 Years', 'Lifetime'],
    locations: ['USA', 'Europe', 'Asia', 'Global', 'North America', 'South America'],
    speeds: ['Standard', 'Express', '2-Day', 'Next Day', 'Same Day'],
    };
    
    // Add custom templates
    customTemplates.forEach((template: any) => {
      allTemplates[template.id] = template.values;
    });
    
    return allTemplates;
  };
  
  const [variantTemplates, setVariantTemplates] = useState(loadVariantTemplates());

  useEffect(() => {
    loadVariants();
    checkVariantGroup();
    loadProductInfo();
  }, [productId]);

  const loadVariants = async () => {
    try {
      setLoading(true);
      // Master-variant products use simple parent-child relationships
      // NOT configurable products (which are for complex product builders like PC configurators)
      
      // Get variants (products with parentId = this product)
      const variantsResponse = await productService.getProducts({
        parentId: productId,
        limit: 100,
      });
      
      setVariants(variantsResponse.items || []);
      setHasVariantGroup(false); // Master-variant doesn't use variant groups
    } catch (err) {
      console.error('Failed to load variants:', err);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const checkVariantGroup = async () => {
    // Master-variant products don't use variant groups
    // Variant groups are reserved for future configurable products (PC builders, etc.)
    // We use simple parent-child relationships for inventory variants
    setHasVariantGroup(false);
  };

  const loadProductInfo = async () => {
    try {
      const product = await productService.getProduct(productId);
      setProductPrice(product.price || 0);
    } catch (err) {
      console.error('Failed to load product info:', err);
    }
  };

  const handleQuickCreate = async (templateType: keyof typeof variantTemplates) => {
    const values = variantTemplates[templateType];
    const confirmMsg = `This will create ${values.length} variants (${values.join(', ')}). Continue?`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
      setError(null);
      let created = 0;
      const errors: string[] = [];
      
      for (const value of values) {
        try {
          const variantSku = `${productSku}-${value.replace(/\s+/g, '-').toUpperCase()}`;
          const variantName = `${productName} - ${value}`;
          
          const variantData = {
            sku: variantSku,
            name: variantName,
            parentId: productId,
            type: 'simple' as const,
            status: 'draft' as const,
            quantity: 0,
            attributes: {
              variantLabel: value,
              variantType: templateType
            },
          };
          
          await productService.createProduct(variantData);
          created++;
        } catch (err: any) {
          if (!err.message?.includes('already exists')) {
            errors.push(`Failed to create ${value}: ${err.message}`);
          }
        }
      }
      
      if (created > 0) {
        setSuccessMessage(`Successfully created ${created} variants`);
        loadVariants();
        // Clear success message after delay
        setTimeout(() => setSuccessMessage(null), 5000);
      }
      
      if (errors.length > 0) {
        setError(errors.join('\n'));
      }
    } catch (err: any) {
      console.error('Failed to create variants:', err);
      setError('Failed to create variants: ' + err.message);
    }
  };

  const handleCreateVariant = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      if (!variantForm.sku || !variantForm.name || !variantForm.variantLabel) {
        setError('SKU, Name, and Variant Label are required');
        return;
      }

      const variantData = {
        sku: variantForm.sku,
        name: variantForm.name,
        parentId: productId,
        type: 'simple' as const,
        price: variantForm.price ? parseFloat(variantForm.price) : undefined,
        specialPrice: variantForm.specialPrice ? parseFloat(variantForm.specialPrice) : undefined,
        cost: variantForm.cost ? parseFloat(variantForm.cost) : undefined,
        weight: variantForm.weight ? parseFloat(variantForm.weight) : undefined,
        quantity: parseInt(variantForm.quantity.toString()) || 0,
        status: variantForm.status.toLowerCase() as any,
        barcode: variantForm.barcode || undefined,
        attributes: {
          variantLabel: variantForm.variantLabel
        },
      };

      await productService.createProduct(variantData);
      
      setSuccessMessage('Variant created successfully');
      setShowCreateForm(false);
      resetVariantForm();
      loadVariants();
      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to create variant:', err);
      setError(err.response?.data?.message || 'Failed to create variant');
    }
  };

  const handleUpdateVariant = async (variantId: string) => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      const updateData = {
        sku: variantForm.sku,
        name: variantForm.name,
        price: variantForm.price ? parseFloat(variantForm.price) : undefined,
        specialPrice: variantForm.specialPrice ? parseFloat(variantForm.specialPrice) : undefined,
        cost: variantForm.cost ? parseFloat(variantForm.cost) : undefined,
        weight: variantForm.weight ? parseFloat(variantForm.weight) : undefined,
        quantity: parseInt(variantForm.quantity.toString()) || 0,
        status: variantForm.status.toLowerCase() as any,
        barcode: variantForm.barcode || undefined,
        attributes: {
          variantLabel: variantForm.variantLabel
        },
      };

      await productService.updateProduct(variantId, updateData);
      
      setSuccessMessage('Variant updated successfully');
      setEditingVariant(null);
      resetVariantForm();
      loadVariants();
      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to update variant:', err);
      setError(err.response?.data?.message || 'Failed to update variant');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) {
      return;
    }

    try {
      setError(null);
      await productService.deleteProduct(variantId);
      setSuccessMessage('Variant deleted successfully');
      loadVariants();
      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to delete variant:', err);
      setError(err.response?.data?.message || 'Failed to delete variant');
    }
  };

  const handleDuplicateVariant = async (variant: Variant) => {
    try {
      setError(null);
      const timestamp = Date.now().toString().slice(-6);
      
      const variantData = {
        sku: `${variant.sku}-COPY-${timestamp}`,
        name: `${variant.name} (Copy)`,
        parentId: productId,
        type: 'simple' as const,
        price: variant.price ? parseFloat(variant.price.toString()) : undefined,
        specialPrice: variant.specialPrice ? parseFloat(variant.specialPrice.toString()) : undefined,
        cost: variant.cost ? parseFloat(variant.cost.toString()) : undefined,
        weight: variant.weight || undefined,
        quantity: variant.quantity || 0,
        status: 'draft' as const,
        barcode: variant.barcode || undefined,
        attributes: variant.attributes || {},
      };

      await productService.createProduct(variantData);
      setSuccessMessage('Variant duplicated successfully');
      loadVariants();
      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to duplicate variant:', err);
      setError(err.response?.data?.message || 'Failed to duplicate variant');
    }
  };

  const startEditVariant = (variant: Variant) => {
    setEditingVariant(variant.id);
    setVariantForm({
      variantLabel: variant.attributes?.variantLabel || '',
      sku: variant.sku || '',
      name: variant.name || '',
      price: variant.price?.toString() || '',
      specialPrice: variant.specialPrice?.toString() || '',
      cost: variant.cost?.toString() || '',
      quantity: variant.quantity || 0,
      barcode: variant.barcode || '',
      weight: variant.weight?.toString() || '',
      status: variant.status || 'draft',
    });
    setShowCreateForm(false);
  };

  const resetVariantForm = () => {
    setVariantForm({
      variantLabel: '',
      sku: '',
      name: '',
      price: '',
      specialPrice: '',
      cost: '',
      quantity: 0,
      barcode: '',
      weight: '',
      status: 'draft',
    });
  };

  const toggleVariantExpansion = (variantId: string) => {
    const newExpanded = new Set(expandedVariants);
    if (newExpanded.has(variantId)) {
      newExpanded.delete(variantId);
    } else {
      newExpanded.add(variantId);
    }
    setExpandedVariants(newExpanded);
  };

  const generateVariantSKU = () => {
    if (!variantForm.variantLabel) {
      setError('Please enter a variant label first');
      return;
    }
    const label = variantForm.variantLabel.replace(/\s+/g, '-').toUpperCase();
    setVariantForm(prev => ({
      ...prev,
      sku: `${productSku}-${label}`,
      name: `${productName} - ${prev.variantLabel}`
    }));
  };

  // Variant Form Component
  const VariantForm = ({ isEdit = false, onSubmit, onCancel }: any) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="font-medium mb-4">{isEdit ? 'Edit Variant' : 'Create New Variant'}</h4>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variant Label <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={variantForm.variantLabel}
          onChange={(e) => setVariantForm(prev => ({ ...prev, variantLabel: e.target.value }))}
          placeholder="e.g., Small, Blue, 256GB"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="mt-1 text-xs text-gray-500">What makes this variant different (size, color, capacity, etc.)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={variantForm.sku}
              onChange={(e) => setVariantForm(prev => ({ ...prev, sku: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {!isEdit && (
              <button
                type="button"
                onClick={generateVariantSKU}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                title="Generate from label"
              >
                Auto
              </button>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={variantForm.name}
            onChange={(e) => setVariantForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="number"
            value={variantForm.price}
            onChange={(e) => setVariantForm(prev => ({ ...prev, price: e.target.value }))}
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Price</label>
          <input
            type="number"
            value={variantForm.specialPrice}
            onChange={(e) => setVariantForm(prev => ({ ...prev, specialPrice: e.target.value }))}
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            value={variantForm.quantity}
            onChange={(e) => setVariantForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
          <input
            type="number"
            value={variantForm.cost}
            onChange={(e) => setVariantForm(prev => ({ ...prev, cost: e.target.value }))}
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
          <input
            type="text"
            value={variantForm.barcode}
            onChange={(e) => setVariantForm(prev => ({ ...prev, barcode: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            value={variantForm.weight}
            onChange={(e) => setVariantForm(prev => ({ ...prev, weight: e.target.value }))}
            step="0.001"
            placeholder="0.000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={variantForm.status}
          onChange={(e) => setVariantForm(prev => ({ ...prev, status: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isEdit ? 'Update Variant' : 'Create Variant'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium">Product Variants</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage inventory variations of this product (sizes, colors, etc.)
          </p>
        </div>
        <div className="flex gap-2">
          {!showCreateForm && !editingVariant && !showVariantWizard && !showMatrixView && (
            <>
              <button
                onClick={() => setShowTemplateManager(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                title="Manage variant templates"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                Templates
              </button>
              {variants.length > 0 && (
                <button
                  onClick={() => setShowMatrixView(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  title="View and edit all variants in a grid"
                >
                  <TableCellsIcon className="h-4 w-4" />
                  Matrix View
                </button>
              )}
              <button
                onClick={() => setShowVariantWizard(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                title="Create multi-axis variants (Size × Color)"
              >
                <SparklesIcon className="h-4 w-4" />
                Multi-Axis Wizard
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  resetVariantForm();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                title="Add a single variant"
              >
                <PlusIcon className="h-4 w-4" />
                Add Single Variant
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-800 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Matrix View Modal */}
      {showMatrixView && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
            <VariantMatrix
              productId={productId}
              productSku={productSku}
              productName={productName}
              onClose={() => setShowMatrixView(false)}
              onUpdate={() => {
                loadVariants();
                setSuccessMessage('Variants updated successfully!');
                setTimeout(() => setSuccessMessage(null), 5000);
              }}
            />
          </div>
        </div>
      )}

      {/* Variant Wizard Modal */}
      {showVariantWizard && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl w-full mx-4">
            <VariantWizard
              productId={productId}
              productSku={productSku}
              productName={productName}
              productPrice={productPrice}
              onComplete={() => {
                setShowVariantWizard(false);
                loadVariants();
                setSuccessMessage('Variants created successfully!');
                setTimeout(() => setSuccessMessage(null), 5000);
              }}
              onCancel={() => setShowVariantWizard(false)}
            />
          </div>
        </div>
      )}

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <TemplateManager
          onClose={() => {
            setShowTemplateManager(false);
            // Reload templates after manager closes
            setVariantTemplates(loadVariantTemplates());
          }}
          onSelectTemplate={(templateId, values) => {
            // Use the selected template
            handleQuickCreate(templateId as keyof typeof variantTemplates);
            setShowTemplateManager(false);
          }}
        />
      )}

      {/* Quick Create Templates */}
      {!showCreateForm && !editingVariant && !showVariantWizard && !showMatrixView && variants.length === 0 && (
        <div className="mb-4 p-4 bg-orange-50 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-orange-900">Quick Create Templates</h4>
            <button
              onClick={() => setShowTemplateManager(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-white text-orange-600 border border-orange-300 rounded hover:bg-orange-100"
              title="Manage Templates"
            >
              <Cog6ToothIcon className="h-3 w-3" />
              Manage Templates
            </button>
          </div>
          
          {/* Group templates by category */}
          {(() => {
            // Get all stored templates
            const stored = localStorage.getItem('variantTemplates');
            const customTemplates = stored ? JSON.parse(stored) : [];
            
            // Organize templates by category
            const templatesByCategory: Record<string, Array<{id: string, name: string, values: string[]}>> = {
              'Apparel & Fashion': [
                { id: 'sizes', name: 'Sizes (XS-3XL)', values: variantTemplates['sizes'] },
                { id: 'euSizes', name: 'EU Sizes (36-50)', values: variantTemplates['euSizes'] },
                { id: 'shoeSizes', name: 'Shoe Sizes', values: variantTemplates['shoeSizes'] },
                { id: 'colors', name: 'Colors (12)', values: variantTemplates['colors'] },
                { id: 'materials', name: 'Materials', values: variantTemplates['materials'] },
              ],
              'Electronics': [
                { id: 'storage', name: 'Storage (64GB-4TB)', values: variantTemplates['storage'] },
                { id: 'memory', name: 'Memory/RAM', values: variantTemplates['memory'] },
                { id: 'processors', name: 'Processors', values: variantTemplates['processors'] },
                { id: 'screenSizes', name: 'Screen Sizes', values: variantTemplates['screenSizes'] },
              ],
              'Food & Beverage': [
                { id: 'flavors', name: 'Flavors', values: variantTemplates['flavors'] },
                { id: 'packSizes', name: 'Pack Sizes', values: variantTemplates['packSizes'] },
                { id: 'weights', name: 'Weights', values: variantTemplates['weights'] },
              ],
            };
            
            // Add custom templates to their categories
            customTemplates.forEach((template: any) => {
              const category = template.category || 'Custom';
              if (!templatesByCategory[category]) {
                templatesByCategory[category] = [];
              }
              templatesByCategory[category].push({
                id: template.id,
                name: `${template.name} (${template.values.length})`,
                values: template.values,
              });
            });
            
            // Render categories with templates
            return Object.entries(templatesByCategory).slice(0, 3).map(([category, templates]) => (
              <div key={category} className="mb-3">
                <h5 className="text-xs font-medium text-gray-700 mb-2">{category}</h5>
                <div className="flex flex-wrap gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleQuickCreate(template.id as keyof typeof variantTemplates)}
                      className="px-3 py-1 bg-white text-orange-600 border border-orange-300 rounded hover:bg-orange-100 text-sm"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            ));
          })()}

          
          {/* Link to Template Manager for more */}
          <div className="mt-3 text-center">
            <button
              onClick={() => setShowTemplateManager(true)}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              View all templates and create custom ones →
            </button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <VariantForm
          onSubmit={handleCreateVariant}
          onCancel={() => {
            setShowCreateForm(false);
            resetVariantForm();
          }}
        />
      )}

      {loading && !showCreateForm && (
        <div className="text-center py-8 text-gray-500">
          Loading variants...
        </div>
      )}

      {!loading && variants.length === 0 && !showCreateForm && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No variants created yet.</p>
          <p className="text-sm text-gray-500">
            Create variants for different versions of this product (sizes, colors, capacities, etc.)
          </p>
        </div>
      )}

      {/* Variants List */}
      {!loading && variants.length > 0 && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{variants.length}</span> variant(s) | 
                Total Stock: <span className="font-medium">{variants.reduce((sum, v) => sum + (v.quantity || 0), 0)}</span> units
              </div>
              <div className="text-xs text-gray-500">
                Active: {variants.filter(v => v.status === 'published').length} | 
                Draft: {variants.filter(v => v.status === 'draft').length}
              </div>
            </div>
          </div>

          {variants.map((variant) => (
            <div key={variant.id} className="border border-gray-200 rounded-lg">
              {editingVariant === variant.id ? (
                <div className="p-4">
                  <VariantForm
                    isEdit
                    onSubmit={() => handleUpdateVariant(variant.id)}
                    onCancel={() => {
                      setEditingVariant(null);
                      resetVariantForm();
                    }}
                  />
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleVariantExpansion(variant.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedVariants.has(variant.id) ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-3">
                          {variant.attributes?.variantLabel && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                              {variant.attributes.variantLabel}
                            </span>
                          )}
                          <span className="font-medium">{variant.name}</span>
                          <span className="text-sm text-gray-500 font-mono">SKU: {variant.sku}</span>
                          {variant.status === 'published' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3" />
                              Active
                            </span>
                          ) : variant.status === 'archived' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <XCircleIcon className="h-3 w-3" />
                              Archived
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>Price: ${variant.price || '0.00'}</span>
                          {variant.specialPrice && (
                            <span className="text-red-600">Special: ${variant.specialPrice}</span>
                          )}
                          <span className={variant.quantity === 0 ? 'text-red-600 font-medium' : ''}>
                            Stock: {variant.quantity || 0}
                          </span>
                          {variant.barcode && <span>Barcode: {variant.barcode}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDuplicateVariant(variant)}
                        className="p-2 text-gray-500 hover:text-blue-600"
                        title="Duplicate variant"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => startEditVariant(variant)}
                        className="p-2 text-gray-500 hover:text-blue-600"
                        title="Edit variant"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="p-2 text-gray-500 hover:text-red-600"
                        title="Delete variant"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {expandedVariants.has(variant.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Cost:</span>
                          <span className="ml-2 font-medium">${variant.cost || '0.00'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Weight:</span>
                          <span className="ml-2 font-medium">{variant.weight || '0'} kg</span>
                        </div>
                        <div>
                          <span className="text-gray-500">In Stock:</span>
                          <span className="ml-2 font-medium">
                            {variant.inStock ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <span className="ml-2 font-medium">
                            {new Date(variant.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Panel */}
      {!showCreateForm && !editingVariant && !showVariantWizard && !showMatrixView && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">About Product Variants</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Variants are inventory variations of the same product (e.g., sizes, colors)</li>
            <li>• Each variant has its own SKU, price, and stock level</li>
            <li>• Customers see variants as options of the main product</li>
            <li>• For customizable products (like computers), use "Configurable" product type instead</li>
          </ul>
        </div>
      )}
    </div>
  );
}