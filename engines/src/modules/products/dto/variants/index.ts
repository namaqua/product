// Main DTOs
export * from './create-variant-group.dto';
export * from './update-variant.dto';
export * from './bulk-variant-update.dto';
export * from './variant-group-response.dto';
export * from './variant-query.dto';
export * from './generate-variants.dto';
export * from './variant-matrix.dto';

// Import for type alias
import { VariantSummary } from './variant-group-response.dto';

// Type alias for backward compatibility
export type VariantSummaryDto = VariantSummary;

// Re-export specific classes
export { 
  VariantSummary,
  VariantStatistics,
  VariantAxisValue,
  VariantGroupResponseDto,
} from './variant-group-response.dto';

export {
  VariantMatrixDto,
  VariantMatrixCell,
} from './variant-matrix.dto';

export {
  PricingStrategy,
  InventoryStrategy,
  SkuGenerationStrategy,
  PriceAdjustmentType,
  BulkUpdateOperation,
  VariantCombination,
  PricingConfigDto,
  InventoryConfigDto,
  GenerateVariantsDto,
} from './generate-variants.dto';

export {
  BulkOperationType,
  InventoryOperation,
  PriceAdjustmentDto,
  CostAdjustmentDto,
  InventoryAdjustmentDto,
  BulkVariantUpdateDto,
} from './bulk-variant-update.dto';
