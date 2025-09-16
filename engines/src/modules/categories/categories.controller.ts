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
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  CategoryResponseDto,
  CategoryTreeDto,
  MoveCategoryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaginatedResponseDto, CollectionResponse, ActionResponseDto } from '../../common/dto';

// Import the new DTOs if they exist
// import { CategoryWithCountsDto, CategoryStatsResponseDto } from './dto';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category with this slug already exists',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent category not found',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<CategoryResponseDto>> {
    return this.categoriesService.create(createCategoryDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
  })
  async findAll(
    @Query() query: CategoryQueryDto,
  ): Promise<CollectionResponse<CategoryResponseDto>> {
    return this.categoriesService.findAll(query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree structure' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category tree retrieved successfully',
    type: [CategoryTreeDto],
  })
  async getTree(): Promise<CollectionResponse<CategoryTreeDto>> {
    return this.categoriesService.getTree();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured categories' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of categories to return' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Featured categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async getFeatured(
    @Query('limit') limit = 10,
  ): Promise<CollectionResponse<CategoryResponseDto>> {
    const query = new CategoryQueryDto();
    query.isFeatured = true;
    query.isVisible = true;
    query.limit = limit;
    query.page = 1;
    return this.categoriesService.findAll(query);
  }

  @Get('menu')
  @ApiOperation({ summary: 'Get categories for navigation menu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Menu categories retrieved successfully',
    type: [CategoryTreeDto],
  })
  async getMenuCategories(): Promise<CollectionResponse<CategoryTreeDto>> {
    const query = new CategoryQueryDto();
    query.showInMenu = true;
    query.isVisible = true;
    query.limit = 100;
    query.page = 1;
    // Return tree structure for menu categories
    return this.categoriesService.getTree();
  }

  @Get('roots')
  @ApiOperation({ summary: 'Get root categories (top level)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Root categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async getRoots(): Promise<CollectionResponse<CategoryResponseDto>> {
    const query = new CategoryQueryDto();
    query.parentId = null;
    query.page = 1;
    query.limit = 100;
    return this.categoriesService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async findBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findBySlug(slug);
  }

  @Get('with-counts')
  @ApiOperation({ 
    summary: 'Get all categories with product counts',
    description: 'Returns hierarchical category tree with direct and total product counts'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories with counts retrieved successfully'
  })
  async getCategoriesWithCounts(): Promise<CollectionResponse<any>> {
    return this.categoriesService.getCategoriesWithCounts();
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get category statistics',
    description: 'Returns aggregated statistics about categories and products'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category statistics retrieved successfully'
  })
  async getCategoryStats(): Promise<any> {
    return this.categoriesService.getCategoryStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiQuery({
    name: 'includeAncestors',
    required: false,
    type: Boolean,
    description: 'Include ancestor categories',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeAncestors') includeAncestors?: boolean,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id, includeAncestors);
  }

  @Get(':id/with-counts')
  @ApiOperation({ 
    summary: 'Get single category with product count',
    description: 'Returns a specific category with its product count'
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category with count retrieved successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found'
  })
  async getCategoryWithCounts(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.categoriesService.getCategoryWithCounts(id);
  }

  @Get(':id/ancestors')
  @ApiOperation({ summary: 'Get category ancestors (path from root)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ancestors retrieved successfully',
    type: [CategoryResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async getAncestors(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CollectionResponse<CategoryResponseDto>> {
    return this.categoriesService.getAncestorsById(id);
  }

  @Get(':id/descendants')
  @ApiOperation({ summary: 'Get all category descendants' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Descendants retrieved successfully',
    type: [CategoryResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async getDescendants(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CollectionResponse<CategoryResponseDto>> {
    return this.categoriesService.getDescendants(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get direct children of a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Children retrieved successfully',
    type: [CategoryResponseDto],
  })
  async getChildren(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CollectionResponse<CategoryResponseDto>> {
    return this.categoriesService.getChildren(id);
  }

  @Get(':id/breadcrumb')
  @ApiOperation({ summary: 'Get breadcrumb path for a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Breadcrumb retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async getBreadcrumb(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CollectionResponse<{ id: string; name: string; slug: string }>> {
    return this.categoriesService.getBreadcrumb(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Slug already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<CategoryResponseDto>> {
    return this.categoriesService.update(id, updateCategoryDto, userId);
  }

  @Post(':id/move')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move a category to a new parent' })
  @ApiParam({ name: 'id', description: 'Category ID to move' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category moved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category or new parent not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid move operation',
  })
  async move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() moveCategoryDto: MoveCategoryDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<CategoryResponseDto>> {
    return this.categoriesService.move(id, moveCategoryDto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category deleted successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete category with subcategories or products',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<CategoryResponseDto>> {
    return this.categoriesService.remove(id, userId);
  }

  @Post(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft deleted category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category restored successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Deleted category not found',
  })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<CategoryResponseDto>> {
    return this.categoriesService.restore(id, userId);
  }
}
