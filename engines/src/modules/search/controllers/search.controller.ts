import { Controller, Post, Get, Body, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SearchService } from '../services/search.service';
import { FacetService } from '../services/facet.service';
import { 
  SearchQueryDto, 
  SearchHitDto, 
  SearchFacetsDto,
  SuggestionDto,
} from '../dto';
import { CollectionResponseDto, ApiResponse as ApiResponseWrapper } from '../../../common/dto';

@ApiTags('Search')
@Controller('search')  // Changed from 'api/search' to just 'search'
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly facetService: FacetService,
  ) {}

  @Post('products')
  @ApiOperation({ summary: 'Search products with filters and facets' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Search results retrieved successfully',
  })
  async searchProducts(
    @Body() searchDto: SearchQueryDto,
  ): Promise<ApiResponseWrapper<CollectionResponseDto<SearchHitDto>>> {
    // Transform SearchQueryDto to the format expected by SearchService
    const results = await this.searchService.search(searchDto.query || '', {
      filters: {
        categoryIds: searchDto.categoryIds,
        brand: searchDto.brand,
        priceMin: searchDto.priceMin,
        priceMax: searchDto.priceMax,
        status: searchDto.status,
        isFeatured: searchDto.isFeatured,
        inStock: searchDto.inStock,
        tags: searchDto.tags,
        ...searchDto.attributes,
      },
      from: ((searchDto.page || 1) - 1) * (searchDto.limit || 20),
      size: searchDto.limit || 20,
      sort: { field: searchDto.sortBy, order: searchDto.sortOrder },
    });
    
    return ApiResponseWrapper.success(results);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions/autocomplete' })
  @ApiQuery({ name: 'q', required: true, description: 'Query string' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of suggestions' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Suggestions retrieved successfully',
  })
  async getSuggestions(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponseWrapper<SuggestionDto[]>> {
    if (!query || query.length < 2) {
      return ApiResponseWrapper.success([], 'Query too short');
    }
    
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const suggestions = await this.searchService.suggest(query);
    return ApiResponseWrapper.success(suggestions.slice(0, limitNum));
  }

  @Post('facets')
  @ApiOperation({ summary: 'Get search facets/aggregations' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Facets retrieved successfully',
  })
  async getFacets(
    @Body() searchDto: SearchQueryDto,
  ): Promise<ApiResponseWrapper<SearchFacetsDto>> {
    const facets = await this.facetService.getSearchFacets(searchDto);
    return ApiResponseWrapper.success(facets);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular search terms' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of terms' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Popular searches retrieved successfully',
  })
  async getPopularSearches(
    @Query('limit') limit?: string,
  ): Promise<ApiResponseWrapper<string[]>> {
    // TODO: Implement search tracking and analytics
    return ApiResponseWrapper.success([]);
  }

  @Get('health')
  @ApiOperation({ summary: 'Check search service health' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Search service is healthy',
  })
  async checkHealth(): Promise<ApiResponseWrapper<{ status: string; elasticsearch: boolean }>> {
    try {
      // Check if Elasticsearch is accessible
      // TODO: Add actual health check to SearchService
      return ApiResponseWrapper.success({
        status: 'healthy',
        elasticsearch: true,
      });
    } catch (error) {
      return ApiResponseWrapper.error('Search service is unhealthy', {
        status: 'unhealthy',
        elasticsearch: false,
      });
    }
  }
}
