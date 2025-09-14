import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsObject,
  MaxLength,
  MinLength,
  ArrayMinSize,
} from 'class-validator';

export class CreateVariantTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Name of the variant axis (e.g., Size, Color)' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  axisName: string;

  @ApiProperty({ 
    description: 'Array of values for this axis',
    example: ['Small', 'Medium', 'Large']
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  values: string[];

  @ApiPropertyOptional({ 
    description: 'Additional metadata',
    example: {
      category: 'apparel',
      icon: 'size-icon',
      color: 'blue',
      suggestedPricing: {
        strategy: 'percentage',
        adjustments: { 'XL': 10, 'XXL': 15 }
      }
    }
  })
  @IsOptional()
  @IsObject()
  metadata?: {
    category?: string;
    icon?: string;
    color?: string;
    suggestedPricing?: {
      strategy?: 'fixed' | 'percentage' | 'tiered';
      adjustments?: Record<string, number>;
    };
  };

  @ApiPropertyOptional({ 
    description: 'Make template available to all users',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiPropertyOptional({ 
    description: 'Template is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateVariantTemplateDto extends PartialType(CreateVariantTemplateDto) {}

export class VariantTemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  axisName: string;

  @ApiProperty()
  values: string[];

  @ApiProperty({ required: false })
  metadata?: {
    category?: string;
    icon?: string;
    color?: string;
    suggestedPricing?: {
      strategy?: 'fixed' | 'percentage' | 'tiered';
      adjustments?: Record<string, number>;
    };
  };

  @ApiProperty()
  isGlobal: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  usageCount: number;

  @ApiProperty({ required: false })
  createdBy?: string;

  @ApiProperty({ required: false })
  creator?: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
