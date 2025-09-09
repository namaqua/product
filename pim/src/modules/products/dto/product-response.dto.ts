import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ProductType, ProductStatus } from '../entities/product.entity';

@Exclude()
export class ProductResponseDto {
  @Expose()
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Stock Keeping Unit' })
  sku: string;

  @Expose()
  @ApiProperty({ description: 'Product name' })
  name: string;

  @Expose()
  @ApiProperty({ enum: ProductType, description: 'Product type' })
  type: ProductType;

  @Expose()
  @ApiProperty({ enum: ProductStatus, description: 'Product status' })
  status: ProductStatus;

  @Expose()
  @ApiProperty({ description: 'Product description', required: false })
  description: string | null;

  @Expose()
  @ApiProperty({ description: 'Short description', required: false })
  shortDescription: string | null;

  // Pricing
  @Expose()
  @ApiProperty({ description: 'Product price', required: false })
  price: number | null;

  @Expose()
  @ApiProperty({ description: 'Cost of goods sold', required: false })
  cost: number | null;

  @Expose()
  @ApiProperty({ description: 'Special price', required: false })
  specialPrice: number | null;

  @Expose()
  @ApiProperty({ description: 'Effective price (calculated)' })
  effectivePrice: number | null;

  @Expose()
  @ApiProperty({ description: 'Is product on sale' })
  isOnSale: boolean;

  @Expose()
  @ApiProperty({ description: 'Special price start date', required: false })
  specialPriceFrom: Date | null;

  @Expose()
  @ApiProperty({ description: 'Special price end date', required: false })
  specialPriceTo: Date | null;

  // Inventory
  @Expose()
  @ApiProperty({ description: 'Stock quantity' })
  quantity: number;

  @Expose()
  @ApiProperty({ description: 'Manage stock flag' })
  manageStock: boolean;

  @Expose()
  @ApiProperty({ description: 'In stock flag' })
  inStock: boolean;

  @Expose()
  @ApiProperty({ description: 'Low stock threshold', required: false })
  lowStockThreshold: number | null;

  @Expose()
  @ApiProperty({ description: 'Is low stock' })
  isLowStock: boolean;

  // Physical attributes
  @Expose()
  @ApiProperty({ description: 'Weight in kg', required: false })
  weight: number | null;

  @Expose()
  @ApiProperty({ description: 'Length in cm', required: false })
  length: number | null;

  @Expose()
  @ApiProperty({ description: 'Width in cm', required: false })
  width: number | null;

  @Expose()
  @ApiProperty({ description: 'Height in cm', required: false })
  height: number | null;

  // SEO
  @Expose()
  @ApiProperty({ description: 'Meta title', required: false })
  metaTitle: string | null;

  @Expose()
  @ApiProperty({ description: 'Meta description', required: false })
  metaDescription: string | null;

  @Expose()
  @ApiProperty({ description: 'Meta keywords', required: false })
  metaKeywords: string | null;

  @Expose()
  @ApiProperty({ description: 'URL key', required: false })
  urlKey: string | null;

  // Relationships
  @Expose()
  @ApiProperty({ description: 'Parent product ID', required: false })
  parentId: string | null;

  @Expose()
  @ApiProperty({ description: 'Has variants' })
  hasVariants: boolean;

  @Expose()
  @ApiProperty({ description: 'Is variant' })
  isVariant: boolean;

  @Expose()
  @ApiProperty({ description: 'Variant products', type: [ProductResponseDto], required: false })
  @Type(() => ProductResponseDto)
  variants: ProductResponseDto[];

  // Additional data
  @Expose()
  @ApiProperty({ description: 'Custom attributes', required: false })
  attributes: Record<string, any> | null;

  @Expose()
  @ApiProperty({ description: 'Features list', required: false })
  features: string[] | null;

  @Expose()
  @ApiProperty({ description: 'Specifications', required: false })
  specifications: Record<string, any> | null;

  @Expose()
  @ApiProperty({ description: 'Tags', required: false })
  tags: string[] | null;

  @Expose()
  @ApiProperty({ description: 'Barcode', required: false })
  barcode: string | null;

  @Expose()
  @ApiProperty({ description: 'Manufacturer part number', required: false })
  mpn: string | null;

  @Expose()
  @ApiProperty({ description: 'Brand', required: false })
  brand: string | null;

  @Expose()
  @ApiProperty({ description: 'Manufacturer', required: false })
  manufacturer: string | null;

  // Visibility
  @Expose()
  @ApiProperty({ description: 'Is visible in catalog' })
  isVisible: boolean;

  @Expose()
  @ApiProperty({ description: 'Is featured' })
  isFeatured: boolean;

  @Expose()
  @ApiProperty({ description: 'Sort order' })
  sortOrder: number;

  @Expose()
  @ApiProperty({ description: 'Is available for sale' })
  isAvailable: boolean;

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
  @ApiProperty({ description: 'Created by user ID', required: false })
  createdBy: string | null;

  @Expose()
  @ApiProperty({ description: 'Updated by user ID', required: false })
  updatedBy: string | null;

  @Expose()
  @ApiProperty({ description: 'Version number' })
  version: number;
}
