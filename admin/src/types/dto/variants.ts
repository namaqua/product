// admin/src/types/dto/variants.ts

// ============ Enums ============

export enum SkuGenerationStrategy {
  SEQUENTIAL = 'sequential',
  PATTERN = 'pattern',
  CUSTOM = 'custom'
}

export enum PricingStrategy {
  FIXED = 'fixed',
  PERCENTAGE_INCREASE = 'percentage_increase',
  AXIS_BASED = 'axis_based',
  CUSTOM = 'custom'
}

export enum PriceAdjustmentType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  ABSOLUTE = 'absolute'
}

export enum BulkUpdateOperation {
  SET = 'set',
  INCREMENT = 'increment',
  DECREMENT = 'decrement',
  MULTIPLY = 'multiply'
}

// ============ DTOs ============

export interface CreateVariantGroupDto {
  parentId: string;
  variantAxes?: string[];
  variantAttributes?: string[];
  generateSku?: boolean;
  skuPattern?: string;
  inheritFields?: string[];
  combinations?: Record<string, string[]>;
}

export interface GenerateVariantsDto {
  combinations: Record<string, string[]>;
  skuStrategy?: SkuGenerationStrategy;
  skuPattern?: string;
  customSkus?: Record<string, string>;
  pricingStrategy?: PricingStrategy | string;
  basePrice?: number;
  pricingRules?: Array<{
    axis: string;
    value: string;
    adjustmentType: 'fixed' | 'percentage';
    adjustmentValue: number;
  }>;
  customPrices?: Record<string, number>;
  inventory?: {
    defaultQuantity?: number;
    manageStock?: boolean;
    lowStockThreshold?: number;
  };
  initialStatus?: string;
  inheritFields?: string[];
  defaultAttributes?: Record<string, any>;
  skipExisting?: boolean;
  isVisible?: boolean;
}

export interface UpdateVariantDto {
  sku?: string;
  name?: string;
  price?: number;
  specialPrice?: number;
  cost?: number;
  quantity?: number;
  status?: string;
  isVisible?: boolean;
  attributes?: Record<string, any>;
  variantAxes?: Record<string, any>;
  inheritedAttributes?: boolean;
  manageStock?: boolean;
  lowStockThreshold?: number;
  barcode?: string;
  weight?: number;
}

export interface BulkVariantUpdateDto {
  variantIds: string[];
  status?: string;
  isVisible?: boolean;
  priceAdjustment?: {
    type: PriceAdjustmentType | string;
    value: number;
  };
  costAdjustment?: {
    type: PriceAdjustmentType | string;
    value: number;
  };
  inventoryAdjustment?: {
    operation: BulkUpdateOperation | string;
    value: number;
  };
  manageStock?: boolean;
  lowStockThreshold?: number;
  attributes?: Record<string, any>;
  tags?: string[];
  inheritedAttributes?: boolean;
}

export interface VariantQueryDto {
  parentId?: string;
  variantGroupId?: string;
  variantAxes?: Record<string, any>;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ============ Response Types ============

export interface VariantSummaryDto {
  id: string;
  sku: string;
  name: string;
  variantAxes: Record<string, any>;
  price: number;
  quantity: number;
  status: string;
  isVisible: boolean;
  inStock: boolean;
  sortOrder: number;
}

export interface VariantGroupResponse {
  item: {
    parentId: string;
    parentSku: string;
    parentName: string;
    variantGroupId: string;
    variantAxes: string[];
    variantAttributes: string[];
    variantCount: number;
    availableValues: Record<string, string[]>;
    variants: VariantSummaryDto[];
    statistics: {
      totalQuantity: number;
      averagePrice: number;
      priceRange: {
        min: number;
        max: number;
      };
      inStockCount: number;
      outOfStockCount: number;
    };
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export interface VariantMatrixDto {
  parentId: string;
  axes: string[];
  axisValues: Record<string, string[]>;
  matrix: Array<{
    axes: Record<string, any>;
    id?: string;
    sku?: string;
    price?: number;
    quantity?: number;
    status?: string;
  }>;
  summary: {
    total: number;
    created: number;
    missing: number;
  };
}

export interface VariantMatrixResponse {
  item: VariantMatrixDto;
  message: string;
}

// ============ Helper Types ============

export interface VariantGenerationResult {
  created: number;
  skipped: number;
  variants: any[];
}

export interface VariantBulkUpdateResult {
  updated: number;
  results: any[];
}

export interface VariantGroupDissolveResult {
  affected: number;
}

export interface VariantInventorySyncResult {
  synced: number;
}