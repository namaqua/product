import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import attributeService, { 
  AttributeType, 
  CreateAttributeDto, 
  AttributeGroup,
  ValidationRule 
} from '../../services/attribute.service';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface AttributeFormData {
  code: string;
  name: string;
  description?: string;
  type: AttributeType;
  groupId?: string;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue?: string;
  sortOrder: number;
  isVisibleInListing: boolean;
  isVisibleInDetail: boolean;
  isComparable: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isLocalizable: boolean;
  helpText?: string;
  placeholder?: string;
  unit?: string;
  // Validation
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export default function AttributeCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AttributeFormData>({
    defaultValues: {
      type: AttributeType.TEXT,
      isRequired: false,
      isUnique: false,
      sortOrder: 0,
      isVisibleInListing: true,
      isVisibleInDetail: true,
      isComparable: false,
      isSearchable: false,
      isFilterable: false,
      isLocalizable: false
    }
  });

  const watchType = watch('type');
  const watchName = watch('name');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    // Auto-generate code from name
    if (watchName) {
      const generatedCode = attributeService.generateAttributeCode(watchName);
      setValue('code', generatedCode);
    }
  }, [watchName, setValue]);

  const fetchGroups = async () => {
    try {
      const response = await attributeService.getAttributeGroups();
      setGroups(response.items);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  const onSubmit = async (data: AttributeFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Build validation rules
      const validationRules: ValidationRule[] = [];
      
      if (data.minValue !== undefined) {
        validationRules.push({
          type: 'min',
          value: data.minValue,
          message: `Value must be at least ${data.minValue}`
        });
      }
      
      if (data.maxValue !== undefined) {
        validationRules.push({
          type: 'max',
          value: data.maxValue,
          message: `Value cannot exceed ${data.maxValue}`
        });
      }
      
      if (data.minLength !== undefined) {
        validationRules.push({
          type: 'minLength',
          value: data.minLength,
          message: `Minimum length is ${data.minLength} characters`
        });
      }
      
      if (data.maxLength !== undefined) {
        validationRules.push({
          type: 'maxLength',
          value: data.maxLength,
          message: `Maximum length is ${data.maxLength} characters`
        });
      }
      
      if (data.pattern) {
        validationRules.push({
          type: 'pattern',
          value: data.pattern,
          message: 'Value does not match the required pattern'
        });
      }

      const createData: CreateAttributeDto = {
        code: data.code,
        name: data.name,
        description: data.description,
        type: data.type,
        groupId: data.groupId || undefined,
        isRequired: data.isRequired,
        isUnique: data.isUnique,
        validationRules: validationRules.length > 0 ? validationRules : undefined,
        defaultValue: data.defaultValue || undefined,
        sortOrder: data.sortOrder,
        isVisibleInListing: data.isVisibleInListing,
        isVisibleInDetail: data.isVisibleInDetail,
        isComparable: data.isComparable,
        isSearchable: data.isSearchable,
        isFilterable: data.isFilterable,
        isLocalizable: data.isLocalizable,
        helpText: data.helpText || undefined,
        placeholder: data.placeholder || undefined,
        unit: data.unit || undefined
      };

      await attributeService.createAttribute(createData);
      navigate('/attributes');
    } catch (err: any) {
      console.error('Failed to create attribute:', err);
      setError(err.response?.data?.message || 'Failed to create attribute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const needsUnit = [
    AttributeType.NUMBER,
    AttributeType.DECIMAL,
    AttributeType.INTEGER,
    AttributeType.PRICE
  ].includes(watchType);

  const needsValidation = [
    AttributeType.TEXT,
    AttributeType.NUMBER,
    AttributeType.DECIMAL,
    AttributeType.INTEGER,
    AttributeType.URL,
    AttributeType.EMAIL
  ].includes(watchType);

  const typeDescriptions: Record<AttributeType, string> = {
    [AttributeType.TEXT]: 'Single line of text for names, titles, or short descriptions',
    [AttributeType.NUMBER]: 'Numeric value that can include decimals',
    [AttributeType.DECIMAL]: 'Decimal number with precise decimal places',
    [AttributeType.INTEGER]: 'Whole number without decimals',
    [AttributeType.BOOLEAN]: 'Yes/No or True/False value',
    [AttributeType.SELECT]: 'Dropdown list where users select one option',
    [AttributeType.MULTISELECT]: 'List where users can select multiple options',
    [AttributeType.DATE]: 'Calendar date picker',
    [AttributeType.DATETIME]: 'Date and time picker',
    [AttributeType.PRICE]: 'Monetary value with currency',
    [AttributeType.URL]: 'Web address or link',
    [AttributeType.EMAIL]: 'Email address with validation',
    [AttributeType.JSON]: 'Structured JSON data for complex attributes'
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/attributes')}
          className="mb-4 text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Attributes
        </button>
        <h1 className="text-2xl font-bold">Create Attribute</h1>
        <p className="text-sm text-gray-600 mt-1">
          Define a new product attribute
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-danger-50 border border-danger-200 text-danger-800 rounded-lg flex items-center gap-2">
          <XCircleIcon className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          {/* Basic Information */}
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Color, Size, Weight"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                {...register('code', { 
                  required: 'Code is required',
                  pattern: {
                    value: /^[a-z0-9_]+$/,
                    message: 'Code must be lowercase letters, numbers, and underscores only'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                placeholder="e.g., product_color"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-danger-600">{errors.code.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Auto-generated from name, but you can customize</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Brief description of this attribute"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-danger-500">*</span>
              </label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {Object.values(AttributeType).map(type => (
                  <option key={type} value={type}>
                    {attributeService.getAttributeTypeLabel(type)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {typeDescriptions[watchType]}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group
              </label>
              <select
                {...register('groupId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Value
              </label>
              <input
                type="text"
                {...register('defaultValue')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional default value"
              />
            </div>

            {needsUnit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  {...register('unit')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., kg, cm, USD"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                {...register('sortOrder', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Help Text
              </label>
              <input
                type="text"
                {...register('helpText')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Instructions shown to users"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                {...register('placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Placeholder text for input fields"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isRequired')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Required field</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isUnique')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Unique values only</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isSearchable')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Searchable</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isFilterable')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Filterable</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isComparable')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Comparable</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isLocalizable')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Localizable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Validation Rules */}
        {needsValidation && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Validation Rules</h2>
            
            {(watchType === AttributeType.TEXT || watchType === AttributeType.URL || watchType === AttributeType.EMAIL) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Length
                  </label>
                  <input
                    type="number"
                    {...register('minLength', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="No minimum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Length
                  </label>
                  <input
                    type="number"
                    {...register('maxLength', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="No maximum"
                  />
                </div>
              </div>
            )}

            {(watchType === AttributeType.NUMBER || watchType === AttributeType.DECIMAL || watchType === AttributeType.INTEGER) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Value
                  </label>
                  <input
                    type="number"
                    step={watchType === AttributeType.DECIMAL ? '0.01' : '1'}
                    {...register('minValue', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="No minimum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Value
                  </label>
                  <input
                    type="number"
                    step={watchType === AttributeType.DECIMAL ? '0.01' : '1'}
                    {...register('maxValue', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="No maximum"
                  />
                </div>
              </div>
            )}

            {watchType === AttributeType.TEXT && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pattern (Regular Expression)
                </label>
                <input
                  type="text"
                  {...register('pattern')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="e.g., ^[A-Z]{2}-[0-9]{4}$"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Advanced: Use regex for custom validation
                </p>
              </div>
            )}
          </div>
        )}

        {/* Note for Select/Multiselect */}
        {(watchType === AttributeType.SELECT || watchType === AttributeType.MULTISELECT) && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-800">
              <p className="font-semibold mb-1">Options Required</p>
              <p>After creating this {watchType} attribute, you'll be redirected to add the available options.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/attributes')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Creating...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Create Attribute
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}