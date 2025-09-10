import api from './api';
import {
  Attribute,
  AttributeGroup,
  CreateAttributeDto,
  UpdateAttributeDto,
  PaginatedResponse,
  AttributeType,
} from '../types/api.types';

export interface AttributeFilters {
  search?: string;
  type?: AttributeType;
  groupId?: string;
  isRequired?: boolean;
  isFilterable?: boolean;
  isSearchable?: boolean;
  isVariant?: boolean;
  page?: number;
  limit?: number;
}

class AttributeService {
  async getAttributes(filters: AttributeFilters = {}): Promise<PaginatedResponse<Attribute>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/attributes?${params.toString()}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async getAttribute(id: string): Promise<Attribute> {
    const response = await api.get(`/attributes/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async getAttributeByCode(code: string): Promise<Attribute> {
    const response = await api.get(`/attributes/code/${code}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async createAttribute(data: CreateAttributeDto): Promise<Attribute> {
    const response = await api.post('/attributes', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async updateAttribute(id: string, data: UpdateAttributeDto): Promise<Attribute> {
    const response = await api.patch(`/attributes/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async deleteAttribute(id: string): Promise<void> {
    await api.delete(`/attributes/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/attributes/bulk-delete', { ids });
  }

  async reorderAttributes(attributeIds: string[]): Promise<void> {
    await api.post('/attributes/reorder', { attributeIds });
  }

  // Attribute Groups
  async getAttributeGroups(): Promise<AttributeGroup[]> {
    const response = await api.get('/attributes/groups');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async getAttributeGroup(id: string): Promise<AttributeGroup> {
    const response = await api.get(`/attributes/groups/${id}`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async createAttributeGroup(data: { code: string; name: string; description?: string }): Promise<AttributeGroup> {
    const response = await api.post('/attributes/groups', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async updateAttributeGroup(id: string, data: Partial<{ code: string; name: string; description?: string }>): Promise<AttributeGroup> {
    const response = await api.patch(`/attributes/groups/${id}`, data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async deleteAttributeGroup(id: string): Promise<void> {
    await api.delete(`/attributes/groups/${id}`);
  }

  async getGroupAttributes(groupId: string): Promise<Attribute[]> {
    const response = await api.get(`/attributes/groups/${groupId}/attributes`);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async assignToGroup(attributeIds: string[], groupId: string): Promise<void> {
    await api.post(`/attributes/groups/${groupId}/assign`, { attributeIds });
  }

  async removeFromGroup(attributeIds: string[], groupId: string): Promise<void> {
    await api.post(`/attributes/groups/${groupId}/remove`, { attributeIds });
  }

  // Validation
  async validateAttributeValue(attributeId: string, value: any): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await api.post(`/attributes/${attributeId}/validate`, { value });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  // Export/Import
  async exportAttributes(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await api.get(`/attributes/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async importAttributes(file: File): Promise<{ success: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/attributes/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  // Get attribute types for forms
  getAttributeTypes(): { value: AttributeType; label: string }[] {
    return [
      { value: AttributeType.TEXT, label: 'Text' },
      { value: AttributeType.NUMBER, label: 'Number' },
      { value: AttributeType.BOOLEAN, label: 'Boolean' },
      { value: AttributeType.DATE, label: 'Date' },
      { value: AttributeType.DATETIME, label: 'Date & Time' },
      { value: AttributeType.SELECT, label: 'Select' },
      { value: AttributeType.MULTISELECT, label: 'Multi-Select' },
      { value: AttributeType.COLOR, label: 'Color' },
      { value: AttributeType.IMAGE, label: 'Image' },
      { value: AttributeType.FILE, label: 'File' },
      { value: AttributeType.PRICE, label: 'Price' },
      { value: AttributeType.WEIGHT, label: 'Weight' },
      { value: AttributeType.DIMENSION, label: 'Dimension' },
    ];
  }
}

export default new AttributeService();
