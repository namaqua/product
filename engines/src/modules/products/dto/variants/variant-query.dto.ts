import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../../entities/product.entity';

export enum VariantSortBy {
  SKU = 'sku',
  NAME = 'name',
  PRICE = 'price',
  QUANTITY = 'quantity',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class VariantQueryDto {
  @ApiPropertyOptional({
    description: 'Parent product ID',
    example: 'parent-uuid',
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Variant group ID',
    example: 'group-uuid',
  })
  @IsString()
  @IsOptional()
  variantGroupId?: string;

  @ApiPropertyOptional({
    description: 'Search query for SKU or name',
    example: 'RED-L',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by product status',
    enum: ProductStatus,
    example: ProductStatus.PUBLISHED,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Filter by variant axes',
    example: { color: 'Red', size: 'Large' },
  })
  @IsObject()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  variantAxes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Filter by visibility',
    example: true,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by in stock status',
    example: true,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 10.00,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 100.00,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Include parent product in response',
    default: false,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  includeParent?: boolean;

  @ApiPropertyOptional({
    description: 'Include media in response',
    default: false,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  includeMedia?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: VariantSortBy,
    default: VariantSortBy.CREATED_AT,
  })
  @IsEnum(VariantSortBy)
  @IsOptional()
  sortBy?: VariantSortBy = VariantSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}
