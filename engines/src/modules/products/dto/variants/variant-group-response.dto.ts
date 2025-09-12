import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../entities/product.entity';

export class VariantStatistics {
  @ApiProperty({
    description: 'Total number of variants',
    example: 12,
  })
  total: number;

  @ApiProperty({
    description: 'Number of active variants',
    example: 10,
  })
  active: number;

  @ApiProperty({
    description: 'Number of published variants',
    example: 8,
  })
  published: number;

  @ApiProperty({
    description: 'Number of out of stock variants',
    example: 2,
  })
  outOfStock: number;

  @ApiProperty({
    description: 'Price range of variants',
    example: { min: 19.99, max: 39.99 },
  })
  priceRange: {
    min: number;
    max: number;
  };

  @ApiProperty({
    description: 'Total stock quantity across all variants',
    example: 1250,
  })
  totalStock: number;
}

export class VariantAxisValue {
  @ApiProperty({
    description: 'Axis name',
    example: 'color',
  })
  axis: string;

  @ApiProperty({
    description: 'Available values for this axis',
    example: ['Red', 'Blue', 'Green', 'Black'],
  })
  values: string[];
}

export class VariantSummary {
  @ApiProperty({
    description: 'Variant ID',
    example: 'variant-uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Variant SKU',
    example: 'PROD-001-RED-L',
  })
  sku: string;

  @ApiProperty({
    description: 'Variant name',
    example: 'Product Name - Red - Large',
  })
  name: string;

  @ApiProperty({
    description: 'Variant axes values',
    example: { color: 'Red', size: 'Large' },
  })
  variantAxes: Record<string, any>;

  @ApiProperty({
    description: 'Current price',
    example: 29.99,
  })
  price: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 50,
  })
  quantity: number;

  @ApiProperty({
    description: 'Product status',
    example: 'published',
  })
  status: string;

  @ApiProperty({
    description: 'Whether variant is visible',
    example: true,
  })
  isVisible: boolean;

  @ApiProperty({
    description: 'Media thumbnail URL',
    example: 'https://example.com/thumb.jpg',
    required: false,
  })
  thumbnail?: string;
}

export class VariantGroupResponseDto {
  @ApiProperty({
    description: 'Parent product information',
  })
  parent: Product;

  @ApiProperty({
    description: 'List of variants in the group',
    type: [VariantSummary],
  })
  variants: VariantSummary[];

  @ApiProperty({
    description: 'Variant axes configuration',
    type: [VariantAxisValue],
  })
  axes: VariantAxisValue[];

  @ApiProperty({
    description: 'Attributes that can vary',
    example: ['sku', 'price', 'quantity', 'weight'],
  })
  variantAttributes: string[];

  @ApiProperty({
    description: 'Variant group statistics',
  })
  statistics: VariantStatistics;

  @ApiProperty({
    description: 'Group ID',
    example: 'group-uuid',
  })
  variantGroupId: string;

  @ApiProperty({
    description: 'Timestamp when group was created',
    example: '2025-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when group was last updated',
    example: '2025-01-02T00:00:00Z',
  })
  updatedAt: Date;
}
