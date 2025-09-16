import React, { useState, useEffect } from 'react';
import { XMarkIcon, FolderIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import categoryService from '../../services/category.service';
import productService from '../../services/product.service';
import { CategoryTreeDto } from '../../types/dto/categories';

interface BulkCategoryAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  selectedProductNames: string[];
  onSuccess: () => void;
}

export default function BulkCategoryAssignment({
  isOpen,
  onClose,
  selectedProductIds,
  selectedProductNames,
  onSuccess
}: BulkCategoryAssignmentProps) {
  const [categories, setCategories] = useState<CategoryTreeDto[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryTree, setShowCategoryTree] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Reset state when modal opens
      setSelectedCategoryIds(new Set());
      setReplaceExisting(false);
      setError(null);
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoryTree = await categoryService.getCategoryTree();
      setCategories(categoryTree);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newSelection = new Set(selectedCategoryIds);
    if (newSelection.has(categoryId)) {
      newSelection.delete(categoryId);
    } else {
      newSelection.add(categoryId);
    }
    setSelectedCategoryIds(newSelection);
  };

  const renderCategoryTree = (categories: CategoryTreeDto[], level = 0) => {
    return categories.map(category => (
      <div key={category.id}>
        <label
          className={`
            flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer
            ${selectedCategoryIds.has(category.id) ? 'bg-blue-50' : ''}
          `}
          style={{ paddingLeft: `${(level * 20) + 12}px` }}
        >
          <input
            type="checkbox"
            checked={selectedCategoryIds.has(category.id)}
            onChange={() => toggleCategory(category.id)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <FolderIcon className={`h-4 w-4 ${selectedCategoryIds.has(category.id) ? 'text-blue-600' : 'text-gray-400'}`} />
          <span className={`text-sm ${selectedCategoryIds.has(category.id) ? 'text-blue-900 font-medium' : 'text-gray-900'}`}>
            {category.name}
          </span>
        </label>
        {category.children && category.children.length > 0 && (
          <div>{renderCategoryTree(category.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  const handleSubmit = async () => {
    if (selectedCategoryIds.size === 0) {
      setError('Please select at least one category');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const categoryIdsArray = Array.from(selectedCategoryIds);
      
      await productService.bulkAssignCategories(
        selectedProductIds,
        categoryIdsArray,
        replaceExisting
      );

      // Success - close modal and notify parent
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to assign categories:', err);
      setError('Failed to assign categories. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Bulk Assign Categories
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Assign categories to {selectedProductIds.length} selected product{selectedProductIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Selected Products Summary */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Selected Products ({selectedProductIds.length})
              </h4>
              <div className="text-xs text-blue-700 max-h-20 overflow-y-auto">
                {selectedProductNames.length > 0 ? (
                  selectedProductNames.slice(0, 5).map((name, idx) => (
                    <div key={idx}>• {name}</div>
                  ))
                ) : (
                  <div>{selectedProductIds.length} products selected</div>
                )}
                {selectedProductNames.length > 5 && (
                  <div className="mt-1 font-medium">
                    ...and {selectedProductNames.length - 5} more
                  </div>
                )}
              </div>
            </div>

            {/* Replace/Append Option */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Replace existing categories
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    If unchecked, selected categories will be added to existing ones. 
                    If checked, existing categories will be replaced with your selection.
                  </div>
                </div>
              </label>
            </div>

            {/* Category Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">
                  Select Categories to Assign
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCategoryTree(!showCategoryTree)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showCategoryTree ? 'Hide' : 'Show'} Categories
                </button>
              </div>

              {/* Selected Categories Summary */}
              {selectedCategoryIds.size > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {Array.from(selectedCategoryIds).map(catId => {
                    const findCategory = (cats: CategoryTreeDto[]): CategoryTreeDto | null => {
                      for (const cat of cats) {
                        if (cat.id === catId) return cat;
                        if (cat.children) {
                          const found = findCategory(cat.children);
                          if (found) return found;
                        }
                      }
                      return null;
                    };
                    const category = findCategory(categories);
                    if (!category) return null;
                    
                    return (
                      <span
                        key={catId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        <FolderIcon className="h-3 w-3" />
                        {category.name}
                        <button
                          type="button"
                          onClick={() => toggleCategory(catId)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Category Tree */}
              {showCategoryTree && (
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Loading categories...
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No categories available
                    </div>
                  ) : (
                    renderCategoryTree(categories)
                  )}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                {selectedCategoryIds.size} categor{selectedCategoryIds.size !== 1 ? 'ies' : 'y'} selected
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || selectedCategoryIds.size === 0}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Assigning...' : `Assign to ${selectedProductIds.length} Products`}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
