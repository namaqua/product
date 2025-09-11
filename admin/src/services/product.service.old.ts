import api from './api';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  PaginatedResponse,
  ProductVariant,
  ProductStatus,
  ProductVisibility,
  ProductType,
} from '../types/api.types';

export interface ProductFilters {
  search?: string;
  status?: string;
  type?: string;
  categoryId?: string;
  brandId?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Map backend product to frontend Product type
function mapBackendProductToFrontend(backendProduct: any): Product {
  return {
    id: backendProduct.id,
    sku: backendProduct.sku,
    name: backendProduct.name,
    description: backendProduct.description,
    shortDescription: backendProduct.shortDescription,
    slug: backendProduct.urlKey || backendProduct.sku.toLowerCase(), // Backend uses urlKey
    
    // Map status - backend uses different values
    status: mapBackendStatus(backendProduct.status),
    
    // Map visibility - backend uses isVisible boolean
    visibility: backendProduct.isVisible ? ProductVisibility.VISIBLE : ProductVisibility.HIDDEN,
    
    // Map type
    type: mapBackendType(backendProduct.type),
    
    price: backendProduct.price ? parseFloat(backendProduct.price) : undefined,
    compareAtPrice: backendProduct.specialPrice ? parseFloat(backendProduct.specialPrice) : undefined,
    cost: backendProduct.cost ? parseFloat(backendProduct.cost) : undefined,
    barcode: backendProduct.barcode,
    trackInventory: backendProduct.manageStock !== false,
    weight: backendProduct.weight,
    weightUnit: backendProduct.weightUnit,
    
    // Map featured - backend uses isFeatured
    featured: backendProduct.isFeatured || false,
    
    metaTitle: backendProduct.metaTitle,
    metaDescription: backendProduct.metaDescription,
    metaKeywords: backendProduct.metaKeywords ? backendProduct.metaKeywords.split(',') : [],
    
    categories: backendProduct.categories || [],
    attributes: backendProduct.attributes || [],
    images: backendProduct.images || [],
    variants: backendProduct.variants || [],
    brand: backendProduct.brand,
    brandId: backendProduct.brandId,
    
    createdAt: backendProduct.createdAt,
    updatedAt: backendProduct.updatedAt,
    publishedAt: backendProduct.publishedAt,
  };
}

// Map backend status to frontend enum
function mapBackendStatus(status: string): ProductStatus {
  const statusMap: Record<string, ProductStatus> = {
    'published': ProductStatus.ACTIVE,
    'draft': ProductStatus.DRAFT,
    'archived': ProductStatus.ARCHIVED,
    'pending_review': ProductStatus.DRAFT,
    'approved': ProductStatus.ACTIVE,
  };
  return statusMap[status] || ProductStatus.DRAFT;
}

// Map backend type to frontend enum
function mapBackendType(type: string): ProductType {
  const typeMap: Record<string, ProductType> = {
    'simple': ProductType.SIMPLE,
    'configurable': ProductType.VARIABLE,
    'bundle': ProductType.BUNDLE,
    'virtual': ProductType.VIRTUAL,
    'grouped': ProductType.GROUPED,
    'downloadable': ProductType.DOWNLOADABLE,
  };
  return typeMap[type] || ProductType.SIMPLE;
}

// Map frontend product to backend format for create/update
function mapFrontendProductToBackend(product: CreateProductDto | UpdateProductDto): any {
  const mapped: any = {
    sku: product.sku,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    
    // Map status - frontend to backend
    status: mapFrontendStatus(product.status),
    
    // Map visibility to isVisible
    isVisible: product.visibility !== ProductVisibility.HIDDEN,
    
    // Map type
    type: mapFrontendType(product.type),
    
    price: product.price,
    specialPrice: product.compareAtPrice,
    cost: product.cost,
    barcode: product.barcode,
    manageStock: product.trackInventory,
    weight: product.weight,
    
    // Map featured to isFeatured
    isFeatured: product.featured,
    
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    metaKeywords: product.metaKeywords?.join(','),
    
    brand: product.brandId,
  };

  // Remove undefined values
  Object.keys(mapped).forEach(key => {
    if (mapped[key] === undefined) {
      delete mapped[key];
    }
  });

  return mapped;
}

// Map frontend status to backend
function mapFrontendStatus(status?: ProductStatus): string {
  if (!status) return 'draft';
  const statusMap: Record<ProductStatus, string> = {
    [ProductStatus.ACTIVE]: 'published',
    [ProductStatus.DRAFT]: 'draft',
    [ProductStatus.ARCHIVED]: 'archived',
  };
  return statusMap[status] || 'draft';
}

// Map frontend type to backend
function mapFrontendType(type?: ProductType): string {
  if (!type) return 'simple';
  const typeMap: Record<ProductType, string> = {
    [ProductType.SIMPLE]: 'simple',
    [ProductType.VARIABLE]: 'configurable',
    [ProductType.BUNDLE]: 'bundle',
    [ProductType.VIRTUAL]: 'virtual',
    [ProductType.GROUPED]: 'grouped',
    [ProductType.DOWNLOADABLE]: 'downloadable',
  };
  return typeMap[type] || 'simple';
}

class ProductService {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    // Map frontend filters to backend format
    const backendFilters: any = {
      ...filters,
      status: filters.status ? mapFrontendStatus(filters.status as ProductStatus) : undefined,
      isFeatured: filters.featured,
    };
    delete backendFilters.featured;
    
