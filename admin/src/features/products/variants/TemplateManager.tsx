import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  TagIcon,
  DocumentDuplicateIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  FolderIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface TemplateManagerProps {
  onClose: () => void;
  onSelectTemplate?: (templateId: string, values: string[]) => void;
}

interface VariantTemplate {
  id: string;
  name: string;
  category: string;
  values: string[];
  description?: string;
  isCustom: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const defaultCategories = [
  'Apparel & Fashion',
  'Electronics',
  'Food & Beverage',
  'Furniture & Home',
  'Jewelry & Accessories',
  'Sports & Fitness',
  'Office & Stationery',
  'Automotive',
  'Beauty & Cosmetics',
  'General',
  'Custom'
];

// Default templates that come with the system
const systemTemplates: VariantTemplate[] = [
  // Apparel & Fashion
  {
    id: 'sizes',
    name: 'Standard Sizes',
    category: 'Apparel & Fashion',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'],
    description: 'Common clothing sizes',
    isCustom: false,
  },
  {
    id: 'euSizes',
    name: 'EU Sizes',
    category: 'Apparel & Fashion',
    values: ['36', '38', '40', '42', '44', '46', '48', '50'],
    description: 'European clothing sizes',
    isCustom: false,
  },
  {
    id: 'colors',
    name: 'Basic Colors',
    category: 'Apparel & Fashion',
    values: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray', 'Navy', 'Pink', 'Purple', 'Orange', 'Brown'],
    description: 'Common color options',
    isCustom: false,
  },
  {
    id: 'materials',
    name: 'Materials',
    category: 'Apparel & Fashion',
    values: ['Cotton', 'Polyester', 'Wool', 'Leather', 'Synthetic', 'Silk', 'Linen', 'Denim', 'Canvas'],
    description: 'Common fabric and material types',
    isCustom: false,
  },
  // Electronics
  {
    id: 'storage',
    name: 'Storage Capacity',
    category: 'Electronics',
    values: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB'],
    description: 'Digital storage sizes',
    isCustom: false,
  },
  {
    id: 'memory',
    name: 'Memory/RAM',
    category: 'Electronics',
    values: ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'],
    description: 'RAM memory sizes',
    isCustom: false,
  },
];

export default function TemplateManager({ onClose, onSelectTemplate }: TemplateManagerProps) {
  // Load templates from localStorage (custom templates) + system templates
  const loadTemplates = (): VariantTemplate[] => {
    const stored = localStorage.getItem('variantTemplates');
    const customTemplates = stored ? JSON.parse(stored) : [];
    return [...systemTemplates, ...customTemplates];
  };

  const [templates, setTemplates] = useState<VariantTemplate[]>(loadTemplates());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<VariantTemplate>>({
    name: '',
    category: 'Custom',
    values: [],
    description: '',
    isCustom: true,
  });
  const [newValue, setNewValue] = useState('');
  const [bulkValues, setBulkValues] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Save custom templates to localStorage
  const saveCustomTemplates = (allTemplates: VariantTemplate[]) => {
    const customOnly = allTemplates.filter(t => t.isCustom);
    localStorage.setItem('variantTemplates', JSON.stringify(customOnly));
  };

  // Filter templates based on category and search
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.values.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Get categories with counts
  const categoriesWithCounts = defaultCategories.map(cat => ({
    name: cat,
    count: templates.filter(t => t.category === cat).length
  }));

  const toggleTemplateExpansion = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
    }
    setExpandedTemplates(newExpanded);
  };

  const handleCreateTemplate = () => {
    if (!formData.name || !formData.values || formData.values.length === 0) {
      alert('Template name and at least one value are required');
      return;
    }

    const newTemplate: VariantTemplate = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      category: formData.category || 'Custom',
      values: formData.values,
      description: formData.description,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveCustomTemplates(updatedTemplates);
    
    setShowCreateForm(false);
    resetForm();
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !formData.name || !formData.values || formData.values.length === 0) {
      alert('Template name and at least one value are required');
      return;
    }

    const updatedTemplates = templates.map(template => {
      if (template.id === editingTemplate) {
        return {
          ...template,
          name: formData.name,
          category: formData.category || template.category,
          values: formData.values,
          description: formData.description,
          updatedAt: new Date().toISOString(),
        };
      }
      return template;
    });

    setTemplates(updatedTemplates);
    saveCustomTemplates(updatedTemplates);
    
    setEditingTemplate(null);
    resetForm();
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    if (!template.isCustom) {
      alert('System templates cannot be deleted');
      return;
    }

    if (!confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      return;
    }

    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    saveCustomTemplates(updatedTemplates);
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newTemplate: VariantTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveCustomTemplates(updatedTemplates);
  };

  const startEditTemplate = (template: VariantTemplate) => {
    if (!template.isCustom) {
      // For system templates, create a copy instead
      handleDuplicateTemplate(template.id);
      return;
    }

    setEditingTemplate(template.id);
    setFormData({
      name: template.name,
      category: template.category,
      values: [...template.values],
      description: template.description,
      isCustom: template.isCustom,
    });
    setShowCreateForm(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Custom',
      values: [],
      description: '',
      isCustom: true,
    });
    setNewValue('');
    setBulkValues('');
    setShowBulkInput(false);
  };

  const addValue = () => {
    if (!newValue.trim()) return;
    
    if (!formData.values?.includes(newValue.trim())) {
      setFormData(prev => ({
        ...prev,
        values: [...(prev.values || []), newValue.trim()]
      }));
    }
    setNewValue('');
  };

  const removeValue = (value: string) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values?.filter(v => v !== value) || []
    }));
  };

  const handleBulkAdd = () => {
    const values = bulkValues
      .split(/[,\n]/)
      .map(v => v.trim())
      .filter(v => v.length > 0);
    
    const uniqueValues = Array.from(new Set([...(formData.values || []), ...values]));
    setFormData(prev => ({
      ...prev,
      values: uniqueValues
    }));
    
    setBulkValues('');
    setShowBulkInput(false);
  };

  // Render the form inline instead of as a component to prevent focus loss
  const renderTemplateForm = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">
        {editingTemplate ? 'Edit Template' : 'Create New Template'}
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Package Sizes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {defaultCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of this template"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Values <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowBulkInput(!showBulkInput)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showBulkInput ? 'Single Input' : 'Bulk Add'}
            </button>
          </div>
          
          {!showBulkInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
                placeholder="Enter a value and press Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addValue}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={bulkValues}
                onChange={(e) => setBulkValues(e.target.value)}
                placeholder="Enter multiple values separated by commas or new lines&#10;e.g., Small, Medium, Large&#10;or&#10;Small&#10;Medium&#10;Large"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleBulkAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add All Values
              </button>
            </div>
          )}
          
          {formData.values && formData.values.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.values.map((value, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => removeValue(value)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(false);
              setEditingTemplate(null);
              resetForm();
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Template Manager</h2>
            <p className="text-sm text-gray-500 mt-1">Create and manage variant templates for quick product variant generation</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar - Categories */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  selectedCategory === 'All' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>All Templates</span>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {templates.length}
                  </span>
                </div>
              </button>
              
              <div className="mt-2 space-y-1">
                {categoriesWithCounts.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === cat.name
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{cat.name}</span>
                      {cat.count > 0 && (
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                          {cat.count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Search and Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {!showCreateForm && !editingTemplate && (
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    resetForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Template
                </button>
              )}
            </div>

            {/* Create/Edit Form */}
            {(showCreateForm || editingTemplate) && renderTemplateForm()}

            {/* Templates List */}
            <div className="space-y-3">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Squares2X2Icon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No templates found matching your search' : 'No templates in this category'}
                  </p>
                </div>
              ) : (
                filteredTemplates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleTemplateExpansion(template.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {expandedTemplates.has(template.id) ? (
                              <ChevronUpIcon className="h-5 w-5" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900">{template.name}</span>
                              {!template.isCustom && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  System
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                {template.category}
                              </span>
                              <span className="text-sm text-gray-400">
                                ({template.values.length} values)
                              </span>
                            </div>
                            {template.description && (
                              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {onSelectTemplate && (
                            <button
                              onClick={() => onSelectTemplate(template.id, template.values)}
                              className="p-2 text-green-600 hover:text-green-700"
                              title="Use this template"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDuplicateTemplate(template.id)}
                            className="p-2 text-gray-500 hover:text-blue-600"
                            title="Duplicate template"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => startEditTemplate(template)}
                            className="p-2 text-gray-500 hover:text-blue-600"
                            title={template.isCustom ? 'Edit template' : 'Create editable copy'}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          {template.isCustom && (
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-2 text-gray-500 hover:text-red-600"
                              title="Delete template"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {expandedTemplates.has(template.id) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex flex-wrap gap-2">
                            {template.values.map((value, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              >
                                {value}
                              </span>
                            ))}
                          </div>
                          {template.createdAt && (
                            <div className="mt-3 text-xs text-gray-500">
                              Created: {new Date(template.createdAt).toLocaleDateString()}
                              {template.updatedAt && template.updatedAt !== template.createdAt && (
                                <span> • Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {templates.filter(t => t.isCustom).length} custom templates, {templates.filter(t => !t.isCustom).length} system templates
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}