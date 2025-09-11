import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  IsNumber,
  IsUUID,
  IsObject,
  ValidateNested,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeType, ValidationRule } from '../entities/attribute.entity';

export class CreateAttributeOptionDto {
  @ApiProperty({ description: 'Option value', example: 'red' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string;

  @ApiProperty({ description: 'Option display label', example: 'Red Color' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number = 0;

  @ApiPropertyOptional({ description: 'Color code', example: '#FF0000' })
  @IsString()
  @IsOptional()
  @MaxLength(7)
  color?: string;

  @ApiPropertyOptional({ description: 'Icon name', example: 'color-swatch' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ description: 'Is default option', example: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateAttributeDto {
  @ApiProperty({ description: 'Unique attribute code', example: 'product_color' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: 'Display name', example: 'Product Color' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Attribute description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Attribute data type',
    enum: AttributeType,
    example: AttributeType.SELECT 
  })
  @IsEnum(AttributeType)
  type: AttributeType;

  @ApiPropertyOptional({ description: 'Attribute group ID' })
  @IsUUID()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional({ 
    description: 'Options for select/multiselect types',
    type: [CreateAttributeOptionDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeOptionDto)
  @IsOptional()
  options?: CreateAttributeOptionDto[];

  @ApiPropertyOptional({ description: 'Is required', example: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = false;

  @ApiPropertyOptional({ description: 'Is unique', example: false })
  @IsBoolean()
  @IsOptional()
  isUnique?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Validation rules',
    example: [{ type: 'minLength', value: 3, message: 'Minimum 3 characters' }]
  })
  @IsArray()
  @IsOptional()
  validationRules?: ValidationRule[];

  @ApiPropertyOptional({ description: 'Default value' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  defaultValue?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number = 0;

  @ApiPropertyOptional({ description: 'Visible in listing', example: true })
  @IsBoolean()
  @IsOptional()
  isVisibleInListing?: boolean = true;

  @ApiPropertyOptional({ description: 'Visible in detail', example: true })
  @IsBoolean()
  @IsOptional()
  isVisibleInDetail?: boolean = true;

  @ApiPropertyOptional({ description: 'Is comparable', example: false })
  @IsBoolean()
  @IsOptional()
  isComparable?: boolean = false;

  @ApiPropertyOptional({ description: 'Is searchable', example: false })
  @IsBoolean()
  @IsOptional()
  isSearchable?: boolean = false;

  @ApiPropertyOptional({ description: 'Is filterable', example: false })
  @IsBoolean()
  @IsOptional()
  isFilterable?: boolean = false;

  @ApiPropertyOptional({ description: 'Is localizable', example: false })
  @IsBoolean()
  @IsOptional()
  isLocalizable?: boolean = false;

  @ApiPropertyOptional({ description: 'Help text' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  helpText?: string;

  @ApiPropertyOptional({ description: 'Placeholder text' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  placeholder?: string;

  @ApiPropertyOptional({ description: 'Unit of measurement', example: 'kg' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  unit?: string;

  @ApiPropertyOptional({ description: 'UI configuration' })
  @IsObject()
  @IsOptional()
  uiConfig?: Record<string, any>;
}
