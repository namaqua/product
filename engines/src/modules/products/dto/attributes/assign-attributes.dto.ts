import { IsUUID, IsString, IsOptional, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Expose } from 'class-transformer';

export class AttributeAssignmentDto {
  @ApiProperty({ description: 'Attribute ID' })
  @IsUUID()
  @IsNotEmpty()
  attributeId: string;

  @ApiProperty({ 
    description: 'Attribute value',
    example: 'Red',
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'boolean' },
      { type: 'array' },
      { type: 'object' },
    ]
  })
  @IsNotEmpty()
  value: any;

  @ApiPropertyOptional({ description: 'Locale code', example: 'en' })
  @IsString()
  @IsOptional()
  locale?: string = 'en';
}

export class AssignProductAttributesDto {
  @ApiProperty({ 
    description: 'Attribute assignments',
    type: [AttributeAssignmentDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeAssignmentDto)
  attributes: AttributeAssignmentDto[];
}

export class BulkAssignProductAttributesDto {
  @ApiProperty({ 
    description: 'Product IDs to assign attributes to',
    type: [String]
  })
  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];

  @ApiProperty({ 
    description: 'Attribute assignments',
    type: [AttributeAssignmentDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeAssignmentDto)
  attributes: AttributeAssignmentDto[];
}

export class RemoveProductAttributeDto {
  @ApiProperty({ description: 'Attribute ID' })
  @IsUUID()
  @IsNotEmpty()
  attributeId: string;

  @ApiPropertyOptional({ description: 'Locale code', example: 'en' })
  @IsString()
  @IsOptional()
  locale?: string = 'en';
}

export class AssignProductAttributeGroupDto {
  @ApiProperty({ description: 'Attribute group ID' })
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ 
    description: 'Values for each attribute in the group',
    type: 'object',
    example: { color: 'Red', material: 'Cotton', size: 'L' }
  })
  @IsNotEmpty()
  values: Record<string, any>;

  @ApiPropertyOptional({ description: 'Locale code', example: 'en' })
  @IsString()
  @IsOptional()
  locale?: string = 'en';
}

export class ProductAttributesResponseDto {
  @ApiProperty({ description: 'Product ID' })
  @Expose()
  productId: string;

  @ApiProperty({ description: 'Product SKU' })
  @Expose()
  sku: string;

  @ApiProperty({ description: 'Product name' })
  @Expose()
  name: string;

  @ApiProperty({ 
    description: 'Assigned attributes grouped by attribute group',
    type: 'object'
  })
  @Expose()
  attributeGroups: Record<string, {
    groupName: string;
    attributes: Array<{
      id: string;
      code: string;
      name: string;
      value: any;
      displayValue: string;
      type: string;
      unit?: string;
    }>;
  }>;

  @ApiProperty({ 
    description: 'Ungrouped attributes',
    type: 'array'
  })
  @Expose()
  ungroupedAttributes: Array<{
    id: string;
    code: string;
    name: string;
    value: any;
    displayValue: string;
    type: string;
    unit?: string;
  }>;

  @ApiProperty({ description: 'Total number of assigned attributes' })
  @Expose()
  totalAttributes: number;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  lastUpdated: Date;

  /**
   * Create DTO from product and attribute data
   */
  static fromProductAndAttributes(
    product: any,
    attributeGroups: any,
    ungroupedAttributes: any[],
    totalAttributes: number,
  ): ProductAttributesResponseDto {
    const dto = new ProductAttributesResponseDto();
    dto.productId = product.id;
    dto.sku = product.sku;
    dto.name = product.name;
    dto.attributeGroups = attributeGroups;
    dto.ungroupedAttributes = ungroupedAttributes;
    dto.totalAttributes = totalAttributes;
    dto.lastUpdated = product.updatedAt;
    return dto;
  }
}

export class ValidateProductAttributesDto {
  @ApiProperty({ 
    description: 'Attribute assignments to validate',
    type: [AttributeAssignmentDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeAssignmentDto)
  attributes: AttributeAssignmentDto[];
}

export class ProductAttributeValidationResultDto {
  @ApiProperty({ description: 'Whether all attributes are valid' })
  @Expose()
  isValid: boolean;

  @ApiProperty({ 
    description: 'Validation errors by attribute',
    type: 'object'
  })
  @Expose()
  errors: Record<string, string[]>;

  @ApiProperty({ 
    description: 'Valid attributes',
    type: 'array'
  })
  @Expose()
  validAttributes: string[];

  @ApiProperty({ 
    description: 'Invalid attributes',
    type: 'array'
  })
  @Expose()
  invalidAttributes: string[];

  /**
   * Create validation result DTO
   */
  static create(
    validAttributes: string[],
    invalidAttributes: string[],
    errors: Record<string, string[]>,
  ): ProductAttributeValidationResultDto {
    const dto = new ProductAttributeValidationResultDto();
    dto.isValid = invalidAttributes.length === 0;
    dto.errors = errors;
    dto.validAttributes = validAttributes;
    dto.invalidAttributes = invalidAttributes;
    return dto;
  }
}
