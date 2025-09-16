import { AxiosResponse } from 'axios';
import {
  CollectionResponse,
  ActionResponse,
  AuthResponse,
  SingleItemResponse,
} from '../types/api-responses.types';
import { normalizeProductFromBackend } from './product-normalizer';

export class ApiResponseParser {
  /**
   * Parse collection responses (GET /entities with pagination)
   */
  static parseCollection<T>(response: AxiosResponse): CollectionResponse<T> {
    // Backend wraps in { success, data, timestamp }
    // The actual collection is in data
    const wrapped = response.data;
    
    if (!wrapped.success) {
      throw new Error('API request was not successful');
    }
    
    const data = wrapped.data;
    
    // Handle both formats the backend might return
    if (data.items && data.meta) {
      // Normalize products if this is a product collection
      const items = data.items.map((item: any) => {
        // Check if this looks like a product
        if (item && typeof item === 'object' && ('sku' in item || 'type' in item || 'status' in item)) {
          return normalizeProductFromBackend(item);
        }
        return item;
      });
      
      return {
        items: items || [],
        meta: {
          totalItems: data.meta.totalItems || 0,
          itemCount: data.meta.itemCount || data.items.length,
          itemsPerPage: data.meta.itemsPerPage || data.meta.limit || 20,
          totalPages: data.meta.totalPages || 1,
          currentPage: data.meta.currentPage || data.meta.page || 1,
        }
      };
    }
    
    // Fallback for non-paginated collections
    if (Array.isArray(data)) {
      // Normalize products in array
      const items = data.map((item: any) => {
        if (item && typeof item === 'object' && ('sku' in item || 'type' in item || 'status' in item)) {
          return normalizeProductFromBackend(item);
        }
        return item;
      });
      
      return {
        items: items,
        meta: {
          totalItems: items.length,
          itemCount: items.length,
          itemsPerPage: items.length,
          totalPages: 1,
          currentPage: 1,
        }
      };
    }
    
    // If data itself has the structure
    return data as CollectionResponse<T>;
  }

  /**
   * Parse action responses (POST, PUT, DELETE)
   */
  static parseAction<T>(response: AxiosResponse): ActionResponse<T> {
    const wrapped = response.data;
    
    if (!wrapped.success) {
      throw new Error('API request was not successful');
    }
    
    const data = wrapped.data;
    
    // ActionResponseDto structure
    const result = {
      item: data.item,
      message: data.message || 'Operation completed successfully',
    };
    
    // Normalize product if the item is a product
    if (result.item && typeof result.item === 'object' && 
        ('sku' in result.item || 'type' in result.item || 'status' in result.item)) {
      result.item = normalizeProductFromBackend(result.item);
    }
    
    return result;
  }

  /**
   * Parse single item responses (GET /entities/:id)
   */
  static parseSingle<T>(response: AxiosResponse): T {
    const wrapped = response.data;
    
    // DIAGNOSTIC: Log what we're receiving
    console.log('🔧 ApiResponseParser.parseSingle - Raw response.data:', wrapped);
    console.log('🔧 ApiResponseParser.parseSingle - Structure analysis:', {
      'has success': 'success' in wrapped,
      'success value': wrapped.success,
      'has data': 'data' in wrapped,
      'data type': typeof wrapped.data,
      'data.data exists': wrapped.data?.data !== undefined,
      'data keys': wrapped.data ? Object.keys(wrapped.data).slice(0, 10) : 'N/A'
    });
    
    if (!wrapped.success) {
      throw new Error('API request was not successful');
    }
    
    // FIX: Check if the product data is in the expected structure
    let data = wrapped.data;
    
    // If data looks like a product (has sku, name, id, etc.), normalize and return it
    if (data && typeof data === 'object' && ('sku' in data || 'id' in data || 'name' in data)) {
      console.log('🔧 ApiResponseParser.parseSingle - Found product data, normalizing');
      // Normalize product data (convert uppercase status/type to lowercase)
      data = normalizeProductFromBackend(data);
      console.log('🔧 ApiResponseParser.parseSingle - Normalized product:', data);
      return data as T;
    }
    
    // If data is wrapped in another data property (shouldn't happen but just in case)
    if (data && typeof data === 'object' && 'data' in data) {
      console.log('🔧 ApiResponseParser.parseSingle - Found double-nested data, unwrapping');
      data = normalizeProductFromBackend(data.data);
      return data as T;
    }
    
    // DIAGNOSTIC: Log what we're returning
    console.log('🔧 ApiResponseParser.parseSingle - Returning:', data);
    
    // Default: return data as is
    return data as T;
  }

  /**
   * Parse auth responses (special case - not wrapped)
   */
  static parseAuth(response: AxiosResponse): AuthResponse {
    // Auth endpoints return tokens directly (not wrapped)
    const data = response.data;
    
    // Check if it's wrapped (shouldn't be, but handle both)
    if (data.success && data.data) {
      return data.data;
    }
    
    return data as AuthResponse;
  }

  /**
   * Parse tree responses (special case for hierarchical data)
   */
  static parseTree<T>(response: AxiosResponse): T[] {
    const wrapped = response.data;
    
    if (!wrapped.success) {
      throw new Error('API request was not successful');
    }
    
    // Handle different tree response formats
    // Backend might return { items: [...], meta: {...} } or just [...]
    const data = wrapped.data;
    
    // If data has items property, use that (paginated format)
    if (data && data.items && Array.isArray(data.items)) {
      return data.items as T[];
    }
    
    // If data is directly an array
    if (Array.isArray(data)) {
      return data as T[];
    }
    
    // Fallback to empty array
    console.warn('Unexpected tree response format:', data);
    return [];
  }

  /**
   * Parse raw response (for special cases)
   */
  static parseRaw<T>(response: AxiosResponse): T {
    return response.data;
  }
}
