import { useState } from 'react';
import ApplicationShell from '@/components/layouts/ApplicationShell';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/tables/DataTable';
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
  },
  {
    name: 'Active Categories',
    value: '145',
    change: '+3.2%',
    changeType: 'increase' as const,
    icon: FolderIcon,
  },
  {
    name: 'Attributes',
    value: '892',
    change: '-1.5%',
    changeType: 'decrease' as const,
    icon: TagIcon,
  },
  {
    name: 'Media Assets',
    value: '12,543',
    change: '+23.1%',
    changeType: 'increase' as const,
    icon: PhotoIcon,
  },
];

export default function Dashboard() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      accessor: (item) => item.name,
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-navy-900">{value}</div>
          <div className="text-gray-500">{item.sku}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (item) => item.category,
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (item) => item.status,
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
          ${value === 'active' ? 'bg-green-100 text-green-800' : ''}
          ${value === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${value === 'archived' ? 'bg-gray-100 text-gray-800' : ''}
        `}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      accessor: (item) => item.price,
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      key: 'lastModified',
      header: 'Last Modified',
      accessor: (item) => item.lastModified,
      sortable: true,
    },
  ];

  return (
    <ApplicationShell currentPath="/">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Welcome back! Here's an overview of your product information.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 space-x-3">
            <Button variant="secondary">Export Data</Button>
            <Button variant="accent">Add Product</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-lg transition-shadow border-l-4 border-transparent hover:border-accent-500 sm:px-6 sm:py-6"
            >
              <dt>
                <div className="absolute rounded-md bg-gradient-navy p-3">
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-navy-900">{stat.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold
                    ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}
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
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-navy-900 mb-4">Recent Products</h3>
            <DataTable
              data={sampleProducts}
              columns={columns}
              keyExtractor={(item) => item.id}
              selectable
              selectedItems={selectedProducts}
              onSelectionChange={setSelectedProducts}
              onRowClick={(item) => console.log('Clicked:', item)}
              pagination={{
                page: currentPage,
                pageSize: 10,
                total: 100,
                onPageChange: setCurrentPage,
                onPageSizeChange: (size) => console.log('Page size:', size),
              }}
            />
          </div>
        </div>
      </div>
    </ApplicationShell>
  );
}
