import axios from 'axios';
import authService from './auth.service';
import { 
  CollectionResponse, 
  ActionResponse,
  PaginationParams 
} from '../types/api.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010/api/v1';

// Attribute type definitions
export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  DECIMAL = 'decimal',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  DATE = 'date',
  DATETIME = 'datetime',
  PRICE = 'price',
  URL = 'url',
  EMAIL = 'email',
  JSON = 'json'
}

export interface AttributeOption {
  id?: string;
  value: string;
  label: string;
  sortOrder: number;
  color?: string | null;
  icon?: string | null;
  isDefault?: boolean;
  metadata?: Record<string, any> | null;
}

export interface ValidationRule {
  type: string;
  value: any;
  message?: string;
}

export interface Attribute {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type: AttributeType;
  groupId?: string | null;
  groupName?: string;
  options?: AttributeOption[];
  isRequired: boolean;
  isUnique: boolean;
  validationRules?: ValidationRule[] | null;
  defaultValue?: any;
  sortOrder: number;
  isVisibleInListing: boolean;
  isVisibleInDetail: boolean;
  isComparable: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isLocalizable: boolean;
  helpText?: string | null;
  placeholder?: string | null;
  unit?: string | null;
  uiConfig?: Record<string, any> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeGroup {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  isCollapsible: boolean;
  isCollapsedByDefault: boolean;
  icon?: string | null;
  config?: Record<string, any> | null;
  attributes?: Attribute[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttributeDto {
  code: string;
  name: string;
  description?: string;
  type: AttributeType;
  groupId?: string;
  isRequired?: boolean;
  isUnique?: boolean;
  validationRules?: ValidationRule[];
  defaultValue?: any;
  sortOrder?: number;
  isVisibleInListing?: boolean;
  isVisibleInDetail?: boolean;
  isComparable?: boolean;
  isSearchable?: boolean;
  isFilterable?: boolean;
  isLocalizable?: boolean;
  helpText?: string;
  placeholder?: string;
  unit?: string;
  uiConfig?: Record<string, any>;
}

export interface UpdateAttributeDto extends Partial<CreateAttributeDto> {}

export interface AttributeQueryParams extends PaginationParams {
  search?: string;
  type?: AttributeType;
  groupId?: string;
  isFilterable?: boolean;
  isSearchable?: boolean;
  isRequired?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class AttributeService {
  private getAuthHeader() {
    const token = authService.getTokens().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Attributes CRUD
  async getAttributes(params?: AttributeQueryParams): Promise<CollectionResponse<Attribute>> {
    const response = await axios.get(`${API_URL}/attributes`, {
      headers: this.getAuthHeader(),
      params
    });

    // Handle wrapped response structure
    const data = response.data.data || response.data;
    return {
      items: data.items || [],
      meta: data.meta || {
        totalItems: 0,
        itemCount: 0,
        page: 1,
        totalPages: 1,
        itemsPerPage: 20
      }
    };
  }

  async getAttribute(id: string): Promise<Attribute> {
    const response = await axios.get(`${API_URL}/attributes/${id}`, {
      headers: this.getAuthHeader()
    });
    return response.data.data || response.data;
  }

  async createAttribute(data: CreateAttributeDto): Promise<ActionResponse<Attribute>> {
    const response = await axios.post(
      `${API_URL}/attributes`,
      data,
      { headers: this.getAuthHeader() }
    );
    
    const result = response.data.data || response.data;
    return {
      item: result.item,
      message: result.message || 'Attribute created successfully'
    };
  }

  async updateAttribute(id: string, data: UpdateAttributeDto): Promise<ActionResponse<Attribute>> {
    const response = await axios.patch(
      `${API_URL}/attributes/${id}`,
      data,
      { headers: this.getAuthHeader() }
    );
    
    const result = response.data.data || response.data;
    return {
      item: result.item,
      message: result.message || 'Attribute updated successfully'
    };
  }

  async deleteAttribute(id: string): Promise<ActionResponse<Attribute>> {
    const response = await axios.delete(
      `${API_URL}/attributes/${id}`,
      { headers: this.getAuthHeader() }
    );
    
    const result = response.data.data || response.data;
    return {
      item: result.item,
      message: result.message || 'Attribute deleted successfully'
    };
  }

  // Attribute Groups
  async getAttributeGroups(): Promise<CollectionResponse<AttributeGroup>> {
    const response = await axios.get(`${API_URL}/attributes/groups`, {
      headers: this.getAuthHeader()
    });

    const data = response.data.data || response.data;
    return {
      items: data.items || [],
      meta: data.meta || {
        totalItems: data.items?.length || 0,
        itemCount: data.items?.length || 0
      }
    };
  }

  async getAttributeGroup(id: string): Promise<AttributeGroup> {
    const response = await axios.get(`${API_URL}/attributes/groups/${id}`, {
      headers: this.getAuthHeader()
    });
    return response.data.data || response.data;
  }

  async createAttributeGroup(data: Partial<AttributeGroup>): Promise<ActionResponse<AttributeGroup>> {
    const response = await axios.post(
      `${API_URL}/attributes/groups`,
      data,
      { headers: this.getAuthHeader() }
    );
    
    const result = response.data.data || response.data;
    return {
      item: result.item,
      message: result.message || 'Attribute group created successfully'
    };
  }

  async updateAttributeGroup(id: string, data: Partial<AttributeGroup>): Promise<ActionResponse<AttributeGroup>> {
    const response = await axios.patch(
      `${API_URL}/attributes/groups/${id}`,
      data,
      { headers: this.getAuthHeader() }
    );
    
    const result = response.data.data || response.data;
    return {
      item: result.item,
      message: result.message || 'Attribute group updated successfully'
    };
  }

  async deleteAttributeGroup(id: string): Promise<ActionResponse<AttributeGroup>> {
    const response = await axios.delete(
      `${API_URL}/attributes/groups/${id}`,
      { headers: this.getAuthHeader() }
    );
    
    const result = response.data.data || response.data;
    return {
      item: result.item,
      message: result.message || 'Attribute group deleted successfully'
    };
  }

  // Attribute Options (for select/multiselect)
  async setAttributeOptions(attributeId: string, options: AttributeOption[]): Promise<ActionResponse<Attribute>> {
    const response = await axios.put(
      `${API_URL}/attributes/${attributeId}/options`,
      { options },
      { headers: this.getAuthHeader() }
    );
    
    const result = response.data.data || response.data;
    return {
      item: result.item,
      message: result.message || 'Attribute options updated successfully'
    };
  }

  // Helper methods
  getAttributeTypeLabel(type: AttributeType): string {
    const labels: Record<AttributeType, string> = {
      [AttributeType.TEXT]: 'Text',
      [AttributeType.NUMBER]: 'Number',
      [AttributeType.DECIMAL]: 'Decimal',
      [AttributeType.INTEGER]: 'Integer',
      [AttributeType.BOOLEAN]: 'Yes/No',
      [AttributeType.SELECT]: 'Select (Single)',
      [AttributeType.MULTISELECT]: 'Select (Multiple)',
      [AttributeType.DATE]: 'Date',
      [AttributeType.DATETIME]: 'Date & Time',
      [AttributeType.PRICE]: 'Price',
      [AttributeType.URL]: 'URL',
      [AttributeType.EMAIL]: 'Email',
      [AttributeType.JSON]: 'JSON'
    };
    return labels[type] || type;
  }

  getAttributeTypeIcon(type: AttributeType): string {
    const icons: Record<AttributeType, string> = {
      [AttributeType.TEXT]: '📝',
      [AttributeType.NUMBER]: '🔢',
      [AttributeType.DECIMAL]: '💯',
      [AttributeType.INTEGER]: '#️⃣',
      [AttributeType.BOOLEAN]: '✓',
      [AttributeType.SELECT]: '▼',
      [AttributeType.MULTISELECT]: '☑',
      [AttributeType.DATE]: '📅',
      [AttributeType.DATETIME]: '🕐',
      [AttributeType.PRICE]: '💰',
      [AttributeType.URL]: '🔗',
      [AttributeType.EMAIL]: '✉️',
      [AttributeType.JSON]: '{}'
    };
    return icons[type] || '📄';
  }

  generateAttributeCode(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_')      // Replace spaces with underscores
      .replace(/-+/g, '_')       // Replace hyphens with underscores
      .replace(/_+/g, '_');      // Replace multiple underscores with single
  }
}

export const attributeService = new AttributeService();
export default attributeService;