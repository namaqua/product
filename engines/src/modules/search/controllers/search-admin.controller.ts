import { Controller, Post, Get, Delete, Body, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { IndexManagementService } from '../services/index-management.service';
import { IndexingService } from '../services/indexing.service';
import { UserRole } from '../../users/entities/user.entity';
import { 
  ReindexOptionsDto, 
  ReindexResultDto, 
  IndexHealthDto, 
  IndexStatsDto,
} from '../dto';
import { ActionResponseDto, ApiResponse as ApiResponseWrapper } from '../../../common/dto';

@ApiTags('Search Admin')
@Controller('search/admin')  // Changed from 'api/search/admin' to just 'search/admin'
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class SearchAdminController {
  constructor(
    private readonly indexManagementService: IndexManagementService,
    private readonly indexingService: IndexingService,
  ) {}

  @Post('index/create')
  @ApiOperation({ summary: 'Create product search index' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Index created successfully',
  })
  async createIndex(): Promise<ActionResponseDto<{ index: string; created: boolean }>> {
    const result = await this.indexManagementService.createProductIndex();
    return ActionResponseDto.create(result);
  }

  @Delete('index/:name')
  @ApiOperation({ summary: 'Delete search index' })
  @ApiParam({ name: 'name', description: 'Index name' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Index deleted successfully',
  })
  async deleteIndex(
    @Param('name') indexName: string,
  ): Promise<ActionResponseDto<{ index: string; deleted: boolean }>> {
    const result = await this.indexManagementService.deleteIndex(indexName);
    return ActionResponseDto.delete(result);
  }

  @Get('index/health')
  @ApiOperation({ summary: 'Get index health status' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Index health retrieved successfully',
  })
  async getIndexHealth(): Promise<ApiResponseWrapper<IndexHealthDto>> {
    const health = await this.indexManagementService.getIndexHealth();
    return ApiResponseWrapper.success(health);
  }

  @Get('index/stats')
  @ApiOperation({ summary: 'Get index statistics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Index statistics retrieved successfully',
  })
  async getIndexStats(): Promise<ApiResponseWrapper<IndexStatsDto>> {
    const stats = await this.indexManagementService.getIndexStats();
    return ApiResponseWrapper.success(stats);
  }

  @Post('reindex')
  @ApiOperation({ summary: 'Reindex all products' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Products reindexed successfully',
  })
  async reindexProducts(
    @Body() options: ReindexOptionsDto = {},
  ): Promise<ActionResponseDto<ReindexResultDto>> {
    const result = await this.indexingService.reindexAll(options);
    return new ActionResponseDto(result, 'Products reindexed successfully');
  }

  @Post('index/refresh')
  @ApiOperation({ summary: 'Refresh search index' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Index refreshed successfully',
  })
  async refreshIndex(): Promise<ActionResponseDto<{ refreshed: boolean }>> {
    await this.indexManagementService.refreshIndex();
    return new ActionResponseDto({ refreshed: true }, 'Index refreshed successfully');
  }

  @Post('index/optimize')
  @ApiOperation({ summary: 'Optimize search index' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Index optimization started',
  })
  async optimizeIndex(): Promise<ActionResponseDto<{ optimizing: boolean }>> {
    await this.indexManagementService.optimizeIndex();
    return new ActionResponseDto({ optimizing: true }, 'Index optimization started');
  }

  @Post('product/:id/index')
  @ApiOperation({ summary: 'Index a single product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Product indexed successfully',
  })
  async indexProduct(
    @Param('id') productId: string,
  ): Promise<ActionResponseDto<{ indexed: boolean }>> {
    await this.indexingService.indexProductById(productId);
    return new ActionResponseDto({ indexed: true }, 'Product indexed successfully');
  }

  @Delete('product/:id/index')
  @ApiOperation({ summary: 'Remove a product from index' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Product removed from index',
  })
  async removeProduct(
    @Param('id') productId: string,
  ): Promise<ActionResponseDto<{ removed: boolean }>> {
    await this.indexingService.deleteDocument(productId);
    return ActionResponseDto.delete({ removed: true });
  }
}
