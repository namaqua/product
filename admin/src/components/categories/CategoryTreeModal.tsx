import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check, Search, Folder, FolderOpen } from 'lucide-react';
import categoryService from '../../services/category.service';
import { CategoryResponseDto } from '../../types/dto/categories';

interface CategoryTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSave: (categoryIds: string[]) => void;
  title?: string;
}

interface CategoryNode extends CategoryResponseDto {
  children?: CategoryNode[];
}

const CategoryTreeModal: React.FC<CategoryTreeModalProps> = ({
  isOpen,
  onClose,
  selectedIds = [],
  onSave,
  title = 'Select Categories',
}) => {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(selectedIds));
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setSelectedCategories(new Set(selectedIds));
    }
  }, [isOpen, selectedIds]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories({ page: 1, limit: 1000 });
      const flatCategories = response.items;
      const tree = buildCategoryTree(flatCategories);
      setCategories(tree);
      
      // Auto-expand parents of selected categories
      expandParentsOfSelected(tree, selectedIds);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryTree = (flatCategories: CategoryResponseDto[]): CategoryNode[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    flatCategories.forEach(cat => {
      const node = categoryMap.get(cat.id)!;
      if (!cat.parentId) {
        roots.push(node);
      } else {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    });

    return roots;
  };

  const expandParentsOfSelected = (tree: CategoryNode[], selectedIds: string[]) => {
    const toExpand = new Set<string>();
    
    const findParents = (nodes: CategoryNode[], parentPath: string[] = []) => {
      for (const node of nodes) {
        if (selectedIds.includes(node.id)) {
          parentPath.forEach(id => toExpand.add(id));
        }
        if (node.children) {
          findParents(node.children, [...parentPath, node.id]);
        }
      }
    };
    
    findParents(tree);
    setExpandedNodes(toExpand);
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleCategory = (categoryId: string, withChildren = false) => {
    const newSelected = new Set(selectedCategories);
    
    if (withChildren) {
      const category = findCategoryById(categories, categoryId);
      if (category) {
        const allIds = getAllChildIds(category);
        allIds.push(categoryId);
        
        if (newSelected.has(categoryId)) {
          allIds.forEach(id => newSelected.delete(id));
        } else {
          allIds.forEach(id => newSelected.add(id));
        }
      }
    } else {
      if (newSelected.has(categoryId)) {
        newSelected.delete(categoryId);
      } else {
        newSelected.add(categoryId);
      }
    }
    
    setSelectedCategories(newSelected);
  };

  const findCategoryById = (tree: CategoryNode[], id: string): CategoryNode | null => {
    for (const node of tree) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findCategoryById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getAllChildIds = (category: CategoryNode): string[] => {
    const ids: string[] = [];
    if (category.children) {
      for (const child of category.children) {
        ids.push(child.id);
        ids.push(...getAllChildIds(child));
      }
    }
    return ids;
  };

  const filterCategories = (nodes: CategoryNode[], query: string): CategoryNode[] => {
    if (!query) return nodes;
    
    const filtered: CategoryNode[] = [];
    
    for (const node of nodes) {
      const matches = node.name.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = node.children ? filterCategories(node.children, query) : [];
      
      if (matches || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren,
        });
        
        if (filteredChildren.length > 0) {
          expandedNodes.add(node.id);
        }
      }
    }
    
    return filtered;
  };

  const handleSave = () => {
    onSave(Array.from(selectedCategories));
    onClose();
  };

  const renderCategoryTree = (nodes: CategoryNode[], level = 0) => {
    const filteredNodes = filterCategories(nodes, searchQuery);
    
    return filteredNodes.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedNodes.has(category.id);
      const isSelected = selectedCategories.has(category.id);
      const hasSelectedChildren = hasChildren && 
        category.children!.some(child => 
          selectedCategories.has(child.id) || 
          (child.children && child.children.some(gc => selectedCategories.has(gc.id)))
        );
      
      return (
        <div key={category.id}>
          <div
            className={`flex items-center px-3 py-2 hover:bg-gray-50 ${
              isSelected ? 'bg-blue-50' : hasSelectedChildren ? 'bg-blue-50/50' : ''
            }`}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="p-1 hover:bg-gray-200 rounded mr-1"
              >
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-gray-600" />
                ) : (
                  <Folder className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6 mr-1" />}
            
            <div
              className="flex-1 flex items-center cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <div className={`w-4 h-4 mr-2 border rounded ${
                isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              } flex items-center justify-center`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm select-none">{category.name}</span>
              {hasChildren && (
                <span className="ml-2 text-xs text-gray-500">
                  ({category.children!.length})
                </span>
              )}
            </div>
            
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id, true);
                }}
                className="ml-auto text-xs text-blue-600 hover:text-blue-800 px-2"
              >
                Select all
              </button>
            )}
          </div>
          
          {hasChildren && isExpanded && (
            <div>{renderCategoryTree(category.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Tree */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No categories available</div>
          ) : (
            <div className="space-y-1">
              {renderCategoryTree(categories)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedCategories.size} categories selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategories(new Set())}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            >
              Save Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTreeModal;
