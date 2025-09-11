import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import attributeService, { 
  AttributeType, 
  UpdateAttributeDto, 
  AttributeGroup,
  ValidationRule,
  Attribute 
} from '../../services/attribute.service';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon,
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

export default function AttributeEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingAttribute, setLoadingAttribute] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [attribute, setAttribute] = useState<Attribute | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AttributeFormData>();

  const watchType = watch('type');

  useEffect(() => {
    if (id) {
      fetchAttribute();
      fetchGroups();
    }
  }, [id]);

  const fetchAttribute = async () => {
    try {
      setLoadingAttribute(true);
      const data = await attributeService.getAttribute(id!);
      setAttribute(data);
      
      // Set form values
      setValue('code', data.code);
      setValue('name', data.name);
      setValue('description', data.description || '');
      setValue('type', data.type);
      setValue('groupId', data.groupId || '');
      setValue('isRequired', data.isRequired);
      setValue('isUnique', data.isUnique);
      setValue('defaultValue', data.defaultValue || '');
      setValue('sortOrder', data.sortOrder);
      setValue('isVisibleInListing', data.isVisibleInListing);
      setValue('isVisibleInDetail', data.isVisibleInDetail);
      setValue('isComparable', data.isComparable);
      setValue('isSearchable', data.isSearchable);
      setValue('isFilterable', data.isFilterable);
      setValue('isLocalizable', data.isLocalizable);
      setValue('helpText', data.helpText || '');
      setValue('placeholder', data.placeholder || '');
      setValue('unit', data.unit || '');
      
      // Extract validation rules
      if (data.validationRules) {
        data.validationRules.forEach((rule: ValidationRule) => {
          switch (rule.type) {
            case 'min':
              setValue('minValue', rule.value);
              break;
            case 'max':
              setValue('maxValue', rule.value);
              break;
            case 'minLength':
              setValue('minLength', rule.value);
              break;
            case 'maxLength':
              setValue('maxLength', rule.value);
              break;
            case 'pattern':
              setValue('pattern', rule.value);
              break;
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch attribute:', err);
      setError('Failed to load attribute. Please try again.');
    } finally {
      setLoadingAttribute(false);
    }
  };

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
      
      if (data.minValue !== undefined && data.minValue !== null) {
        validationRules.push({
          type: 'min',
          value: data.minValue,
          message: `Value must be at least ${data.minValue}`
        });
      }
      
      if (data.maxValue !== undefined && data.maxValue !== null) {
        validationRules.push({
          type: 'max',
          value: data.maxValue,
          message: `Value cannot exceed ${data.maxValue}`
        });
      }
      
      if (data.minLength !== undefined && data.minLength !== null) {
        validationRules.push({
          type: 'minLength',
          value: data.minLength,
          message: `Minimum length is ${data.minLength} characters`
        });
      }
      
      if (data.maxLength !== undefined && data.maxLength !== null) {
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

      const updateData: UpdateAttributeDto = {
        name: data.name,
        description: data.description || undefined,
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

      await attributeService.updateAttribute(id!, updateData);
      navigate('/attributes');
    } catch (err: any) {
      console.error('Failed to update attribute:', err);
      setError(err.response?.data?.message || 'Failed to update attribute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const needsUnit = attribute && [
    AttributeType.NUMBER,
    AttributeType.DECIMAL,
    AttributeType.INTEGER,
    AttributeType.PRICE
  ].includes(attribute.type);

  const needsValidation = attribute && [
    AttributeType.TEXT,
    AttributeType.NUMBER,
    AttributeType.DECIMAL,
    AttributeType.INTEGER,
    AttributeType.URL,
    AttributeType.EMAIL
  ].includes(attribute.type);

  if (loadingAttribute) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading attribute...</div>
        </div>
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Attribute not found</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">Edit Attribute</h1>
        <p className="text-sm text-gray-600 mt-1">
          Update attribute configuration
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
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
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Color, Size, Weight"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('code')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                disabled
                title="Code cannot be changed after creation"
              />
              <p className="mt-1 text-xs text-gray-500">Code cannot be changed</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of this attribute"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                value={attributeService.getAttributeTypeLabel(attribute.type)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
                title="Type cannot be changed after creation"
              />
              <p className="mt-1 text-xs text-gray-500">Type cannot be changed</p>
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
            
            {(attribute.type === AttributeType.TEXT || attribute.type === AttributeType.URL || attribute.type === AttributeType.EMAIL) && (
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

            {(attribute.type === AttributeType.NUMBER || attribute.type === AttributeType.DECIMAL || attribute.type === AttributeType.INTEGER) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Value
                  </label>
                  <input
                    type="number"
                    step={attribute.type === AttributeType.DECIMAL ? '0.01' : '1'}
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
                    step={attribute.type === AttributeType.DECIMAL ? '0.01' : '1'}
                    {...register('maxValue', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="No maximum"
                  />
                </div>
              </div>
            )}

            {attribute.type === AttributeType.TEXT && (
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

        {/* Options Management Note */}
        {(attribute.type === AttributeType.SELECT || attribute.type === AttributeType.MULTISELECT) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Manage Options</p>
              <p>This is a {attribute.type} attribute. You can manage its options from the attributes list.</p>
              {attribute.options && attribute.options.length > 0 && (
                <p className="mt-1">Currently has {attribute.options.length} option(s): {attribute.options.map(o => o.label).join(', ')}</p>
              )}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Updating...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Update Attribute
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}