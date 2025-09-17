import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { accountService } from '../../services/account.service';
import { Account } from '../../types/dto/accounts';
import { useToast } from '../../contexts/ToastContext';
import AccountSelector from '../../components/accounts/AccountSelector';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  PlusIcon,
  LinkIcon,
  ArrowsUpDownIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface AccountNode extends Account {
  children?: AccountNode[];
  level?: number;
  isExpanded?: boolean;
}

export default function AccountRelationships() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAddSubsidiary, setShowAddSubsidiary] = useState(false);
  const [newSubsidiaryId, setNewSubsidiaryId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  // Fetch all accounts
  const { data: accountsData, isLoading, error } = useQuery({
    queryKey: ['accounts-relationships'],
    queryFn: () => accountService.getAccounts({ limit: 1000 })
  });

  // Debug logging to see data structure
  console.log('AccountRelationships - accountsData:', accountsData);

  // Build tree structure
  const buildTree = (accounts: Account[]): AccountNode[] => {
    if (!accounts || !Array.isArray(accounts)) {
      console.warn('buildTree received invalid accounts:', accounts);
      return [];
    }

    const accountMap = new Map<string, AccountNode>();
    const rootNodes: AccountNode[] = [];

    // First pass: create all nodes
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    // Second pass: build tree structure
    accounts.forEach(account => {
      const node = accountMap.get(account.id);
      if (node) {
        if (account.parentAccountId) {
          const parent = accountMap.get(account.parentAccountId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(node);
            node.level = (parent.level || 0) + 1;
          } else {
            // Parent not found, treat as root
            rootNodes.push(node);
            node.level = 0;
          }
        } else {
          // No parent, this is a root node
          rootNodes.push(node);
          node.level = 0;
        }
      }
    });

    // Sort children by name
    const sortNodes = (nodes: AccountNode[]) => {
      nodes.sort((a, b) => (a.legalName || '').localeCompare(b.legalName || ''));
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(rootNodes);
    return rootNodes;
  };

  // FIXED: Use correct data structure based on AccountsListResponse type
  const treeData = accountsData?.data?.items ? buildTree(accountsData.data.items) : [];

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Expand all nodes
  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectIds = (nodes: AccountNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          allNodeIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedNodes(allNodeIds);
  };

  // Collapse all nodes
  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Add subsidiary mutation - Fixed to use correct response structure
  const addSubsidiaryMutation = useMutation({
    mutationFn: ({ parentId, childId }: { parentId: string; childId: string }) =>
      accountService.updateAccount(childId, { parentAccountId: parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-selector'] }); // Also refresh selector queries
      toast.success('Subsidiary relationship created successfully');
      setShowAddSubsidiary(false);
      setNewSubsidiaryId(undefined);
      setSelectedAccount(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create relationship');
    }
  });

  // Remove parent relationship mutation
  const removeParentMutation = useMutation({
    mutationFn: (accountId: string) =>
      accountService.updateAccount(accountId, { parentAccountId: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-selector'] });
      toast.success('Parent relationship removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove relationship');
    }
  });

  // Handle add subsidiary
  const handleAddSubsidiary = () => {
    if (selectedAccount && newSubsidiaryId) {
      addSubsidiaryMutation.mutate({
        parentId: selectedAccount.id,
        childId: newSubsidiaryId
      });
    }
  };

  // Get all descendant IDs to exclude from selector
  const getDescendantIds = (account: Account): string[] => {
    const ids: string[] = [account.id];
    const node = treeData.find(n => n.id === account.id);
    
    const collectChildIds = (node: AccountNode) => {
      if (node.children) {
        node.children.forEach(child => {
          ids.push(child.id);
          collectChildIds(child);
        });
      }
    };

    if (node) {
      collectChildIds(node);
    }

    // Also find nodes that have this account as a descendant
    const findNodeInTree = (nodes: AccountNode[], targetId: string): boolean => {
      for (const n of nodes) {
        if (n.id === targetId) return true;
        if (n.children && findNodeInTree(n.children, targetId)) return true;
      }
      return false;
    };

    // Add all accounts that already have this account in their tree
    treeData.forEach(rootNode => {
      if (findNodeInTree([rootNode], account.id)) {
        ids.push(rootNode.id);
      }
    });

    return ids;
  };

  // Render tree node
  const renderTreeNode = (node: AccountNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedAccount?.id === node.id;

    return (
      <div key={node.id}>
        <div
          className={`
            flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-md
            ${isSelected ? 'bg-blue-50 border-blue-200 border' : ''}
          `}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
          onClick={() => setSelectedAccount(node)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) {
                toggleNode(node.id);
              }
            }}
            className="mr-2"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
              )
            ) : (
              <div className="w-4" />
            )}
          </button>

          <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <Link
                to={`/accounts/${node.id}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {node.legalName || 'Unnamed Account'}
              </Link>
              {node.tradeName && (
                <span className="ml-2 text-sm text-gray-500">({node.tradeName})</span>
              )}
            </div>
            <div className="flex items-center mt-0.5">
              <span className="text-xs text-gray-500">
                {node.accountType || 'Unknown'} • {node.businessSize || 'Unknown'}
              </span>
              {node.status !== 'active' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  {node.status}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {hasChildren && (
              <span className="text-xs text-gray-500">
                {node.children?.length} {node.children?.length === 1 ? 'subsidiary' : 'subsidiaries'}
              </span>
            )}
            <Link
              to={`/accounts/${node.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-gray-500"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children?.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    const parentAccounts = treeData;
    
    return (
      <div className="space-y-4">
        {parentAccounts.map(parent => (
          <div key={parent.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <Link
                    to={`/accounts/${parent.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-blue-600"
                  >
                    {parent.legalName || 'Unnamed Account'}
                  </Link>
                  {parent.tradeName && (
                    <span className="ml-2 text-gray-500">({parent.tradeName})</span>
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {parent.accountType || 'Unknown'} • {parent.businessSize || 'Unknown'} • {parent.status || 'Unknown'}
                </div>
              </div>
              <Link
                to={`/accounts/${parent.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4 mr-1.5" />
                View
              </Link>
            </div>

            {parent.children && parent.children.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Subsidiaries ({parent.children.length})
                </h4>
                <div className="space-y-2">
                  {parent.children.map(child => (
                    <div key={child.id} className="flex items-center justify-between pl-6">
                      <div className="flex items-center flex-1 min-w-0">
                        <LinkIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <Link
                          to={`/accounts/${child.id}`}
                          className="text-sm text-gray-900 hover:text-blue-600 truncate"
                        >
                          {child.legalName || 'Unnamed Account'}
                        </Link>
                        <span className="ml-2 text-xs text-gray-500">
                          ({child.accountType || 'Unknown'})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeParentMutation.mutate(child.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Remove relationship"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/accounts/${child.id}`}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading accounts</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['accounts-relationships'] })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if accounts data is loaded and has the correct structure
  const hasAccounts = accountsData?.data?.items && accountsData.data.items.length > 0;
  
  // Handle empty data
  if (!hasAccounts) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Relationships</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage parent and subsidiary account relationships
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">No accounts found</p>
            <p className="text-sm text-gray-400 mt-2">Create some accounts first to manage relationships</p>
            <Link
              to="/accounts/new"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Relationships</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage parent and subsidiary account relationships
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* View mode toggle */}
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`
                relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium
                ${viewMode === 'tree'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              Tree View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`
                relative -ml-px inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium
                ${viewMode === 'list'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              List View
            </button>
          </div>

          {viewMode === 'tree' && (
            <>
              <button
                onClick={expandAll}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Collapse All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree/List View */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {viewMode === 'tree' ? (
                <div className="space-y-1">
                  {treeData.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No accounts found
                    </p>
                  ) : (
                    treeData.map(node => renderTreeNode(node))
                  )}
                </div>
              ) : (
                renderListView()
              )}
            </div>
          </div>
        </div>

        {/* Actions Panel */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>

              {selectedAccount ? (
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Account</h4>
                    <div className="text-sm">
                      <p className="font-medium">{selectedAccount.legalName || 'Unnamed Account'}</p>
                      <p className="text-gray-500">
                        {selectedAccount.accountType || 'Unknown'} • {selectedAccount.businessSize || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to={`/accounts/${selectedAccount.id}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="mr-2 h-4 w-4" />
                      View Details
                    </Link>

                    <Link
                      to={`/accounts/${selectedAccount.id}/edit`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PencilSquareIcon className="mr-2 h-4 w-4" />
                      Edit Account
                    </Link>

                    {!showAddSubsidiary ? (
                      <button
                        onClick={() => setShowAddSubsidiary(true)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                      >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Subsidiary
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <AccountSelector
                          value={newSubsidiaryId}
                          onChange={setNewSubsidiaryId}
                          placeholder="Select account to make subsidiary..."
                          excludeIds={getDescendantIds(selectedAccount)}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleAddSubsidiary}
                            disabled={!newSubsidiaryId}
                            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowAddSubsidiary(false);
                              setNewSubsidiaryId(undefined);
                            }}
                            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedAccount.parentAccountId && (
                      <button
                        onClick={() => removeParentMutation.mutate(selectedAccount.id)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Remove Parent
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ArrowsUpDownIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm">
                    Select an account to manage relationships
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-4 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Accounts</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {accountsData?.data?.items?.length || 0}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Parent Accounts</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {treeData.length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Subsidiary Accounts</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {(accountsData?.data?.items?.length || 0) - treeData.length}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
