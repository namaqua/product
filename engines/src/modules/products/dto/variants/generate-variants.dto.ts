import {
  IsString,
  IsObject,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PricingStrategy {
  FIXED = 'fixed',
  PERCENTAGE_INCREASE = 'percentage_increase',
  TIERED = 'tiered',
  CUSTOM = 'custom',
}

export enum InventoryStrategy {
  SHARED = 'shared',
  DIVIDED = 'divided',
  CUSTOM = 'custom',
  DEFAULT = 'default',
}

export class PricingConfigDto {
  @ApiProperty({
    description: 'Pricing strategy for variants',
    enum: PricingStrategy,
    example: PricingStrategy.FIXED,
  })
  @IsEnum(PricingStrategy)
  strategy: PricingStrategy;

  @ApiPropertyOptional({
    description: 'Base price for all variants',
    example: 29.99,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  basePrice?: number;

  @ApiPropertyOptional({
    description: 'Percentage increase for each variant',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  percentageIncrease?: number;

  @ApiPropertyOptional({
    description: 'Custom pricing rules per combination',
    example: { 'Red-Large': 39.99, 'Blue-Small': 24.99 },
  })
  @IsObject()
  @IsOptional()
  customPricing?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Tiered pricing based on axes',
    example: { color: { Red: 5, Blue: 0 }, size: { XL: 10, S: -5 } },
  })
  @IsObject()
  @IsOptional()
  tieredPricing?: Record<string, Record<string, number>>;
}

export class InventoryConfigDto {
  @ApiProperty({
    description: 'Inventory management strategy',
    enum: InventoryStrategy,
    example: InventoryStrategy.DEFAULT,
  })
  @IsEnum(InventoryStrategy)
  strategy: InventoryStrategy;

  @ApiPropertyOptional({
    description: 'Default quantity for each variant',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  defaultQuantity?: number;

  @ApiPropertyOptional({
    description: 'Whether to manage stock',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  manageStock?: boolean;

  @ApiPropertyOptional({
    description: 'Custom quantities per combination',
    example: { 'Red-Large': 50, 'Blue-Small': 150 },
  })
  @IsObject()
  @IsOptional()
  customQuantities?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Low stock threshold',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  lowStockThreshold?: number;
}

export class VariantCombination {
  @ApiProperty({
    description: 'Axis name',
    example: 'color',
  })
  @IsString()
  @IsNotEmpty()
  axis: string;

  @ApiProperty({
    description: 'Possible values for this axis',
    example: ['Red', 'Blue', 'Green'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  values: string[];
}

export class GenerateVariantsDto {
  @ApiProperty({
    description: 'Parent product ID',
    example: 'parent-uuid',
  })
  @IsString()
  @IsNotEmpty()
  parentId: string;

  @ApiProperty({
    description: 'Variant combinations to generate',
    type: [VariantCombination],
  })
  @ValidateNested({ each: true })
  @Type(() => VariantCombination)
  @IsArray()
  @IsNotEmpty()
  combinations: VariantCombination[];

  @ApiPropertyOptional({
    description: 'Pricing configuration',
  })
  @ValidateNested()
  @Type(() => PricingConfigDto)
  @IsOptional()
  pricing?: PricingConfigDto;

  @ApiPropertyOptional({
    description: 'Inventory configuration',
  })
  @ValidateNested()
  @Type(() => InventoryConfigDto)
  @IsOptional()
  inventory?: InventoryConfigDto;

  @ApiPropertyOptional({
    description: 'SKU generation pattern',
    example: '{parent}-{color}-{size}',
    default: '{parent}-{variant}',
  })
  @IsString()
  @IsOptional()
  skuPattern?: string;

  @ApiPropertyOptional({
    description: 'Name generation pattern',
    example: '{parent} - {color} - {size}',
    default: '{parent} - {variant}',
  })
  @IsString()
  @IsOptional()
  namePattern?: string;

  @ApiPropertyOptional({
    description: 'Attributes to inherit from parent',
    example: ['description', 'brand', 'metaTitle'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inheritAttributes?: string[];

  @ApiPropertyOptional({
    description: 'Whether to publish variants immediately',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  publishImmediately?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to skip existing combinations',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  skipExisting?: boolean;

  @ApiPropertyOptional({
    description: 'Custom attributes for all generated variants',
    example: { source: 'auto-generated', version: '1.0' },
  })
  @IsObject()
  @IsOptional()
  customAttributes?: Record<string, any>;
}
