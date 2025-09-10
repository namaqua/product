import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/product.service';
import { Product, PaginatedResponse } from '../../types/api.types';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page: pagination.page,
        limit: pagination.limit,
      });
      setProducts(response.items);
      setPagination({
        ...pagination,
        total: response.meta.totalItems,
        totalPages: response.meta.totalPages,
      });
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => navigate('/products/new')}>
          Add Product
        </Button>
      </div>

      <DataTable
        data={products}
        columns={[
          { key: 'sku', label: 'SKU' },
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
          { key: 'price', label: 'Price', render: (product: Product) => `$${product.price || 0}` },
          { key: 'type', label: 'Type' },
          {
            key: 'actions',
            label: 'Actions',
            render: (product: Product) => (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
