import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
  Length,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType, ProductStatus } from '../entities/product.entity';
import { RelationshipType } from '../entities/product-relationship.entity';
import { MediaType } from '../entities/product-media.entity';

// Locale DTO
export class ProductLocaleDto {
  @IsString()
  @Length(2, 10)
  localeCode: string;

  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  urlKey?: string;

  @IsObject()
  @IsOptional()
  features?: Record<string, any>;

  @IsObject()
  @IsOptional()
  specifications?: Record<string, any>;
}

// Attribute DTO
export class ProductAttributeDto {
  @IsString()
  @Length(1, 100)
  attributeCode: string;

  @IsOptional()
  valueText?: string;

  @IsNumber()
  @IsOptional()
  valueNumber?: number;

  @IsBoolean()
  @IsOptional()
  valueBoolean?: boolean;

  @IsString()
  @IsOptional()
  valueDate?: string;

  @IsString()
  @IsOptional()
  valueDatetime?: string;

  @IsObject()
  @IsOptional()
  valueJson?: Record<string, any>;

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  valueOptions?: string[];

  @IsString()
  @IsOptional()
  @Length(2, 10)
  localeCode?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  channelCode?: string;
}

// Media DTO
export class ProductMediaDto {
  @IsString()
  url: string;

  @IsEnum(MediaType)
  @IsOptional()
  mediaType?: MediaType;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsString()
  @IsOptional()
  @Length(2, 10)
  localeCode?: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  title?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}

// Variant DTO
export class ProductVariantDto {
  @IsUUID()
  variantProductId: string;

  @IsObject()
  variantAttributes: Record<string, any>;

  @IsNumber()
  @IsOptional()
  priceModifier?: number;

  @IsNumber()
  @IsOptional()
  weightModifier?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}

// Bundle Item DTO
export class BundleItemDto {
  @IsUUID()
  componentProductId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}

// Relationship DTO
export class ProductRelationshipDto {
  @IsUUID()
  targetProductId: string;

  @IsEnum(RelationshipType)
  relationshipType: RelationshipType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}

// Create Product DTO
export class CreateProductDto {
  @IsString()
  @Length(1, 100)
  sku: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  // Inventory
  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @IsBoolean()
  @IsOptional()
  trackInventory?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minQuantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxQuantity?: number;

  // Pricing
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  comparePrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  // Physical properties
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  weightUnit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  length?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  width?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  dimensionUnit?: string;

  // Visibility
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;

  // Metadata
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  // Related data
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductLocaleDto)
  locales?: ProductLocaleDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  media?: ProductMediaDto[];

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  bundleItems?: BundleItemDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductRelationshipDto)
  relationships?: ProductRelationshipDto[];
}

// Update Product DTO
export class UpdateProductDto {
  @IsString()
  @Length(1, 100)
  @IsOptional()
  sku?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  // Inventory
  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @IsBoolean()
  @IsOptional()
  trackInventory?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minQuantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxQuantity?: number;

  // Pricing
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  comparePrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  // Physical properties
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  weightUnit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  length?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  width?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  dimensionUnit?: string;

  // Visibility
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;

  // Metadata
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  // Related data
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductLocaleDto)
  locales?: ProductLocaleDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  media?: ProductMediaDto[];

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
