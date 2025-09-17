import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { accountService } from '../../services/account.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, bgColor, textColor }: any) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            <Icon className={`h-6 w-6 ${textColor}`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AccountDashboard() {
  // Fetch account statistics
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['account-stats'],
    queryFn: () => accountService.getAccountStats(),
  });

  // Fetch recent accounts
  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['recent-accounts'],
    queryFn: () => accountService.getAccounts({ limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' }),
  });

  const stats = statsData?.data;

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading statistics</h3>
              <p className="text-sm text-red-700 mt-1">Failed to load account statistics. Please try again.</p>
            </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Account Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Overview of your accounts and key metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/accounts/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Account
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Accounts"
          value={stats?.totalAccounts || 0}
          icon={BuildingOfficeIcon}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatsCard
          title="Active Accounts"
          value={stats?.activeAccounts || 0}
          icon={CheckCircleIcon}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatsCard
          title="Pending Verification"
          value={stats?.pendingVerification || 0}
          icon={ClockIcon}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
        <StatsCard
          title="Suspended"
          value={stats?.suspendedAccounts || 0}
          icon={XCircleIcon}
          bgColor="bg-red-100"
          textColor="text-red-600"
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Account Types Distribution */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Accounts by Type
            </h3>
            {stats?.accountsByType && Object.entries(stats.accountsByType).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.accountsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No account type data available</p>
            )}
          </div>
        </div>

        {/* Business Size Distribution */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Accounts by Business Size
            </h3>
            {stats?.accountsBySize && Object.entries(stats.accountsBySize).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.accountsBySize).map(([size, count]) => {
                  const percentage = stats.totalAccounts ? ((count as number) / stats.totalAccounts * 100).toFixed(1) : '0';
                  return (
                    <div key={size}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {size.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No business size data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Credit Metrics */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Credit Limit
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              ${(stats?.totalCreditLimit || 0).toLocaleString()}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Average Credit Limit
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              ${(stats?.averageCreditLimit || 0).toLocaleString()}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Parent/Subsidiary Accounts
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {stats?.parentAccounts || 0} / {stats?.subsidiaryAccounts || 0}
            </dd>
          </div>
        </div>
      </div>

      {/* Recent Accounts */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Accounts
              </h3>
              <Link
                to="/accounts"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
              >
                View all
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
            {recentLoading ? (
              <div className="text-center py-4">
                <LoadingSpinner />
              </div>
            ) : recentData?.data.items && recentData.data.items.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentData.data.items.map((account) => (
                    <li key={account.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {account.legalName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {account.accountType} • {account.businessSize.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <Link
                            to={`/accounts/${account.id}`}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent accounts</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/accounts/new"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <PlusIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Create Account</p>
              <p className="text-sm text-gray-500">Add a new account</p>
            </div>
          </Link>

          <Link
            to="/accounts"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">View Accounts</p>
              <p className="text-sm text-gray-500">Browse all accounts</p>
            </div>
          </Link>

          <Link
            to="/accounts/relationships"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Relationships</p>
              <p className="text-sm text-gray-500">Manage hierarchies</p>
            </div>
          </Link>

          <Link
            to="/import-export"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Import/Export</p>
              <p className="text-sm text-gray-500">Bulk operations</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
