import {
  IsString,
  IsArray,
  IsObject,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../../entities/product.entity';

export enum PriceAdjustmentType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  OVERRIDE = 'override',
  ABSOLUTE = 'absolute',
}

export enum BulkOperationType {
  UPDATE_STATUS = 'update_status',
  ADJUST_PRICE = 'adjust_price',
  UPDATE_STOCK = 'update_stock',
  SYNC_ATTRIBUTES = 'sync_attributes',
  UPDATE_VISIBILITY = 'update_visibility',
}

export enum InventoryOperation {
  ADD = 'add',
  SUBTRACT = 'subtract',
  SET = 'set',
}

export class PriceAdjustmentDto {
  @ApiProperty({
    description: 'Type of price adjustment',
    enum: PriceAdjustmentType,
    example: PriceAdjustmentType.PERCENTAGE,
  })
  @IsEnum(PriceAdjustmentType)
  type: PriceAdjustmentType;

  @ApiProperty({
    description: 'Adjustment value (percentage or fixed amount)',
    example: 10,
  })
  @IsNumber()
  @Type(() => Number)
  value: number;
}

export class CostAdjustmentDto {
  @ApiProperty({
    description: 'Type of cost adjustment',
    enum: PriceAdjustmentType,
    example: PriceAdjustmentType.PERCENTAGE,
  })
  @IsEnum(PriceAdjustmentType)
  type: PriceAdjustmentType;

  @ApiProperty({
    description: 'Adjustment value (percentage or fixed amount)',
    example: 5,
  })
  @IsNumber()
  @Type(() => Number)
  value: number;
}

export class InventoryAdjustmentDto {
  @ApiProperty({
    description: 'Inventory operation type',
    enum: InventoryOperation,
    example: InventoryOperation.ADD,
  })
  @IsEnum(InventoryOperation)
  operation: InventoryOperation;

  @ApiProperty({
    description: 'Value to adjust inventory by',
    example: 50,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value: number;
}

export class BulkVariantUpdateDto {
  @ApiProperty({
    description: 'Array of variant IDs to update',
    example: ['variant-1', 'variant-2', 'variant-3'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  variantIds: string[];

  @ApiProperty({
    description: 'Type of bulk operation',
    enum: BulkOperationType,
    example: BulkOperationType.ADJUST_PRICE,
  })
  @IsEnum(BulkOperationType)
  operation: BulkOperationType;

  @ApiPropertyOptional({
    description: 'Product status for status update',
    enum: ProductStatus,
    example: ProductStatus.PUBLISHED,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Price adjustment configuration',
  })
  @ValidateNested()
  @Type(() => PriceAdjustmentDto)
  @IsOptional()
  priceAdjustment?: PriceAdjustmentDto;

  @ApiPropertyOptional({
    description: 'Cost adjustment configuration',
  })
  @ValidateNested()
  @Type(() => CostAdjustmentDto)
  @IsOptional()
  costAdjustment?: CostAdjustmentDto;

  @ApiPropertyOptional({
    description: 'Inventory adjustment configuration',
  })
  @ValidateNested()
  @Type(() => InventoryAdjustmentDto)
  @IsOptional()
  inventoryAdjustment?: InventoryAdjustmentDto;

  @ApiPropertyOptional({
    description: 'Stock quantity for stock update',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Whether variant is visible',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to manage stock',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  manageStock?: boolean;

  @ApiPropertyOptional({
    description: 'Low stock threshold',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  lowStockThreshold?: number;

  @ApiPropertyOptional({
    description: 'Attributes to update',
    example: { brand: 'NewBrand', material: 'Cotton' },
  })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Tags to set',
    example: ['new-arrival', 'sale'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether to inherit attributes from parent',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  inheritedAttributes?: boolean;

  @ApiPropertyOptional({
    description: 'Visibility settings',
    example: { isVisible: true, isFeatured: false },
  })
  @IsObject()
  @IsOptional()
  visibility?: {
    isVisible?: boolean;
    isFeatured?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Attributes to sync from parent',
    example: ['description', 'metaTitle', 'metaDescription'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  syncAttributes?: string[];

  @ApiPropertyOptional({
    description: 'Generic updates to apply to all variants',
    example: { brand: 'NewBrand', manufacturer: 'NewManufacturer' },
  })
  @IsObject()
  @IsOptional()
  updates?: Record<string, any>;
}
