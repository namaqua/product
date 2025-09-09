import { IsOptional, IsString, IsBoolean, IsNumber, IsUUID, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto, SortOrder } from '../../../common/dto';

export class CategoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by name or description',
    example: 'electronics',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by parent category ID (null for root categories)',
    example: 'uuid-of-parent',
  })
  @IsOptional()
  parentId?: string | null;

  @ApiPropertyOptional({
    description: 'Filter by tree level (0 for root)',
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  level?: number;

  @ApiPropertyOptional({
    description: 'Filter by visibility',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by featured status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by menu visibility',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  showInMenu?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'name',
    enum: ['name', 'left', 'sortOrder', 'createdAt', 'updatedAt'],
    default: 'left',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'left';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.ASC;
}
