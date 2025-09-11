import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsObject,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated if not provided)',
    example: 'electronics',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Electronic devices and accessories',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID (null for root categories)',
    example: 'uuid-of-parent-category',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  // Display settings
  @ApiPropertyOptional({
    description: 'Sort order for display',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number = 0;

  @ApiPropertyOptional({
    description: 'Whether category is visible',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean = true;

  @ApiPropertyOptional({
    description: 'Whether to show in navigation menu',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  showInMenu?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether category is featured',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  // SEO fields
  @ApiPropertyOptional({
    description: 'SEO meta title',
    example: 'Electronics - Best Electronic Devices',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO meta description',
    example: 'Shop the best electronic devices and accessories...',
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'SEO meta keywords',
    example: 'electronics, devices, gadgets, technology',
  })
  @IsString()
  @IsOptional()
  metaKeywords?: string;

  // Images
  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/images/electronics.jpg',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Category banner URL',
    example: 'https://example.com/images/electronics-banner.jpg',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bannerUrl?: string;

  // Attributes
  @ApiPropertyOptional({
    description: 'Default attributes for products in this category',
    example: { warranty: '1 year', returnable: true },
  })
  @IsObject()
  @IsOptional()
  defaultAttributes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Required attributes for products in this category',
    example: ['voltage', 'power_consumption'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredAttributes?: string[];
}
