import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsDateString,
  MaxLength,
  MinLength,
  Min,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType, ProductStatus } from '../entities/product.entity';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'Stock Keeping Unit - unique product identifier',
    example: 'PROD-001',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  sku: string;

  @ApiProperty({
    description: 'Product name/title',
    example: 'Premium Wireless Headphones',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    enum: ProductType,
    default: ProductType.SIMPLE,
    description: 'Product type classification',
  })
  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType = ProductType.SIMPLE;

  @ApiPropertyOptional({
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
    description: 'Current workflow status',
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.DRAFT;

  @ApiPropertyOptional({
    description: 'Detailed product description',
    example: 'High-quality wireless headphones with noise cancellation...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Short product description for listings',
    example: 'Premium wireless headphones with 30-hour battery life',
  })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  // Pricing
  @ApiPropertyOptional({
    description: 'Base product price',
    example: 199.99,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    description: 'Cost of goods sold',
    example: 75.00,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  cost?: number;

  @ApiPropertyOptional({
    description: 'Special/sale price',
    example: 149.99,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  specialPrice?: number;

  @ApiPropertyOptional({
    description: 'Special price start date',
    example: '2025-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  specialPriceFrom?: string;

  @ApiPropertyOptional({
    description: 'Special price end date',
    example: '2025-01-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  specialPriceTo?: string;

  // Inventory
  @ApiPropertyOptional({
    description: 'Current stock quantity',
    example: 100,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  quantity?: number = 0;

  @ApiPropertyOptional({
    description: 'Whether stock is tracked for this product',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  manageStock?: boolean = true;

  @ApiPropertyOptional({
    description: 'Minimum quantity for low stock alerts',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  lowStockThreshold?: number;

  // Physical attributes
  @ApiPropertyOptional({
    description: 'Product weight in kg',
    example: 0.5,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product length in cm',
    example: 20,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  length?: number;

  @ApiPropertyOptional({
    description: 'Product width in cm',
    example: 15,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  width?: number;

  @ApiPropertyOptional({
    description: 'Product height in cm',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  height?: number;

  // SEO
  @ApiPropertyOptional({
    description: 'SEO meta title',
    example: 'Premium Wireless Headphones | Best Sound Quality',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO meta description',
    example: 'Experience premium sound quality with our wireless headphones...',
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'SEO meta keywords',
    example: 'wireless headphones, bluetooth, noise cancellation',
  })
  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @ApiPropertyOptional({
    description: 'URL slug for product page',
    example: 'premium-wireless-headphones',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  urlKey?: string;

  // Parent relationship
  @ApiPropertyOptional({
    description: 'Parent product ID for variants',
    example: 'uuid-of-parent-product',
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  // Additional data
  @ApiPropertyOptional({
    description: 'Custom attributes as JSON',
    example: { color: 'black', material: 'plastic' },
  })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Product features list',
    example: ['Noise Cancellation', '30-hour battery', 'Bluetooth 5.0'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({
    description: 'Product specifications',
    example: { battery: '30 hours', connectivity: 'Bluetooth 5.0' },
  })
  @IsObject()
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Product tags for categorization',
    example: ['electronics', 'audio', 'wireless'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Product barcode (EAN/UPC)',
    example: '1234567890123',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Manufacturer part number',
    example: 'WH-1000XM4',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  mpn?: string;

  @ApiPropertyOptional({
    description: 'Product brand name',
    example: 'Sony',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  brand?: string;

  @ApiPropertyOptional({
    description: 'Product manufacturer',
    example: 'Sony Corporation',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  manufacturer?: string;

  // Visibility
  @ApiPropertyOptional({
    description: 'Whether product is visible in catalog',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean = true;

  @ApiPropertyOptional({
    description: 'Whether product is featured',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

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

  // Category associations
  @ApiPropertyOptional({
    description: 'Category IDs to assign to the product',
    example: ['uuid-1', 'uuid-2'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
