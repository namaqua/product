import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency as formatCurrencyHelper } from '../../config/currency.config';
import {
  BuildingOfficeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PhoneIcon,
  GlobeAltIcon,
  TagIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { accountService } from '../../services/account.service';
import { Account } from '../../types/dto/accounts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  if (!status) return null;
  
  const statusConfig = {
    active: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      icon: CheckCircleIcon,
      label: 'Active' 
    },
    inactive: { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      icon: XCircleIcon,
      label: 'Inactive' 
    },
    suspended: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      icon: ExclamationTriangleIcon,
      label: 'Suspended' 
    },
    pending_verification: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      icon: ClockIcon,
      label: 'Pending Verification' 
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-4 h-4 mr-1.5" />
      {config.label}
    </span>
  );
};

// Info row component
const InfoRow = ({ label, value, className = '' }: { label: string; value?: any; className?: string }) => {
  if (!value && value !== 0) return null;
  
  return (
    <div className={`py-3 sm:grid sm:grid-cols-3 sm:gap-4 ${className}`}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{value}</dd>
    </div>
  );
};

// Address display component
const AddressDisplay = ({ address, label }: { address?: any; label: string }) => {
  if (!address || !Object.values(address).some(v => v)) return null;

  return (
    <div className="py-3">
      <dt className="text-sm font-medium text-gray-500 mb-2">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {address.street && <div>{address.street}</div>}
        {(address.city || address.state || address.postalCode) && (
          <div>
            {address.city && address.city}
            {address.city && address.state && ', '}
            {address.state && address.state}
            {' '}
            {address.postalCode && address.postalCode}
          </div>
        )}
        {address.country && <div>{address.country}</div>}
      </dd>
    </div>
  );
};

