import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
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
import { ProductAttributesService } from './services/product-attributes.service';
import { CategoryResponseDto } from '../categories/dto/category-response.dto';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductResponseDto,
  AssignCategoriesDto,
  BulkAssignCategoriesDto,
} from './dto';
import {
  AssignProductAttributesDto,
  BulkAssignProductAttributesDto,
  RemoveProductAttributeDto,
  AssignProductAttributeGroupDto,
  ProductAttributesResponseDto,
  ValidateProductAttributesDto,
  ProductAttributeValidationResultDto,
} from './dto/attributes';
import {
  CreateVariantGroupDto,
  UpdateVariantDto,
  BulkVariantUpdateDto,
  VariantGroupResponseDto,
  VariantQueryDto,
  GenerateVariantsDto,
  VariantMatrixDto,
} from './dto/variants';
import { ProductStatus } from './entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { 
  CollectionResponseDto,
  ActionResponseDto 
} from '../../common/dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productAttributesService: ProductAttributesService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created successfully', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Product with this SKU already exists' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid product data' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.create(createProductDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Products retrieved successfully' })
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<CollectionResponseDto<ProductResponseDto>> {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of products to return' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Featured products retrieved successfully', type: [ProductResponseDto] })
  async getFeaturedProducts(
    @Query('limit') limitParam?: string,
  ): Promise<CollectionResponseDto<ProductResponseDto>> {
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    return this.productsService.getFeaturedProducts(limit);
  }

  @Get('low-stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Low stock products retrieved successfully', type: [ProductResponseDto] })
  async getLowStockProducts(): Promise<CollectionResponseDto<ProductResponseDto>> {
    return this.productsService.getLowStockProducts();
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get a product by SKU' })
  @ApiParam({ name: 'sku', description: 'Product SKU' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product retrieved successfully', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async findBySku(@Param('sku') sku: string): Promise<{ success: boolean; data: ProductResponseDto; timestamp: string }> {
    const product = await this.productsService.findBySku(sku);
    return {
      success: true,
      data: product,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'includeVariants', required: false, type: Boolean, description: 'Include product variants' })
  @ApiQuery({ name: 'includeCategories', required: false, type: Boolean, description: 'Include product categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product retrieved successfully', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeVariants') includeVariants?: boolean,
    @Query('includeCategories') includeCategories?: boolean,
  ): Promise<{ success: boolean; data: ProductResponseDto; timestamp: string }> {
    const product = await this.productsService.findOne(id, includeVariants, includeCategories);
    return {
      success: true,
      data: product,
      timestamp: new Date().toISOString(),
    };
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
  ): Promise<ActionResponseDto<ProductResponseDto>> {
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
  ): Promise<ActionResponseDto<ProductResponseDto>> {
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
  ): Promise<ActionResponseDto<{ affected: number }>> {
    return this.productsService.bulkUpdateStatus(ids, status, userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot delete product with variants' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
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
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.restore(id);
  }

  // ============ CATEGORY MANAGEMENT ENDPOINTS ============

  @Post(':id/categories')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Assign categories to a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categories assigned successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid category IDs' })
  async assignCategories(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: AssignCategoriesDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.assignCategories(productId, dto.categoryIds, false);
  }

  @Get(':id/categories')
  @ApiOperation({ summary: 'Get categories assigned to a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categories retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async getProductCategories(
    @Param('id', ParseUUIDPipe) productId: string,
  ): Promise<CollectionResponseDto<CategoryResponseDto>> {
    return this.productsService.getProductCategories(productId);
  }

  @Delete(':id/categories/:categoryId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a category from a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID to remove' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category removed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product or category not found' })
  async removeCategory(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.removeCategory(productId, categoryId);
  }

  @Delete(':id/categories')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove all categories from a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All categories removed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async removeAllCategories(
    @Param('id', ParseUUIDPipe) productId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.removeAllCategories(productId);
  }

  @Post('categories/bulk-assign')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Bulk assign categories to multiple products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categories assigned successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid product or category IDs' })
  async bulkAssignCategories(
    @Body() dto: BulkAssignCategoriesDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ affected: number; results: any[] }>> {
    return this.productsService.bulkAssignCategories(
      dto.productIds,
      dto.categoryIds,
      dto.replace,
    );
  }

  // ============ VARIANT MANAGEMENT ENDPOINTS ============

  @Post(':id/variants/group')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a variant group for a product' })
  @ApiParam({ name: 'id', description: 'Parent product ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Variant group created successfully', type: VariantGroupResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parent product not found' })
  async createVariantGroup(
    @Param('id', ParseUUIDPipe) parentId: string,
    @Body() dto: Omit<CreateVariantGroupDto, 'parentId'>,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<VariantGroupResponseDto>> {
    return this.productsService.createVariantGroup(
      { ...dto, parentId },
      userId,
    );
  }

  @Get(':id/variants')
  @ApiOperation({ summary: 'Get all variants for a product' })
  @ApiParam({ name: 'id', description: 'Parent product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Variants retrieved successfully', type: VariantGroupResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parent product not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Product is not configurable' })
  async getVariantGroup(
    @Param('id', ParseUUIDPipe) parentId: string,
  ): Promise<ActionResponseDto<VariantGroupResponseDto>> {
    return this.productsService.getVariantGroup(parentId);
  }

  @Post(':id/variants/generate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Generate variants from combinations' })
  @ApiParam({ name: 'id', description: 'Parent product ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Variants generated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parent product not found' })
  async generateVariants(
    @Param('id', ParseUUIDPipe) parentId: string,
    @Body() dto: GenerateVariantsDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ created: number; skipped: number; variants: any[] }>> {
    return this.productsService.generateVariants(parentId, dto, userId);
  }

  @Put('variants/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a single variant' })
  @ApiParam({ name: 'id', description: 'Variant ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Variant updated successfully', type: ProductResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Variant not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Product is not a variant' })
  async updateVariant(
    @Param('id', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateVariantDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.updateVariant(variantId, dto, userId);
  }

  @Put(':id/variants/bulk')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Bulk update variants' })
  @ApiParam({ name: 'id', description: 'Parent product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Variants updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No variants found' })
  async bulkUpdateVariants(
    @Body() dto: BulkVariantUpdateDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ updated: number; results: ProductResponseDto[] }>> {
    return this.productsService.bulkUpdateVariants(dto, userId);
  }

  @Post(':id/variants/sync')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Sync variant inventory with parent' })
  @ApiParam({ name: 'id', description: 'Parent product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Inventory synced successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parent product not found' })
  async syncVariantInventory(
    @Param('id', ParseUUIDPipe) parentId: string,
  ): Promise<ActionResponseDto<{ synced: number }>> {
    return this.productsService.syncVariantInventory(parentId);
  }

  @Delete(':id/variants/group')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dissolve a variant group' })
  @ApiParam({ name: 'id', description: 'Parent product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Variant group dissolved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parent product not found' })
  async dissolveVariantGroup(
    @Param('id', ParseUUIDPipe) parentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ affected: number }>> {
    return this.productsService.dissolveVariantGroup(parentId, userId);
  }

  @Get(':id/variants/matrix')
  @ApiOperation({ summary: 'Get variant matrix view' })
  @ApiParam({ name: 'id', description: 'Parent product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Variant matrix retrieved successfully', type: VariantMatrixDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parent product not found' })
  async getVariantMatrix(
    @Param('id', ParseUUIDPipe) parentId: string,
  ): Promise<ActionResponseDto<VariantMatrixDto>> {
    return this.productsService.getVariantMatrix(parentId);
  }

  @Get('variants/search')
  @ApiOperation({ summary: 'Search variants across all products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Variants retrieved successfully' })
  async searchVariants(
    @Query() query: VariantQueryDto,
  ): Promise<CollectionResponseDto<ProductResponseDto>> {
    return this.productsService.searchVariants(query);
  }

  // ============ ATTRIBUTE MANAGEMENT ENDPOINTS ============

  @Post(':id/attributes')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Assign attributes to a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Attributes assigned successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async assignAttributes(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: AssignProductAttributesDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ assigned: number; failed: number }>> {
    return this.productAttributesService.assignAttributes(productId, dto, userId);
  }

  @Post('attributes/bulk')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Bulk assign attributes to multiple products' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Attributes assigned successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'One or more products not found' })
  async bulkAssignAttributes(
    @Body() dto: BulkAssignProductAttributesDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<any>> {
    return this.productAttributesService.bulkAssignAttributes(dto, userId);
  }

  @Post(':id/attributes/group')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Assign all attributes from a group to a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Attribute group assigned successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product or group not found' })
  async assignAttributeGroup(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: AssignProductAttributeGroupDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ assigned: number; failed: number }>> {
    return this.productAttributesService.assignAttributeGroup(productId, dto, userId);
  }

  @Get(':id/attributes')
  @ApiOperation({ summary: 'Get all attributes for a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'locale', required: false, description: 'Locale code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product attributes retrieved successfully', type: ProductAttributesResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async getProductAttributes(
    @Param('id', ParseUUIDPipe) productId: string,
    @Query('locale') locale?: string,
  ): Promise<{ success: boolean; data: ProductAttributesResponseDto; timestamp: string }> {
    const attributes = await this.productAttributesService.getProductAttributes(productId, locale);
    return {
      success: true,
      data: attributes,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id/attributes')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an attribute from a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Attribute removed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product or attribute not found' })
  async removeAttribute(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: RemoveProductAttributeDto,
  ): Promise<ActionResponseDto<any>> {
    return this.productAttributesService.removeAttribute(productId, dto);
  }

  @Delete(':id/attributes/all')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all attributes from a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All attributes cleared successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async clearAttributes(
    @Param('id', ParseUUIDPipe) productId: string,
  ): Promise<ActionResponseDto<{ removed: number }>> {
    return this.productAttributesService.clearAttributes(productId);
  }

  @Post(':id/attributes/validate')
  @ApiOperation({ summary: 'Validate attributes before assignment' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Validation completed', type: ProductAttributeValidationResultDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async validateAttributes(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: ValidateProductAttributesDto,
  ): Promise<{ success: boolean; data: ProductAttributeValidationResultDto; timestamp: string }> {
    const result = await this.productAttributesService.validateAttributes(productId, dto);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/attributes/copy/:targetId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Copy attributes from one product to another' })
  @ApiParam({ name: 'id', description: 'Source product ID' })
  @ApiParam({ name: 'targetId', description: 'Target product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Attributes copied successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Source or target product not found' })
  async copyAttributes(
    @Param('id', ParseUUIDPipe) sourceProductId: string,
    @Param('targetId', ParseUUIDPipe) targetProductId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ copied: number }>> {
    return this.productAttributesService.copyAttributes(sourceProductId, targetProductId, userId);
  }
}
