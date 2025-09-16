import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CategoryResponseDto } from './category-response.dto';

/**
 * Category with Product Counts DTO
 * Extends CategoryResponseDto with product count information
 * Compliant with PIM API Standards
 */
export class CategoryWithCountsDto extends CategoryResponseDto {
  @ApiProperty({ 
    description: 'Number of products directly in this category',
    example: 15 
  })
  @Expose()
  productCount: number;

  @ApiProperty({ 
    description: 'Total products including subcategories',
    example: 45 
  })
  @Expose()
  totalProductCount: number;

  @ApiPropertyOptional({ 
    description: 'Child categories with counts',
    type: () => [CategoryWithCountsDto],
    isArray: true 
  })
  @Expose()
  @Type(() => CategoryWithCountsDto)
  children?: CategoryWithCountsDto[];

  /**
   * Factory method to create from entity with counts
   */
  static fromEntityWithCount(
    entity: any, 
    directCount: number = 0, 
    totalCount?: number
  ): CategoryWithCountsDto {
    const dto = new CategoryWithCountsDto();
    Object.assign(dto, entity);
    dto.productCount = directCount;
    dto.totalProductCount = totalCount ?? directCount;
    return dto;
  }

  /**
   * Factory method for arrays with counts
   */
  static fromEntitiesWithCounts(entities: any[]): CategoryWithCountsDto[] {
    return entities.map(entity => this.fromEntityWithCount(
      entity,
      entity.productCount || 0,
      entity.totalProductCount
    ));
  }
}
