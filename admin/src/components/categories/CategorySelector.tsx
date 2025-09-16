import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, ChevronRight, Check, Search } from 'lucide-react';
import categoryService from '../../services/category.service';
import { CategoryResponseDto } from '../../types/dto/categories';

interface CategorySelectorProps {
  value: string[];
  onChange: (categoryIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

interface CategoryNode extends CategoryResponseDto {
  children?: CategoryNode[];
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value = [],
  onChange,
  placeholder = 'Select categories...',
  disabled = false,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryResponseDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Update selected categories when value changes
  useEffect(() => {
    if (categories.length > 0) {
      const selected = findCategoriesByIds(categories, value);
      setSelectedCategories(selected);
    }
  }, [value, categories]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories({ page: 1, limit: 1000 });
      const flatCategories = response.items;
      const tree = buildCategoryTree(flatCategories);
      setCategories(tree);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryTree = (flatCategories: CategoryResponseDto[]): CategoryNode[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    // First pass: create all nodes
    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree structure
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

  const findCategoriesByIds = (tree: CategoryNode[], ids: string[]): CategoryResponseDto[] => {
    const result: CategoryResponseDto[] = [];
    
    const traverse = (nodes: CategoryNode[]) => {
      for (const node of nodes) {
        if (ids.includes(node.id)) {
          result.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    };
    
    traverse(tree);
    return result;
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

  const toggleCategory = (category: CategoryResponseDto) => {
    const newValue = value.includes(category.id)
      ? value.filter(id => id !== category.id)
      : [...value, category.id];
    onChange(newValue);
  };

  const removeCategory = (categoryId: string) => {
    onChange(value.filter(id => id !== categoryId));
  };

  const getCategoryPath = (category: CategoryResponseDto): string => {
    const paths: string[] = [];
    let current = category;
    
    while (current) {
      paths.unshift(current.name);
      // Find parent in tree
      const parent = findParentCategory(categories, current.parentId);
      current = parent as CategoryResponseDto;
    }
    
    return paths.join(' > ');
  };

  const findParentCategory = (tree: CategoryNode[], parentId: string | null): CategoryNode | null => {
    if (!parentId) return null;
    
    for (const node of tree) {
      if (node.id === parentId) return node;
      if (node.children) {
        const found = findParentCategory(node.children, parentId);
        if (found) return found;
      }
    }
    return null;
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
        
        // Auto-expand if children match
        if (filteredChildren.length > 0) {
          expandedNodes.add(node.id);
        }
      }
    }
    
    return filtered;
  };

  const renderCategoryTree = (nodes: CategoryNode[], level = 0) => {
    const filteredNodes = filterCategories(nodes, searchQuery);
    
    return filteredNodes.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedNodes.has(category.id);
      const isSelected = value.includes(category.id);
      
      return (
        <div key={category.id}>
          <div
            className={`flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer ${
              isSelected ? 'bg-blue-50' : ''
            }`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(category.id);
                }}
                className="p-1 hover:bg-gray-200 rounded mr-1"
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            <div
              className="flex-1 flex items-center"
              onClick={() => toggleCategory(category)}
            >
              <div className={`w-4 h-4 mr-2 border rounded ${
                isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              } flex items-center justify-center`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm">{category.name}</span>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div>{renderCategoryTree(category.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Categories Display */}
      <div
        className={`min-h-[42px] px-3 py-2 border rounded-lg bg-white cursor-pointer flex flex-wrap gap-2 items-center ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        } ${error ? 'border-red-500' : 'border-gray-300'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedCategories.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          selectedCategories.map(cat => (
            <div
              key={cat.id}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              <span>{cat.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeCategory(cat.id);
                }}
                className="hover:text-blue-600"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
        <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search Box */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Category Tree */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No categories available</div>
            ) : (
              renderCategoryTree(categories)
            )}
          </div>

          {/* Actions */}
          <div className="p-2 border-t bg-gray-50 flex justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
                setSearchQuery('');
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear all
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setSearchQuery('');
              }}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
