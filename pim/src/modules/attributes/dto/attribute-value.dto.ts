import { IsUUID, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetAttributeValueDto {
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

export class BulkSetAttributeValuesDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ 
    description: 'Attribute values to set',
    type: [SetAttributeValueDto]
  })
  @IsNotEmpty()
  values: SetAttributeValueDto[];
}

export class AttributeValueResponseDto {
  id: string;
  productId: string;
  attributeId: string;
  attributeCode: string;
  attributeName: string;
  value: any;
  displayValue: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}
