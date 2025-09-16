import { IsOptional, IsString, IsUUID, IsNumber, IsBoolean, IsArray, IsEnum, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

/**
 * Product Query DTO - Compliant with PIM API Standards
 * Extends BaseQueryDto for standard pagination and sorting
 */
export class ProductQueryDto extends BaseQueryDto {
  
  // ========== Product Identification Filters ==========
  
  @ApiPropertyOptional({ description: 'Filter by SKU' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  sku?: string;

  @ApiPropertyOptional({ description: 'Filter by product type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by parent product ID' })
  @IsOptional()
  @IsUUID('4')
  parentId?: string;

  // ========== Brand/Manufacturer Filters ==========

  @ApiPropertyOptional({ description: 'Filter by brand' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  brand?: string;

  @ApiPropertyOptional({ description: 'Filter by manufacturer' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  manufacturer?: string;

  // ========== Status Filters ==========

  @ApiPropertyOptional({ 
    description: 'Filter by product status',
    enum: ['draft', 'published', 'archived']
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by visibility status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Filter by featured status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isFeatured?: boolean;

  // ========== Inventory Filters ==========

  @ApiPropertyOptional({ description: 'Filter by stock availability' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ description: 'Filter by low stock status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  lowStock?: boolean;

  // ========== Price Filters ==========

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // ========== Category Filters (Supporting both single and multiple) ==========

  @ApiPropertyOptional({ description: 'Filter by single category ID' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by multiple category IDs',
    type: [String],
    isArray: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle comma-separated string
    if (typeof value === 'string') {
      return value.split(',').map(id => id.trim()).filter(id => id);
    }
    // Handle array
    if (Array.isArray(value)) {
      return value.map(id => id.trim()).filter(id => id);
    }
    return [];
  })
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  // ========== Tag Filters ==========

  @ApiPropertyOptional({ 
    description: 'Filter by tags',
    type: [String],
    isArray: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // ========== Include Options ==========

  @ApiPropertyOptional({ description: 'Include deleted items' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean = false;

  @ApiPropertyOptional({ description: 'Include product variants' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeVariants?: boolean = false;

  @ApiPropertyOptional({ description: 'Include product categories' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeCategories?: boolean = false;

  @ApiPropertyOptional({ description: 'Include product attributes' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeAttributes?: boolean = false;

  @ApiPropertyOptional({ description: 'Include product media' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeMedia?: boolean = false;

  // ========== Helper Methods ==========

  /**
   * Get combined category filters (both single and multiple)
   */
  getCategoryFilters(): string[] {
    const filters: string[] = [];
    
    if (this.categoryId) {
      filters.push(this.categoryId);
    }
    
    if (this.categoryIds && this.categoryIds.length > 0) {
      filters.push(...this.categoryIds);
    }
    
    // Remove duplicates
    return [...new Set(filters)];
  }

  /**
   * Check if price range filter is applied
   */
  hasPriceRange(): boolean {
    return this.minPrice !== undefined || this.maxPrice !== undefined;
  }
}
