import { useState, useEffect } from 'react';
import {
  DocumentDuplicateIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { importExportService } from '../../../services/import-export.service';
import { useNotification } from '../../../hooks/useNotification';

interface MappingTemplate {
  id: string;
  name: string;
  type: string;
  mapping: Record<string, string>;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MappingTemplates() {
  const [templates, setTemplates] = useState<MappingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<MappingTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'products',
    mapping: {} as Record<string, string>,
  });
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await importExportService.getMappingTemplates();
      if (response.success) {
        setTemplates(response.data.items || []);
      }
    } catch (error) {
      showError('Failed to load mapping templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      type: 'products',
      mapping: {},
    });
  };

  const handleEdit = (template: MappingTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setFormData({
      name: template.name,
      type: template.type,
      mapping: template.mapping,
    });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const response = await importExportService.createMappingTemplate(formData);
        if (response.success) {
          showSuccess('Mapping template created successfully');
          loadTemplates();
        }
      } else if (isEditing && selectedTemplate) {
        const response = await importExportService.updateMappingTemplate(selectedTemplate.id, formData);
        if (response.success) {
          showSuccess('Mapping template updated successfully');
          loadTemplates();
        }
      }
      handleCancel();
    } catch (error) {
      showError('Failed to save mapping template');
    }
  };

  const handleDelete = async (template: MappingTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        const response = await importExportService.deleteMappingTemplate(template.id);
        if (response.success) {
          showSuccess('Mapping template deleted successfully');
          loadTemplates();
        }
      } catch (error) {
        showError('Failed to delete mapping template');
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      type: 'products',
      mapping: {},
    });
  };

  const addMappingField = () => {
    setFormData(prev => ({
      ...prev,
      mapping: {
        ...prev.mapping,
        '': '',
      },
    }));
  };

  const updateMappingField = (oldKey: string, newKey: string, value: string) => {
    const newMapping = { ...formData.mapping };
    if (oldKey !== newKey) {
      delete newMapping[oldKey];
    }
    newMapping[newKey] = value;
    setFormData(prev => ({
      ...prev,
      mapping: newMapping,
    }));
  };

  const removeMappingField = (key: string) => {
    const newMapping = { ...formData.mapping };
    delete newMapping[key];
    setFormData(prev => ({
      ...prev,
      mapping: newMapping,
    }));
  };

  const FIELD_OPTIONS = {
    products: ['name', 'sku', 'description', 'price', 'compareAtPrice', 'cost', 'stock', 'category', 'brand', 'tags', 'weight', 'dimensions', 'status'],
    variants: ['sku', 'name', 'price', 'stock', 'size', 'color', 'material', 'weight'],
    categories: ['name', 'slug', 'description', 'parent', 'order', 'status'],
    attributes: ['name', 'slug', 'type', 'options', 'required', 'filterable'],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Mapping Templates</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create reusable field mapping templates for consistent imports
          </p>
        </div>
        {!isCreating && !isEditing && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            New Template
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isCreating ? 'Create New Template' : 'Edit Template'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., Default Product Import"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Import Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="products">Products</option>
                  <option value="variants">Product Variants</option>
                  <option value="categories">Categories</option>
                  <option value="attributes">Attributes</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Field Mappings
                  </label>
                  <button
                    onClick={addMappingField}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Field
                  </button>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(formData.mapping).map(([key, value], index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => updateMappingField(key, e.target.value, value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="CSV Column Name"
                      />
                      <span className="text-gray-500">→</span>
                      <select
                        value={value}
                        onChange={(e) => updateMappingField(key, key, e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">-- Select Field --</option>
                        {FIELD_OPTIONS[formData.type as keyof typeof FIELD_OPTIONS]?.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeMappingField(key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  {Object.keys(formData.mapping).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No field mappings defined. Click "Add Field" to start.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <XMarkIcon className="mr-2 h-5 w-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || Object.keys(formData.mapping).length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckIcon className="mr-2 h-5 w-5" />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      {!isCreating && !isEditing && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {templates.map((template) => (
              <li key={template.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DocumentDuplicateIcon className="h-10 w-10 text-gray-400" />
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{template.name}</p>
                          {template.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Type: {template.type} • {Object.keys(template.mapping).length} field mappings
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      {!template.isDefault && (
                        <button
                          onClick={() => handleDelete(template)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Show mapping preview */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(template.mapping).slice(0, 3).map(([key, value]) => (
                      <span key={key} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        {key} → {value}
                      </span>
                    ))}
                    {Object.keys(template.mapping).length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                        +{Object.keys(template.mapping).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          {templates.length === 0 && (
            <div className="text-center py-12">
              <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new mapping template.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
