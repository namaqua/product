import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Remove toast import - will use inline notifications
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Save, X, Palette } from 'lucide-react';
import attributeService, { Attribute, AttributeOption, AttributeType } from '../../services/attribute.service';

// Validation schema for options
const optionSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  label: z.string().min(1, 'Label is required'),
  sortOrder: z.number().int().min(0),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
  metadata: z.record(z.any()).nullable().optional()
});

const optionsFormSchema = z.object({
  options: z.array(optionSchema).min(1, 'At least one option is required')
});

type OptionsFormData = z.infer<typeof optionsFormSchema>;

export const AttributeOptions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<OptionsFormData>({
    resolver: zodResolver(optionsFormSchema),
    defaultValues: {
      options: []
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'options'
  });

  const options = watch('options');

  useEffect(() => {
    loadAttribute();
  }, [id]);

  const loadAttribute = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await attributeService.getAttribute(id);
      setAttribute(data);
      
      // Load existing options
      if (data.options && data.options.length > 0) {
        setValue('options', data.options.map((opt, index) => ({
          ...opt,
          sortOrder: opt.sortOrder || index
        })));
      } else {
        // Add initial empty option
        append({
          value: '',
          label: '',
          sortOrder: 0,
          color: null,
          icon: null,
          isDefault: false,
          metadata: null
        });
      }
    } catch (error: any) {
      console.error('Failed to load attribute:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to load attribute');
      setTimeout(() => {
        navigate('/attributes');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: OptionsFormData) => {
    if (!id) return;
    
    try {
      setSaving(true);
      
      // Update sort orders based on array position
      const optionsWithOrder = data.options.map((opt, index) => ({
        ...opt,
        sortOrder: index
      }));
      
      const result = await attributeService.setAttributeOptions(id, optionsWithOrder);
      setSuccessMessage(result.message || 'Options saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reload attribute to get updated data
      await loadAttribute();
    } catch (error: any) {
      console.error('Failed to save options:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save options');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const addOption = () => {
    const newIndex = fields.length;
    append({
      value: '',
      label: '',
      sortOrder: newIndex,
      color: null,
      icon: null,
      isDefault: false,
      metadata: null
    });
  };

  const removeOption = (index: number) => {
    if (fields.length === 1) {
      setErrorMessage('At least one option is required');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    remove(index);
  };

  const moveOption = (from: number, to: number) => {
    if (to < 0 || to >= fields.length) return;
    move(from, to);
  };

  const handleDragStart = (index: number) => {
    setIsDragging(true);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      move(draggedIndex, dropIndex);
    }
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const generateValue = (label: string) => {
    return label
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/-+/g, '_')
      .replace(/_+/g, '_');
  };

  const handleLabelChange = (index: number, label: string) => {
    setValue(`options.${index}.label`, label);
    // Auto-generate value if empty
    const currentValue = watch(`options.${index}.value`);
    if (!currentValue) {
      setValue(`options.${index}.value`, generateValue(label));
    }
  };

  const setDefaultOption = (index: number) => {
    // Clear all other defaults
    options.forEach((_, i) => {
      setValue(`options.${i}.isDefault`, i === index);
    });
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
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Attribute not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if attribute type supports options
  if (attribute.type !== AttributeType.SELECT && attribute.type !== AttributeType.MULTISELECT) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Options Not Supported</h3>
            <p className="text-yellow-700">
              Options are only available for SELECT and MULTISELECT attribute types.
            </p>
            <p className="text-yellow-700 mt-2">
              Current type: <span className="font-mono">{attribute.type}</span>
            </p>
            <button
              onClick={() => navigate('/attributes')}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Back to Attributes
            </button>
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Options</h1>
              <p className="text-gray-600 mt-2">
                Configure options for <span className="font-semibold">{attribute.name}</span>
              </p>
            </div>
            <button
              onClick={() => navigate('/attributes')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Attribute info */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Code</p>
                <p className="font-mono text-sm">{attribute.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                <p className="text-sm">{attributeService.getAttributeTypeLabel(attribute.type)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  attribute.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {attribute.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Options Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Options</h2>
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </button>
              </div>
            </div>

            <div className="p-6">
              {fields.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No options configured yet</p>
                  <button
                    type="button"
                    onClick={addOption}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Option
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`border rounded-lg p-4 bg-white transition-all ${
                        isDragging && draggedIndex === index
                          ? 'opacity-50'
                          : ''
                      } ${
                        isDragging && draggedIndex !== index
                          ? 'border-indigo-300'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Drag handle */}
                        <div className="cursor-move pt-2">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* Option fields */}
                        <div className="flex-1 grid grid-cols-12 gap-4">
                          {/* Value */}
                          <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Value
                            </label>
                            <input
                              {...register(`options.${index}.value`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="option_value"
                            />
                            {errors.options?.[index]?.value && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.options[index]?.value?.message}
                              </p>
                            )}
                          </div>

                          {/* Label */}
                          <div className="col-span-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Label
                            </label>
                            <input
                              {...register(`options.${index}.label`)}
                              onChange={(e) => handleLabelChange(index, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Option Label"
                            />
                            {errors.options?.[index]?.label && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.options[index]?.label?.message}
                              </p>
                            )}
                          </div>

                          {/* Color */}
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                {...register(`options.${index}.color`)}
                                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() => setValue(`options.${index}.color`, null)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                                title="Clear color"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Icon */}
                          <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Icon
                            </label>
                            <input
                              {...register(`options.${index}.icon`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="🎨"
                              maxLength={2}
                            />
                          </div>

                          {/* Default */}
                          <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Default
                            </label>
                            <div className="pt-2">
                              <input
                                type="checkbox"
                                {...register(`options.${index}.isDefault`)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDefaultOption(index);
                                  }
                                }}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0">
                              Actions
                            </label>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveOption(index, index - 1)}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveOption(index, index + 1)}
                                disabled={index === fields.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="p-1 text-red-400 hover:text-red-600"
                                title="Remove option"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.options && (
                <p className="mt-4 text-sm text-red-600">{errors.options.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {isDirty && <span>You have unsaved changes</span>}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/attributes')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !isDirty}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
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
                        Save Options
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};