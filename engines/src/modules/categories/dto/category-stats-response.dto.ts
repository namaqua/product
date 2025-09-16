import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * Category Statistics Response DTO
 * Provides aggregated statistics for categories
 */
export class CategoryStatsResponseDto {
  @ApiProperty({ 
    description: 'Total number of categories',
    example: 25 
  })
  @Expose()
  totalCategories: number;

  @ApiProperty({ 
    description: 'Total number of active categories',
    example: 20 
  })
  @Expose()
  activeCategories: number;

  @ApiProperty({ 
    description: 'Total products across all categories',
    example: 150 
  })
  @Expose()
  totalProducts: number;

  @ApiProperty({ 
    description: 'Categories with no products',
    example: 5 
  })
  @Expose()
  emptyCategories: number;

  @ApiProperty({ 
    description: 'Category with most products',
    example: { id: 'abc123', name: 'Electronics', count: 45 }
  })
  @Expose()
  topCategory?: {
    id: string;
    name: string;
    count: number;
  };
}
