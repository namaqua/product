import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';
import { Type } from 'class-transformer';

/**
 * DTO for representing category tree structure
 */
export class CategoryTreeDto extends CategoryResponseDto {
  @ApiProperty({
    description: 'Child categories',
    type: [CategoryTreeDto],
    required: false,
    default: [],
  })
  @Type(() => CategoryTreeDto)
  children: CategoryTreeDto[];
}
