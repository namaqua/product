import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, FolderIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import categoryService from '../../services/category.service';
import productService from '../../services/product.service';
import { CategoryTreeDto } from '../../types/dto/categories';

interface CategoryAssignmentProps {
  productId: string;
  onCategoriesChange?: (categoryIds: string[]) => void;
}

export default function CategoryAssignment({ productId, onCategoriesChange }: CategoryAssignmentProps) {
  const [assignedCategories, setAssignedCategories] = useState<CategoryTreeDto[]>([]);
  const [availableCategories, setAvailableCategories] = useState<CategoryTreeDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all categories in tree structure
      const categoryTree = await categoryService.getCategoryTree();
      setAvailableCategories(categoryTree);

      // Load product's assigned categories
      const response = await productService.getProductCategories(productId);
      const categories = response.items || response.data || [];
      setAssignedCategories(categories);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const flattenCategories = (categories: CategoryTreeDto[], level = 0): { id: string; name: string; level: number; path: string }[] => {
    const result: { id: string; name: string; level: number; path: string }[] = [];
    
    const processCategory = (cat: CategoryTreeDto, parentPath = '', level = 0) => {
      const path = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
      result.push({
        id: cat.id,
        name: cat.name,
        level,
        path
      });
      
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach(child => processCategory(child, path, level + 1));
      }
    };
    
    categories.forEach(cat => processCategory(cat, '', 0));
    return result;
  };

  const handleAddCategory = async () => {
    if (!selectedCategoryId) {
      setError('Please select a category to add');
      return;
    }

    // Check if already assigned
    if (assignedCategories.some(cat => cat.id === selectedCategoryId)) {
      setError('This category is already assigned');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Get all currently assigned category IDs
      const currentIds = assignedCategories.map(cat => cat.id);
      const newIds = [...currentIds, selectedCategoryId];

      // Call API to assign categories
      await productService.assignCategories(productId, newIds);

      // Find the category details from available categories
      const flatCategories = flattenCategories(availableCategories);
      const categoryToAdd = flatCategories.find(cat => cat.id === selectedCategoryId);
      
      if (categoryToAdd) {
        const newCategory: CategoryTreeDto = {
          id: categoryToAdd.id,
          name: categoryToAdd.name,
          slug: '', // Will be filled by API
          children: []
        };
        setAssignedCategories([...assignedCategories, newCategory]);
      }

      setSelectedCategoryId('');
      setSuccessMessage('Category added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Notify parent if callback provided
      if (onCategoriesChange) {
        onCategoriesChange(newIds);
      }
    } catch (err: any) {
      console.error('Failed to add category:', err);
      setError('Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    try {
      setSaving(true);
      setError(null);

      // Call API to remove category
      await productService.removeCategory(productId, categoryId);

      // Update local state
      const updatedCategories = assignedCategories.filter(cat => cat.id !== categoryId);
      setAssignedCategories(updatedCategories);

      setSuccessMessage('Category removed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Notify parent if callback provided
      if (onCategoriesChange) {
        onCategoriesChange(updatedCategories.map(cat => cat.id));
      }
    } catch (err: any) {
      console.error('Failed to remove category:', err);
      setError('Failed to remove category');
    } finally {
      setSaving(false);
    }
  };

  const renderCategoryTree = (categories: CategoryTreeDto[], level = 0) => {
    return categories.map(category => {
      const isAssigned = assignedCategories.some(cat => cat.id === category.id);
      
      return (
        <div key={category.id}>
          <button
            type="button"
            onClick={() => !isAssigned && setSelectedCategoryId(category.id)}
            disabled={isAssigned}
            className={`
              w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2
              ${selectedCategoryId === category.id ? 'bg-blue-50 text-blue-700' : ''}
              ${isAssigned ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{ paddingLeft: `${(level * 20) + 12}px` }}
          >
            <FolderIcon className="h-4 w-4" />
            <span>{category.name}</span>
            {isAssigned && (
              <span className="ml-auto text-xs text-gray-500">Already assigned</span>
            )}
          </button>
          {category.children && category.children.length > 0 && (
            <div>
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Categories</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded text-sm">
          {successMessage}
        </div>
      )}

      {/* Assigned Categories */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned Categories</h3>
        {assignedCategories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories assigned</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assignedCategories.map(category => (
              <div
                key={category.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                <FolderIcon className="h-4 w-4" />
                <span>{category.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category.id)}
                  disabled={saving}
                  className="ml-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Section */}
      <div className="border-t pt-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Category
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left flex items-center justify-between hover:bg-gray-50"
              >
                <span className="text-sm">
                  {selectedCategoryId 
                    ? flattenCategories(availableCategories).find(c => c.id === selectedCategoryId)?.path
                    : 'Select a category...'}
                </span>
                <ChevronRightIcon className={`h-4 w-4 transform transition-transform ${showCategoryPicker ? 'rotate-90' : ''}`} />
              </button>

              {/* Category Picker Dropdown */}
              {showCategoryPicker && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {availableCategories.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">No categories available</div>
                  ) : (
                    renderCategoryTree(availableCategories)
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={!selectedCategoryId || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Categories help organize products and improve navigation
        </p>
      </div>
    </div>
  );
}
