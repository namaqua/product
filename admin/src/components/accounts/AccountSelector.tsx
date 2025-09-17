import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountService } from '../../services/account.service';
import { Account } from '../../types/dto/accounts';
import { MagnifyingGlassIcon, BuildingOfficeIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AccountSelectorProps {
  value?: string;
  onChange: (accountId: string | undefined) => void;
  placeholder?: string;
  excludeIds?: string[];
  accountType?: string;
  label?: string;
  required?: boolean;
  error?: string;
  clearable?: boolean;
  disabled?: boolean;
}

export default function AccountSelector({
  value,
  onChange,
  placeholder = 'Select an account...',
  excludeIds = [],
  accountType,
  label,
  required = false,
  error,
  clearable = true,
  disabled = false
}: AccountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Fetch accounts with search - REMOVED status filter that might be causing issues
  const { data: accountsData, isLoading, error: fetchError } = useQuery({
    queryKey: ['accounts-selector', searchTerm, accountType],
    queryFn: () => {
      const params: any = {
        limit: 100, // Increased limit to get more accounts
      };
      
      // Only add search if there's a search term
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Only add accountType if specified
      if (accountType) {
        params.accountType = accountType;
      }
      
      // Removed status: 'active' filter as it might be filtering out all accounts
      
      return accountService.getAccounts(params);
    },
    enabled: isOpen, // Only fetch when dropdown is open
    staleTime: 30000, // Cache for 30 seconds
  });

  // Debug log to see data structure and any errors
  useEffect(() => {
    if (isOpen) {
      console.log('AccountSelector - Query enabled, fetching accounts...');
      console.log('AccountSelector - accountsData:', accountsData);
      console.log('AccountSelector - fetchError:', fetchError);
      if (accountsData?.data?.items) {
        console.log('AccountSelector - Number of accounts:', accountsData.data.items.length);
        console.log('AccountSelector - First account:', accountsData.data.items[0]);
      }
    }
  }, [isOpen, accountsData, fetchError]);

  // Fetch selected account details
  useEffect(() => {
    if (value && !selectedAccount) {
      accountService.getAccount(value)
        .then(account => {
          console.log('AccountSelector - Fetched selected account:', account);
          setSelectedAccount(account);
        })
        .catch((err) => {
          console.error('AccountSelector - Error fetching selected account:', err);
          setSelectedAccount(null);
        });
    } else if (!value) {
      setSelectedAccount(null);
    }
  }, [value, selectedAccount]);

  // Filter out excluded accounts and get the items array correctly
  const allAccounts = accountsData?.data?.items || [];
  const filteredAccounts = allAccounts.filter(
    (account: Account) => !excludeIds.includes(account.id)
  );

  console.log('AccountSelector - Filtered accounts count:', filteredAccounts.length);
  console.log('AccountSelector - Excluded IDs:', excludeIds);

  const handleSelect = (account: Account) => {
    console.log('AccountSelector - Selected account:', account);
    setSelectedAccount(account);
    onChange(account.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedAccount(null);
    onChange(undefined);
  };

  const displayValue = selectedAccount 
    ? `${selectedAccount.legalName}${selectedAccount.tradeName ? ` (${selectedAccount.tradeName})` : ''}`
    : '';

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              console.log('AccountSelector - Opening dropdown...');
              setIsOpen(!isOpen);
            }
          }}
          disabled={disabled}
          className={`
            relative w-full bg-white border rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        >
          <span className="flex items-center">
            <BuildingOfficeIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
            <span className={`block truncate ${!displayValue ? 'text-gray-400' : ''}`}>
              {displayValue || placeholder}
            </span>
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="mr-1 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown panel */}
            <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {/* Search input */}
              <div className="sticky top-0 bg-white px-2 py-1.5 border-b">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => {
                      console.log('AccountSelector - Search term changed:', e.target.value);
                      setSearchTerm(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Options list */}
              {fetchError ? (
                <div className="py-2 px-3 text-red-500 text-center">
                  Error loading accounts
                  <div className="text-xs mt-1">
                    {fetchError instanceof Error ? fetchError.message : 'Unknown error'}
                  </div>
                </div>
              ) : isLoading ? (
                <div className="py-2 px-3 text-gray-500 text-center">
                  Loading accounts...
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="py-2 px-3 text-gray-500 text-center">
                  {allAccounts.length === 0 
                    ? 'No accounts found in the system'
                    : excludeIds.length > 0 
                      ? `No available accounts (${excludeIds.length} excluded)`
                      : 'No accounts found'
                  }
                  {searchTerm && (
                    <div className="text-xs mt-1">
                      Try clearing the search term
                    </div>
                  )}
                </div>
              ) : (
                <ul className="py-1">
                  {filteredAccounts.map((account: Account) => (
                    <li
                      key={account.id}
                      onClick={() => handleSelect(account)}
                      className="cursor-pointer select-none relative py-2 pl-10 pr-4 hover:bg-blue-50"
                    >
                      <div className="flex items-center">
                        <span className="font-normal block truncate">
                          {account.legalName || 'Unnamed Account'}
                          {account.tradeName && (
                            <span className="text-gray-500 ml-2">({account.tradeName})</span>
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {account.accountType || 'Unknown'} • {account.businessSize || 'Unknown'}
                        {account.parentAccountId && ' • Subsidiary'}
                        {account.status && account.status !== 'active' && (
                          <span className="ml-1 text-yellow-600">({account.status})</span>
                        )}
                      </div>
                      {value === account.id && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
