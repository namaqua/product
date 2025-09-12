import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  CubeTransparentIcon,
  CubeIcon,
  TagIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import productService from '../../services/product.service';
import attributeService from '../../services/attribute.service';
import { Product } from '../../types/dto/products';

interface ProductModel {
  id?: string;
  name: string;
  commonAttributes: Record<string, any>;
  familyVariant?: {
    axes: string[]; // e.g., ['color', 'size']
    variantAttributes: string[]; // Attributes that can vary
    invariantAttributes: string[]; // Attributes that must be same
  };
}

interface ChildProduct extends Product {
  productModelId?: string; // Links to Product Model
  variantValues: Record<string, any>; // e.g., { color: 'blue', size: 'M' }
}

interface ProductModelVariantsProps {
  productId: string;
  productType: string;
  productSku: string;
  productName: string;
}

/**
 * Product Model & Variants Management
 * Following Akeneo PIM pattern:
 * - Product Model = abstract parent (not buyable)
 * - Child Products = actual variants with SKUs (buyable)
 * - Family Variants = defines variation axes
 */
export default function ProductModelVariants({ 
  productId, 
  productType, 
  productSku,
  productName
}: ProductModelVariantsProps) {
  const [loading, setLoading] = useState(false);
  const [isProductModel, setIsProductModel] = useState(false);
  const [childProducts, setChildProducts] = useState<ChildProduct[]>([]);
  const [familyVariant, setFamilyVariant] = useState<any>(null);
  const [availableAxes, setAvailableAxes] = useState<string[]>([]);
  const [selectedAxes, setSelectedAxes] = useState<string[]>([]);
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Common variation axes
  const commonAxes = {
    color: { 
      name: 'Color', 
      values: ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Navy'] 
    },
    size: { 
      name: 'Size', 
      values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] 
    },
    material: { 
      name: 'Material', 
      values: ['Cotton', 'Polyester', 'Wool', 'Leather', 'Synthetic'] 
    },
    storage: { 
      name: 'Storage', 
      values: ['128GB', '256GB', '512GB', '1TB', '2TB'] 
    },
    capacity: { 
      name: 'Capacity', 
      values: ['250ml', '500ml', '750ml', '1L', '2L'] 
    },
    finish: { 
      name: 'Finish', 
      values: ['Matte', 'Glossy', 'Satin', 'Textured'] 
    }
  };

  const [childForm, setChildForm] = useState({
    sku: '',
    name: '',
    variantValues: {} as Record<string, string>,
    price: '',
    quantity: 0,
    status: 'draft',
  });

  useEffect(() => {
    checkIfProductModel();
    loadChildProducts();
  }, [productId]);

  const checkIfProductModel = () => {
    // Check if this product is configured as a Product Model
    // In real implementation, this would check a field like isProductModel or type
    const hasNoSku = !productSku || productSku === 'MODEL';
    setIsProductModel(hasNoSku || productType === 'model');
  };

  const loadChildProducts = async () => {
    try {
      setLoading(true);
      // Load child products linked to this Product Model
      const response = await productService.getProducts({
        parentId: productId,
        limit: 100,
      });
      setChildProducts(response.items || []);
    } catch (err) {
      console.error('Failed to load child products:', err);
      setChildProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const convertToProductModel = async () => {
    if (!confirm('Convert this product to a Product Model? This will make it non-buyable and allow you to create child products with variations.')) {
      return;
    }

    try {
      setError(null);
      // Update product to be a Product Model
      await productService.updateProduct(productId, {
        type: 'model' as any,
        sku: 'MODEL-' + productId.slice(0, 8),
        // Clear inventory as Product Models aren't buyable
        quantity: 0,
        manageStock: false,
      });
      
      setIsProductModel(true);
      setSuccessMessage('Converted to Product Model successfully');
    } catch (err: any) {
      setError('Failed to convert to Product Model');
    }
  };

  const setupFamilyVariant = () => {
    setShowBulkCreate(true);
  };

  const generateChildCombinations = () => {
    if (selectedAxes.length === 0) {
      setError('Please select at least one variation axis');
      return [];
    }

    const combinations: Array<Record<string, string>> = [];
    
    const generateCombos = (index: number, current: Record<string, string>) => {
      if (index === selectedAxes.length) {
        combinations.push({ ...current });
        return;
      }
      
      const axis = selectedAxes[index];
      const values = commonAxes[axis as keyof typeof commonAxes]?.values || [];
      
      for (const value of values) {
        current[axis] = value;
        generateCombos(index + 1, current);
      }
    };
    
    generateCombos(0, {});
    return combinations;
  };

  const handleBulkCreateChildren = async () => {
    try {
      setError(null);
      const combinations = generateChildCombinations();
      
      if (combinations.length > 50) {
        if (!confirm(`This will create ${combinations.length} child products. Continue?`)) {
          return;
        }
      }

      let created = 0;
      
      for (const combo of combinations) {
        try {
          // Generate child SKU from variant values
          const variantSuffix = Object.values(combo)
            .map(v => v.substring(0, 3).toUpperCase())
            .join('-');
          
          const childSku = `${productSku || 'PROD'}-${variantSuffix}`;
          const childName = `${productName} - ${Object.values(combo).join(' / ')}`;
          
          const childData = {
            sku: childSku,
            name: childName,
            parentId: productId,
            type: 'simple' as const,
            status: 'draft' as const,
            quantity: 0,
            attributes: {
              ...combo,
              _productModel: productId,
            },
          };
          
          await productService.createProduct(childData);
          created++;
        } catch (err: any) {
          console.error(`Failed to create child: ${err.message}`);
        }
      }
      
      setSuccessMessage(`Created ${created} child products`);
      setShowBulkCreate(false);
      setSelectedAxes([]);
      loadChildProducts();
    } catch (err: any) {
      setError('Failed to create child products: ' + err.message);
    }
  };

  const handleCreateChild = async () => {
    try {
      setError(null);
      
      if (!childForm.sku || !childForm.name) {
        setError('SKU and Name are required');
        return;
      }

      const childData = {
        sku: childForm.sku,
        name: childForm.name,
        parentId: productId,
        type: 'simple' as const,
        price: childForm.price ? parseFloat(childForm.price) : undefined,
        quantity: childForm.quantity,
        status: childForm.status as any,
        attributes: {
          ...childForm.variantValues,
          _productModel: productId,
        },
      };

      await productService.createProduct(childData);
      setSuccessMessage('Child product created successfully');
      setShowCreateForm(false);
      resetChildForm();
      loadChildProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create child product');
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (!confirm('Delete this child product?')) return;
    
    try {
      await productService.deleteProduct(childId);
      setSuccessMessage('Child product deleted');
      loadChildProducts();
    } catch (err: any) {
      setError('Failed to delete child product');
    }
  };

  const resetChildForm = () => {
    setChildForm({
      sku: '',
      name: '',
      variantValues: {},
      price: '',
      quantity: 0,
      status: 'draft',
    });
  };

  const toggleChildExpansion = (childId: string) => {
    const newExpanded = new Set(expandedChildren);
    if (newExpanded.has(childId)) {
      newExpanded.delete(childId);
    } else {
      newExpanded.add(childId);
    }
    setExpandedChildren(newExpanded);
  };

  // If not a Product Model, show conversion option
  if (!isProductModel) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Product Model & Variants</h2>
        <div className="bg-amber-50 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">This is a Simple Product</h3>
              <p className="text-gray-600 mb-4">
                To manage variants using the Product Model pattern (like Akeneo PIM), 
                this product needs to be converted to a Product Model.
              </p>
              <div className="bg-white p-4 rounded border border-amber-200 mb-4">
                <h4 className="font-medium text-sm mb-2">What is a Product Model?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• An abstract parent that groups similar products</li>
                  <li>• Not buyable (no inventory or SKU)</li>
                  <li>• Contains common attributes shared by all variants</li>
                  <li>• Child products are the actual buyable variants</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={convertToProductModel}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  Convert to Product Model
                </button>
                <button
                  onClick={() => {}}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Keep as Simple Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product Model Interface
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center gap-2">
            <CubeTransparentIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-medium">Product Model</h2>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
              Not Buyable
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage child products (variants) that inherit common attributes from this model
          </p>
        </div>
        <div className="flex gap-2">
          {!showBulkCreate && !showCreateForm && (
            <>
              <button
                onClick={setupFamilyVariant}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <SparklesIcon className="h-4 w-4" />
                Generate Children
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                Add Child
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
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Family Variant Setup */}
      {showBulkCreate && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
          <h4 className="font-medium mb-3">Setup Family Variant</h4>
          <p className="text-sm text-gray-600 mb-4">
            Select variation axes to generate all possible child products:
          </p>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.entries(commonAxes).map(([key, axis]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedAxes.includes(key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAxes([...selectedAxes, key]);
                    } else {
                      setSelectedAxes(selectedAxes.filter(a => a !== key));
                    }
                  }}
                />
                <span className="text-sm">{axis.name}</span>
                <span className="text-xs text-gray-500">({axis.values.length} options)</span>
              </label>
            ))}
          </div>

          {selectedAxes.length > 0 && (
            <div className="p-3 bg-white rounded border border-purple-200 mb-4">
              <p className="text-sm">
                This will create{' '}
                <span className="font-bold text-purple-600">
                  {selectedAxes.reduce((total, axis) => 
                    total * (commonAxes[axis as keyof typeof commonAxes]?.values.length || 1), 1
                  )}
                </span>{' '}
                child products
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowBulkCreate(false);
                setSelectedAxes([]);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkCreateChildren}
              disabled={selectedAxes.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Generate Child Products
            </button>
          </div>
        </div>
      )}

      {/* Manual Child Creation Form */}
      {showCreateForm && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <h4 className="font-medium mb-4">Create Child Product</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={childForm.sku}
                onChange={(e) => setChildForm(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PROD-BLU-M"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={childForm.name}
                onChange={(e) => setChildForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Product Name - Blue - Medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                value={childForm.price}
                onChange={(e) => setChildForm(prev => ({ ...prev, price: e.target.value }))}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={childForm.quantity}
                onChange={(e) => setChildForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={childForm.status}
                onChange={(e) => setChildForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetChildForm();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateChild}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Child Product
            </button>
          </div>
        </div>
      )}

      {/* Child Products List */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading child products...
        </div>
      )}

      {!loading && childProducts.length === 0 && !showCreateForm && !showBulkCreate && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No child products yet</p>
          <p className="text-sm text-gray-500">
            Child products are the buyable variants that inherit common attributes from this Product Model
          </p>
        </div>
      )}

      {!loading && childProducts.length > 0 && (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <span className="font-medium">{childProducts.length}</span> child product(s)
              </div>
              <div className="text-sm text-blue-600">
                Total Stock: {childProducts.reduce((sum, child) => sum + (child.quantity || 0), 0)} units
              </div>
            </div>
          </div>

          {childProducts.map((child) => (
            <div key={child.id} className="border border-gray-200 rounded-lg">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleChildExpansion(child.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedChildren.has(child.id) ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-3">
                        <CubeIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{child.name}</span>
                        <span className="text-sm text-gray-500 font-mono">SKU: {child.sku}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          child.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {child.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>Price: ${child.price || '0.00'}</span>
                        <span className={child.quantity === 0 ? 'text-red-600' : ''}>
                          Stock: {child.quantity || 0}
                        </span>
                        {child.attributes && (
                          <div className="flex gap-2">
                            {Object.entries(child.attributes)
                              .filter(([key]) => !key.startsWith('_'))
                              .map(([key, value]) => (
                                <span key={key} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                  {key}: {value}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      className="p-2 text-gray-500 hover:text-red-600"
                      title="Delete child"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {expandedChildren.has(child.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Cost:</span>
                        <span className="ml-2">${child.cost || '0.00'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <span className="ml-2">{child.weight || '0'} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Barcode:</span>
                        <span className="ml-2">{child.barcode || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">In Stock:</span>
                        <span className="ml-2">{child.inStock ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900 mb-2">Product Model Pattern (Akeneo Style)</h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Product Model = Abstract parent (not buyable, no inventory)</li>
          <li>• Child Products = Actual buyable products with SKUs</li>
          <li>• Common attributes are inherited from the Product Model</li>
          <li>• Variant attributes (color, size) differ per child</li>
          <li>• This is the industry-standard PIM pattern</li>
        </ul>
      </div>
    </div>
  );
}