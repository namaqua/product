import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { categoryService } from '../../services/category.service';

interface CategoryWithCounts {
  id: string;
  name: string;
  parentId?: string | null;
  productCount: number;
  totalProductCount: number;
  children?: CategoryWithCounts[];
}

interface CategoryFilterProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryWithCounts[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategoriesWithCounts();
  }, []);

  const fetchCategoriesWithCounts = async () => {
    try {
      setLoading(true);
      // Use the new endpoint that returns counts
      const response = await categoryService.getCategoriesWithCounts();
      
      // Response follows PIM standards: { success, data: { items, meta }, timestamp }
      const categoriesData = response.data?.items || response.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to regular categories without counts
      try {
        const fallbackResponse = await categoryService.getAll();
        const items = fallbackResponse.data?.items || [];
        // Set counts to 0 if not available
        const withZeroCounts = items.map(cat => ({
          ...cat,
          productCount: 0,
          totalProductCount: 0
        }));
        setCategories(buildTree(withZeroCounts));
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (items: any[]): CategoryWithCounts[] => {
    const map = new Map();
    const tree: CategoryWithCounts[] = [];

    items.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    items.forEach(item => {
      const node = map.get(item.id);
      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return tree;
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    onChange(newSelection);
  };

  const handleApplyFilter = () => {
    setIsOpen(false);
    // Trigger the onChange to apply filters
    onChange(selectedCategories);
  };

  const renderCategory = (category: CategoryWithCounts, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedNodes.has(category.id);
    const isSelected = selectedCategories.includes(category.id);
    
    // Use totalProductCount to show count including subcategories
    const displayCount = category.totalProductCount || 0;

    return (
      <div key={category.id}>
        <div 
          className={`flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
              className="mr-1 p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-600" />
              ) : (
                <ChevronRight size={16} className="text-gray-600" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-5 mr-1" />}
          
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleCategoryToggle(category.id)}
            className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          
          <div className="mr-2 text-gray-600">
            {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
          </div>
          
          <span className="flex-1 text-gray-800">{category.name}</span>
          
          <span className="text-gray-500 text-sm ml-2">
            ({displayCount})
          </span>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="flex items-center">
          <Folder className="mr-2 text-gray-600" size={20} />
          <span className="text-gray-800">Filter by Category</span>
        </span>
        <div className="flex items-center">
          {selectedCategories.length > 0 && (
            <span className="mr-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
              {selectedCategories.length}
            </span>
          )}
          <ChevronDown className="text-gray-400" size={20} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Filter by Categories</h3>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => onChange([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No categories available
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto border border-gray-100 rounded p-2">
                {categories.map(category => renderCategory(category))}
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center pt-3 border-t">
              <span className="text-sm text-gray-600">
                {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyFilter}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
