import React, { useState, useEffect } from 'react';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types/api.types';
import Button from '../../components/common/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CategoryFormProps {
  category?: Category | null;
  parentCategory?: Category | null;
  categories: Category[];
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  parentCategory,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateCategoryDto | UpdateCategoryDto>({
    name: '',
    description: '',
    parentId: parentCategory?.id || undefined,
    isVisible: true,
    showInMenu: false,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '', // String, not array per DTO
    imageUrl: '',
    bannerUrl: '',
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [keywordsList, setKeywordsList] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      // Editing existing category
      const keywords = category.metaKeywords 
        ? (typeof category.metaKeywords === 'string' 
            ? category.metaKeywords.split(',').map(k => k.trim()).filter(k => k)
            : category.metaKeywords as string[])
        : [];
      
      setKeywordsList(keywords);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentId: category.parentId || undefined,
        isVisible: category.isActive !== undefined ? category.isActive : true, // Map isActive to isVisible
        showInMenu: (category as any).showInMenu || false,
        isFeatured: (category as any).isFeatured || false,
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        metaKeywords: keywords.join(', '), // Convert to string
        imageUrl: category.imageUrl || '',
        bannerUrl: (category as any).bannerUrl || '',
      });
    } else if (parentCategory) {
      // Creating new subcategory
      setFormData(prev => ({
        ...prev,
        parentId: parentCategory.id,
      }));
    }
  }, [category, parentCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywordsList.includes(keywordInput.trim())) {
      const newKeywords = [...keywordsList, keywordInput.trim()];
      setKeywordsList(newKeywords);
      setFormData(prev => ({
        ...prev,
        metaKeywords: newKeywords.join(', '),
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const newKeywords = keywordsList.filter(k => k !== keyword);
    setKeywordsList(newKeywords);
    setFormData(prev => ({
      ...prev,
      metaKeywords: newKeywords.join(', '),
    }));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (formData.name && formData.name.length > 255) {
      newErrors.name = 'Category name must be less than 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.metaTitle && formData.metaTitle.length > 255) {
      newErrors.metaTitle = 'Meta title must be less than 255 characters';
    }

    if (formData.metaDescription && formData.metaDescription.length > 500) {
      newErrors.metaDescription = 'Meta description must be less than 500 characters';
    }

    if (formData.imageUrl && formData.imageUrl.length > 500) {
      newErrors.imageUrl = 'Image URL must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data for submission
      const submitData = { ...formData };
      
      // Log the data before cleaning
      console.log('Form data before cleaning:', submitData);
      
      // Ensure metaKeywords is a string (already converted above)
      if (!submitData.metaKeywords) {
        delete submitData.metaKeywords; // Remove if empty
      }
      
      // Remove empty optional fields but keep required fields
      const requiredFields = ['name', 'isVisible', 'showInMenu', 'isFeatured'];
      Object.keys(submitData).forEach(key => {
        const value = submitData[key as keyof typeof submitData];
        // Don't remove boolean fields or required fields
        if (!requiredFields.includes(key) && 
            (value === '' || value === undefined || value === null)) {
          delete submitData[key as keyof typeof submitData];
        }
      });
      
      // Log the cleaned data
      console.log('Form data after cleaning:', submitData);

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting category form:', error);
    }
  };

  // Get available parent categories (exclude current category and its descendants)
  const getAvailableParents = () => {
    if (!category) {
      return categories; // All categories available for new category
    }

    // Filter out current category and its descendants
    const excludeIds = new Set<string>([category.id]);
    
    const collectDescendantIds = (cats: Category[], parentId: string) => {
      cats
        .filter(c => c.parentId === parentId)
        .forEach(c => {
          excludeIds.add(c.id);
          collectDescendantIds(cats, c.id);
        });
    };
    
    collectDescendantIds(categories, category.id);
    
    return categories.filter(c => !excludeIds.has(c.id));
  };

  const availableParents = getAvailableParents();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {category ? 'Edit Category' : 'Create Category'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.name 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="e.g., Electronics"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.description 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="Brief description of the category"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
              Parent Category
            </label>
            <select
              id="parentId"
              name="parentId"
              value={formData.parentId || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Root Category</option>
              {availableParents.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {'—'.repeat(cat.level)} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.imageUrl 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="bannerUrl" className="block text-sm font-medium text-gray-700">
              Banner URL
            </label>
            <input
              type="text"
              id="bannerUrl"
              name="bannerUrl"
              value={formData.bannerUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          {/* Display Settings */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isVisible"
                name="isVisible"
                checked={formData.isVisible}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-900">
                Visible (Show category to customers)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showInMenu"
                name="showInMenu"
                checked={formData.showInMenu}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="showInMenu" className="ml-2 block text-sm text-gray-900">
                Show in Navigation Menu
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                Featured Category
              </label>
            </div>
          </div>
        </div>

        {/* SEO Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">SEO Information</h4>
          
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
              Meta Title
            </label>
            <input
              type="text"
              id="metaTitle"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.metaTitle 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="SEO title for search engines"
            />
            {errors.metaTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.metaTitle}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.metaTitle?.length || 0}/255 characters
            </p>
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows={2}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.metaDescription 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="SEO description for search engines"
            />
            {errors.metaDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.metaDescription}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.metaDescription?.length || 0}/500 characters
            </p>
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
              Meta Keywords
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                className="flex-1 rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Add a keyword"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
              >
                Add
              </button>
            </div>
            {keywordsList.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {keywordsList.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 text-indigo-400 hover:text-indigo-600"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Keywords are stored as a comma-separated string in the backend
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
