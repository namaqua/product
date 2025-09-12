import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  CubeIcon,
  UserIcon,
  FolderIcon,
  TagIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'product' | 'user' | 'category' | 'attribute' | 'media' | 'order' | 'system';
  action: 'create' | 'update' | 'delete' | 'archive' | 'publish' | 'login' | 'error' | 'success';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

// Generate mock activities
const generateMockActivities = (): Activity[] => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'product',
      action: 'create',
      title: 'New product added',
      description: 'MacBook Pro 16" was added to the catalog',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      user: { name: 'John Doe', email: 'john@example.com' },
      metadata: { productId: 'prod-123', sku: 'MBP-16-2024' },
    },
    {
      id: '2',
      type: 'user',
      action: 'login',
      title: 'User login',
      description: 'Admin user logged in from 192.168.1.1',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      user: { name: 'Admin User', email: 'admin@test.com' },
    },
    {
      id: '3',
      type: 'category',
      action: 'update',
      title: 'Category updated',
      description: 'Electronics category structure was modified',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      user: { name: 'Jane Smith', email: 'jane@example.com' },
    },
    {
      id: '4',
      type: 'media',
      action: 'create',
      title: 'Images uploaded',
      description: '5 new product images were uploaded',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      user: { name: 'John Doe', email: 'john@example.com' },
      metadata: { count: 5, size: '12.5 MB' },
    },
    {
      id: '5',
      type: 'product',
      action: 'publish',
      title: 'Product published',
      description: 'iPhone 15 Pro is now live on the store',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      user: { name: 'Jane Smith', email: 'jane@example.com' },
    },
    {
      id: '6',
      type: 'system',
      action: 'success',
      title: 'Backup completed',
      description: 'Daily backup completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    },
    {
      id: '7',
      type: 'attribute',
      action: 'create',
      title: 'New attribute created',
      description: 'Color attribute with 12 options was added',
      timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      user: { name: 'Admin User', email: 'admin@test.com' },
    },
    {
      id: '8',
      type: 'order',
      action: 'create',
      title: 'New order received',
      description: 'Order #12345 for $1,299.00',
      timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
      metadata: { orderId: '12345', amount: 1299.00 },
    },
  ];

  return activities;
};

const getActivityIcon = (type: Activity['type'], action: Activity['action']) => {
  // Icon based on type
  const typeIcons = {
    product: CubeIcon,
    user: UserIcon,
    category: FolderIcon,
    attribute: TagIcon,
    media: PhotoIcon,
    order: ShoppingCartIcon,
    system: CheckCircleIcon,
  };

  // Override for specific actions
  if (action === 'delete') return TrashIcon;
  if (action === 'error') return ExclamationTriangleIcon;
  
  return typeIcons[type] || CubeIcon;
};

const getActivityColor = (action: Activity['action']) => {
  const colors = {
    create: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    delete: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    archive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    publish: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    login: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  };
  
  return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
};

interface ActivityFeedProps {
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const ActivityFeed = ({ 
  limit = 10, 
  showFilters = true, 
  compact = false,
  autoRefresh = false,
  refreshInterval = 30000,
}: ActivityFeedProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLive, setIsLive] = useState(autoRefresh);

  useEffect(() => {
    // Initial load
    const loadActivities = () => {
      setLoading(true);
      setTimeout(() => {
        const mockData = generateMockActivities();
        setActivities(mockData);
        setFilteredActivities(mockData.slice(0, limit));
        setLoading(false);
      }, 500);
    };

    loadActivities();

    // Auto refresh
    if (isLive && refreshInterval) {
      const interval = setInterval(() => {
        // Add a new random activity
        const newActivity: Activity = {
          id: Date.now().toString(),
          type: ['product', 'user', 'category', 'media'][Math.floor(Math.random() * 4)] as Activity['type'],
          action: ['create', 'update', 'publish'][Math.floor(Math.random() * 3)] as Activity['action'],
          title: 'New activity',
          description: 'Something just happened in the system',
          timestamp: new Date(),
          user: { name: 'System User', email: 'system@example.com' },
        };
        
        setActivities(prev => [newActivity, ...prev]);
        setFilteredActivities(prev => [newActivity, ...prev].slice(0, limit));
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [limit, isLive, refreshInterval]);

  useEffect(() => {
    // Filter activities
    if (selectedType === 'all') {
      setFilteredActivities(activities.slice(0, limit));
    } else {
      const filtered = activities.filter(a => a.type === selectedType);
      setFilteredActivities(filtered.slice(0, limit));
    }
  }, [selectedType, activities, limit]);

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'product', label: 'Products' },
    { value: 'user', label: 'Users' },
    { value: 'category', label: 'Categories' },
    { value: 'media', label: 'Media' },
    { value: 'system', label: 'System' },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex space-x-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      {showFilters && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              isLive
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {isLive ? '● Live' : '○ Paused'}
          </button>
        </div>
      )}

      {/* Activity list */}
      <div className="flow-root">
        <ul className="-mb-8">
          {filteredActivities.length === 0 ? (
            <li className="text-center py-8 text-gray-500 dark:text-gray-400">
              No activities found
            </li>
          ) : (
            filteredActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type, activity.action);
              const isLast = index === filteredActivities.length - 1;
              
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {!isLast && (
                      <span
                        className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <span
                          className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 ${getActivityColor(activity.action)}`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </p>
                          {!compact && (
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                              {activity.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <time dateTime={activity.timestamp.toISOString()}>
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </time>
                            {activity.user && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{activity.user.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};
