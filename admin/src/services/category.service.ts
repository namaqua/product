import api from './api';
import { ApiResponseParser } from '../utils/api-response-parser';
import {
  CollectionResponse,
  ActionResponse,
} from '../types/api-responses.types';
import {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  CategoryTreeDto,
} from '../types/dto/categories';

class CategoryService {
  /**
   * Get paginated list of categories
   */
  async getCategories(query: CategoryQueryDto = {}): Promise<CollectionResponse<CategoryResponseDto>> {
    const response = await api.get('/categories', { params: query });
    return ApiResponseParser.parseCollection<CategoryResponseDto>(response);
  }

  /**
   * Get category tree structure
   */
  async getCategoryTree(): Promise<CategoryTreeDto[]> {
    const response = await api.get('/categories/tree');
    return ApiResponseParser.parseTree<CategoryTreeDto>(response);
  }

  /**
   * Get single category by ID
   */
  async getCategory(id: string): Promise<CategoryResponseDto> {
    const response = await api.get(`/categories/${id}`);
    return ApiResponseParser.parseSingle<CategoryResponseDto>(response);
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
    const response = await api.get(`/categories/slug/${slug}`);
    return ApiResponseParser.parseSingle<CategoryResponseDto>(response);
  }

  /**
   * Get category with its products
   */
  async getCategoryWithProducts(id: string): Promise<any> {
    const response = await api.get(`/categories/${id}/products`);
    return ApiResponseParser.parseSingle<any>(response);
  }

  /**
   * Get ancestors of a category
   */
  async getCategoryAncestors(id: string): Promise<CategoryResponseDto[]> {
    const response = await api.get(`/categories/${id}/ancestors`);
    return ApiResponseParser.parseSingle<CategoryResponseDto[]>(response);
  }

  /**
   * Get descendants of a category
   */
  async getCategoryDescendants(id: string): Promise<CategoryResponseDto[]> {
    const response = await api.get(`/categories/${id}/descendants`);
    return ApiResponseParser.parseSingle<CategoryResponseDto[]>(response);
  }

  /**
   * Create new category
   */
  async createCategory(dto: CreateCategoryDto): Promise<ActionResponse<CategoryResponseDto>> {
    const response = await api.post('/categories', dto);
    return ApiResponseParser.parseAction<CategoryResponseDto>(response);
  }

  /**
   * Update existing category
   */
  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<ActionResponse<CategoryResponseDto>> {
    const response = await api.patch(`/categories/${id}`, dto);
    return ApiResponseParser.parseAction<CategoryResponseDto>(response);
  }

  /**
   * Move category to new parent
   */
  async moveCategory(id: string, newParentId: string | null, position?: number): Promise<ActionResponse<CategoryResponseDto>> {
    const response = await api.post(`/categories/${id}/move`, { 
      newParentId, 
      position 
    });
    return ApiResponseParser.parseAction<CategoryResponseDto>(response);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<ActionResponse<CategoryResponseDto>> {
    const response = await api.delete(`/categories/${id}`);
    return ApiResponseParser.parseAction<CategoryResponseDto>(response);
  }

  /**
   * Bulk delete categories
   */
  async bulkDelete(ids: string[]): Promise<ActionResponse<any>> {
    const response = await api.post('/categories/bulk-delete', { ids });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Export categories
   */
  async exportCategories(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await api.get(`/categories/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Import categories
   */
  async importCategories(file: File): Promise<ActionResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/categories/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Rebuild the category tree (admin only)
   */
  async rebuildTree(): Promise<ActionResponse<any>> {
    const response = await api.post('/categories/rebuild-tree');
    return ApiResponseParser.parseAction<any>(response);
  }
}

export default new CategoryService();
