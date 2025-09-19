import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  HomeIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { addressService } from '../../services/address.service';
import { 
  Address, 
  AddressType,
  CreateAddressDto,
  UpdateAddressDto,
  BusinessHours 
} from '../../types/dto/addresses';

interface AddressFormData extends Partial<CreateAddressDto> {}

// Updated address type configuration for business rules
const addressTypeConfig = {
  [AddressType.HEADQUARTERS]: { 
    icon: HomeIcon, 
    label: 'Headquarters', 
    color: 'blue',
    description: 'Primary business location (required, only one allowed)',
    limit: 1,
    required: true
  },
  [AddressType.BILLING]: { 
    icon: BuildingOfficeIcon, 
    label: 'Billing', 
    color: 'green',
    description: 'Billing address (only one allowed, can be same as HQ)',
    limit: 1,
    required: false
  },
  [AddressType.SHIPPING]: { 
    icon: TruckIcon, 
    label: 'Shipping', 
    color: 'purple',
    description: 'Shipping destinations (multiple allowed)',
    limit: null,
    required: false
  },
};

// Address card component
const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete,
  onSetDefault,
  canDelete,
}: { 
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onSetDefault?: (address: Address) => void;
  canDelete: boolean;
}) => {
  const typeConfig = addressTypeConfig[address.addressType];
  const Icon = typeConfig.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start">
          <Icon className={`h-6 w-6 mr-3 text-${typeConfig.color}-500`} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">
                {address.label || typeConfig.label}
              </h3>
              {address.addressType === AddressType.HEADQUARTERS && (
                <HomeIconSolid className="h-5 w-5 text-blue-500" title="Headquarters" />
              )}
              {address.isDefault && address.addressType === AddressType.SHIPPING && (
                <StarIconSolid className="h-5 w-5 text-yellow-400" title="Default Shipping" />
              )}
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${typeConfig.color}-100 text-${typeConfig.color}-800 mt-1`}>
              {typeConfig.label}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {address.addressType === AddressType.SHIPPING && !address.isDefault && onSetDefault && (
            <button
              onClick={() => onSetDefault(address)}
              className="p-1 text-gray-400 hover:text-yellow-500"
              title="Set as Default"
            >
              <StarIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => onEdit(address)}
            className="p-1 text-gray-400 hover:text-blue-500"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(address)}
              className="p-1 text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {address.contactName && (
          <div className="flex items-center text-gray-600">
            <span className="font-medium mr-2">Contact:</span> {address.contactName}
          </div>
        )}
        
        <div className="text-gray-900">
          <div>{address.street1}</div>
          {address.street2 && <div>{address.street2}</div>}
          <div>
            {address.city}{address.state && `, ${address.state}`} {address.postalCode}
          </div>
          <div>{address.country}</div>
        </div>

        {(address.phone || address.email) && (
          <div className="flex gap-4 mt-2">
            {address.phone && (
              <div className="flex items-center text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-1" />
                {address.phone}
              </div>
            )}
            {address.email && (
              <div className="flex items-center text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                {address.email}
              </div>
            )}
          </div>
        )}

        {address.deliveryInstructions && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <span className="font-medium">Instructions:</span> {address.deliveryInstructions}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            {address.isValidated ? (
              <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
            ) : (
              <ClockIcon className="h-4 w-4 mr-1" />
            )}
            {address.isValidated ? 'Validated' : 'Not Validated'}
          </div>
          {address.usageCount > 0 && (
            <div className="text-xs text-gray-500">
              Used {address.usageCount} time{address.usageCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Address form modal
const AddressFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  address,
  accountId,
  allowedTypes,
}: { 
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => void;
  address?: Address | null;
  accountId: string;
  allowedTypes: AddressType[];
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    accountId,
    addressType: allowedTypes[0] || AddressType.SHIPPING,
    isDefault: false,
    label: '',
    contactName: '',
    phone: '',
    email: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    county: '',
    deliveryInstructions: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fixed useEffect to properly populate form when editing
  useEffect(() => {
    if (!isOpen) return;
    
    if (address && address.id) {
      // Log for debugging
      console.log('Populating form with address:', address);
      
      // Populate form with existing address data
      setFormData({
        accountId: address.accountId || accountId,
        addressType: address.addressType || allowedTypes[0] || AddressType.SHIPPING,
        isDefault: address.isDefault === true,
        label: address.label || '',
        contactName: address.contactName || '',
        phone: address.phone || '',
        email: address.email || '',
        street1: address.street1 || '',
        street2: address.street2 || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'US',
        county: address.county || '',
        deliveryInstructions: address.deliveryInstructions || '',
      });
    } else {
      // Reset form for new address - ENSURE accountId is set
      console.log('Resetting form for new address with accountId:', accountId);
      setFormData({
        accountId: accountId, // Critical: Ensure accountId is set
        addressType: allowedTypes[0] || AddressType.SHIPPING,
        isDefault: false,
        label: '',
        contactName: '',
        phone: '',
        email: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        county: '',
        deliveryInstructions: '',
      });
    }
    setErrors({});
  }, [address, accountId, allowedTypes, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.accountId) {
      newErrors.accountId = 'Account ID is required';
    }
    if (!formData.street1) {
      newErrors.street1 = 'Street address is required';
    }
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    if (!formData.postalCode) {
      newErrors.postalCode = 'Postal code is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    
    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.error('Form validation failed:', errors);
      return;
    }

    // Ensure accountId is included
    const submitData = {
      ...formData,
      accountId: accountId, // Double-ensure accountId is set
    };
    
    console.log('Submitting form data:', submitData);
    onSubmit(submitData);
  };

  const handleInputChange = (field: keyof AddressFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  const getPlaceholderLabel = () => {
    switch(formData.addressType) {
      case AddressType.HEADQUARTERS:
        return "e.g., Main Office";
      case AddressType.BILLING:
        return "e.g., Finance Department";
      case AddressType.SHIPPING:
        return "e.g., Warehouse 1, East Coast, Customer Location";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {address ? 'Edit Address' : 'Add New Address'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Hidden field to ensure accountId is submitted */}
            <input type="hidden" name="accountId" value={accountId} />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Type
                </label>
                <select
                  value={formData.addressType}
                  onChange={(e) => handleInputChange('addressType', e.target.value as AddressType)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={!!address || allowedTypes.length === 1}
                >
                  {allowedTypes.map((type) => (
                    <option key={type} value={type}>{addressTypeConfig[type].label}</option>
                  ))}
                </select>
                {!address && (
                  <p className="mt-1 text-xs text-gray-500">
                    {addressTypeConfig[formData.addressType as AddressType]?.description}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.label || ''}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  placeholder={getPlaceholderLabel()}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {formData.addressType === AddressType.SHIPPING && (
              <div className="bg-purple-50 p-3 rounded-md">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault === true}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                    Set as default shipping address
                  </label>
                </div>
                <p className="text-xs text-purple-600 mt-1 ml-6">
                  The default shipping address will be pre-selected for orders
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contactName || ''}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.street1 || ''}
                onChange={(e) => handleInputChange('street1', e.target.value)}
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.street1 ? 'border-red-500' : ''}`}
                required
              />
              {errors.street1 && (
                <p className="mt-1 text-xs text-red-600">{errors.street1}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address 2
              </label>
              <input
                type="text"
                value={formData.street2 || ''}
                onChange={(e) => handleInputChange('street2', e.target.value)}
                placeholder="Apartment, suite, unit, etc."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.city ? 'border-red-500' : ''}`}
                  required
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  value={formData.postalCode || ''}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.postalCode ? 'border-red-500' : ''}`}
                  required
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.country ? 'border-red-500' : ''}`}
                  maxLength={2}
                  placeholder="US"
                  required
                />
                {errors.country && (
                  <p className="mt-1 text-xs text-red-600">{errors.country}</p>
                )}
              </div>
            </div>

            {formData.addressType === AddressType.SHIPPING && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions
                </label>
                <textarea
                  value={formData.deliveryInstructions || ''}
                  onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Special instructions for delivery (e.g., ring doorbell, use loading dock, leave at reception)..."
                />
              </div>
            )}

            {/* Show validation summary if there are errors */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600 font-medium">Please fix the following errors:</p>
                <ul className="mt-1 text-xs text-red-500 list-disc list-inside">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {address ? 'Update' : 'Create'} Address
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function AccountAddresses() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [allowedTypesForForm, setAllowedTypesForForm] = useState<AddressType[]>([]);

  // Validate accountId
  useEffect(() => {
    if (!id) {
      toast.error('Invalid account ID');
      console.error('No account ID provided in URL');
    }
  }, [id, toast]);

  // Fetch addresses
  const { data: addressesResponse, isLoading, error } = useQuery({
    queryKey: ['addresses', id],
    queryFn: () => addressService.getAddressesByAccount(id!),
    enabled: !!id,
  });

  // Extract addresses from standardized response
  // Handle both single and double-wrapped responses
  const extractAddresses = (response: any) => {
    // Check if double-wrapped (data.data structure)
    if (response?.data?.data?.items) {
      console.log('Double-wrapped response detected');
      return response.data.data.items;
    }
    // Check if single-wrapped (data.items structure)
    if (response?.data?.items) {
      console.log('Single-wrapped response detected');
      return response.data.items;
    }
    // Fallback to empty array
    console.log('No addresses found in response');
    return [];
  };
  
  const addresses = extractAddresses(addressesResponse) || [];

  // Debug log
  useEffect(() => {
    if (addresses.length > 0) {
      console.log('Loaded addresses:', addresses);
    }
  }, [addresses]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      // Ensure accountId is included
      const createDto: CreateAddressDto = {
        ...data,
        accountId: id!,
      } as CreateAddressDto;
      
      console.log('Creating address with data:', createDto);
      const response = await addressService.createAddress(createDto);
      
      // Handle both single and double-wrapped responses
      if (response?.data?.data?.item || response?.data?.item) {
        return response;
      }
      throw new Error('Invalid response structure');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', id] });
      toast.success('Address created successfully');
      setIsFormOpen(false);
      setEditingAddress(null);
    },
    onError: (error: any) => {
      console.error('Create address error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create address');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id: addressId, data }: { id: string; data: AddressFormData }) => {
      const updateDto: UpdateAddressDto = {
        ...data,
      } as UpdateAddressDto;
      
      console.log('Updating address with data:', updateDto);
      return addressService.updateAddress(addressId, updateDto);
    },
    onSuccess: (response) => {
      console.log('Update successful, response:', response);
      queryClient.invalidateQueries({ queryKey: ['addresses', id] });
      toast.success('Address updated successfully');
      setIsFormOpen(false);
      setEditingAddress(null);
    },
    onError: (error: any) => {
      console.error('Update address error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update address');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (addressId: string) => addressService.deleteAddress(addressId),
    onSuccess: (response) => {
      console.log('Delete successful, response:', response);
      queryClient.invalidateQueries({ queryKey: ['addresses', id] });
      toast.success('Address deleted successfully');
      setShowDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    },
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: (addressId: string) => addressService.setAsDefault(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', id] });
      toast.success('Default shipping address updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to set default address');
    },
  });

  // Clone HQ to Billing mutation
  const cloneHQMutation = useMutation({
    mutationFn: () => addressService.cloneHQAsBilling(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', id] });
      toast.success('Billing address created from headquarters');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clone headquarters address');
    },
  });

  // Helper functions
  const getAddressesByType = (type: AddressType) => {
    return addresses.filter((addr: Address) => addr.addressType === type);
  };

  const getHeadquartersAddress = () => getAddressesByType(AddressType.HEADQUARTERS)[0];
  const getBillingAddress = () => getAddressesByType(AddressType.BILLING)[0];
  const getShippingAddresses = () => getAddressesByType(AddressType.SHIPPING);

  // Handle set default for shipping addresses
  const handleSetDefault = (address: Address) => {
    if (address.addressType === AddressType.SHIPPING) {
      setDefaultMutation.mutate(address.id);
    }
  };

  // Clone HQ to Billing
  const handleCloneHQToBilling = () => {
    cloneHQMutation.mutate();
  };

  const handleEdit = (address: Address) => {
    console.log('Editing address:', address);
    setEditingAddress(address);
    setAllowedTypesForForm([address.addressType]); // Can't change type when editing
    setIsFormOpen(true);
  };

  const handleDelete = (address: Address) => {
    // Don't allow deleting HQ
    if (address.addressType === AddressType.HEADQUARTERS) {
      toast.error('Cannot delete the headquarters address');
      return;
    }
    setShowDeleteConfirm(address.id);
  };

  const handleFormSubmit = (data: AddressFormData) => {
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Open form for new HQ address
  const handleAddHQ = () => {
    setEditingAddress(null);
    setAllowedTypesForForm([AddressType.HEADQUARTERS]);
    setIsFormOpen(true);
  };

  // Open form for new Billing address
  const handleAddBilling = () => {
    setEditingAddress(null);
    setAllowedTypesForForm([AddressType.BILLING]);
    setIsFormOpen(true);
  };

  // Open form for new Shipping address
  const handleAddShipping = () => {
    setEditingAddress(null);
    setAllowedTypesForForm([AddressType.SHIPPING]);
    setIsFormOpen(true);
  };

  const hqAddress = getHeadquartersAddress();
  const billingAddress = getBillingAddress();
  const shippingAddresses = getShippingAddresses();

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Invalid account ID</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error loading addresses: {(error as any).message}</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            to={`/accounts/${id}`}
            className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Back to account
          </Link>
        </div>
        
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPinIcon className="h-7 w-7 text-gray-400 mr-2" />
              Manage Addresses
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure headquarters, billing, and shipping addresses for this account
            </p>
          </div>
        </div>
      </div>

      {/* Alert for missing HQ */}
      {!hqAddress && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Headquarters Address Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please add a headquarters address for this account before adding other addresses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content - ORDER: HQ → Billing → Shipping */}
      <div className="space-y-8">
        {/* 1. HEADQUARTERS ADDRESS (Required) */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <HomeIcon className="h-5 w-5 mr-2 text-blue-500" />
            Headquarters Address
            <span className="ml-2 text-xs text-red-500 font-normal">*Required</span>
          </h2>
          {hqAddress ? (
            <div className="max-w-2xl">
              <AddressCard
                address={hqAddress}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canDelete={false} // Never allow deleting HQ
              />
            </div>
          ) : (
            <div className="max-w-2xl text-center py-8 bg-white rounded-lg border-2 border-dashed border-blue-300">
              <HomeIcon className="mx-auto h-12 w-12 text-blue-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No headquarters address</h3>
              <p className="mt-1 text-sm text-gray-500">Add your main business location</p>
              <div className="mt-4">
                <button
                  onClick={handleAddHQ}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Add Headquarters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. BILLING ADDRESS (One only) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2 text-green-500" />
              Billing Address
              <span className="ml-2 text-xs text-gray-500 font-normal">(Optional)</span>
            </h2>
            {hqAddress && !billingAddress && (
              <button
                onClick={handleCloneHQToBilling}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
                disabled={cloneHQMutation.isPending}
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-1.5" />
                Clone from HQ
              </button>
            )}
          </div>
          {billingAddress ? (
            <div className="max-w-2xl">
              <AddressCard
                address={billingAddress}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canDelete={true}
              />
            </div>
          ) : (
            <div className="max-w-2xl text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No billing address</h3>
              <p className="mt-1 text-sm text-gray-500">
                {hqAddress ? "Add a custom billing address or clone from headquarters" : "Add headquarters address first"}
              </p>
              {hqAddress && (
                <div className="mt-4 flex gap-2 justify-center">
                  <button
                    onClick={handleCloneHQToBilling}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={cloneHQMutation.isPending}
                  >
                    <DocumentDuplicateIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    Clone from HQ
                  </button>
                  <button
                    onClick={handleAddBilling}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    Add Custom
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. SHIPPING ADDRESSES (Multiple allowed) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <TruckIcon className="h-5 w-5 mr-2 text-purple-500" />
                Shipping Addresses
                <span className="ml-2 text-xs text-gray-500 font-normal">(Multiple allowed)</span>
              </h2>
              {shippingAddresses.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {shippingAddresses.length} shipping {shippingAddresses.length === 1 ? 'address' : 'addresses'} configured
                </p>
              )}
            </div>
            <button
              onClick={handleAddShipping}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 border border-transparent rounded-md"
            >
              <PlusIcon className="h-4 w-4 mr-1.5" />
              Add Shipping Address
            </button>
          </div>
          
          {shippingAddresses.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {shippingAddresses.map((address: Address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                  canDelete={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No shipping addresses</h3>
              <p className="mt-1 text-sm text-gray-500">Add locations where orders can be shipped</p>
              <div className="mt-6">
                <button
                  onClick={handleAddShipping}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Add First Shipping Address
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {id && (
        <AddressFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAddress(null);
            setAllowedTypesForForm([]);
          }}
          onSubmit={handleFormSubmit}
          address={editingAddress}
          accountId={id}
          allowedTypes={allowedTypesForForm}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteConfirm(null)}></div>
            
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Address</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
