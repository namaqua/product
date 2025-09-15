import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { SearchQueryDto, SearchFacetsDto, FacetDto } from '../dto';
import { QueryBuilderService } from './query-builder.service';

@Injectable()
export class FacetService {
  private readonly logger = new Logger(FacetService.name);
  private readonly productIndex: string;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
    private readonly queryBuilder: QueryBuilderService,
  ) {
    this.productIndex = this.configService.get('elasticsearch.indices.products');
  }

  async getSearchFacets(searchDto: SearchQueryDto): Promise<SearchFacetsDto> {
    try {
      // Pass the whole DTO to QueryBuilderService
      const searchQuery = this.queryBuilder.buildSearchQuery(searchDto);
      const aggregations = this.buildAggregations(searchDto.facets);

      const result = await this.elasticsearchService.search({
        index: this.productIndex,
        size: 0, // We only want aggregations
        query: searchQuery,
        aggs: aggregations,
      });

      return this.transformAggregations(result.aggregations);
    } catch (error) {
      this.logger.error(`Failed to get facets: ${error.message}`);
      return {};
    }
  }

  async getProductFacets(query?: string, filters?: any): Promise<any> {
    const searchQuery = {
      index: this.productIndex,
      size: 0, // We only want aggregations, not results
      query: query ? {
        multi_match: {
          query,
          fields: ['name^3', 'description', 'sku^2'],
        },
      } : { match_all: {} },
      aggs: {
        categories: {
          nested: {
            path: 'categories',
          },
          aggs: {
            category_names: {
              terms: {
                field: 'categories.name',
                size: 20,
              },
            },
          },
        },
        price_ranges: {
          range: {
            field: 'price',
            ranges: [
              { key: 'Under $50', to: 50 },
              { key: '$50-$100', from: 50, to: 100 },
              { key: '$100-$250', from: 100, to: 250 },
              { key: '$250-$500', from: 250, to: 500 },
              { key: 'Over $500', from: 500 },
            ],
          },
        },
        status: {
          terms: {
            field: 'status',
          },
        },
        featured: {
          terms: {
            field: 'isFeatured',
          },
        },
      },
    };

    const result = await this.elasticsearchService.search(searchQuery);
    return result.aggregations;
  }

  private buildAggregations(requestedFacets?: string[]): any {
    const aggs: any = {};
    const includeFacets = requestedFacets || ['categories', 'brands', 'priceRanges', 'status'];

    if (includeFacets.includes('categories')) {
      aggs.categories = {
        nested: {
          path: 'categories',
        },
        aggs: {
          category_names: {
            terms: {
              field: 'categories.name',
              size: 20,
            },
          },
        },
      };
    }

    if (includeFacets.includes('brands')) {
      aggs.brands = {
        terms: {
          field: 'brand',
          size: 20,
        },
      };
    }

    if (includeFacets.includes('priceRanges')) {
      aggs.priceRanges = {
        range: {
          field: 'price',
          ranges: [
            { key: 'Under $50', to: 50 },
            { key: '$50-$100', from: 50, to: 100 },
            { key: '$100-$250', from: 100, to: 250 },
            { key: '$250-$500', from: 250, to: 500 },
            { key: 'Over $500', from: 500 },
          ],
        },
      };
    }

    if (includeFacets.includes('status')) {
      aggs.status = {
        terms: {
          field: 'status',
        },
      };
    }

    return aggs;
  }

  private transformAggregations(aggregations: any): SearchFacetsDto {
    const facets: SearchFacetsDto = {};

    if (aggregations?.categories?.category_names) {
      facets.categories = {
        name: 'categories',
        buckets: aggregations.categories.category_names.buckets.map((bucket: any) => ({
          key: bucket.key,
          doc_count: bucket.doc_count,
        })),
      };
    }

    if (aggregations?.brands) {
      facets.brands = {
        name: 'brands',
        buckets: aggregations.brands.buckets.map((bucket: any) => ({
          key: bucket.key,
          doc_count: bucket.doc_count,
        })),
      };
    }

    if (aggregations?.priceRanges) {
      facets.priceRanges = {
        name: 'priceRanges',
        buckets: aggregations.priceRanges.buckets.map((bucket: any) => ({
          key: bucket.key,
          doc_count: bucket.doc_count,
        })),
      };
    }

    if (aggregations?.status) {
      facets.status = {
        name: 'status',
        buckets: aggregations.status.buckets.map((bucket: any) => ({
          key: bucket.key,
          doc_count: bucket.doc_count,
        })),
      };
    }

    return facets;
  }
}
