import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max, IsEnum, IsString } from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Base pagination DTO with common pagination parameters
 */
export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  /**
   * Get offset for database queries
   */
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Get take value for database queries
   */
  get take(): number {
    return this.limit;
  }
}

/**
 * Generic paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Pagination metadata
 */
export class PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;

  constructor(page: number, limit: number, totalItems: number) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrevious = page > 1;
  }
}

/**
 * Helper function to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  totalItems: number,
): PaginatedResponseDto<T> {
  return {
    data,
    meta: new PaginationMeta(page, limit, totalItems),
  };
}
