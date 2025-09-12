// admin/src/services/variant.service.ts
import api from './api';
import { 
  CreateVariantGroupDto, 
  UpdateVariantDto, 
  BulkVariantUpdateDto, 
  GenerateVariantsDto,
  VariantGroupResponse,
  VariantMatrixResponse,
  VariantQueryDto 
} from '../types/dto/variants';
import { Product } from '../types/dto/products';

class VariantService {
  private baseUrl = '/products';

  // ============ Variant Group Management ============
  
  /**
   * Create a variant group for a configurable product
   */
  async createVariantGroup(parentId: string, data: Omit<CreateVariantGroupDto, 'parentId'>) {
    const response = await api.post(`${this.baseUrl}/${parentId}/variants/group`, data);
    return response.data;
  }

  /**
   * Get variant group information including all variants
   */
  async getVariantGroup(parentId: string): Promise<VariantGroupResponse> {
    const response = await api.get(`${this.baseUrl}/${parentId}/variants`);
    return response.data;
  }

  /**
   * Dissolve a variant group (converts variants to standalone products)
   */
  async dissolveVariantGroup(parentId: string) {
    const response = await api.delete(`${this.baseUrl}/${parentId}/variants/group`);
    return response.data;
  }

  // ============ Variant Generation & Management ============
  
  /**
   * Generate variants from combinations
   */
  async generateVariants(parentId: string, data: GenerateVariantsDto) {
    const response = await api.post(`${this.baseUrl}/${parentId}/variants/generate`, data);
    return response.data;
  }

  /**
   * Update a single variant
   */
  async updateVariant(variantId: string, data: UpdateVariantDto) {
    const response = await api.put(`${this.baseUrl}/variants/${variantId}`, data);
    return response.data;
  }

  /**
   * Bulk update multiple variants
   */
  async bulkUpdateVariants(data: BulkVariantUpdateDto) {
    const response = await api.put(`${this.baseUrl}/variants/bulk`, data);
    return response.data;
  }

  /**
   * Sync variant inventory with parent product
   */
  async syncVariantInventory(parentId: string) {
    const response = await api.post(`${this.baseUrl}/${parentId}/variants/sync`);
    return response.data;
  }

  // ============ Variant Search & Display ============
  
  /**
   * Search variants across all products
   */
  async searchVariants(query: VariantQueryDto) {
    const response = await api.get(`${this.baseUrl}/variants/search`, { params: query });
    return response.data;
  }

  /**
   * Get variant matrix view for a product
   */
  async getVariantMatrix(parentId: string): Promise<VariantMatrixResponse> {
    const response = await api.get(`${this.baseUrl}/${parentId}/variants/matrix`);
    return response.data;
  }

  // ============ Quick Generation Templates ============
  
  /**
   * Generate variants from a predefined template
   */
  async generateFromTemplate(
    parentId: string, 
    template: 'sizes' | 'colors' | 'storage' | 'memory',
    options?: {
      pricing?: 'fixed' | 'percentage' | 'axis-based';
      basePrice?: number;
      inheritFields?: string[];
    }
  ) {
    const templates = {
      sizes: {
        axes: ['size'],
        values: {
          size: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
        }
      },
      colors: {
        axes: ['color'],
        values: {
          color: ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Navy']
        }
      },
      storage: {
        axes: ['storage'],
        values: {
          storage: ['128GB', '256GB', '512GB', '1TB', '2TB']
        }
      },
      memory: {
        axes: ['memory'],
        values: {
          memory: ['8GB', '16GB', '32GB', '64GB']
        }
      }
    };

    const templateConfig = templates[template];
    const generateDto: GenerateVariantsDto = {
      combinations: templateConfig.values,
      pricingStrategy: options?.pricing || 'fixed',
      basePrice: options?.basePrice,
      inheritFields: options?.inheritFields || ['description', 'brand', 'manufacturer'],
      skuStrategy: 'pattern',
      skuPattern: '{parent}-{axes}',
      skipExisting: true,
      initialStatus: 'draft',
      isVisible: true,
      inventory: {
        defaultQuantity: 0,
        manageStock: true
      }
    };

    return this.generateVariants(parentId, generateDto);
  }

