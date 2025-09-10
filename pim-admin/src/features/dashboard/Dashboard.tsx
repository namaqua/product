import { useState } from 'react';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CubeIcon,
  FolderIcon,
  TagIcon,
  PhotoIcon,
} from '@heroicons/react/20/solid';

// Sample data types
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  price: number;
  lastModified: string;
}

// Sample data
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Product Alpha',
    sku: 'SKU-001',
    category: 'Electronics',
    status: 'active',
    price: 299.99,
    lastModified: '2025-01-05',
  },
  {
    id: '2',
    name: 'Product Beta',
    sku: 'SKU-002',
    category: 'Clothing',
    status: 'draft',
    price: 79.99,
    lastModified: '2025-01-04',
  },
  {
    id: '3',
    name: 'Product Gamma',
    sku: 'SKU-003',
    category: 'Electronics',
    status: 'active',
    price: 599.99,
    lastModified: '2025-01-03',
  },
  {
    id: '4',
    name: 'Product Delta',
    sku: 'SKU-004',
    category: 'Home',
    status: 'archived',
    price: 149.99,
    lastModified: '2025-01-02',
  },
];

const stats = [
  {
    name: 'Total Products',
    value: '2,847',
    change: '+12.5%',
    changeType: 'increase' as const,
    icon: CubeIcon,
    accent: true, // Use accent color for products
  },
  {
    name: 'Active Categories',
    value: '145',
    change: '+3.2%',
    changeType: 'increase' as const,
    icon: FolderIcon,
    accent: false,
  },
  {
    name: 'Attributes',
    value: '892',
    change: '-1.5%',
    changeType: 'decrease' as const,
    icon: TagIcon,
    accent: false,
  },
  {
    name: 'Media Assets',
    value: '12,543',
    change: '+23.1%',
    changeType: 'increase' as const,
    icon: PhotoIcon,
    accent: false,
  },
];

export default function Dashboard() {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const columns = [
    {
      key: 'name',
      header: 'Product Name',
      sortable: true,
      cell: (item: Product) => (
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
      cell: (item: Product) => item.category,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (item: Product) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
          ${item.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
          ${item.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : ''}
          ${item.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' : ''}
        `}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      cell: (item: Product) => `$${item.price.toFixed(2)}`,
    },
    {
      key: 'lastModified',
      header: 'Last Modified',
      sortable: true,
      cell: (item: Product) => item.lastModified,
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
              Welcome back! Here's an overview of your product information.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 space-x-3">
            <Button variant="outline">Export Data</Button>
            <Button>Add Product</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
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
              <dd className="ml-16 flex items-baseline">
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
              </dd>
            </div>
          ))}
        </div>

        {/* Recent Products Table */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Recent Products
            </h3>
            <DataTable
              columns={columns}
              data={sampleProducts}
              loading={false}
              pagination={{
                currentPage,
                totalPages: Math.ceil(sampleProducts.length / 10),
                pageSize: 10,
                totalItems: sampleProducts.length,
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
