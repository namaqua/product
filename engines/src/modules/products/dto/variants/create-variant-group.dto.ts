import {
  IsString,
  IsArray,
  IsObject,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantGroupDto {
  @ApiProperty({
    description: 'Array of product IDs to include in the variant group',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  productIds: string[];

  @ApiProperty({
    description: 'Parent product ID for the variant group',
    example: 'parent-uuid',
  })
  @IsString()
  @IsNotEmpty()
  parentId: string;

  @ApiProperty({
    description: 'Attributes that define the variant axes',
    example: ['color', 'size', 'material'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  variantAxes: string[];

  @ApiPropertyOptional({
    description: 'Attributes that can vary between variants',
    example: ['sku', 'price', 'quantity', 'weight'],
    default: ['sku', 'price', 'quantity'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variantAttributes?: string[];

  @ApiPropertyOptional({
    description: 'Whether to generate SKUs automatically',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  generateSku?: boolean;

  @ApiPropertyOptional({
    description: 'Pattern for SKU generation',
    example: '{parent}-{color}-{size}',
    default: '{parent}-{variant}',
  })
  @IsString()
  @IsOptional()
  skuPattern?: string;

  @ApiPropertyOptional({
    description: 'Fields to inherit from parent',
    example: ['description', 'brand', 'category', 'metaTitle'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inheritFields?: string[];
}
