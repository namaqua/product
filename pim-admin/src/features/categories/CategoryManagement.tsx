import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Category, 
  CategoryTree as CategoryTreeType,
  CreateCategoryDto,
  UpdateCategoryDto 
} from '../../types/api.types';
import categoryService from '../../services/category.service';
import CategoryTree from './CategoryTree';
import CategoryForm from './CategoryForm';
import Modal from '../../components/common/ModalWrapper'; // Use wrapper for compatibility
import Notification from '../../components/common/NotificationWrapper'; // Use wrapper for compatibility
import {
  TagIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const CategoryManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Load categories
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load both flat list and tree structure
      const [categoriesResponse, treeResponse] = await Promise.all([
        categoryService.getCategories({ limit: 100 }), // Max limit is 100 per backend validation
        categoryService.getCategoryTree(),
      ]);
      
      console.log('Categories Response:', categoriesResponse);
      console.log('Tree Response:', treeResponse);
      
      setCategories(categoriesResponse.items || []);
      setCategoryTree(treeResponse || []);
      
      console.log('Set categories:', categoriesResponse.items?.length || 0, 'items');
      console.log('Set tree:', treeResponse?.length || 0, 'root nodes');
    } catch (error) {
      console.error('Error loading categories:', error);
      showNotification('error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Notification helper
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Handle category selection
  const handleSelectCategory = useCallback(async (categoryId: string) => {
    console.log('Selecting category:', categoryId);
    try {
      const category = await categoryService.getCategory(categoryId);
      console.log('Loaded category:', category);
      setSelectedCategory(category);
      setEditingCategory(null);
      setParentCategory(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error loading category:', error);
      console.error('Error response:', error.response);
      
      // Extract error message
      let message = 'Failed to load category details';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      showNotification('error', message);
    }
  }, []);

  // Handle create category
  const handleCreateCategory = useCallback((parentId?: string) => {
    const parent = parentId ? categories.find(c => c.id === parentId) : null;
    setParentCategory(parent || null);
    setEditingCategory(null);
    setSelectedCategory(null);
    setShowForm(true);
  }, [categories]);

  // Handle edit category
  const handleEditCategory = useCallback((categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setEditingCategory(category);
      setParentCategory(null);
      setSelectedCategory(null);
      setShowForm(true);
    }
  }, [categories]);

  // Handle delete category
  const handleDeleteCategory = useCallback((categoryId: string) => {
    setCategoryToDelete(categoryId);
    setShowDeleteModal(true);
  }, []);

  // Confirm delete
  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryService.deleteCategory(categoryToDelete);
      showNotification('success', 'Category deleted successfully');
      await loadCategories();
      
      // Clear selection if deleted category was selected
      if (selectedCategory?.id === categoryToDelete) {
        setSelectedCategory(null);
      }
      if (editingCategory?.id === categoryToDelete) {
        setEditingCategory(null);
        setShowForm(false);
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const message = error.response?.data?.message || 'Failed to delete category';
      showNotification('error', message);
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  // Handle move category
  const handleMoveCategory = async (categoryId: string, newParentId: string | null) => {
    try {
      await categoryService.moveCategory(categoryId, newParentId);
      showNotification('success', 'Category moved successfully');
      await loadCategories();
    } catch (error: any) {
      console.error('Error moving category:', error);
      const message = error.response?.data?.message || 'Failed to move category';
      showNotification('error', message);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    setIsSaving(true);
    try {
      console.log('Submitting category data:', data); // Debug log
      
      if (editingCategory) {
        // Update existing category
        const result = await categoryService.updateCategory(editingCategory.id, data as UpdateCategoryDto);
        console.log('Update result:', result); // Debug log
        showNotification('success', 'Category updated successfully');
      } else {
        // Create new category
        const result = await categoryService.createCategory(data as CreateCategoryDto);
        console.log('Create result:', result); // Debug log
        showNotification('success', 'Category created successfully');
      }
      
      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
      setParentCategory(null);
    } catch (error: any) {
      console.error('Error saving category:', error);
      console.error('Error response:', error.response); // More detailed error log
      
      // Extract error message from various possible locations
      let message = 'Failed to save category';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          message = errors.map((e: any) => e.message || e).join(', ');
        }
      } else if (error.message) {
        message = error.message;
      }
      
      showNotification('error', message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await categoryService.exportCategories(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categories.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification('success', `Categories exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting categories:', error);
      showNotification('error', 'Failed to export categories');
    }
  };

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await categoryService.importCategories(file);
      showNotification(
        'success',
        `Import completed: ${result.success} succeeded, ${result.failed} failed`
      );
      await loadCategories();
    } catch (error) {
      console.error('Error importing categories:', error);
      showNotification('error', 'Failed to import categories');
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Get category details for display
  const getCategoryDetails = () => {
    const category = selectedCategory || editingCategory;
    if (!category) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{category.slug}</p>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {category.description || 'No description'}
            </dd>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Level</dt>
              <dd className="mt-1 text-sm text-gray-900">{category.level}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Position</dt>
              <dd className="mt-1 text-sm text-gray-900">{category.position}</dd>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  (category.isVisible !== undefined ? category.isVisible : category.isActive) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {(category.isVisible !== undefined ? category.isVisible : category.isActive) ? 'Visible' : 'Hidden'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Products</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {category.productCount || 0}
              </dd>
            </div>
          </div>

          {category.metaTitle && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Meta Title</dt>
              <dd className="mt-1 text-sm text-gray-900">{category.metaTitle}</dd>
            </div>
          )}

          {category.metaDescription && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Meta Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{category.metaDescription}</dd>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={() => handleEditCategory(category.id)}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </dl>
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

          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <button
              onClick={loadCategories}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Refresh"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export Button */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Import Button */}
            <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <ArrowUpTrayIcon className="h-4 w-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Tree - Left Side */}
        <div className="lg:col-span-1">
          <CategoryTree
            categories={categoryTree}
            selectedCategoryId={selectedCategory?.id}
            onSelectCategory={handleSelectCategory}
            onCreateCategory={handleCreateCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onMoveCategory={handleMoveCategory}
            isLoading={isLoading}
          />
        </div>

        {/* Right Side - Form or Details */}
        <div className="lg:col-span-2">
          {showForm ? (
            <CategoryForm
              category={editingCategory}
              parentCategory={parentCategory}
              categories={categories}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCategory(null);
                setParentCategory(null);
              }}
              isLoading={isSaving}
            />
          ) : selectedCategory ? (
            getCategoryDetails()
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Category Selected
              </h3>
              <p className="text-sm text-gray-500">
                Select a category from the tree to view details, or create a new category
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Category"
      >
        <div className="space-y-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-900">
                Are you sure you want to delete this category?
              </p>
              <p className="mt-2 text-sm text-gray-500">
                This action cannot be undone. All subcategories and product associations will be affected.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete Category
            </button>
          </div>
        </div>
      </Modal>

      {/* Notification */}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default CategoryManagement;
