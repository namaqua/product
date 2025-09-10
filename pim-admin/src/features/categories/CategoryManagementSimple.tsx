import React, { useState, useEffect } from 'react';
import { 
  Category, 
  CategoryTree as CategoryTreeType,
  CreateCategoryDto,
  UpdateCategoryDto 
} from '../../types/api.types';
import categoryService from '../../services/category.service';
import { TagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Simplified Category Management without complex dependencies
const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load both flat list and tree structure
      const [categoriesResponse, treeResponse] = await Promise.all([
        categoryService.getCategories({ limit: 1000 }),
        categoryService.getCategoryTree(),
      ]);
      
      setCategories(categoriesResponse.items || []);
      setCategoryTree(treeResponse || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories. Please check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Simple tree display component
  const SimpleTree: React.FC<{ tree: CategoryTreeType[], level?: number }> = ({ tree, level = 0 }) => {
    return (
      <div style={{ marginLeft: `${level * 20}px` }}>
        {tree.map((category) => (
          <div key={category.id} className="py-1">
            <div className="flex items-center space-x-2 hover:bg-gray-50 px-2 py-1 rounded">
              <span className="text-gray-600">{'—'.repeat(level)}</span>
              <span className="font-medium">{category.name}</span>
              {category.productCount !== undefined && (
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {category.productCount}
                </span>
              )}
            </div>
            {category.children && category.children.length > 0 && (
              <SimpleTree tree={category.children} level={level + 1} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TagIcon className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Organize your products with hierarchical categories
              </p>
            </div>
          </div>

          <button
            onClick={loadCategories}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Tree - Simple Version */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Category Tree</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : categoryTree.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No categories found</p>
          ) : (
            <SimpleTree tree={categoryTree} />
          )}
        </div>

        {/* Category List - Simple Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">All Categories ({categories.length})</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.slice(0, 10).map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">{category.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{category.level}</td>
                      <td className="px-3 py-2 text-sm">
                        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                          (category.isVisible !== undefined ? category.isVisible : category.isActive)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {(category.isVisible !== undefined ? category.isVisible : category.isActive) ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categories.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">Showing first 10 of {categories.length} categories</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Test</h3>
        <p className="text-sm text-blue-700">
          This is a simplified version of Category Management to ensure the page loads without crashing.
        </p>
        <p className="text-sm text-blue-700 mt-2">
          Run the test script to create categories: <code className="bg-blue-100 px-1 py-0.5 rounded">./test-category-management.sh</code>
        </p>
      </div>
    </div>
  );
};

export default CategoryManagement;
