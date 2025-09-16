import api from './api';
import { ApiResponseParser } from '../utils/api-response-parser';
import { prepareProductForBackend } from '../utils/product-normalizer';
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
    console.log('[ProductService] createProduct - Original DTO:', dto);
    // Normalize data for backend (convert lowercase status/type to uppercase)
    const normalizedDto = prepareProductForBackend(dto);
    console.log('[ProductService] createProduct - Normalized DTO for backend:', normalizedDto);
    
    try {
      const response = await api.post('/products', normalizedDto);
      return ApiResponseParser.parseAction<ProductResponseDto>(response);
    } catch (error: any) {
      console.error('[ProductService] createProduct failed:', error.response?.data);
      throw error;
    }
  }

  /**
   * Update existing product
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<ActionResponse<ProductResponseDto>> {
    console.log('[ProductService] updateProduct - Original DTO:', dto);
    // Normalize data for backend (convert lowercase status/type to uppercase)
    const normalizedDto = prepareProductForBackend(dto);
    console.log('[ProductService] updateProduct - Normalized DTO for backend:', normalizedDto);
    
    try {
      const response = await api.patch(`/products/${id}`, normalizedDto);
      return ApiResponseParser.parseAction<ProductResponseDto>(response);
    } catch (error: any) {
      console.error('[ProductService] updateProduct failed:', error.response?.data);
      console.error('[ProductService] updateProduct status:', error.response?.status);
      throw error;
    }
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
    // Use the normalized update method to ensure proper formatting
    return this.updateProduct(id, { status: 'archived' });
  }

  /**
   * Unarchive product
   */
  async unarchiveProduct(id: string): Promise<ActionResponse<ProductResponseDto>> {
    // Use the normalized update method to ensure proper formatting
    return this.updateProduct(id, { status: 'draft' });
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
      // Step 1: Get the existing product (already normalized by parseSingle)
      const existingProduct = await this.getProduct(id);
      
      // Validate that we have the required fields
      if (!existingProduct || !existingProduct.sku || !existingProduct.name) {
        console.error('[ProductService] Invalid product data:', existingProduct);
        throw new Error('Cannot duplicate: Product data is missing required fields');
      }
      
      // Step 2: Create a copy with modified SKU and name
      const timestamp = Date.now();
      const duplicateData: CreateProductDto = {
        sku: `${existingProduct.sku}-COPY-${timestamp}`,
        name: `${existingProduct.name} (Copy)`,
        // Only include non-null values
        ...(existingProduct.description && { description: existingProduct.description }),
        ...(existingProduct.shortDescription && { shortDescription: existingProduct.shortDescription }),
        // Status and type are already normalized (lowercase) from parseSingle
        status: 'draft' as any, // Always set duplicates to draft
        type: (existingProduct.type || 'simple') as any,
        ...(existingProduct.price != null && { price: parseFloat(existingProduct.price.toString()) }),
        ...(existingProduct.specialPrice != null && { specialPrice: parseFloat(existingProduct.specialPrice.toString()) }),
        ...(existingProduct.cost != null && { cost: parseFloat(existingProduct.cost.toString()) }),
        ...(existingProduct.barcode && { barcode: existingProduct.barcode }),
        quantity: existingProduct.quantity || 0,
        isFeatured: existingProduct.isFeatured === true,
        isVisible: existingProduct.isVisible !== false,
        manageStock: existingProduct.manageStock !== false,
        ...(existingProduct.metaTitle && { metaTitle: existingProduct.metaTitle }),
        ...(existingProduct.metaDescription && { metaDescription: existingProduct.metaDescription }),
        ...(existingProduct.metaKeywords && { metaKeywords: existingProduct.metaKeywords }),
        ...(existingProduct.weight != null && { weight: existingProduct.weight }),
        ...(existingProduct.brand && { brand: existingProduct.brand }),
        ...(existingProduct.manufacturer && { manufacturer: existingProduct.manufacturer }),
      };
      
      console.log('[ProductService] Duplicating product with data:', duplicateData);
      
      // Step 3: Create the new product (createProduct will normalize for backend)
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
