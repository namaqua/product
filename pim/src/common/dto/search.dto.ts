import { IsOptional, IsString, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

/**
 * Base search DTO that extends pagination
 */
export class SearchDto extends PaginationDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean = false;

  @IsDateString()
  @IsOptional()
  createdFrom?: string;

  @IsDateString()
  @IsOptional()
  createdTo?: string;

  @IsDateString()
  @IsOptional()
  updatedFrom?: string;

  @IsDateString()
  @IsOptional()
  updatedTo?: string;
}

/**
 * Advanced filter DTO for complex queries
 */
export class FilterDto extends SearchDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(id => id.trim());
    }
    return value;
  })
  ids?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(status => status.trim());
    }
    return value;
  })
  status?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(rel => rel.trim());
    }
    return value;
  })
  include?: string[];
}

/**
 * Bulk operation DTO
 */
export class BulkOperationDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
