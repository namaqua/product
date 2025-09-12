import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import productService from '../../services/product.service';
import {
  CubeIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  UsersIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const navigate = useNavigate();
  const [productCount, setProductCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch product count for the Product Engine card
    const fetchProductCount = async () => {
      try {
        const response = await productService.getProducts({ limit: 1 });
        setProductCount(response.meta?.totalItems || 0);
      } catch (error) {
        console.error('Failed to fetch product count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductCount();
  }, []);

  // Engine statistics with real product count
  const engineStats = [
    {
      name: 'Product Engine',
      description: 'Manage your product catalog',
      icon: CubeIcon,
      stats: { 
        label: 'Total Products', 
        value: loading ? 'Loading...' : productCount.toLocaleString() 
      },
      status: 'active',
      link: '/product-dashboard',
      color: 'bg-blue-500',
    },
    {
      name: 'Subscription Engine',
      description: 'Manage recurring revenue',
      icon: CreditCardIcon,
      stats: { label: 'Active Subscriptions', value: 'Coming Soon' },
      status: 'coming-soon',
      link: null,
      color: 'bg-purple-500',
    },
    {
      name: 'Marketplace Engine',
      description: 'Multi-vendor marketplace',
      icon: ShoppingCartIcon,
      stats: { label: 'Total Vendors', value: 'Coming Soon' },
      status: 'coming-soon',
      link: null,
      color: 'bg-green-500',
    },
  ];

  const overviewStats = [
    { 
      name: 'Total Revenue', 
      value: '$54,239', 
      change: '+12.5%', 
      changeType: 'increase' as const,
      icon: BanknotesIcon 
    },
    { 
      name: 'Active Users', 
      value: '1,429', 
      change: '+8.2%', 
      changeType: 'increase' as const,
      icon: UsersIcon 
    },
    { 
      name: 'Growth Rate', 
      value: '23.1%', 
      change: '+3.2%', 
      changeType: 'increase' as const,
      icon: ArrowTrendingUpIcon 
    },
    { 
      name: 'Avg. Response', 
      value: '1.4s', 
      change: '-0.3s', 
      changeType: 'decrease' as const,
      icon: ClockIcon 
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
              Welcome to your unified business management platform
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={() => navigate('/product-dashboard')}
              className="flex items-center gap-2"
            >
              <CubeIcon className="h-4 w-4" />
              Go to Products
            </Button>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {overviewStats.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow hover:shadow-lg transition-shadow sm:px-6 sm:py-6"
            >
              <dt>
                <div className="absolute rounded-md bg-accent-500 p-3">
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold
                    ${stat.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                  `}
                >
                  {stat.change}
                </p>
              </dd>
            </div>
          ))}
        </div>

        {/* Engine Cards */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Business Engines</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {engineStats.map((engine) => (
              <div
                key={engine.name}
                className={`relative rounded-lg border ${
                  engine.status === 'active' 
                    ? 'border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer' 
                    : 'border-gray-200 dark:border-gray-700 opacity-75'
                } bg-white dark:bg-gray-800 px-6 py-5 shadow-sm transition-all`}
                onClick={() => engine.link && navigate(engine.link)}
              >
                {engine.status === 'coming-soon' && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                      Coming Soon
                    </span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-lg ${engine.color} p-3`}>
                    <engine.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-900 dark:text-white">
                        {engine.name}
                      </dt>
                      <dd className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {engine.description}
                      </dd>
                      <dd className="mt-3">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {engine.stats.value}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {engine.stats.label}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>

                {engine.status === 'active' && (
                  <div className="mt-4 flex items-center text-sm text-accent-600 dark:text-accent-400">
                    <span>View Dashboard</span>
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No activity yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Activity from all engines will appear here once configured.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <button
                onClick={() => navigate('/products/new')}
                className="relative rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 text-center hover:border-accent-500 hover:shadow-md transition-all"
              >
                <CubeIcon className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Add Product
                </span>
              </button>
              
              <button
                disabled
                className="relative rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 text-center opacity-50 cursor-not-allowed"
              >
                <CreditCardIcon className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  New Subscription
                </span>
                <span className="absolute top-1 right-1 text-xs text-gray-400">Soon</span>
              </button>
              
              <button
                disabled
                className="relative rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 text-center opacity-50 cursor-not-allowed"
              >
                <ShoppingCartIcon className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Add Vendor
                </span>
                <span className="absolute top-1 right-1 text-xs text-gray-400">Soon</span>
              </button>
              
              <button
                onClick={() => navigate('/users/new')}
                className="relative rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 text-center hover:border-accent-500 hover:shadow-md transition-all"
              >
                <UsersIcon className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Add User
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Product Engine</span>
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Subscription Engine</span>
                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                  Not Configured
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Marketplace Engine</span>
                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                  Not Configured
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Database</span>
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
