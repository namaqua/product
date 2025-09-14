import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VariantSummary } from './variant-group-response.dto';

export class VariantMatrixCell {
  @ApiProperty({
    description: 'Variant data for this cell',
    required: false,
  })
  variant?: VariantSummary;

  @ApiProperty({
    description: 'Whether this combination exists',
    example: true,
  })
  exists: boolean;

  @ApiProperty({
    description: 'Cell coordinates in matrix',
    example: { row: 0, col: 0 },
  })
  coordinates: {
    row: number;
    col: number;
  };

  @ApiProperty({
    description: 'Combination values for this cell',
    example: { color: 'Red', size: 'Large' },
  })
  combination: Record<string, string>;
}

export class VariantMatrixDto {
  @ApiProperty({
    description: 'Parent product ID',
    example: 'parent-uuid',
  })
  parentId: string;

  @ApiProperty({
    description: 'Matrix axes',
    example: ['color', 'size'],
  })
  axes: string[];

  @ApiProperty({
    description: 'Available values for each axis',
    example: { color: ['Red', 'Blue'], size: ['S', 'M', 'L'] },
  })
  axisValues: Record<string, string[]>;

  @ApiProperty({
    description: 'Matrix data',
    type: [[Object]],
  })
  matrix: any[];

  @ApiProperty({
    description: 'Summary statistics',
    example: {
      total: 12,
      created: 8,
      missing: 4,
    },
  })
  summary: {
    total: number;
    created: number;
    missing: number;
  };

  // Alternative property names for flexibility
  @ApiPropertyOptional({
    description: 'Total possible combinations',
    example: 12,
  })
  totalCombinations?: number;

  @ApiPropertyOptional({
    description: 'Number of existing variants',
    example: 8,
  })
  existingCount?: number;

  @ApiPropertyOptional({
    description: 'Number of missing combinations',
    example: 4,
  })
  missingCount?: number;

  @ApiPropertyOptional({
    description: 'List of missing combinations',
    example: [
      { color: 'Red', size: 'XL' },
      { color: 'Blue', size: 'S' },
    ],
  })
  missingCombinations?: Record<string, string>[];

  @ApiPropertyOptional({
    description: 'Quick statistics',
    example: {
      averagePrice: 29.99,
      priceRange: { min: 19.99, max: 39.99 },
      totalStock: 500,
      outOfStock: 2,
    },
  })
  statistics?: {
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    totalStock: number;
    outOfStock: number;
  };
}
