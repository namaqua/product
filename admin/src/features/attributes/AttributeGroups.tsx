import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Remove toast import - will use inline notifications
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Folder,
  FolderOpen,
  Save,
  X,
  GripVertical,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import attributeService, { AttributeGroup } from '../../services/attribute.service';

// Validation schema for group
const groupSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code must be less than 50 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0),
  isCollapsible: z.boolean(),
  isCollapsedByDefault: z.boolean(),
  icon: z.string().nullable().optional(),
  isActive: z.boolean().optional()
});

type GroupFormData = z.infer<typeof groupSchema>;

export const AttributeGroups: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<AttributeGroup | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      code: '',
      name: '',
      description: null,
      sortOrder: 0,
      isCollapsible: true,
      isCollapsedByDefault: false,
      icon: null,
      isActive: true
    }
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await attributeService.getAttributeGroups();
      // Sort groups by sortOrder
      const sortedGroups = response.items.sort((a, b) => a.sortOrder - b.sortOrder);
      setGroups(sortedGroups);
    } catch (error: any) {
      console.error('Failed to load attribute groups:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to load attribute groups');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: GroupFormData) => {
    try {
      if (editingGroup) {
        // Update existing group
        const result = await attributeService.updateAttributeGroup(editingGroup.id, data);
        setSuccessMessage(result.message || 'Group updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // Create new group
        const result = await attributeService.createAttributeGroup(data);
        setSuccessMessage(result.message || 'Group created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      
      await loadGroups();
      handleCancel();
    } catch (error: any) {
      console.error('Failed to save group:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save group');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleEdit = (group: AttributeGroup) => {
    setEditingGroup(group);
    setIsCreating(false);
    reset({
      code: group.code,
      name: group.name,
      description: group.description,
      sortOrder: group.sortOrder,
      isCollapsible: group.isCollapsible,
      isCollapsedByDefault: group.isCollapsedByDefault,
      icon: group.icon,
      isActive: group.isActive
    });
  };

  const handleDelete = async (group: AttributeGroup) => {
    if (!confirm(`Are you sure you want to delete the group "${group.name}"? This will not delete the attributes in this group.`)) {
      return;
    }

    try {
      const result = await attributeService.deleteAttributeGroup(group.id);
      setSuccessMessage(result.message || 'Group deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadGroups();
    } catch (error: any) {
      console.error('Failed to delete group:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to delete group');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleCancel = () => {
    setEditingGroup(null);
    setIsCreating(false);
    reset({
      code: '',
      name: '',
      description: null,
      sortOrder: groups.length,
      isCollapsible: true,
      isCollapsedByDefault: false,
      icon: null,
      isActive: true
    });
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingGroup(null);
    reset({
      code: '',
      name: '',
      description: null,
      sortOrder: groups.length,
      isCollapsible: true,
      isCollapsedByDefault: false,
      icon: null,
      isActive: true
    });
  };

  const moveGroup = async (group: AttributeGroup, direction: 'up' | 'down') => {
    const currentIndex = groups.findIndex(g => g.id === group.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= groups.length) return;
    
    const targetGroup = groups[targetIndex];
    
    try {
      // Swap sort orders
      await attributeService.updateAttributeGroup(group.id, { sortOrder: targetGroup.sortOrder });
      await attributeService.updateAttributeGroup(targetGroup.id, { sortOrder: group.sortOrder });
      
      await loadGroups();
      setSuccessMessage('Group order updated');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to reorder groups:', error);
      setErrorMessage('Failed to reorder groups');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const toggleGroupExpanded = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const generateCode = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/-+/g, '_')
      .replace(/_+/g, '_');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attribute Groups</h1>
              <p className="text-gray-600 mt-2">
                Organize attributes into logical groups for better management
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/attributes')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back to Attributes
              </button>
              <button
                onClick={handleCreateNew}
                disabled={isCreating || editingGroup !== null}
                className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Group
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-success-50 border border-success-200 text-success-800 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-4 bg-danger-50 border border-danger-200 text-danger-800 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Create/Edit Form */}
        {(isCreating || editingGroup) && (
          <div className="bg-white rounded-lg shadow mb-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {editingGroup ? 'Edit Group' : 'Create New Group'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code <span className="text-danger-500">*</span>
                    </label>
                    <input
                      {...register('code')}
                      disabled={editingGroup !== null}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                      placeholder="general_info"
                    />
                    {errors.code && (
                      <p className="mt-1 text-xs text-danger-600">{errors.code.message}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-danger-500">*</span>
                    </label>
                    <input
                      {...register('name')}
                      onChange={(e) => {
                        const value = e.target.value;
                        setValue('name', value);
                        if (!editingGroup && !watch('code')) {
                          setValue('code', generateCode(value));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="General Information"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-danger-600">{errors.name.message}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Group description..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      {...register('sortOrder', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min={0}
                    />
                    {errors.sortOrder && (
                      <p className="mt-1 text-xs text-danger-600">{errors.sortOrder.message}</p>
                    )}
                  </div>

                  {/* Icon */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon (Emoji)
                    </label>
                    <input
                      {...register('icon')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="📁"
                      maxLength={2}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="pt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          {...register('isActive')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Collapsible Settings */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Display Settings</h3>
                  <div className="space-y-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        {...register('isCollapsible')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow collapsing</span>
                    </label>
                    
                    {watch('isCollapsible') && (
                      <label className="inline-flex items-center ml-6">
                        <input
                          type="checkbox"
                          {...register('isCollapsedByDefault')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Collapsed by default</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingGroup ? 'Update Group' : 'Create Group'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Attribute Groups</h3>
            <p className="text-gray-500 mb-4">
              Create your first attribute group to organize attributes
            </p>
            {!isCreating && (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Group
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Groups ({groups.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {groups.map((group, index) => (
                <div key={group.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="pt-1">
                        {group.icon ? (
                          <span className="text-2xl">{group.icon}</span>
                        ) : expandedGroups.has(group.id) ? (
                          <FolderOpen className="w-6 h-6 text-gray-400" />
                        ) : (
                          <Folder className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {/* Group Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium text-gray-900">
                            {group.name}
                          </h3>
                          <span className="text-xs font-mono text-gray-500">
                            ({group.code})
                          </span>
                          {!group.isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                          {group.isCollapsible && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                              Collapsible
                            </span>
                          )}
                          {group.isCollapsedByDefault && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning-100 text-warning-800">
                              Collapsed
                            </span>
                          )}
                        </div>
                        
                        {group.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {group.description}
                          </p>
                        )}

                        {/* Attributes in group */}
                        {group.attributes && group.attributes.length > 0 && (
                          <div className="mt-3">
                            <button
                              onClick={() => toggleGroupExpanded(group.id)}
                              className="text-sm text-primary-600 hover:text-primary-800"
                            >
                              {expandedGroups.has(group.id) ? (
                                <>
                                  <EyeOff className="w-4 h-4 inline mr-1" />
                                  Hide {group.attributes.length} attributes
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 inline mr-1" />
                                  Show {group.attributes.length} attributes
                                </>
                              )}
                            </button>
                            
                            {expandedGroups.has(group.id) && (
                              <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                {group.attributes.map(attr => (
                                  <div key={attr.id} className="py-1">
                                    <span className="text-sm text-gray-700">{attr.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({attr.code})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveGroup(group, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveGroup(group, 'down')}
                        disabled={index === groups.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(group)}
                        disabled={isCreating || editingGroup !== null}
                        className="p-1 text-primary-600 hover:text-primary-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(group)}
                        className="p-1 text-danger-600 hover:text-danger-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};