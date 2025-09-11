import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @Expose()
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Category name' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Category description' })
  description: string | null;

  // Nested Set Model fields
  @Expose()
  @ApiProperty({ description: 'Nested set left value' })
  left: number;

  @Expose()
  @ApiProperty({ description: 'Nested set right value' })
  right: number;

  @Expose()
  @ApiProperty({ description: 'Depth level in tree (0 = root)' })
  level: number;

  // Parent relationship
  @Expose()
  @ApiPropertyOptional({ description: 'Parent category ID' })
  parentId: string | null;

  // Display settings
  @Expose()
  @ApiProperty({ description: 'Sort order for display' })
  sortOrder: number;

  @Expose()
  @ApiProperty({ description: 'Whether category is visible' })
  isVisible: boolean;

  @Expose()
  @ApiProperty({ description: 'Whether to show in navigation menu' })
  showInMenu: boolean;

  @Expose()
  @ApiProperty({ description: 'Whether category is featured' })
  isFeatured: boolean;

  // SEO fields
  @Expose()
  @ApiPropertyOptional({ description: 'SEO meta title' })
  metaTitle: string | null;

  @Expose()
  @ApiPropertyOptional({ description: 'SEO meta description' })
  metaDescription: string | null;

  @Expose()
  @ApiPropertyOptional({ description: 'SEO meta keywords' })
  metaKeywords: string | null;

  // Images
  @Expose()
  @ApiPropertyOptional({ description: 'Category image URL' })
  imageUrl: string | null;

  @Expose()
  @ApiPropertyOptional({ description: 'Category banner URL' })
  bannerUrl: string | null;

  // Attributes
  @Expose()
  @ApiPropertyOptional({ description: 'Default attributes for products' })
  defaultAttributes: Record<string, any> | null;

  @Expose()
  @ApiPropertyOptional({ description: 'Required attributes for products' })
  requiredAttributes: string[] | null;

  // Statistics
  @Expose()
  @ApiProperty({ description: 'Number of direct products' })
  productCount: number;

  @Expose()
  @ApiProperty({ description: 'Total products including subcategories' })
  totalProductCount: number;

  // Metadata
  @Expose()
  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @Expose()
  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Created by user ID' })
  createdBy: string | null;

  @Expose()
  @ApiPropertyOptional({ description: 'Updated by user ID' })
  updatedBy: string | null;

  @Expose()
  @ApiProperty({ description: 'Version number' })
  version: number;

  // Optional relationships (populated when requested)
  @Expose()
  @ApiPropertyOptional({ 
    description: 'Ancestor categories (when includeAncestors=true)',
    type: [CategoryResponseDto],
  })
  @Type(() => CategoryResponseDto)
  ancestors?: CategoryResponseDto[];
}
