import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchHitDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product SKU' })
  sku: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiPropertyOptional({ description: 'Product description' })
  description?: string;

  @ApiProperty({ description: 'Product price' })
  price: number;

  @ApiPropertyOptional({ description: 'Special price' })
  specialPrice?: number;

  @ApiProperty({ description: 'Stock quantity' })
  quantity: number;

  @ApiProperty({ description: 'Product status' })
  status: string;

  @ApiPropertyOptional({ description: 'Brand' })
  brand?: string;

  @ApiPropertyOptional({ description: 'Categories', isArray: true })
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  @ApiPropertyOptional({ description: 'Media', isArray: true })
  media?: Array<{
    id: string;
    url: string;
    type: string;
    isPrimary: boolean;
  }>;

  @ApiPropertyOptional({ description: 'Search relevance score' })
  _score?: number;

  @ApiPropertyOptional({ description: 'Search highlights' })
  _highlights?: Record<string, string[]>;
}

export class FacetBucketDto {
  @ApiProperty({ description: 'Facet value' })
  key: string;

  @ApiProperty({ description: 'Document count' })
  doc_count: number;
}

export class FacetDto {
  @ApiProperty({ description: 'Facet name' })
  name: string;

  @ApiProperty({ description: 'Facet buckets', isArray: true, type: FacetBucketDto })
  buckets: FacetBucketDto[];
}

export class SearchFacetsDto {
  @ApiPropertyOptional({ description: 'Category facets', type: FacetDto })
  categories?: FacetDto;

  @ApiPropertyOptional({ description: 'Brand facets', type: FacetDto })
  brands?: FacetDto;

  @ApiPropertyOptional({ description: 'Price range facets', type: FacetDto })
  priceRanges?: FacetDto;

  @ApiPropertyOptional({ description: 'Status facets', type: FacetDto })
  status?: FacetDto;

  @ApiPropertyOptional({ description: 'Custom attribute facets' })
  attributes?: Record<string, FacetDto>;
}

export class SearchStatsDto {
  @ApiProperty({ description: 'Total search time in milliseconds' })
  took: number;

  @ApiProperty({ description: 'Maximum relevance score' })
  maxScore?: number;
}

export class SuggestionDto {
  @ApiProperty({ description: 'Suggested text' })
  text: string;

  @ApiPropertyOptional({ description: 'Suggestion score' })
  score?: number;

  @ApiPropertyOptional({ description: 'Suggestion frequency' })
  freq?: number;
}
