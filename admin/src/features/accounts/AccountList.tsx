import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { accountService } from '../../services/account.service';
import { Account, AccountsQueryDto } from '../../types/dto/accounts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { useToast } from '../../contexts/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    pending_verification: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Account type badge
const AccountTypeBadge = ({ type }: { type: string }) => {
  const typeStyles = {
    customer: 'bg-blue-100 text-blue-800',
    supplier: 'bg-purple-100 text-purple-800',
    partner: 'bg-indigo-100 text-indigo-800',
    vendor: 'bg-pink-100 text-pink-800',
    distributor: 'bg-orange-100 text-orange-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${typeStyles[type as keyof typeof typeStyles] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  );
};

export default function AccountList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AccountsQueryDto>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch accounts
  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts', { ...filters, search: debouncedSearchTerm }],
    queryFn: () => accountService.getAccounts({ ...filters, search: debouncedSearchTerm }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    },
  });

  // Bulk status update mutation
  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: any }) => 
      accountService.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Accounts updated successfully');
      setSelectedAccounts([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update accounts');
    },
  });

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedAccounts.length === 0) {
      toast.warning('Please select accounts first');
      return;
    }

    switch (action) {
      case 'delete':
        if (window.confirm(`Delete ${selectedAccounts.length} accounts?`)) {
          selectedAccounts.forEach(id => deleteMutation.mutate(id));
        }
        break;
      case 'activate':
        bulkStatusMutation.mutate({ ids: selectedAccounts, status: 'active' });
        break;
      case 'suspend':
        bulkStatusMutation.mutate({ ids: selectedAccounts, status: 'suspended' });
        break;
      default:
        break;
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedAccounts.length === data?.data.items.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(data?.data.items.map(a => a.id) || []);
    }
  };

  // Handle individual select
  const handleSelectAccount = (id: string) => {
    setSelectedAccounts(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await accountService.exportAccounts(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accounts-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Accounts exported successfully');
    } catch (error: any) {
      toast.error('Failed to export accounts');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage customer, supplier, and partner accounts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/accounts/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Account
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search accounts..."
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FunnelIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Filters
          </button>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                value={filters.accountType || ''}
                onChange={(e) => setFilters({ ...filters, accountType: e.target.value as any || undefined })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
                <option value="partner">Partner</option>
                <option value="vendor">Vendor</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Size</label>
              <select
                value={filters.businessSize || ''}
                onChange={(e) => setFilters({ ...filters, businessSize: e.target.value as any || undefined })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Sizes</option>
                <option value="startup">Startup</option>
                <option value="smb">SMB</option>
                <option value="mid_market">Mid Market</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending_verification">Pending Verification</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedAccounts.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {selectedAccounts.length} account(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('suspend')}
              className="text-sm text-yellow-600 hover:text-yellow-800"
            >
              Suspend
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {isLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-600">
                  <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>Failed to load accounts</p>
                </div>
              ) : data?.data.items.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No accounts found</p>
                  <Link
                    to="/accounts/new"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create your first account
                  </Link>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.length === data?.data.items.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Size
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credit Limit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.data.items.map((account: Account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedAccounts.includes(account.id)}
                            onChange={() => handleSelectAccount(account.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {account.legalName}
                            </div>
                            {account.tradeName && (
                              <div className="text-sm text-gray-500">
                                {account.tradeName}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <AccountTypeBadge type={account.accountType} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {account.businessSize.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={account.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {account.creditLimit 
                            ? `${account.currency || 'EUR'} ${account.creditLimit.toLocaleString()}`
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/accounts/${account.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="View"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/accounts/${account.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(account.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {data?.data.meta && data.data.meta.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={data.data.meta.page}
            totalPages={data.data.meta.totalPages}
            totalItems={data.data.meta.totalItems}
            itemsPerPage={data.data.meta.itemsPerPage}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </div>
      )}
    </div>
  );
}
