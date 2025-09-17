import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../../services/account.service';
import { UpdateAccountDto, Address, Account } from '../../types/dto/accounts';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { currencies, defaultCurrency } from '../../config/currency.config';
import { CurrencyInput } from '../../components/common/CurrencyInput';
import AccountSelector from '../../components/accounts/AccountSelector';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  MapPinIcon,
  CreditCardIcon,
  UserGroupIcon,
  TagIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Tab interface for form sections
interface FormTab {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

const formTabs: FormTab[] = [
  { id: 'basic', name: 'Basic Information', icon: BuildingOfficeIcon },
  { id: 'business', name: 'Business Details', icon: DocumentTextIcon },
  { id: 'addresses', name: 'Addresses', icon: MapPinIcon },
  { id: 'commercial', name: 'Commercial Info', icon: CreditCardIcon },
  { id: 'relationships', name: 'Relationships', icon: UserGroupIcon },
  { id: 'additional', name: 'Additional Info', icon: TagIcon },
];

export default function AccountEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing account data
  const { data: account, isLoading: accountLoading, error: accountError } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountService.getAccount(id!),
    enabled: !!id,
  });

  // Form state - initialized with empty values
  const [formData, setFormData] = useState<UpdateAccountDto>({
    legalName: '',
    tradeName: '',
    registrationNumber: '',
    taxId: '',
    accountType: 'customer',
    businessSize: 'smb',
    industryType: '',
    website: '',
    email: '',
    phoneNumber: '',
    faxNumber: '',
    headquartersAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    paymentTerms: '',
    currency: defaultCurrency,
    creditLimit: undefined,
    accountManagerId: '',
    parentAccountId: '',
    primaryContactId: '',
    businessClassification: '',
    annualRevenue: undefined,
    employeeCount: undefined,
    notes: '',
    tags: [],
    status: 'active',
  });

  const [tagInput, setTagInput] = useState('');
  const [originalData, setOriginalData] = useState<UpdateAccountDto | null>(null);

  // Initialize form data when account is loaded
  useEffect(() => {
    if (account) {
      const initialData: UpdateAccountDto = {
        legalName: account.legalName || '',
        tradeName: account.tradeName || '',
        registrationNumber: account.registrationNumber || '',
        taxId: account.taxId || '',
        accountType: account.accountType || 'customer',
        businessSize: account.businessSize || 'smb',
        industryType: account.industryType || '',
        website: account.website || '',
        email: account.email || '',
        phoneNumber: account.phoneNumber || '',
        faxNumber: account.faxNumber || '',
        headquartersAddress: account.headquartersAddress || {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
        shippingAddress: account.shippingAddress || {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
        billingAddress: account.billingAddress || {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
        paymentTerms: account.paymentTerms || '',
        currency: account.currency || defaultCurrency,
        creditLimit: account.creditLimit || undefined,
        accountManagerId: account.accountManagerId || '',
        parentAccountId: account.parentAccountId || '',
        primaryContactId: account.primaryContactId || '',
        businessClassification: account.businessClassification || '',
        annualRevenue: account.annualRevenue || undefined,
        employeeCount: account.employeeCount || undefined,
        notes: account.notes || '',
        tags: account.tags || [],
        status: account.status || 'active',
      };
      
      setFormData(initialData);
      setOriginalData(JSON.parse(JSON.stringify(initialData))); // Deep clone for comparison
    }
  }, [account]);

  // Track changes
  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateAccountDto) => accountService.updateAccount(id!, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['account', id] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account updated successfully');
      navigate(`/accounts/${id}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update account';
      toast.error(message);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    if (!formData.legalName?.trim()) {
      setErrors({ legalName: 'Legal name is required' });
      setActiveTab('basic');
      return;
    }

    // Only send changed fields (but we'll send all for simplicity with PATCH)
    updateMutation.mutate(formData);
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        navigate(`/accounts/${id}`);
      }
    } else {
      navigate(`/accounts/${id}`);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle number input changes
  const handleNumberChange = (name: string, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setFormData(prev => ({
      ...prev,
      [name]: numValue,
    }));
  };

  // Handle address changes
  const handleAddressChange = (addressType: 'headquartersAddress' | 'shippingAddress' | 'billingAddress', field: keyof Address, value: string) => {
    setFormData(prev => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value,
      },
    }));
  };

  // Handle tag addition
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index),
    }));
  };

  // Copy headquarters address
  const copyHeadquarters = (target: 'shipping' | 'billing') => {
    const addressField = target === 'shipping' ? 'shippingAddress' : 'billingAddress';
    setFormData(prev => ({
      ...prev,
      [addressField]: { ...prev.headquartersAddress },
    }));
  };

  // Reset form to original data
  const handleReset = () => {
    if (originalData) {
      setFormData(JSON.parse(JSON.stringify(originalData)));
      toast.info('Form reset to original values');
    }
  };

  if (accountLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (accountError || !account) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading account</h3>
              <p className="text-sm text-red-700 mt-1">
                {accountError ? 'Failed to load account for editing.' : 'Account not found.'}
              </p>
              <button
                onClick={() => navigate('/accounts')}
                className="mt-2 inline-flex items-center text-sm text-red-600 hover:text-red-500"
              >
                <ArrowLeftIcon className="mr-1 h-4 w-4" />
                Back to accounts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <button
                type="button"
                onClick={() => navigate(`/accounts/${id}`)}
                className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="mr-1 h-4 w-4" />
                Back to details
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Account</h1>
            <p className="mt-2 text-sm text-gray-700">
              Update account information for {account.legalName}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !hasChanges}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {/* Show unsaved changes indicator */}
        {hasChanges && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">You have unsaved changes</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {formTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  <Icon className={`
                    ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    -ml-0.5 mr-2 h-5 w-5
                  `} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="legalName" className="block text-sm font-medium text-gray-700">
                      Legal Name *
                    </label>
                    <input
                      type="text"
                      name="legalName"
                      id="legalName"
                      required
                      value={formData.legalName}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.legalName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {errors.legalName && (
                      <p className="mt-1 text-sm text-red-600">{errors.legalName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="tradeName" className="block text-sm font-medium text-gray-700">
                      Trade Name (DBA)
                    </label>
                    <input
                      type="text"
                      name="tradeName"
                      id="tradeName"
                      value={formData.tradeName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                      Tax ID / VAT Number
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      id="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
                      Account Type *
                    </label>
                    <select
                      name="accountType"
                      id="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="customer">Customer</option>
                      <option value="supplier">Supplier</option>
                      <option value="partner">Partner</option>
                      <option value="vendor">Vendor</option>
                      <option value="distributor">Distributor</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="businessSize" className="block text-sm font-medium text-gray-700">
                      Business Size *
                    </label>
                    <select
                      name="businessSize"
                      id="businessSize"
                      value={formData.businessSize}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="startup">Startup</option>
                      <option value="smb">SMB</option>
                      <option value="mid_market">Mid Market</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending_verification">Pending Verification</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Business Details Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="industryType" className="block text-sm font-medium text-gray-700">
                      Industry Type
                    </label>
                    <input
                      type="text"
                      name="industryType"
                      id="industryType"
                      value={formData.industryType}
                      onChange={handleInputChange}
                      placeholder="e.g., Technology, Retail, Manufacturing"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="businessClassification" className="block text-sm font-medium text-gray-700">
                      Business Classification
                    </label>
                    <input
                      type="text"
                      name="businessClassification"
                      id="businessClassification"
                      value={formData.businessClassification}
                      onChange={handleInputChange}
                      placeholder="e.g., B2B, B2C, SaaS"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      id="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="faxNumber" className="block text-sm font-medium text-gray-700">
                      Fax Number
                    </label>
                    <input
                      type="tel"
                      name="faxNumber"
                      id="faxNumber"
                      value={formData.faxNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <CurrencyInput
                    id="annualRevenue"
                    label="Annual Revenue"
                    value={formData.annualRevenue}
                    onChange={(value) => handleNumberChange('annualRevenue', value)}
                    currency={formData.currency || defaultCurrency}
                    placeholder="0.00"
                  />

                  <div>
                    <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700">
                      Employee Count
                    </label>
                    <input
                      type="number"
                      id="employeeCount"
                      value={formData.employeeCount || ''}
                      onChange={(e) => handleNumberChange('employeeCount', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-8">
                {/* Link to Manage Addresses */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">Advanced Address Management</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Use the dedicated address management interface to configure multiple shipping locations, 
                        set defaults, and manage address validation.
                      </p>
                    </div>
                    <Link
                      to={`/accounts/${id}/addresses`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <MapPinIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      Manage Addresses
                    </Link>
                  </div>
                </div>

                {/* Legacy Address Fields Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        The address fields below are legacy and will be migrated to the new address management system.
                        For now, you can still edit them here, but we recommend using the "Manage Addresses" feature above.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Headquarters Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Headquarters Address</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="hq-street" className="block text-sm font-medium text-gray-700">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="hq-street"
                        value={formData.headquartersAddress?.street}
                        onChange={(e) => handleAddressChange('headquartersAddress', 'street', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="hq-city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        id="hq-city"
                        value={formData.headquartersAddress?.city}
                        onChange={(e) => handleAddressChange('headquartersAddress', 'city', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="hq-state" className="block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="hq-state"
                        value={formData.headquartersAddress?.state}
                        onChange={(e) => handleAddressChange('headquartersAddress', 'state', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="hq-country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        id="hq-country"
                        value={formData.headquartersAddress?.country}
                        onChange={(e) => handleAddressChange('headquartersAddress', 'country', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="hq-postalCode" className="block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="hq-postalCode"
                        value={formData.headquartersAddress?.postalCode}
                        onChange={(e) => handleAddressChange('headquartersAddress', 'postalCode', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                    <button
                      type="button"
                      onClick={() => copyHeadquarters('shipping')}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Copy from Headquarters
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="ship-street" className="block text-sm font-medium text-gray-700">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="ship-street"
                        value={formData.shippingAddress?.street}
                        onChange={(e) => handleAddressChange('shippingAddress', 'street', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="ship-city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        id="ship-city"
                        value={formData.shippingAddress?.city}
                        onChange={(e) => handleAddressChange('shippingAddress', 'city', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="ship-state" className="block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="ship-state"
                        value={formData.shippingAddress?.state}
                        onChange={(e) => handleAddressChange('shippingAddress', 'state', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="ship-country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        id="ship-country"
                        value={formData.shippingAddress?.country}
                        onChange={(e) => handleAddressChange('shippingAddress', 'country', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="ship-postalCode" className="block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="ship-postalCode"
                        value={formData.shippingAddress?.postalCode}
                        onChange={(e) => handleAddressChange('shippingAddress', 'postalCode', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
                    <button
                      type="button"
                      onClick={() => copyHeadquarters('billing')}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Copy from Headquarters
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="bill-street" className="block text-sm font-medium text-gray-700">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="bill-street"
                        value={formData.billingAddress?.street}
                        onChange={(e) => handleAddressChange('billingAddress', 'street', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="bill-city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        id="bill-city"
                        value={formData.billingAddress?.city}
                        onChange={(e) => handleAddressChange('billingAddress', 'city', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="bill-state" className="block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="bill-state"
                        value={formData.billingAddress?.state}
                        onChange={(e) => handleAddressChange('billingAddress', 'state', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="bill-country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        id="bill-country"
                        value={formData.billingAddress?.country}
                        onChange={(e) => handleAddressChange('billingAddress', 'country', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="bill-postalCode" className="block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="bill-postalCode"
                        value={formData.billingAddress?.postalCode}
                        onChange={(e) => handleAddressChange('billingAddress', 'postalCode', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Commercial Info Tab */}
            {activeTab === 'commercial' && (
              <div className="space-y-6">
                {/* Currency Information Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        All monetary values (Credit Limit, Annual Revenue) will be displayed and stored in the selected currency.
                        Changing the currency will not convert existing values.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      name="paymentTerms"
                      id="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleInputChange}
                      placeholder="e.g., Net 30, Net 60, COD"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                      Currency
                    </label>
                    <select
                      name="currency"
                      id="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <CurrencyInput
                    id="creditLimit"
                    label="Credit Limit"
                    value={formData.creditLimit}
                    onChange={(value) => handleNumberChange('creditLimit', value)}
                    currency={formData.currency || defaultCurrency}
                    placeholder="0.00"
                  />

                  <div>
                    <label htmlFor="accountManagerId" className="block text-sm font-medium text-gray-700">
                      Account Manager ID
                    </label>
                    <input
                      type="text"
                      name="accountManagerId"
                      id="accountManagerId"
                      value={formData.accountManagerId}
                      onChange={handleInputChange}
                      placeholder="User ID of account manager"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Relationships Tab */}
            {activeTab === 'relationships' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <AccountSelector
                    value={formData.parentAccountId}
                    onChange={(value) => setFormData(prev => ({ ...prev, parentAccountId: value || '' }))}
                    label="Parent Account"
                    placeholder="Select parent account (if subsidiary)..."
                    excludeIds={id ? [id] : []} // Exclude current account
                    clearable
                  />

                  <div>
                    <label htmlFor="primaryContactId" className="block text-sm font-medium text-gray-700">
                      Primary Contact ID
                    </label>
                    <input
                      type="text"
                      name="primaryContactId"
                      id="primaryContactId"
                      value={formData.primaryContactId}
                      onChange={handleInputChange}
                      placeholder="ID of primary contact person"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        If this account is a subsidiary, select its parent account above. 
                        Parent-subsidiary relationships help organize your account hierarchy.
                        Note: An account cannot be its own parent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info Tab */}
            {activeTab === 'additional' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Additional notes about this account..."
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Type a tag and press Enter"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                          >
                            <span className="sr-only">Remove tag</span>
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
