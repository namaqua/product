// admin/src/features/products/variants/VariantMatrix.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  TableCellsIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import variantService from '../../../services/variant.service';
import productService from '../../../services/product.service';
import { VariantMatrixDto, BulkVariantUpdateDto, PriceAdjustmentType } from '../../../types/dto/variants';

interface VariantMatrixProps {
  productId: string;
  productSku: string;
  productName: string;
  onClose?: () => void;
  onUpdate?: () => void;
}

interface CellEdit {
  variantId: string;
  field: 'price' | 'quantity' | 'sku';
  value: string | number;
}

interface FilterState {
  stockLevel: 'all' | 'in-stock' | 'out-of-stock' | 'low-stock';
  status: 'all' | 'published' | 'draft' | 'archived';
  priceRange: { min?: number; max?: number };
}

export default function VariantMatrix({
  productId,
  productSku,
  productName,
  onClose,
  onUpdate,
}: VariantMatrixProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrixData, setMatrixData] = useState<VariantMatrixDto | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [editingCell, setEditingCell] = useState<CellEdit | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    stockLevel: 'all',
    status: 'all',
    priceRange: {},
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Bulk actions
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkPriceAdjustment, setBulkPriceAdjustment] = useState({ type: 'percentage', value: 0 });
  const [bulkQuantityAdjustment, setBulkQuantityAdjustment] = useState({ operation: 'set', value: 0 });

  useEffect(() => {
    // Load both in sequence to ensure proper fallback
    const loadData = async () => {
      try {
        setLoading(true);
        // First load variants
        const response = await productService.getProducts({
          parentId: productId,
          limit: 100,
          includeVariants: true,
        });
        const items = response.items || [];
        setVariants(items);
        
        // Then try to load matrix, with variants as fallback
        await loadMatrixData(items);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load variant data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [productId]);

  const loadMatrixData = async (variantList?: any[]) => {
    try {
      const response = await variantService.getVariantMatrix(productId);
      console.log('Matrix response:', response);
      setMatrixData(response.item);
    } catch (err: any) {
      console.error('Failed to load matrix data:', err);
      // If the endpoint fails, build matrix from variants
      console.log('Falling back to building matrix from variants');
      // Build a basic matrix from the variants list
      const variantsToUse = variantList || variants;
      if (variantsToUse.length > 0) {
        buildMatrixFromVariants(variantsToUse);
      }
      setError(null); // Clear error since we have a fallback
    }
  };

  const loadVariants = async () => {
    try {
      const response = await productService.getProducts({
        parentId: productId,
        limit: 100,
        includeVariants: true,
      });
      const items = response.items || [];
      setVariants(items);
      
      // Store items for potential fallback
      // Matrix data will be built after loadMatrixData if needed
    } catch (err) {
      console.error('Failed to load variants:', err);
    }
  };

  // Fallback: Build matrix from variant list
  const buildMatrixFromVariants = (variantList: any[]) => {
    console.log('Building matrix from variants:', variantList);
    
    // Extract axes from variants
    const axesSet = new Set<string>();
    const axisValuesMap: Record<string, Set<string>> = {};
    
    variantList.forEach(variant => {
      // Try to extract axes from variant name or attributes
      if (variant.variantAxes) {
        Object.entries(variant.variantAxes).forEach(([axis, value]) => {
          axesSet.add(axis);
          if (!axisValuesMap[axis]) {
            axisValuesMap[axis] = new Set();
          }
          axisValuesMap[axis].add(String(value));
        });
      } else if (variant.attributes?.variantLabel) {
        // Fallback to simple label
        axesSet.add('Variant');
        if (!axisValuesMap['Variant']) {
          axisValuesMap['Variant'] = new Set();
        }
        axisValuesMap['Variant'].add(variant.attributes.variantLabel);
      }
    });
    
    const axes = Array.from(axesSet);
    const axisValues: Record<string, string[]> = {};
    Object.entries(axisValuesMap).forEach(([axis, values]) => {
      axisValues[axis] = Array.from(values);
    });
    
    // Build matrix cells
    const matrixCells = variantList.map(variant => {
      const axes: Record<string, any> = {};
      
      if (variant.variantAxes) {
        Object.assign(axes, variant.variantAxes);
      } else if (variant.attributes?.variantLabel) {
        axes['Variant'] = variant.attributes.variantLabel;
      }
      
      return {
        axes,
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        quantity: variant.quantity,
        status: variant.status,
      };
    });
    
    const matrixDto: VariantMatrixDto = {
      parentId: productId,
      axes,
      axisValues,
      matrix: matrixCells,
      summary: {
        total: variantList.length,
        created: variantList.length,
        missing: 0,
      },
    };
    
    setMatrixData(matrixDto);
  };

  // Build the matrix structure
  const matrix = useMemo(() => {
    if (!matrixData) return null;

    const { axes, axisValues, matrix: matrixCells } = matrixData;
    
    if (axes.length === 0) return null;
    
    // For simplicity, we'll handle 1-3 axes
    if (axes.length === 1) {
      // Single axis - simple list
      return {
        type: 'single',
        axis: axes[0],
        values: axisValues[axes[0]] || [],
        cells: matrixCells,
      };
    } else if (axes.length === 2) {
      // Two axes - traditional matrix
      const [rowAxis, colAxis] = axes;
      return {
        type: 'double',
        rowAxis,
        colAxis,
        rowValues: axisValues[rowAxis] || [],
        colValues: axisValues[colAxis] || [],
        cells: matrixCells,
      };
    } else {
      // Three+ axes - grouped matrix
      const [groupAxis, rowAxis, colAxis] = axes;
      return {
        type: 'triple',
        groupAxis,
        rowAxis,
        colAxis,
        groupValues: axisValues[groupAxis] || [],
        rowValues: axisValues[rowAxis] || [],
        colValues: axisValues[colAxis] || [],
        cells: matrixCells,
      };
    }
  }, [matrixData]);

  // Find cell data for specific axis combination
  const findCell = (combination: Record<string, any>) => {
    if (!matrixData) return null;
    
    return matrixData.matrix.find(cell => {
      return Object.entries(combination).every(([key, value]) => 
        cell.axes[key] === value
      );
    });
  };

  // Get variant data for a cell
  const getVariantForCell = (cell: any) => {
    if (!cell?.id) return null;
    return variants.find(v => v.id === cell.id);
  };

  // Apply filters to cells
  const isVisible = (cell: any) => {
    const variant = getVariantForCell(cell);
    
    // Stock level filter
    if (filters.stockLevel !== 'all') {
      const quantity = cell?.quantity || 0;
      if (filters.stockLevel === 'out-of-stock' && quantity > 0) return false;
      if (filters.stockLevel === 'in-stock' && quantity === 0) return false;
      if (filters.stockLevel === 'low-stock' && quantity > 10) return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && cell?.status !== filters.status) {
      return false;
    }
    
    // Price range filter
    if (filters.priceRange.min !== undefined && (cell?.price || 0) < filters.priceRange.min) {
      return false;
    }
    if (filters.priceRange.max !== undefined && (cell?.price || 0) > filters.priceRange.max) {
      return false;
    }
    
    return true;
  };

  // Handle cell editing
  const startEdit = (variantId: string, field: 'price' | 'quantity' | 'sku', currentValue: any) => {
    setEditingCell({
      variantId,
      field,
      value: currentValue || '',
    });
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    
    try {
      setSaving(true);
      
      const updateData: any = {};
      if (editingCell.field === 'price') {
        updateData.price = parseFloat(editingCell.value.toString());
      } else if (editingCell.field === 'quantity') {
        updateData.quantity = parseInt(editingCell.value.toString());
      } else if (editingCell.field === 'sku') {
        updateData.sku = editingCell.value.toString();
      }
      
      await variantService.updateVariant(editingCell.variantId, updateData);
      
      // Refresh data
      await loadMatrixData();
      await loadVariants();
      
      setEditingCell(null);
      setSuccessMessage('Updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // Handle bulk actions
  const applyBulkPriceAdjustment = async () => {
    if (selectedVariants.size === 0) {
      setError('Please select variants first');
      return;
    }
    
    try {
      setSaving(true);
      
      await variantService.adjustVariantPrices(
        Array.from(selectedVariants),
        {
          type: bulkPriceAdjustment.type as any,
          value: bulkPriceAdjustment.value,
        }
      );
      
      setSuccessMessage(`Updated prices for ${selectedVariants.size} variants`);
      setSelectedVariants(new Set());
      await loadMatrixData();
      await loadVariants();
    } catch (err: any) {
      setError(err.message || 'Failed to update prices');
    } finally {
      setSaving(false);
    }
  };

  const applyBulkQuantityAdjustment = async () => {
    if (selectedVariants.size === 0) {
      setError('Please select variants first');
      return;
    }
    
    try {
      setSaving(true);
      
      await variantService.updateVariantInventory(
        Array.from(selectedVariants),
        bulkQuantityAdjustment.operation as any,
        bulkQuantityAdjustment.value
      );
      
      setSuccessMessage(`Updated inventory for ${selectedVariants.size} variants`);
      setSelectedVariants(new Set());
      await loadMatrixData();
      await loadVariants();
    } catch (err: any) {
      setError(err.message || 'Failed to update inventory');
    } finally {
      setSaving(false);
    }
  };

  const toggleVariantSelection = (variantId: string) => {
    const newSelection = new Set(selectedVariants);
    if (newSelection.has(variantId)) {
      newSelection.delete(variantId);
    } else {
      newSelection.add(variantId);
    }
    setSelectedVariants(newSelection);
  };

  const selectAll = () => {
    const allIds = matrixData?.matrix
      .filter(cell => cell.id && isVisible(cell))
      .map(cell => cell.id) || [];
    setSelectedVariants(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedVariants(new Set());
  };

  // Render cell content
  const renderCell = (cell: any) => {
    if (!cell) {
      return (
        <div className="p-4 bg-gray-50 text-center text-gray-400">
          <span className="text-xs">Not created</span>
        </div>
      );
    }

    const isSelected = cell.id && selectedVariants.has(cell.id);
    const isEditing = editingCell?.variantId === cell.id;
    const variant = getVariantForCell(cell);
    const quantity = cell.quantity || 0;
    const stockClass = quantity === 0 
      ? 'bg-red-50 border-red-200' 
      : quantity <= 10 
      ? 'bg-yellow-50 border-yellow-200' 
      : 'bg-green-50 border-green-200';

    return (
      <div className={`p-3 border ${stockClass} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        {cell.id && (
          <div className="flex items-center justify-between mb-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleVariantSelection(cell.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className={`text-xs px-2 py-1 rounded ${
              cell.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {cell.status || 'draft'}
            </span>
          </div>
        )}

        {/* SKU */}
        <div className="mb-2">
          {isEditing && editingCell?.field === 'sku' ? (
            <input
              type="text"
              value={editingCell.value}
              onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
              className="w-full px-2 py-1 text-xs border rounded"
              autoFocus
            />
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-600">{cell.sku || 'No SKU'}</span>
              {cell.id && (
                <button
                  onClick={() => startEdit(cell.id, 'sku', cell.sku)}
                  className="p-1 hover:bg-white rounded"
                >
                  <PencilIcon className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-2">
          {isEditing && editingCell?.field === 'price' ? (
            <div className="flex gap-1">
              <input
                type="number"
                value={editingCell.value}
                onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded"
                step="0.01"
                autoFocus
              />
              <button onClick={saveEdit} className="p-1 text-green-600">
                <CheckIcon className="h-4 w-4" />
              </button>
              <button onClick={cancelEdit} className="p-1 text-red-600">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                ${cell.price?.toFixed(2) || '0.00'}
              </span>
              {cell.id && (
                <button
                  onClick={() => startEdit(cell.id, 'price', cell.price)}
                  className="p-1 hover:bg-white rounded"
                >
                  <PencilIcon className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div>
          {isEditing && editingCell?.field === 'quantity' ? (
            <div className="flex gap-1">
              <input
                type="number"
                value={editingCell.value}
                onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded"
                autoFocus
              />
              <button onClick={saveEdit} className="p-1 text-green-600">
                <CheckIcon className="h-4 w-4" />
              </button>
              <button onClick={cancelEdit} className="p-1 text-red-600">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {quantity === 0 && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${quantity === 0 ? 'text-red-600 font-semibold' : ''}`}>
                  {quantity} units
                </span>
              </div>
              {cell.id && (
                <button
                  onClick={() => startEdit(cell.id, 'quantity', cell.quantity)}
                  className="p-1 hover:bg-white rounded"
                >
                  <PencilIcon className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">
          <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
          Loading variant matrix...
        </div>
      </div>
    );
  }

  if (!matrix && variants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TableCellsIcon className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Variant Matrix View</h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
        <div className="p-6 text-center text-gray-500">
          <p>No variants available yet.</p>
          <p className="text-sm mt-2">Create variants using the Multi-Axis Wizard first.</p>
        </div>
      </div>
    );
  }

  // If we have variants but no matrix structure, show a simple list
  if (!matrix && variants.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TableCellsIcon className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Variant List View</h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Showing {variants.length} variant(s) in list view. Use the Multi-Axis Wizard to create properly structured variants.
          </p>
          <div className="space-y-2">
            {variants.map((variant: any) => (
              <div key={variant.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{variant.name}</span>
                    <span className="ml-2 text-sm text-gray-500">SKU: {variant.sku}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">${variant.price?.toFixed(2) || '0.00'}</span>
                    <span className="text-sm">{variant.quantity || 0} units</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      variant.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {variant.status || 'draft'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TableCellsIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Variant Matrix View</h2>
              <p className="text-sm text-gray-500">
                {matrixData?.summary.created || 0} of {matrixData?.summary.total || 0} variants created
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Selection actions */}
            {selectedVariants.size > 0 ? (
              <>
                <span className="text-sm text-gray-600">
                  {selectedVariants.size} selected
                </span>
                <button
                  onClick={deselectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </>
            ) : (
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select all visible
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
                showFilters ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 border'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
            </button>

            {/* Bulk actions */}
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={selectedVariants.size === 0}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
                selectedVariants.size > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Bulk Actions
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                loadMatrixData();
                loadVariants();
              }}
              className="p-1.5 text-gray-600 hover:text-gray-800"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-3 p-3 bg-white rounded-lg border">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Stock Level
                </label>
                <select
                  value={filters.stockLevel}
                  onChange={(e) => setFilters({ ...filters, stockLevel: e.target.value as any })}
                  className="w-full px-2 py-1 text-sm border rounded"
                >
                  <option value="all">All</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="low-stock">Low Stock (≤10)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full px-2 py-1 text-sm border rounded"
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: { ...filters.priceRange, min: e.target.value ? parseFloat(e.target.value) : undefined }
                    })}
                    className="w-1/2 px-2 py-1 text-sm border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: { ...filters.priceRange, max: e.target.value ? parseFloat(e.target.value) : undefined }
                    })}
                    className="w-1/2 px-2 py-1 text-sm border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk actions panel */}
        {showBulkActions && selectedVariants.size > 0 && (
          <div className="mt-3 p-3 bg-white rounded-lg border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Adjust Prices
                </label>
                <div className="flex gap-2">
                  <select
                    value={bulkPriceAdjustment.type}
                    onChange={(e) => setBulkPriceAdjustment({ ...bulkPriceAdjustment, type: e.target.value })}
                    className="px-2 py-1 text-sm border rounded"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="absolute">Set to</option>
                  </select>
                  <input
                    type="number"
                    value={bulkPriceAdjustment.value}
                    onChange={(e) => setBulkPriceAdjustment({ ...bulkPriceAdjustment, value: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 text-sm border rounded"
                  />
                  <button
                    onClick={applyBulkPriceAdjustment}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Adjust Inventory
                </label>
                <div className="flex gap-2">
                  <select
                    value={bulkQuantityAdjustment.operation}
                    onChange={(e) => setBulkQuantityAdjustment({ ...bulkQuantityAdjustment, operation: e.target.value })}
                    className="px-2 py-1 text-sm border rounded"
                  >
                    <option value="set">Set to</option>
                    <option value="increment">Add</option>
                    <option value="decrement">Subtract</option>
                  </select>
                  <input
                    type="number"
                    value={bulkQuantityAdjustment.value}
                    onChange={(e) => setBulkQuantityAdjustment({ ...bulkQuantityAdjustment, value: parseInt(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 text-sm border rounded"
                  />
                  <button
                    onClick={applyBulkQuantityAdjustment}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Matrix Content */}
      <div className="p-6 overflow-auto">
        {matrix.type === 'single' && (
          // Single axis - vertical list
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700 mb-3">{matrix.axis}</h3>
            {matrix.values.map((value: string) => {
              const cell = findCell({ [matrix.axis]: value });
              if (!isVisible(cell)) return null;
              return (
                <div key={value} className="flex items-center gap-4">
                  <span className="w-32 font-medium text-gray-700">{value}</span>
                  <div className="flex-1">
                    {renderCell(cell)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {matrix.type === 'double' && (
          // Two axes - traditional matrix
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-sm font-medium text-gray-700 bg-gray-100">
                    {matrix.rowAxis} / {matrix.colAxis}
                  </th>
                  {matrix.colValues.map((colValue: string) => (
                    <th key={colValue} className="p-2 text-center text-sm font-medium text-gray-700 bg-gray-100 border-l">
                      {colValue}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.rowValues.map((rowValue: string) => (
                  <tr key={rowValue}>
                    <td className="p-2 font-medium text-gray-700 bg-gray-50 border-t">
                      {rowValue}
                    </td>
                    {matrix.colValues.map((colValue: string) => {
                      const cell = findCell({
                        [matrix.rowAxis]: rowValue,
                        [matrix.colAxis]: colValue,
                      });
                      if (!isVisible(cell)) return <td key={colValue} className="border-t border-l" />;
                      return (
                        <td key={colValue} className="border-t border-l">
                          {renderCell(cell)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {matrix.type === 'triple' && (
          // Three axes - grouped matrices
          <div className="space-y-6">
            {matrix.groupValues.map((groupValue: string) => (
              <div key={groupValue}>
                <h3 className="font-medium text-gray-800 mb-3 text-lg">
                  {matrix.groupAxis}: {groupValue}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-left text-sm font-medium text-gray-700 bg-gray-100">
                          {matrix.rowAxis} / {matrix.colAxis}
                        </th>
                        {matrix.colValues.map((colValue: string) => (
                          <th key={colValue} className="p-2 text-center text-sm font-medium text-gray-700 bg-gray-100 border-l">
                            {colValue}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.rowValues.map((rowValue: string) => (
                        <tr key={rowValue}>
                          <td className="p-2 font-medium text-gray-700 bg-gray-50 border-t">
                            {rowValue}
                          </td>
                          {matrix.colValues.map((colValue: string) => {
                            const cell = findCell({
                              [matrix.groupAxis]: groupValue,
                              [matrix.rowAxis]: rowValue,
                              [matrix.colAxis]: colValue,
                            });
                            if (!isVisible(cell)) return <td key={colValue} className="border-t border-l" />;
                            return (
                              <td key={colValue} className="border-t border-l">
                                {renderCell(cell)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-gray-500">Total Variants:</span>
              <span className="ml-2 font-semibold">{matrixData?.summary.total || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-2 font-semibold text-green-600">{matrixData?.summary.created || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Missing:</span>
              <span className="ml-2 font-semibold text-gray-400">{matrixData?.summary.missing || 0}</span>
            </div>
          </div>
          
          {matrixData?.summary.missing > 0 && (
            <button
              className="text-blue-600 hover:text-blue-800 text-sm"
              onClick={() => {
                // Could open variant wizard to create missing variants
                alert('Open variant wizard to create missing combinations');
              }}
            >
              Create missing variants →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}