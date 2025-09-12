import {
  IsString,
  IsArray,
  IsObject,
  IsOptional,
  IsEnum,
  IsNumber,
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
}

export enum BulkOperationType {
  UPDATE_STATUS = 'update_status',
  ADJUST_PRICE = 'adjust_price',
  UPDATE_STOCK = 'update_stock',
  SYNC_ATTRIBUTES = 'sync_attributes',
  UPDATE_VISIBILITY = 'update_visibility',
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
    description: 'Stock quantity for stock update',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  quantity?: number;

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
