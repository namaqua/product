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
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductResponseDto,
} from './dto';
import { ProductStatus } from './entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaginatedResponseDto } from '../../common/dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created successfully', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Product with this SKU already exists' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid product data' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Products retrieved successfully' })
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of products to return' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Featured products retrieved successfully', type: [ProductResponseDto] })
  async getFeaturedProducts(
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.getFeaturedProducts(limit);
  }

  @Get('low-stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Low stock products retrieved successfully', type: [ProductResponseDto] })
  async getLowStockProducts(): Promise<ProductResponseDto[]> {
    return this.productsService.getLowStockProducts();
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get a product by SKU' })
  @ApiParam({ name: 'sku', description: 'Product SKU' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product retrieved successfully', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async findBySku(@Param('sku') sku: string): Promise<ProductResponseDto> {
    return this.productsService.findBySku(sku);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'includeVariants', required: false, type: Boolean, description: 'Include product variants' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product retrieved successfully', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeVariants') includeVariants?: boolean,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(id, includeVariants);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product updated successfully', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'SKU already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto, userId);
  }

  @Patch(':id/stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update product stock quantity' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'number', minimum: 0, description: 'New stock quantity' }
      },
      required: ['quantity']
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stock updated successfully', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Stock is not managed for this product' })
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
    @CurrentUser('id') userId: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.updateStock(id, quantity, userId);
  }

  @Patch('bulk/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update product status' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' }, description: 'Array of product IDs' },
        status: { type: 'string', enum: Object.values(ProductStatus), description: 'New status for products' }
      },
      required: ['ids', 'status']
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Products updated successfully' })
  async bulkUpdateStatus(
    @Body('ids') ids: string[],
    @Body('status') status: ProductStatus,
    @CurrentUser('id') userId: string,
  ): Promise<{ affected: number }> {
    const affected = await this.productsService.bulkUpdateStatus(ids, status, userId);
    return { affected };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Product deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot delete product with variants' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.productsService.remove(id, userId);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore a soft deleted product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product restored successfully', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deleted product not found' })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.restore(id);
  }
}
