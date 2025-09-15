import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { QueryBuilderService } from './query-builder.service';
import { SearchQueryDto, SearchHitDto, SuggestionDto } from '../dto';
import { CollectionResponseDto } from '../../../common/dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly productIndex: string;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
    private readonly queryBuilder: QueryBuilderService,
  ) {
    this.productIndex = this.configService.get('elasticsearch.indices.products');
  }

  async search(query: string, options: any = {}): Promise<CollectionResponseDto<SearchHitDto>> {
    try {
      const { from = 0, size = 20, filters = {}, sort = {} } = options;

      // Build the search query - pass query and filters separately
      const searchQuery = this.queryBuilder.buildSearchQuery(query || '');
      
      // Apply additional filters if provided
      if (filters && Object.keys(filters).length > 0) {
        // Merge filters into the query
        const filterQuery = this.buildFilters(filters);
        if (filterQuery.length > 0) {
          searchQuery.bool = searchQuery.bool || {};
          searchQuery.bool.filter = [...(searchQuery.bool.filter || []), ...filterQuery];
        }
      }
      
      // Build sort options
      const sortOptions = this.buildSortOptions(sort);

      // Execute search with correct API format
      const result = await this.elasticsearchService.search({
        index: this.productIndex,
        from,
        size,
        query: searchQuery,
        sort: sortOptions,
        highlight: {
          fields: {
            name: { number_of_fragments: 1 },
            description: { number_of_fragments: 2 },
          },
        },
        track_total_hits: true,
      });

      // Transform results to SearchHitDto array
      const items: SearchHitDto[] = result.hits.hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score,
        _highlights: hit.highlight,
      }));

      const totalItems = typeof result.hits.total === 'number' 
        ? result.hits.total 
        : result.hits.total.value;

      // Calculate pagination
      const page = Math.floor(from / size) + 1;
      
      return CollectionResponseDto.paginate(items, totalItems, page, size);
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      return CollectionResponseDto.from([]);
    }
  }

  async suggest(query: string): Promise<SuggestionDto[]> {
    try {
      const result = await this.elasticsearchService.search({
        index: this.productIndex,
        size: 0,
        suggest: {
          product_suggest: {
            text: query,
            completion: {
              field: 'name.suggest',
              size: 10,
              skip_duplicates: true,
            },
          },
        },
      });

      // Safely access suggestions with proper type checking
      const suggestResponse = result.suggest?.product_suggest?.[0];
      const options = suggestResponse?.options || [];
      
      return Array.isArray(options) 
        ? options.map((option: any) => ({
            text: option.text || option._source?.name || '',
            score: option._score || 0,
          }))
        : [];
    } catch (error) {
      this.logger.error(`Suggest failed: ${error.message}`);
      return [];
    }
  }

  private buildSortOptions(sort: any): any[] {
    const sortOptions: any[] = [];

    if (sort && sort.field) {
      const sortOrder = sort.order || 'asc';
      sortOptions.push({ [sort.field]: { order: sortOrder } });
    } else {
      // Default sort by relevance (score) and then by name
      sortOptions.push('_score', { 'name.keyword': { order: 'asc' } });
    }

    return sortOptions;
  }

  private buildFilters(filters: any): any[] {
    const elasticFilters = [];

    if (filters.status) {
      elasticFilters.push({ term: { status: filters.status } });
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      elasticFilters.push({
        nested: {
          path: 'categories',
          query: {
            terms: { 'categories.id': filters.categoryIds },
          },
        },
      });
    }

    if (filters.brand) {
      elasticFilters.push({ term: { brand: filters.brand } });
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const rangeFilter: any = { range: { price: {} } };
      if (filters.priceMin !== undefined) rangeFilter.range.price.gte = filters.priceMin;
      if (filters.priceMax !== undefined) rangeFilter.range.price.lte = filters.priceMax;
      elasticFilters.push(rangeFilter);
    }

    if (filters.isFeatured !== undefined) {
      elasticFilters.push({ term: { isFeatured: filters.isFeatured } });
    }

    if (filters.inStock === true) {
      elasticFilters.push({ range: { quantity: { gt: 0 } } });
    }

    if (filters.tags && filters.tags.length > 0) {
      elasticFilters.push({ terms: { tags: filters.tags } });
    }

    return elasticFilters;
  }
}
