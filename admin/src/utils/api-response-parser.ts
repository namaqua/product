import { AxiosResponse } from 'axios';
import {
  CollectionResponse,
  ActionResponse,
  AuthResponse,
  SingleItemResponse,
} from '../types/api-responses.types';

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
      return {
        items: data.items || [],
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
      return {
        items: data,
        meta: {
          totalItems: data.length,
          itemCount: data.length,
          itemsPerPage: data.length,
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
    return {
      item: data.item,
      message: data.message || 'Operation completed successfully',
    };
  }

  /**
   * Parse single item responses (GET /entities/:id)
   */
  static parseSingle<T>(response: AxiosResponse): T {
    const wrapped = response.data;
    
    if (!wrapped.success) {
      throw new Error('API request was not successful');
    }
    
    // For single items, the DTO is directly in data
    return wrapped.data as T;
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
