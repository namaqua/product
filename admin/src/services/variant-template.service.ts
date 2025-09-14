import api from './api';

export interface VariantTemplate {
  id: string;
  name: string;
  description?: string;
  axisName: string;
  values: string[];
  metadata?: {
    category?: string;
    icon?: string;
    color?: string;
    suggestedPricing?: {
      strategy?: 'fixed' | 'percentage' | 'tiered';
      adjustments?: Record<string, number>;
    };
  };
  isGlobal: boolean;
  isActive: boolean;
  usageCount: number;
  createdBy?: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantTemplateDto {
  name: string;
  description?: string;
  axisName: string;
  values: string[];
  metadata?: {
    category?: string;
    icon?: string;
    color?: string;
    suggestedPricing?: {
      strategy?: 'fixed' | 'percentage' | 'tiered';
      adjustments?: Record<string, number>;
    };
  };
  isGlobal?: boolean;
  isActive?: boolean;
}

export interface UpdateVariantTemplateDto extends Partial<CreateVariantTemplateDto> {}

class VariantTemplateService {
  /**
   * Create a new variant template
   */
  async create(dto: CreateVariantTemplateDto) {
    const response = await api.post('/variant-templates', dto);
    return response.data;
  }

  /**
   * Get all global templates (for unauthenticated users)
   */
  async getGlobalTemplates() {
    const response = await api.get('/variant-templates');
    return response.data;
  }

  /**
   * Get current user's templates and global templates
   */
  async getMyTemplates() {
    const response = await api.get('/variant-templates/my-templates');
    return response.data;
  }

  /**
   * Get all templates - will return user's + global if authenticated, only global if not
   */
  async getAll() {
    try {
      // Try to get user's templates (requires auth)
      return await this.getMyTemplates();
    } catch (error: any) {
      // If not authenticated, fall back to global templates only
      if (error.response?.status === 401) {
        return await this.getGlobalTemplates();
      }
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getById(id: string) {
    const response = await api.get(`/variant-templates/${id}`);
    return response.data;
  }

  /**
   * Update a template
   */
  async update(id: string, dto: UpdateVariantTemplateDto) {
    const response = await api.put(`/variant-templates/${id}`, dto);
    return response.data;
  }

  /**
   * Delete a template
   */
  async delete(id: string) {
    const response = await api.delete(`/variant-templates/${id}`);
    return response.data;
  }

  /**
   * Duplicate a template
   */
  async duplicate(id: string) {
    const response = await api.post(`/variant-templates/${id}/duplicate`);
    return response.data;
  }

  /**
   * Seed default templates (admin only)
   */
  async seedDefaults() {
    const response = await api.post('/variant-templates/seed-defaults');
    return response.data;
  }

  /**
   * Migrate templates from localStorage to database
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      // Get templates from localStorage
      const stored = localStorage.getItem('variantTemplates');
      if (!stored) return;

      const localTemplates = JSON.parse(stored);
      if (!Array.isArray(localTemplates) || localTemplates.length === 0) return;

      console.log(`Migrating ${localTemplates.length} templates from localStorage to database...`);

      // Create each template in the database
      const promises = localTemplates.map(template => 
        this.create({
          name: template.name,
          description: `Migrated from localStorage`,
          axisName: template.name,
          values: template.values,
          metadata: {
            category: 'custom',
            color: 'blue',
          },
          isGlobal: false,
          isActive: true,
        }).catch(err => {
          console.error(`Failed to migrate template ${template.name}:`, err);
          return null;
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r !== null).length;

      console.log(`Successfully migrated ${successCount} templates`);

      // Clear localStorage after successful migration
      if (successCount > 0) {
        localStorage.removeItem('variantTemplates');
        console.log('Cleared localStorage templates');
      }
    } catch (error) {
      console.error('Failed to migrate templates:', error);
    }
  }
}

export const variantTemplateService = new VariantTemplateService();
export default variantTemplateService;
