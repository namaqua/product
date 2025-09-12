import { useState, useEffect } from 'react';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CubeIcon,
  FolderIcon,
  TagIcon,
  PhotoIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/product.service';
import categoryService from '../../services/category.service';
import attributeService from '../../services/attribute.service';
import mediaService from '../../services/media.service';
import { ProductResponseDto } from '../../types/dto/products';
import { format } from 'date-fns';

// Loading skeleton component
const StatSkeleton = () => (
  <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:px-6 sm:py-6 animate-pulse">
    <div className="absolute rounded-md p-3 bg-gray-300 dark:bg-gray-700 h-12 w-12"></div>
    <div className="ml-16">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
    </div>
  </div>
);

interface DashboardStats {
  totalProducts: number;
  activeCategories: number;
  attributes: number;
  mediaAssets: number;
  lowStockProducts: number;
  draftProducts: number;
  publishedProducts: number;
  archivedProducts: number;
}

export default function ProductDashboard() {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [recentProducts, setRecentProducts] = useState<ProductResponseDto[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeCategories: 0,
    attributes: 0,
    mediaAssets: 0,
    lowStockProducts: 0,
    draftProducts: 0,
    publishedProducts: 0,
    archivedProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setError(null);
      
      // Fetch base stats first
      const [productsData, categoriesData, attributesData, mediaResponse] = await Promise.all([
        productService.getProducts({ limit: 100 }), // Get sample for low stock count
        categoryService.getCategories({ limit: 100 }),
        attributeService.getAttributes({ limit: 100 }),
        mediaService.getMediaList({ limit: 1 }),
      ]);

      // Try to get status counts, but don't fail if filtering isn't supported
      let draftCount = 0, publishedCount = 0, archivedCount = 0;
      
      try {
        const [draftData, publishedData, archivedData] = await Promise.all([
          productService.getProducts({ limit: 1, status: 'draft' }),
          productService.getProducts({ limit: 1, status: 'published' }),
          productService.getProducts({ limit: 1, status: 'archived' }),
        ]);
        
        draftCount = draftData.meta?.totalItems || 0;
        publishedCount = publishedData.meta?.totalItems || 0;
        archivedCount = archivedData.meta?.totalItems || 0;
      } catch (statusError) {
        // If status filtering fails, try to count from sample
        console.log('Status filtering not supported, counting from sample');
        const sampleProducts = productsData.items || [];
        draftCount = sampleProducts.filter(p => p.status === 'draft').length;
        publishedCount = sampleProducts.filter(p => p.status === 'published').length;
        archivedCount = sampleProducts.filter(p => p.status === 'archived').length;
      }

      // Calculate low stock from the sample (first 100 products)
      const sampleProducts = productsData.items || [];
      const lowStockInSample = sampleProducts.filter((p: ProductResponseDto) => 
        p.quantity !== undefined && p.quantity !== null && p.quantity < 10
      ).length;
      
      // Estimate total low stock based on sample proportion
      const totalProducts = productsData.meta?.totalItems || 0;
      const sampleSize = sampleProducts.length;
      const estimatedLowStock = sampleSize > 0 
        ? Math.round((lowStockInSample / sampleSize) * totalProducts)
        : 0;

      // Handle media response - it's wrapped differently
      let mediaCount = 0;
      if (mediaResponse?.success && mediaResponse.data) {
        mediaCount = mediaResponse.data.meta?.totalItems || 0;
      } else if (mediaResponse?.meta) {
        mediaCount = mediaResponse.meta.totalItems || 0;
      }

      setStats({
        totalProducts: totalProducts,
        activeCategories: categoriesData.meta?.totalItems || 0,
        attributes: attributesData.meta?.totalItems || 0,
        mediaAssets: mediaCount,
        lowStockProducts: estimatedLowStock,
        draftProducts: draftCount,
        publishedProducts: publishedCount,
        archivedProducts: archivedCount,
      });
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      
      // Try to provide more specific error message
      let errorMessage = 'Failed to load dashboard statistics';
      if (err.response?.data?.message) {
        errorMessage = Array.isArray(err.response.data.message) 
          ? err.response.data.message.join(', ')
          : err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch recent products
  const fetchRecentProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productService.getProducts({
        limit: 10,
        page: 1,
        sortBy: 'updatedAt',
        sortOrder: 'DESC',
      });
      
      setRecentProducts(response.items || []);
    } catch (err) {
      console.error('Failed to fetch recent products:', err);
      // Don't set error here to avoid blocking the whole dashboard
    } finally {
      setProductsLoading(false);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchRecentProducts()]);
  };

  useEffect(() => {
    fetchStats();
    fetchRecentProducts();
  }, []);

  // Calculate trend percentages (placeholder for now)
  const calculateTrend = (current: number, previous: number = 0): { change: string; type: 'increase' | 'decrease' } => {
    if (previous === 0) {
      return { change: '+0%', type: 'increase' };
    }
    const percentChange = ((current - previous) / previous) * 100;
    return {
      change: `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`,
      type: percentChange >= 0 ? 'increase' : 'decrease'
    };
  };

  // Stats configuration with real data
  const statsConfig = [
    {
      name: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      change: '+12.5%', // Placeholder - would need historical data
      changeType: 'increase' as const,
      icon: CubeIcon,
      accent: true,
      subStats: stats.totalProducts > 0 ? [
        { label: 'Published', value: stats.publishedProducts },
        { label: 'Draft', value: stats.draftProducts },
        { label: 'Archived', value: stats.archivedProducts },
      ] : undefined,
    },
    {
      name: 'Active Categories',
      value: stats.activeCategories.toLocaleString(),
      change: '+3.2%',
      changeType: 'increase' as const,
      icon: FolderIcon,
      accent: false,
    },
    {
      name: 'Attributes',
      value: stats.attributes.toLocaleString(),
      change: '+5.1%',
      changeType: 'increase' as const,
      icon: TagIcon,
      accent: false,
    },
    {
      name: 'Media Assets',
      value: stats.mediaAssets.toLocaleString(),
      change: '+23.1%',
      changeType: 'increase' as const,
      icon: PhotoIcon,
      accent: false,
    },
  ];

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      header: 'Product Name',
      sortable: true,
      cell: (item: ProductResponseDto) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
          <div className="text-gray-500 dark:text-gray-400">{item.sku}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      cell: (item: ProductResponseDto) => (
        <span className="text-gray-600 dark:text-gray-300">
          {item.categories && item.categories.length > 0 
            ? item.categories[0].name 
            : 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (item: ProductResponseDto) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
          ${item.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
          ${item.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : ''}
          ${item.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' : ''}
        `}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Stock',
      sortable: true,
      cell: (item: ProductResponseDto) => {
        const quantity = item.quantity || 0;
        const isLowStock = quantity < 10;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-medium ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {quantity}
            </span>
            {isLowStock && (
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" title="Low stock" />
            )}
          </div>
        );
      },
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      cell: (item: ProductResponseDto) => (
        <span className="text-gray-900 dark:text-white">
          ${item.price ? parseFloat(item.price.toString()).toFixed(2) : '0.00'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      sortable: true,
      cell: (item: ProductResponseDto) => (
        <span className="text-gray-500 dark:text-gray-400">
          {format(new Date(item.updatedAt), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (item: ProductResponseDto) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/products/${item.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
              Comprehensive overview of your product catalog and inventory
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => navigate('/products/new')}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm font-medium">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="text-sm underline hover:no-underline mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            // Show skeletons while loading
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            statsConfig.map((stat) => (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow hover:shadow-lg transition-shadow border-l-4 border-transparent hover:border-accent-500 sm:px-6 sm:py-6"
              >
                <dt>
                  <div className={`absolute rounded-md p-3 ${
                    stat.accent ? 'bg-accent-500' : 'bg-navy-800'
                  }`}>
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.name}
                  </p>
                </dt>
                <dd className="ml-16">
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    <p
                      className={`ml-2 flex items-baseline text-sm font-semibold
                        ${stat.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                      `}
                    >
                      {stat.changeType === 'increase' ? (
                        <ArrowUpIcon
                          className="h-5 w-5 flex-shrink-0 self-center text-green-500"
                          aria-hidden="true"
                        />
                      ) : (
                        <ArrowDownIcon
                          className="h-5 w-5 flex-shrink-0 self-center text-red-500"
                          aria-hidden="true"
                        />
                      )}
                      <span className="sr-only">
                        {' '}
                        {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by{' '}
                      </span>
                      {stat.change}
                    </p>
                  </div>
                  {/* Sub-stats for products */}
                  {stat.subStats && (
                    <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {stat.subStats.map((subStat) => (
                        <span key={subStat.label}>
                          {subStat.label}: <strong>{subStat.value}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </dd>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => navigate('/products/new')}
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center hover:border-accent-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <CubeIcon className="mx-auto h-8 w-8 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
              New Product
            </span>
          </button>
          <button
            onClick={() => navigate('/categories')}
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center hover:border-accent-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FolderIcon className="mx-auto h-8 w-8 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
              Manage Categories
            </span>
          </button>
          <button
            onClick={() => navigate('/attributes')}
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center hover:border-accent-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <TagIcon className="mx-auto h-8 w-8 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
              Manage Attributes
            </span>
          </button>
          <button
            onClick={() => navigate('/media')}
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center hover:border-accent-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
              Media Library
            </span>
          </button>
        </div>

        {/* Low Stock Alert */}
        {stats.lowStockProducts > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-lg">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Low Stock Alert</p>
                <p className="text-sm mt-1">
                  Approximately {stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's' : ''} {stats.lowStockProducts !== 1 ? 'are' : 'is'} running low on stock (below 10 units).
                  <button
                    onClick={() => navigate('/products?filter=lowStock')}
                    className="ml-2 underline hover:no-underline"
                  >
                    View products
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Products Table */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Recent Products
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/products')}
              >
                View All
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={recentProducts}
              loading={productsLoading}
              pagination={{
                currentPage,
                totalPages: Math.ceil(recentProducts.length / 10),
                pageSize: 10,
                totalItems: recentProducts.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: (size) => console.log('Page size:', size),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
