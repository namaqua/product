import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import productService, { ProductFilters } from '../../services/product.service';
import { Product, ProductStatus, ProductVisibility } from '../../types/api.types';
import { format } from 'date-fns';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<ProductFilters>({
    status: '',
    type: '',
    featured: undefined,
  });

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts({
        ...filters,
        search: searchTerm,
        page: currentPage,
        limit: pageSize,
      });
      
      setProducts(response.items);
      setTotalItems(response.meta.totalItems);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchTerm, filters]);

  // Table columns
  const columns = useMemo(() => [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-navy-800 focus:ring-navy-800"
          checked={selectedProducts.size === products.length && products.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProducts(new Set(products.map(p => p.id)));
            } else {
              setSelectedProducts(new Set());
            }
          }}
        />
      ),
      cell: (product: Product) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-navy-800 focus:ring-navy-800"
          checked={selectedProducts.has(product.id)}
          onChange={(e) => {
            const newSelected = new Set(selectedProducts);
            if (e.target.checked) {
              newSelected.add(product.id);
            } else {
              newSelected.delete(product.id);
            }
            setSelectedProducts(newSelected);
          }}
        />
      ),
      width: '40px',
    },
    {
      key: 'sku',
      header: 'SKU',
      sortable: true,
      cell: (product: Product) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {product.sku}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cell: (product: Product) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {product.name}
          </div>
          {product.shortDescription && (
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {product.shortDescription}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      cell: (product: Product) => (
        <div className="text-sm">
          {product.price ? (
            <>
              <div className="font-medium text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </div>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <div className="text-gray-500 dark:text-gray-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (product: Product) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          product.status === ProductStatus.ACTIVE
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : product.status === ProductStatus.DRAFT
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          {product.status}
        </span>
      ),
    },
    {
      key: 'visibility',
      header: 'Visibility',
      cell: (product: Product) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          product.visibility === ProductVisibility.VISIBLE
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          {product.visibility}
        </span>
      ),
    },
    {
      key: 'featured',
      header: 'Featured',
      cell: (product: Product) => (
        product.featured ? (
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      sortable: true,
      cell: (product: Product) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(product.updatedAt), 'MMM d, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (product: Product) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/products/${product.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700 dark:text-red-400"
            onClick={() => {
              setProductToDelete(product);
              setDeleteModalOpen(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ], [products, selectedProducts]);

  // Handle delete
  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await productService.deleteProduct(productToDelete.id);
      await fetchProducts();
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    
    try {
      await productService.bulkDelete(Array.from(selectedProducts));
      await fetchProducts();
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('Failed to delete products:', error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Manage your product catalog
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button
            onClick={() => navigate('/products/new')}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search
              </label>
              <input
                type="text"
                id="search"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Search by SKU or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All</option>
                <option value={ProductStatus.DRAFT}>Draft</option>
                <option value={ProductStatus.ACTIVE}>Active</option>
                <option value={ProductStatus.ARCHIVED}>Archived</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                id="type"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All</option>
                <option value="simple">Simple</option>
                <option value="variable">Variable</option>
                <option value="grouped">Grouped</option>
                <option value="bundle">Bundle</option>
                <option value="virtual">Virtual</option>
                <option value="downloadable">Downloadable</option>
              </select>
            </div>

            <div>
              <label htmlFor="featured" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured
              </label>
              <select
                id="featured"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-navy-800 focus:ring-navy-800 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={filters.featured === undefined ? '' : filters.featured.toString()}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  featured: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
              >
                <option value="">All</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>
            </div>
          </div>

          {selectedProducts.size > 0 && (
            <div className="mt-4 flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {selectedProducts.size} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <DataTable
              columns={columns}
              data={products}
              loading={loading}
              pagination={{
                currentPage,
                totalPages: Math.ceil(totalItems / pageSize),
                pageSize,
                totalItems,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
              }}
            />
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
