import api from './api';
import {
  Category,
  CategoryTree,
  CreateCategoryDto,
  UpdateCategoryDto,
  PaginatedResponse,
} from '../types/api.types';

export interface CategoryFilters {
  search?: string;
  parentId?: string;
  isActive?: boolean;
  level?: number;
  page?: number;
  limit?: number;
}

class CategoryService {
  async getCategories(filters: CategoryFilters = {}): Promise<PaginatedResponse<Category>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/categories?${params.toString()}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async getCategory(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await api.get(`/categories/slug/${slug}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async getCategoryTree(): Promise<CategoryTree[]> {
    const response = await api.get('/categories/tree');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async getCategoryPath(id: string): Promise<Category[]> {
    const response = await api.get(`/categories/${id}/path`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async getCategoryChildren(id: string): Promise<Category[]> {
    const response = await api.get(`/categories/${id}/children`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async getCategoryDescendants(id: string): Promise<Category[]> {
    const response = await api.get(`/categories/${id}/descendants`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await api.post('/categories', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await api.patch(`/categories/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }

  async moveCategory(id: string, newParentId: string | null, position?: 'first' | 'last'): Promise<Category> {
    const response = await api.post(`/categories/${id}/move`, {
      newParentId,
      position: position || 'last', // Default to 'last' if not specified
    });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async reorderCategories(parentId: string | null, categoryIds: string[]): Promise<void> {
    await api.post('/categories/reorder', {
      parentId,
      categoryIds,
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/categories/bulk-delete', { ids });
  }

  async rebuildTree(): Promise<void> {
    await api.post('/categories/rebuild-tree');
  }

  async validateTree(): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await api.get('/categories/validate-tree');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async exportCategories(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await api.get(`/categories/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async importCategories(file: File): Promise<{ success: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/categories/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }
}

export default new CategoryService();