    // Add filters to query params
    Object.entries(backendFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/products?${params.toString()}`);
    
    // Handle the backend response structure
    const rawData = response.data;
    
    // Check if it's the wrapped format with data array and meta
    if (rawData.data && Array.isArray(rawData.data) && rawData.meta) {
      // Map each product
      const mappedItems = rawData.data.map(mapBackendProductToFrontend);
      
      return {
        items: mappedItems,
        meta: {
          totalItems: rawData.meta.totalItems,
          itemCount: rawData.meta.itemCount || mappedItems.length,
          itemsPerPage: rawData.meta.limit || rawData.meta.itemsPerPage || 20,
          totalPages: rawData.meta.totalPages,
          currentPage: rawData.meta.page || rawData.meta.currentPage || 1,
        },
      };
    }
    
    // Fallback for different response structure
    const data = rawData.data || rawData;
    if (data.items) {
      return {
        ...data,
        items: data.items.map(mapBackendProductToFrontend),
      };
    }
    
    // If it's just an array
    if (Array.isArray(data)) {
      return {
        items: data.map(mapBackendProductToFrontend),
        meta: {
          totalItems: data.length,
          itemCount: data.length,
          itemsPerPage: data.length,
          totalPages: 1,
          currentPage: 1,
        },
      };
    }
    
    throw new Error('Unexpected response format from products API');
  }

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    const data = response.data.data || response.data;
    return mapBackendProductToFrontend(data);
  }

  async getProductBySku(sku: string): Promise<Product> {
    const response = await api.get(`/products/sku/${sku}`);
    const data = response.data.data || response.data;
    return mapBackendProductToFrontend(data);
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const response = await api.get(`/products/slug/${slug}`);
    const data = response.data.data || response.data;
    return mapBackendProductToFrontend(data);
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const backendData = mapFrontendProductToBackend(data);
    const response = await api.post('/products', backendData);
    const responseData = response.data.data || response.data;
    return mapBackendProductToFrontend(responseData);
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const backendData = mapFrontendProductToBackend(data);
    const response = await api.patch(`/products/${id}`, backendData);
    const responseData = response.data.data || response.data;
    return mapBackendProductToFrontend(responseData);
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/products/bulk-delete', { ids });
  }

  async duplicateProduct(id: string): Promise<Product> {
    const response = await api.post(`/products/${id}/duplicate`);
    const data = response.data.data || response.data;
    return mapBackendProductToFrontend(data);
  }

  async updateInventory(id: string, quantity: number): Promise<Product> {
    const response = await api.patch(`/products/${id}/inventory`, { quantity });
    const data = response.data.data || response.data;
    return mapBackendProductToFrontend(data);
  }

  // Variant methods
  async getVariants(productId: string): Promise<ProductVariant[]> {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data.data || response.data;
  }

  async createVariant(productId: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    const response = await api.post(`/products/${productId}/variants`, data);
    return response.data.data || response.data;
  }

  async updateVariant(productId: string, variantId: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    const response = await api.patch(`/products/${productId}/variants/${variantId}`, data);
    return response.data.data || response.data;
  }

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    await api.delete(`/products/${productId}/variants/${variantId}`);
  }

  // Bulk operations
  async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
    const backendStatus = mapFrontendStatus(status as ProductStatus);
    await api.post('/products/bulk-update-status', { ids, status: backendStatus });
  }

  async exportProducts(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await api.get(`/products/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async importProducts(file: File): Promise<{ success: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  }
}

export default new ProductService();
