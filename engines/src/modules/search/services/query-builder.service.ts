import { Injectable } from '@nestjs/common';
import { SearchQueryDto } from '../dto';

@Injectable()
export class QueryBuilderService {
  buildSearchQuery(searchInput: string | SearchQueryDto): any {
    // Handle both string queries and SearchQueryDto
    if (typeof searchInput === 'string') {
      return this.buildSimpleQuery(searchInput);
    }

    const must = [];
    const filter = [];

    // Add search term
    if (searchInput.query) {
      must.push({
        multi_match: {
          query: searchInput.query,
          fields: ['name^3', 'description', 'sku^2', 'brand'],
          type: 'best_fields',
          fuzziness: searchInput.fuzziness || 'AUTO',
        },
      });
    }

    // Add filters
    if (searchInput.status) {
      filter.push({ term: { status: searchInput.status } });
    }

    if (searchInput.categoryIds && searchInput.categoryIds.length > 0) {
      filter.push({
        nested: {
          path: 'categories',
          query: {
            terms: { 'categories.id': searchInput.categoryIds },
          },
        },
      });
    }

    if (searchInput.brand) {
      filter.push({ term: { brand: searchInput.brand } });
    }

    if (searchInput.priceMin !== undefined || searchInput.priceMax !== undefined) {
      const rangeQuery: any = { range: { price: {} } };
      if (searchInput.priceMin !== undefined) {
        rangeQuery.range.price.gte = searchInput.priceMin;
      }
      if (searchInput.priceMax !== undefined) {
        rangeQuery.range.price.lte = searchInput.priceMax;
      }
      filter.push(rangeQuery);
    }

    if (searchInput.isFeatured !== undefined) {
      filter.push({ term: { isFeatured: searchInput.isFeatured } });
    }

    if (searchInput.inStock !== undefined) {
      filter.push({ range: { quantity: { gt: 0 } } });
    }

    if (searchInput.tags && searchInput.tags.length > 0) {
      filter.push({ terms: { tags: searchInput.tags } });
    }

    return {
      bool: {
        must: must.length ? must : [{ match_all: {} }],
        filter,
      },
    };
  }

  private buildSimpleQuery(searchTerm: string): any {
    if (!searchTerm) {
      return { match_all: {} };
    }

    return {
      bool: {
        must: [{
          multi_match: {
            query: searchTerm,
            fields: ['name^3', 'description', 'sku^2', 'brand'],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        }],
      },
    };
  }

  buildAggregations(requestedFacets: string[] = []): any {
    const aggs: any = {};

    if (requestedFacets.length === 0 || requestedFacets.includes('categories')) {
      aggs.categories = {
        nested: { path: 'categories' },
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

    if (requestedFacets.length === 0 || requestedFacets.includes('brands')) {
      aggs.brands = {
        terms: {
          field: 'brand',
          size: 20,
        },
      };
    }

    if (requestedFacets.length === 0 || requestedFacets.includes('price')) {
      aggs.price_stats = {
        stats: { field: 'price' },
      };
      aggs.price_ranges = {
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

    if (requestedFacets.length === 0 || requestedFacets.includes('status')) {
      aggs.status = {
        terms: { field: 'status' },
      };
    }

    return aggs;
  }
}
