import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCategoriesDto {
  @ApiProperty({
    description: 'Array of category IDs to assign to the product',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true, message: 'Each category ID must be a valid UUID' })
  categoryIds: string[];
}

export class BulkAssignCategoriesDto {
  @ApiProperty({
    description: 'Array of product IDs to assign categories to',
    example: ['product-uuid-1', 'product-uuid-2'],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true, message: 'Each product ID must be a valid UUID' })
  productIds: string[];

  @ApiProperty({
    description: 'Array of category IDs to assign',
    example: ['category-uuid-1', 'category-uuid-2'],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true, message: 'Each category ID must be a valid UUID' })
  categoryIds: string[];

  @ApiProperty({
    description: 'Whether to replace existing categories or append to them',
    example: false,
    default: false,
  })
  replace?: boolean = false;
}
