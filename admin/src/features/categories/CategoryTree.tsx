import React, { useState, useCallback } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { CategoryTree as CategoryTreeType } from '../../types/api.types';
import { classNames } from '../../utils/classNames';

interface CategoryTreeProps {
  categories: CategoryTreeType[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  onCreateCategory: (parentId?: string) => void;
  onEditCategory: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onMoveCategory?: (categoryId: string, newParentId: string | null) => void;
  isLoading?: boolean;
}

interface CategoryNodeProps {
  category: CategoryTreeType;
  level: number;
  selectedCategoryId?: string;
  expandedNodes: Set<string>;
  onToggleExpand: (categoryId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onCreateCategory: (parentId?: string) => void;
  onEditCategory: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDragStart?: (e: React.DragEvent, category: CategoryTreeType) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetCategory: CategoryTreeType) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  draggedCategory?: CategoryTreeType | null;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  level,
  selectedCategoryId,
  expandedNodes,
  onToggleExpand,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggedCategory,
}) => {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedNodes.has(category.id);
  const isSelected = selectedCategoryId === category.id;
  const isDragging = draggedCategory?.id === category.id;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    if (onDragOver) onDragOver(e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (onDrop && draggedCategory && draggedCategory.id !== category.id) {
      onDrop(e, category);
    }
  };

  return (
    <div className="select-none">
      <div
        className={classNames(
          'flex items-center px-2 py-1.5 rounded-md cursor-pointer group transition-colors duration-150',
          isSelected
            ? 'bg-blue-50 text-blue-700'
            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900',
          isDragging && 'opacity-50',
          isDragOver && 'bg-blue-100 border-blue-500'
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => onSelectCategory(category.id)}
        draggable
        onDragStart={(e) => onDragStart && onDragStart(e, category)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={onDragEnd}
      >
        {/* Expand/Collapse Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleExpand(category.id);
          }}
          className={classNames(
            'p-0.5 rounded hover:bg-gray-200',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>

        {/* Folder Icon */}
        <div className="ml-1 mr-2">
          {isExpanded ? (
            <FolderOpenIcon className="h-5 w-5 text-blue-600" />
          ) : (
            <FolderIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>

        {/* Category Name */}
        <span className="flex-1 truncate font-medium">{category.name}</span>

        {/* Product Count Badge */}
        {category.productCount !== undefined && category.productCount > 0 && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
            {category.productCount}
          </span>
        )}

        {/* Action Buttons */}
        <div className="ml-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateCategory(category.id);
            }}
            className="p-1 rounded hover:bg-gray-200"
            title="Add subcategory"
          >
            <PlusIcon className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditCategory(category.id);
            }}
            className="p-1 rounded hover:bg-gray-200"
            title="Edit category"
          >
            <PencilIcon className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCategory(category.id);
            }}
            className="p-1 rounded hover:bg-red-100"
            title="Delete category"
          >
            <TrashIcon className="h-4 w-4 text-gray-500 hover:text-red-600" />
          </button>
        </div>
      </div>

      {/* Render Children */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
              selectedCategoryId={selectedCategoryId}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              onSelectCategory={onSelectCategory}
              onCreateCategory={onCreateCategory}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              draggedCategory={draggedCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onMoveCategory,
  isLoading,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [draggedCategory, setDraggedCategory] = useState<CategoryTreeType | null>(null);

  const handleToggleExpand = useCallback((categoryId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const allIds = new Set<string>();
    const collectIds = (cats: CategoryTreeType[]) => {
      cats.forEach((cat) => {
        allIds.add(cat.id);
        if (cat.children) collectIds(cat.children);
      });
    };
    collectIds(categories);
    setExpandedNodes(allIds);
  }, [categories]);

  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const handleDragStart = (e: React.DragEvent, category: CategoryTreeType) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCategory: CategoryTreeType) => {
    e.preventDefault();
    if (draggedCategory && onMoveCategory) {
      // Don't allow dropping a category onto itself or its descendants
      if (draggedCategory.id !== targetCategory.id && !isDescendant(draggedCategory, targetCategory)) {
        onMoveCategory(draggedCategory.id, targetCategory.id);
      }
    }
    setDraggedCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
  };

  const handleDropOnRoot = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedCategory && onMoveCategory) {
      onMoveCategory(draggedCategory.id, null); // Move to root
    }
    setDraggedCategory(null);
  };

  // Helper function to check if target is a descendant of source
  const isDescendant = (source: CategoryTreeType, target: CategoryTreeType): boolean => {
    if (!source.children) return false;
    for (const child of source.children) {
      if (child.id === target.id) return true;
      if (isDescendant(child, target)) return true;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tree Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Categories</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExpandAll}
              className="text-sm text-gray-600 hover:text-gray-900"
              title="Expand all"
            >
              Expand
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={handleCollapseAll}
              className="text-sm text-gray-600 hover:text-gray-900"
              title="Collapse all"
            >
              Collapse
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => onCreateCategory()}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Root</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div 
        className="p-4 max-h-[600px] overflow-y-auto"
        onDragOver={(e) => {
          if (draggedCategory) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }
        }}
        onDrop={handleDropOnRoot}
      >
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FolderIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No categories yet</p>
            <button
              onClick={() => onCreateCategory()}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first category
            </button>
          </div>
        ) : (
          categories.map((category) => (
            <CategoryNode
              key={category.id}
              category={category}
              level={0}
              selectedCategoryId={selectedCategoryId}
              expandedNodes={expandedNodes}
              onToggleExpand={handleToggleExpand}
              onSelectCategory={onSelectCategory}
              onCreateCategory={onCreateCategory}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              draggedCategory={draggedCategory}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryTree;
