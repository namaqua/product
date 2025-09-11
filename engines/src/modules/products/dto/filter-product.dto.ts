import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  IsUUID,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType, ProductStatus } from '../entities/product.entity';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  SKU = 'sku',
  PRICE = 'price',
  QUANTITY = 'quantity',
  SORT_ORDER = 'sortOrder',
}

export class FilterProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  @IsEnum(ProductStatus, { each: true })
  statuses?: ProductStatus[];

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minQuantity?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  localeCode?: string;

  // Pagination
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // Sorting
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  // Include relations
  @IsOptional()
  @IsBoolean()
  includeLocales?: boolean;

  @IsOptional()
  @IsBoolean()
  includeAttributes?: boolean;

  @IsOptional()
  @IsBoolean()
  includeMedia?: boolean;

  @IsOptional()
  @IsBoolean()
  includeCategories?: boolean;

  @IsOptional()
  @IsBoolean()
  includeVariants?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRelationships?: boolean;
}

export class BulkOperationDto {
  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];
}

export class BulkUpdateStatusDto extends BulkOperationDto {
  @IsEnum(ProductStatus)
  status: ProductStatus;
}

export class BulkUpdateVisibilityDto extends BulkOperationDto {
  @IsBoolean()
  isVisible: boolean;
}

export class ImportProductDto {
  @IsString()
  format: 'csv' | 'json' | 'xml';

  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsObject()
  mappingConfig?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean;

  @IsOptional()
  @IsBoolean()
  skipValidation?: boolean;
}

export class ExportProductDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  productIds?: string[];

  @IsOptional()
  @Type(() => FilterProductDto)
  filters?: FilterProductDto;

  @IsString()
  format: 'csv' | 'json' | 'xml';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @IsOptional()
  @IsBoolean()
  includeLocales?: boolean;

  @IsOptional()
  @IsBoolean()
  includeAttributes?: boolean;

  @IsOptional()
  @IsBoolean()
  includeMedia?: boolean;
}
