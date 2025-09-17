import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../../services/account.service';
import userService from '../../services/user.service';
import { Account } from '../../types/dto/accounts';
import { UserResponseDto } from '../../types/dto/users';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AccountSelector from '../../components/accounts/AccountSelector';
import {
  UserIcon,
  BuildingOfficeIcon,
  LinkIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function UserAccountAssignment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'users' | 'accounts'>('users');

  // Fetch users
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers({ limit: 100 })
  });

  // Fetch accounts
  const { data: accountsData, isLoading: accountsLoading, error: accountsError } = useQuery({
    queryKey: ['accounts-assignments'],
    queryFn: () => accountService.getAccounts({ limit: 1000 })
  });

  // Debug logging
  console.log('Users Data:', usersData);
  console.log('Accounts Data:', accountsData);

  // Assign user to account (update account's managerId)
  const assignUserMutation = useMutation({
    mutationFn: ({ accountId, userId }: { accountId: string; userId: string }) =>
      accountService.updateAccount(accountId, { accountManagerId: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-assignments'] });
      toast.success('User assigned to account successfully');
      setSelectedAccount(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign user');
    }
  });

  // Remove user from account
  const removeUserMutation = useMutation({
    mutationFn: (accountId: string) =>
      accountService.updateAccount(accountId, { accountManagerId: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-assignments'] });
      toast.success('User removed from account successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    }
  });

  // Get accounts managed by a user - Fixed to use correct data structure
  const getAccountsForUser = (userId: string): Account[] => {
    if (!accountsData?.data?.items) return [];
    return accountsData.data.items.filter((account: Account) => account.accountManagerId === userId);
  };

  // Get user managing an account - Fixed to use correct data structure
  const getUserForAccount = (accountManagerId: string | undefined): UserResponseDto | undefined => {
    if (!accountManagerId || !usersData?.items) return undefined;
    return usersData.items.find((user: UserResponseDto) => user.id === accountManagerId);
  };

  // Filter users by search - Fixed with null checks
  const filteredUsers = usersData?.items?.filter((user: UserResponseDto) => {
    if (!user) return false;
    const searchLower = searchTerm.toLowerCase();
    const userName = user.name || '';
    const userEmail = user.email || '';
    return (
      userName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Filter accounts by search - Fixed with null checks and correct data structure
  const filteredAccounts = accountsData?.data?.items?.filter((account: Account) => {
    if (!account) return false;
    const searchLower = searchTerm.toLowerCase();
    const legalName = account.legalName || '';
    const tradeName = account.tradeName || '';
    return (
      legalName.toLowerCase().includes(searchLower) ||
      tradeName.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Handle assign user to account
  const handleAssignUser = () => {
    if (selectedUser && selectedAccount) {
      assignUserMutation.mutate({
        accountId: selectedAccount,
        userId: selectedUser.id
      });
    }
  };

  // Render users view
  const renderUsersView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Users List */}
      <div className="lg:col-span-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Users */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No users found</p>
              ) : (
                filteredUsers.map((user: UserResponseDto) => {
                  const managedAccounts = getAccountsForUser(user.id);
                  const isSelected = selectedUser?.id === user.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`
                        border rounded-lg p-4 cursor-pointer transition-colors
                        ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-200'}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'Unnamed User'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Role: {user.role || 'Unknown'} • Status: {user.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {managedAccounts.length} {managedAccounts.length === 1 ? 'account' : 'accounts'}
                          </span>
                        </div>
                      </div>

                      {managedAccounts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-xs font-medium text-gray-700 mb-1">Manages:</div>
                          <div className="space-y-1">
                            {managedAccounts.slice(0, 3).map((account: Account) => (
                              <div key={account.id} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 truncate">
                                  {account.legalName || 'Unnamed Account'}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeUserMutation.mutate(account.id);
                                  }}
                                  className="text-red-600 hover:text-red-700 ml-2"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {managedAccounts.length > 3 && (
                              <div className="text-gray-500">
                                +{managedAccounts.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Panel */}
      <div>
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assign to Account</h3>
            
            {selectedUser ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected User</h4>
                  <div className="text-sm">
                    <p className="font-medium">{selectedUser.name || 'Unnamed User'}</p>
                    <p className="text-gray-500">{selectedUser.email || 'No email'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <AccountSelector
                    value={selectedAccount}
                    onChange={setSelectedAccount}
                    placeholder="Select account to assign..."
                    label="Account"
                  />
                  
                  <button
                    onClick={handleAssignUser}
                    disabled={!selectedAccount}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Assign to Account
                  </button>
                </div>

                {/* Current Assignments */}
                {getAccountsForUser(selectedUser.id).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Assignments</h4>
                    <div className="space-y-2">
                      {getAccountsForUser(selectedUser.id).map((account: Account) => (
                        <div key={account.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">{account.legalName || 'Unnamed Account'}</span>
                          <button
                            onClick={() => removeUserMutation.mutate(account.id)}
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm">
                  Select a user to manage account assignments
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render accounts view
  const renderAccountsView = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Accounts Table */}
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type / Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Manager
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No accounts found
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account: Account) => {
                  const manager = getUserForAccount(account.accountManagerId);
                  
                  return (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {account.legalName || 'Unnamed Account'}
                            </div>
                            {account.tradeName && (
                              <div className="text-sm text-gray-500">{account.tradeName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{account.accountType || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{account.businessSize || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {manager ? (
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">{manager.name || 'Unnamed User'}</div>
                              <div className="text-xs text-gray-500">{manager.email || 'No email'}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {manager ? (
                          <button
                            onClick={() => removeUserMutation.mutate(account.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              // You could open a modal here to select a user
                              toast.info('Select from Users view to assign');
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Handle loading state
  if (usersLoading || accountsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error states
  if (usersError || accountsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data</p>
          <p className="text-gray-600 text-sm">
            {usersError && 'Failed to load users. '}
            {accountsError && 'Failed to load accounts.'}
          </p>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['users'] });
              queryClient.invalidateQueries({ queryKey: ['accounts-assignments'] });
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle empty data
  if (!usersData?.items && !accountsData?.data?.items) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No data available</p>
          <p className="text-gray-500 text-sm">
            Please ensure you have users and accounts in the system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Account Assignments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage which users are assigned as account managers
          </p>
        </div>
        
        {/* View mode toggle */}
        <div className="mt-4 sm:mt-0 inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('users')}
            className={`
              relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium
              ${viewMode === 'users'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            By Users
          </button>
          <button
            type="button"
            onClick={() => setViewMode('accounts')}
            className={`
              relative -ml-px inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium
              ${viewMode === 'accounts'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <BuildingOfficeIcon className="mr-2 h-4 w-4" />
            By Accounts
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {usersData?.items?.length || 0}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Accounts</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {accountsData?.data?.items?.length || 0}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Assigned Accounts</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {accountsData?.data?.items?.filter((a: Account) => a.accountManagerId).length || 0}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Unassigned Accounts</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {accountsData?.data?.items?.filter((a: Account) => !a.accountManagerId).length || 0}
            </dd>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'users' ? renderUsersView() : renderAccountsView()}
    </div>
  );
}
