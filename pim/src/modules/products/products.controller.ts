import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  FilterProductDto,
  BulkUpdateStatusDto,
  BulkUpdateVisibilityDto,
  ProductResponse,
  PaginatedProductResponse,
  BulkOperationResponse,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('products')
// @UseGuards(JwtAuthGuard, RolesGuard)  // TEMPORARILY DISABLED
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * DEBUG: Simple direct query - no auth, no complex logic
   */
  @Get('debug/simple')
  async getSimpleProducts() {
    console.log('🔍 DEBUG: Simple products query');
    const result = await this.productsService.getSimpleProducts();
    return result;
  }

  /**
   * Create a new product
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(
    @Body(ValidationPipe) createProductDto: CreateProductDto,
    @Request() req,
  ): Promise<ProductResponse> {
    return this.productsService.create(createProductDto, req.user.id);
  }

  /**
   * Get all products with filtering and pagination
   */
  @Get()
  async findAll(
    @Query(ValidationPipe) filterDto: FilterProductDto,
  ): Promise<PaginatedProductResponse> {
    return this.productsService.findAll(filterDto);
  }

  /**
   * Get product statistics
   */
  @Get('statistics')
  async getStatistics() {
    return this.productsService.getStatistics();
  }

  /**
   * Get a product by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponse> {
    return this.productsService.findOne(id);
  }

  /**
   * Get a product by SKU
   */
  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string): Promise<ProductResponse> {
    return this.productsService.findBySku(sku);
  }

  /**
   * Update a product
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
    @Request() req,
  ): Promise<ProductResponse> {
    return this.productsService.update(id, updateProductDto, req.user.id);
  }

  /**
   * Delete a product (soft delete)
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  /**
   * Restore a soft-deleted product
   */
  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  async restore(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponse> {
    return this.productsService.restore(id);
  }

  /**
   * Duplicate a product
   */
  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('sku') newSku: string,
    @Request() req,
  ): Promise<ProductResponse> {
    return this.productsService.duplicate(id, newSku, req.user.id);
  }

  /**
   * Update product inventory
   */
  @Patch(':id/inventory')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
    @Body('operation') operation: 'set' | 'increment' | 'decrement' = 'set',
  ): Promise<ProductResponse> {
    return this.productsService.updateInventory(id, quantity, operation);
  }

  /**
   * Bulk update product status
   */
  @Post('bulk/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async bulkUpdateStatus(
    @Body(ValidationPipe) bulkUpdateDto: BulkUpdateStatusDto,
  ): Promise<BulkOperationResponse> {
    return this.productsService.bulkUpdateStatus(bulkUpdateDto);
  }

  /**
   * Bulk update product visibility
   */
  @Post('bulk/visibility')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async bulkUpdateVisibility(
    @Body(ValidationPipe) bulkUpdateDto: BulkUpdateVisibilityDto,
  ): Promise<BulkOperationResponse> {
    return this.productsService.bulkUpdateVisibility(bulkUpdateDto);
  }
}
