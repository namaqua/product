import { ApiProperty } from '@nestjs/swagger';

/**
 * Pagination metadata for collection responses
 */
export class PaginationMetaDto {
  @ApiProperty({ description: 'Total number of items in the collection' })
  totalItems: number;

  @ApiProperty({ description: 'Number of items in current page' })
  itemCount: number;

  @ApiProperty({ description: 'Current page number', required: false })
  page?: number;

  @ApiProperty({ description: 'Total number of pages', required: false })
  totalPages?: number;

  @ApiProperty({ description: 'Items per page', required: false })
  itemsPerPage?: number;

  @ApiProperty({ description: 'Has next page', required: false })
  hasNext?: boolean;

  @ApiProperty({ description: 'Has previous page', required: false })
  hasPrevious?: boolean;

  constructor(partial: Partial<PaginationMetaDto>) {
    Object.assign(this, partial);
  }

  static fromPagination(
    totalItems: number,
    itemCount: number,
    page: number = 1,
    limit: number = 20
  ): PaginationMetaDto {
    const totalPages = Math.ceil(totalItems / limit);
    
    return new PaginationMetaDto({
      totalItems,
      itemCount,
      page,
      totalPages,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    });
  }
}

/**
 * Standard collection response wrapper
 */
export class CollectionResponseDto<T> {
  @ApiProperty({ description: 'Array of items', isArray: true })
  items: T[];

  @ApiProperty({ 
    description: 'Pagination metadata', 
    type: PaginationMetaDto,
    required: false 
  })
  meta?: PaginationMetaDto;

  constructor(items: T[], meta?: PaginationMetaDto) {
    this.items = items;
    this.meta = meta;
  }

  static paginate<T>(
    items: T[],
    totalItems: number,
    page: number = 1,
    limit: number = 20
  ): CollectionResponseDto<T> {
    return new CollectionResponseDto(
      items,
      PaginationMetaDto.fromPagination(totalItems, items.length, page, limit)
    );
  }

  static from<T>(items: T[]): CollectionResponseDto<T> {
    return new CollectionResponseDto(items, {
      totalItems: items.length,
      itemCount: items.length
    });
  }
}

/**
 * Type for service methods returning collections
 */
export type CollectionResponse<T> = {
  items: T[];
  meta?: PaginationMetaDto;
};

/**
 * Helper functions for services
 */
export const ResponseHelpers = {
  /**
   * Wrap array in collection response
   */
  wrapCollection<T>(
    items: T[], 
    meta?: Partial<PaginationMetaDto>
  ): CollectionResponse<T> {
    return {
      items,
      meta: meta ? new PaginationMetaDto(meta) : undefined
    };
  },

  /**
   * Create paginated response from TypeORM
   */
  wrapPaginated<T>(
    results: [T[], number],
    page: number = 1,
    limit: number = 20
  ): CollectionResponse<T> {
    const [items, totalItems] = results;
    return {
      items,
      meta: PaginationMetaDto.fromPagination(totalItems, items.length, page, limit)
    };
  }
};