  /**
   * Generate multi-axis variants (e.g., Size + Color combinations)
   */
  async generateMultiAxisVariants(
    parentId: string,
    axes: Record<string, string[]>,
    options?: {
      pricing?: Record<string, number>; // Price adjustments per combination
      inventory?: Record<string, number>; // Stock levels per combination
      skipExisting?: boolean;
    }
  ) {
    const generateDto: GenerateVariantsDto = {
      combinations: axes,
      pricingStrategy: options?.pricing ? 'custom' : 'fixed',
      customPrices: options?.pricing,
      skipExisting: options?.skipExisting ?? true,
      initialStatus: 'draft',
      skuStrategy: 'pattern',
      skuPattern: '{parent}-{axes}',
      inheritFields: ['description', 'brand', 'manufacturer'],
      inventory: {
        defaultQuantity: 0,
        manageStock: true
      }
    };

    return this.generateVariants(parentId, generateDto);
  }

  // ============ Pricing & Inventory Utilities ============
  
  /**
   * Apply bulk price adjustment to variants
   */
  async adjustVariantPrices(
    variantIds: string[],
    adjustment: {
      type: 'fixed' | 'percentage' | 'absolute';
      value: number;
    }
  ) {
    const data: BulkVariantUpdateDto = {
      variantIds,
      priceAdjustment: adjustment
    };
    
    return this.bulkUpdateVariants(data);
  }

  /**
   * Update variant inventory levels
   */
  async updateVariantInventory(
    variantIds: string[],
    operation: 'set' | 'increment' | 'decrement',
    value: number
  ) {
    const data: BulkVariantUpdateDto = {
      variantIds,
      inventoryAdjustment: {
        operation,
        value
      }
    };
    
    return this.bulkUpdateVariants(data);
  }

  /**
   * Calculate variant statistics
   */
  async getVariantStatistics(parentId: string) {
    const group = await this.getVariantGroup(parentId);
    
    return {
      totalVariants: group.variantCount,
      totalQuantity: group.statistics.totalQuantity,
      averagePrice: group.statistics.averagePrice,
      priceRange: group.statistics.priceRange,
      inStockCount: group.statistics.inStockCount,
      outOfStockCount: group.statistics.outOfStockCount,
      availableAxes: group.variantAxes,
      availableValues: group.availableValues
    };
  }

  // ============ Validation & Helpers ============
  
  /**
   * Validate variant combination uniqueness
   */
  async validateCombination(
    parentId: string,
    combination: Record<string, any>
  ): Promise<boolean> {
    try {
      const variants = await this.searchVariants({
        parentId,
        variantAxes: combination
      });
      return variants.items.length === 0;
    } catch {
      return true; // Assume valid if check fails
    }
  }

  /**
   * Generate SKU for a variant
   */
  generateVariantSku(
    parentSku: string,
    combination: Record<string, any>,
    pattern = '{parent}-{axes}'
  ): string {
    let sku = pattern.replace('{parent}', parentSku);
    
    const axesString = Object.entries(combination)
      .map(([key, value]) => String(value).toUpperCase())
      .join('-');
    
    sku = sku.replace('{axes}', axesString);
    
    // Replace individual axis placeholders
    Object.entries(combination).forEach(([key, value]) => {
      sku = sku.replace(`{${key}}`, String(value).toUpperCase());
    });
    
    return sku.replace(/\s+/g, '-');
  }

  /**
   * Calculate price based on variant attributes
   */
  calculateVariantPrice(
    basePrice: number,
    combination: Record<string, any>,
    rules?: Array<{
      axis: string;
      value: string;
      adjustmentType: 'fixed' | 'percentage';
      adjustmentValue: number;
    }>
  ): number {
    if (!rules || rules.length === 0) {
      return basePrice;
    }

    let price = basePrice;
    
    rules.forEach(rule => {
      if (combination[rule.axis] === rule.value) {
        if (rule.adjustmentType === 'percentage') {
          price *= (1 + rule.adjustmentValue / 100);
        } else {
          price += rule.adjustmentValue;
        }
      }
    });
    
    return Math.round(price * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get variant display label
   */
  getVariantLabel(variant: Product): string {
    if (!variant.variantAxes) {
      return variant.name;
    }
    
    const label = Object.entries(variant.variantAxes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    return label || variant.name;
  }
}

export default new VariantService();