export default function AccountDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch account details
  const { data: account, isLoading, error } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountService.getAccount(id!),
    enabled: !!id,
  });

  // Debug log the account data
  useEffect(() => {
    if (account) {
      console.log('Account data received:', account);
    }
  }, [account]);

  // Fetch subsidiaries
  const { data: subsidiariesData } = useQuery({
    queryKey: ['account-subsidiaries', id],
    queryFn: () => accountService.getSubsidiaries(id!),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => accountService.deleteAccount(id!),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      navigate('/accounts');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    },
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: (status: string) => accountService.updateAccountStatus(id!, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', id] });
      toast.success('Status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  // Handle delete
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setShowDeleteConfirm(false);
  };

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    if (window.confirm(`Change status to ${newStatus}?`)) {
      statusMutation.mutate(newStatus);
    }
  };

  // Format currency using the helper
  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return '-';
    return formatCurrencyHelper(amount, currency || 'EUR');
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading account</h3>
              <p className="text-sm text-red-700 mt-1">
                {error ? 'Failed to load account details.' : 'Account not found.'}
              </p>
              <Link
                to="/accounts"
                className="mt-2 inline-flex items-center text-sm text-red-600 hover:text-red-500"
              >
                <ArrowLeftIcon className="mr-1 h-4 w-4" />
                Back to accounts
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            to="/accounts"
            className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Back to accounts
          </Link>
        </div>
        
        <div className="sm:flex sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{account.legalName}</h1>
                {account.tradeName && (
                  <p className="text-sm text-gray-500">DBA: {account.tradeName}</p>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4">
              {account.status && <StatusBadge status={account.status} />}
              {account.accountType && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {account.accountType}
                </span>
              )}
              {account.businessSize && (
                <span className="text-sm text-gray-500">
                  {account.businessSize.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
            {/* Status Actions Dropdown */}
            <div className="relative inline-block text-left">
              <select
                value=""
                onChange={(e) => handleStatusChange(e.target.value)}
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <option value="">Change Status</option>
                {account.status && account.status !== 'active' && <option value="active">Activate</option>}
                {account.status && account.status !== 'inactive' && <option value="inactive">Deactivate</option>}
                {account.status && account.status !== 'suspended' && <option value="suspended">Suspend</option>}
                {account.status && account.status !== 'pending_verification' && <option value="pending_verification">Set Pending</option>}
              </select>
            </div>
            
            <Link
              to={`/accounts/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilSquareIcon className="-ml-1 mr-2 h-5 w-5" />
              Edit
            </Link>
            
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Basic Information
              </h3>
              <dl className="divide-y divide-gray-200">
                <InfoRow label="Legal Name" value={account.legalName} />
                <InfoRow label="Trade Name" value={account.tradeName} />
                <InfoRow label="Registration Number" value={account.registrationNumber} />
                <InfoRow label="Tax ID" value={account.taxId} />
                <InfoRow label="Account Type" value={account.accountType} />
                <InfoRow label="Business Size" value={account.businessSize?.replace('_', ' ')} />
                <InfoRow label="Industry Type" value={account.industryType} />
              </dl>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Contact Information
              </h3>
              <dl className="divide-y divide-gray-200">
                <InfoRow label="Email" value={account.email} />
                <InfoRow label="Phone" value={account.phoneNumber} />
                <InfoRow label="Fax" value={account.faxNumber} />
                <InfoRow label="Website" value={
                  account.website ? (
                    <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                      {account.website}
                    </a>
                  ) : null
                } />
              </dl>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Addresses
                </h3>
                <Link
                  to={`/accounts/${id}/addresses`}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500"
                >
                  <MapPinIcon className="-ml-1 mr-2 h-4 w-4" />
                  Manage Addresses
                </Link>
              </div>
              <div className="space-y-4 divide-y divide-gray-200">
                <AddressDisplay address={account.headquartersAddress} label="Headquarters (Legacy)" />
                <AddressDisplay address={account.shippingAddress} label="Shipping Address (Legacy)" />
                <AddressDisplay address={account.billingAddress} label="Billing Address (Legacy)" />
                <div className="pt-3 text-sm text-gray-500">
                  Click "Manage Addresses" to view and manage all addresses for this account.
                </div>
              </div>
            </div>
          </div>

          {/* Commercial Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Commercial Information
              </h3>
              <dl className="divide-y divide-gray-200">
                <InfoRow label="Payment Terms" value={account.paymentTerms} />
                <InfoRow label="Currency" value={account.currency} />
                <InfoRow label="Credit Limit" value={formatCurrency(account.creditLimit, account.currency)} />
                <InfoRow label="Annual Revenue" value={formatCurrency(account.annualRevenue, account.currency)} />
                <InfoRow label="Employee Count" value={account.employeeCount} />
              </dl>
            </div>
          </div>

          {/* Additional Information */}
          {(account.notes || (account.tags && account.tags.length > 0)) && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Additional Information
                </h3>
                {account.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{account.notes}</p>
                  </div>
                )}
                {account.tags && account.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {account.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          <TagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Quick Info
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(account.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(account.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">{account.version}</dd>
                </div>
                {account.deletedAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Deleted</dt>
                    <dd className="mt-1 text-sm text-red-600">{formatDate(account.deletedAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Relationships */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Relationships
              </h3>
              
              {/* Parent Account */}
              {account.parentAccountId && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Parent Account</h4>
                  <Link
                    to={`/accounts/${account.parentAccountId}`}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    View Parent
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              )}
              
              {/* Subsidiaries */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Subsidiaries ({subsidiariesData?.data.items.length || 0})
                </h4>
                {subsidiariesData?.data.items && subsidiariesData.data.items.length > 0 ? (
                  <ul className="space-y-2">
                    {subsidiariesData.data.items.slice(0, 5).map((subsidiary: Account) => (
                      <li key={subsidiary.id}>
                        <Link
                          to={`/accounts/${subsidiary.id}`}
                          className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                        >
                          {subsidiary.legalName}
                          <ChevronRightIcon className="ml-1 h-3 w-3" />
                        </Link>
                      </li>
                    ))}
                    {subsidiariesData.data.items.length > 5 && (
                      <li>
                        <Link
                          to={`/accounts?parentAccountId=${id}`}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          View all {subsidiariesData.data.items.length} subsidiaries
                        </Link>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No subsidiaries</p>
                )}
              </div>
              
              {/* Manage Relationships Button */}
              <div className="mt-4">
                <Link
                  to="/accounts/relationships"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  <UserGroupIcon className="mr-1.5 h-4 w-4" />
                  Manage Relationships
                </Link>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to={`/accounts/${id}/edit`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilSquareIcon className="mr-2 h-4 w-4" />
                  Edit Account
                </Link>
                
                <button
                  onClick={() => navigate('/accounts/new', { state: { parentAccountId: id } })}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <UserGroupIcon className="mr-2 h-4 w-4" />
                  Add Subsidiary
                </button>
                
                <button
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Account</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this account? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
