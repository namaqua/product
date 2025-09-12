import api from './api';
import { ApiResponseParser } from '../utils/api-response-parser';
import {
  CollectionResponse,
  ActionResponse,
} from '../types/api-responses.types';
import {
  ProductResponseDto,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from '../types/dto/products';

class ProductService {
  /**
   * Get paginated list of products
   */
  async getProducts(query: ProductQueryDto = {}): Promise<CollectionResponse<ProductResponseDto>> {
    try {
      const response = await api.get('/products', { params: query });
      return ApiResponseParser.parseCollection<ProductResponseDto>(response);
    } catch (error: any) {
      console.error('[ProductService] Failed to get products:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get single product by ID
   */
  async getProduct(id: string, includeRelations = true): Promise<ProductResponseDto> {
    const response = await api.get(`/products/${id}`, {
      params: includeRelations ? { includeVariants: true, includeAttributes: true } : {}
    });
    return ApiResponseParser.parseSingle<ProductResponseDto>(response);
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string): Promise<ProductResponseDto> {
    const response = await api.get(`/products/sku/${sku}`);
    return ApiResponseParser.parseSingle<ProductResponseDto>(response);
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<ProductResponseDto> {
    const response = await api.get(`/products/slug/${slug}`);
    return ApiResponseParser.parseSingle<ProductResponseDto>(response);
  }

  /**
   * Create new product
   */
  async createProduct(dto: CreateProductDto): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.post('/products', dto);
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Update existing product
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.patch(`/products/${id}`, dto);
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.delete(`/products/${id}`);
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Archive product
   */
  async archiveProduct(id: string): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.patch(`/products/${id}`, { status: 'archived' });
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Unarchive product
   */
  async unarchiveProduct(id: string): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.patch(`/products/${id}`, { status: 'draft' });
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Bulk delete products
   */
  async bulkDelete(ids: string[]): Promise<ActionResponse<any>> {
    const response = await api.post('/products/bulk-delete', { ids });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Duplicate product (implemented in frontend using existing endpoints)
   */
  async duplicateProduct(id: string): Promise<ActionResponse<ProductResponseDto>> {
    try {
      // Step 1: Get the existing product
      const existingProduct = await this.getProduct(id);
      
      // Step 2: Create a copy with modified SKU and name
      const timestamp = Date.now();
      const duplicateData: CreateProductDto = {
        sku: `${existingProduct.sku}-COPY-${timestamp}`,
        name: `${existingProduct.name} (Copy)`,
        description: existingProduct.description,
        shortDescription: existingProduct.shortDescription,
        status: 'draft', // Always set duplicates to draft
        type: existingProduct.type || 'simple',
        price: existingProduct.price ? parseFloat(existingProduct.price.toString()) : undefined,
        specialPrice: existingProduct.specialPrice ? parseFloat(existingProduct.specialPrice.toString()) : undefined,
        cost: existingProduct.cost ? parseFloat(existingProduct.cost.toString()) : undefined,
        barcode: existingProduct.barcode,
        quantity: existingProduct.quantity || 0,
        isFeatured: existingProduct.isFeatured || false,
        isVisible: existingProduct.isVisible !== false,
        manageStock: existingProduct.manageStock !== false,
        metaTitle: existingProduct.metaTitle,
        metaDescription: existingProduct.metaDescription,
        metaKeywords: existingProduct.metaKeywords,
        weight: existingProduct.weight,
        weightUnit: existingProduct.weightUnit,
        brandId: existingProduct.brandId,
        // Note: categoryIds would need to be extracted from existingProduct.categories if needed
      };
      
      // Step 3: Create the new product
      return await this.createProduct(duplicateData);
    } catch (error: any) {
      console.error('[ProductService] Failed to duplicate product:', error);
      throw error;
    }
  }

  /**
   * Update product inventory
   */
  async updateInventory(id: string, quantity: number): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.patch(`/products/${id}/inventory`, { quantity });
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(ids: string[], status: string): Promise<ActionResponse<any>> {
    const response = await api.post('/products/bulk-update-status', { ids, status });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Export products
   */
  async exportProducts(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await api.get(`/products/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Import products
   */
  async importProducts(file: File): Promise<ActionResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return ApiResponseParser.parseAction<any>(response);
  }

  // Variant methods
  async getVariants(productId: string): Promise<any[]> {
    const response = await api.get(`/products/${productId}/variants`);
    return ApiResponseParser.parseSingle<any[]>(response);
  }

  async createVariant(productId: string, data: any): Promise<ActionResponse<any>> {
    const response = await api.post(`/products/${productId}/variants`, data);
    return ApiResponseParser.parseAction<any>(response);
  }

  async updateVariant(productId: string, variantId: string, data: any): Promise<ActionResponse<any>> {
    const response = await api.patch(`/products/${productId}/variants/${variantId}`, data);
    return ApiResponseParser.parseAction<any>(response);
  }

  async deleteVariant(productId: string, variantId: string): Promise<ActionResponse<any>> {
    const response = await api.delete(`/products/${productId}/variants/${variantId}`);
    return ApiResponseParser.parseAction<any>(response);
  }
}

export default new ProductService();
