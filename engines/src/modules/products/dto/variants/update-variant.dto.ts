import {
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../../entities/product.entity';

export class UpdateVariantDto {
  @ApiPropertyOptional({
    description: 'Variant SKU',
    example: 'PROD-001-RED-L',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Variant name',
    example: 'Product Name - Red - Large',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Variant price',
    example: 29.99,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Special price',
    example: 24.99,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  specialPrice?: number;

  @ApiPropertyOptional({
    description: 'Cost of goods sold',
    example: 15.00,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({
    description: 'Stock quantity',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Product status',
    enum: ProductStatus,
    example: ProductStatus.PUBLISHED,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

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
    description: 'Variant axes values',
    example: { color: 'Red', size: 'Large' },
  })
  @IsObject()
  @IsOptional()
  variantAxes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether to inherit attributes from parent',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  inheritedAttributes?: boolean;

  @ApiPropertyOptional({
    description: 'Custom attributes',
    example: { customField1: 'value1', customField2: 'value2' },
  })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Product weight in kg',
    example: 1.5,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Barcode',
    example: '1234567890123',
  })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Whether product is visible',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Whether product is featured',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Media IDs to associate with variant',
    example: ['media-id-1', 'media-id-2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaIds?: string[];
}
