import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, Min, Max, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export enum SearchSortField {
  RELEVANCE = '_score',
  NAME = 'name.keyword',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  SKU = 'sku',
}

export class SearchQueryDto {
  @ApiPropertyOptional({
    description: 'Search query string',
    example: 'laptop',
  })
  @IsString()
  @IsOptional()
  query?: string;

  // Filters
  @ApiPropertyOptional({
    description: 'Filter by category IDs',
    example: ['uuid-1', 'uuid-2'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : value?.split(','))
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by brand',
    example: 'Apple',
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  priceMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 5000,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  priceMax?: number;

  @ApiPropertyOptional({
    description: 'Filter by product status',
    example: 'published',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by featured products',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by in-stock products',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  inStock?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by tags',
    example: ['electronics', 'portable'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : value?.split(','))
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Custom attribute filters as JSON',
    example: { color: 'blue', size: 'large' },
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  })
  attributes?: Record<string, any>;

  // Sorting
  @ApiPropertyOptional({
    description: 'Sort field',
    enum: SearchSortField,
    default: SearchSortField.RELEVANCE,
  })
  @IsEnum(SearchSortField)
  @IsOptional()
  sortBy?: SearchSortField = SearchSortField.RELEVANCE;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'desc';

  // Pagination
  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  // Advanced options
  @ApiPropertyOptional({
    description: 'Include facets in response',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeFacets?: boolean = false;

  @ApiPropertyOptional({
    description: 'Specific facets to include',
    example: ['categories', 'price', 'brand'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : value?.split(','))
  facets?: string[];

  @ApiPropertyOptional({
    description: 'Include search highlights',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeHighlights?: boolean = true;

  @ApiPropertyOptional({
    description: 'Fuzziness level for search',
    example: 'AUTO',
    enum: ['0', '1', '2', 'AUTO'],
    default: 'AUTO',
  })
  @IsString()
  @IsOptional()
  fuzziness?: string = 'AUTO';
}
