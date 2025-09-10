import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, Not, Between, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Category } from './entities/category.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  CategoryResponseDto,
  CategoryTreeDto,
  MoveCategoryDto,
} from './dto';
import { plainToInstance } from 'class-transformer';
import { 
  CollectionResponse, 
  ResponseHelpers,
  ActionResponseDto 
} from '../../common/dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new category
   */
  async create(
    createCategoryDto: CreateCategoryDto,
    userId?: string,
  ): Promise<ActionResponseDto<CategoryResponseDto>> {
    this.logger.log(`Creating category: ${createCategoryDto.name}`);

    // Check if slug already exists
    if (createCategoryDto.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: createCategoryDto.slug },
      });
      if (existing) {
        throw new ConflictException(`Category with slug ${createCategoryDto.slug} already exists`);
      }
    }

    // Use transaction for nested set operations
    return await this.dataSource.transaction(async manager => {
      const categoryRepo = manager.getRepository(Category);

      // Get parent if specified
      let parent: Category | null = null;
      let level = 0;
      let leftValue = 1;
      let rightValue = 2;

      if (createCategoryDto.parentId) {
        parent = await categoryRepo.findOne({
          where: { id: createCategoryDto.parentId, isDeleted: false },
        });

        if (!parent) {
          throw new NotFoundException(`Parent category ${createCategoryDto.parentId} not found`);
        }

        level = parent.level + 1;
        leftValue = parent.right;
        rightValue = parent.right + 1;

        // Update nested set values for other nodes
        await categoryRepo.update(
          { right: MoreThanOrEqual(parent.right) },
          { right: () => '"right" + 2' },
        );
        await categoryRepo.update(
          { left: MoreThanOrEqual(parent.right) },
          { left: () => '"left" + 2' },
        );
      } else {
        // For root categories, find the max right value
        const maxRight = await categoryRepo
          .createQueryBuilder('category')
          .select('MAX(category.right)', 'max')
          .getRawOne();

        if (maxRight && maxRight.max) {
          leftValue = maxRight.max + 1;
          rightValue = maxRight.max + 2;
        }
      }

      // Create the category
      const category = categoryRepo.create({
        ...createCategoryDto,
        left: leftValue,
        right: rightValue,
        level,
        parentId: parent?.id || null,
        createdBy: userId,
        updatedBy: userId,
      });

      const savedCategory = await categoryRepo.save(category);
      this.logger.log(`Category created with ID: ${savedCategory.id}`);

      return ActionResponseDto.create(this.toResponseDto(savedCategory));
    });
  }

  /**
   * Find all categories with filtering and pagination
   */
  async findAll(query: CategoryQueryDto): Promise<CollectionResponse<CategoryResponseDto>> {
    const { page = 1, limit = 20, sortBy = 'left', sortOrder = 'ASC' } = query;

    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    // Apply filters
    queryBuilder.where('category.isDeleted = :isDeleted', { isDeleted: false });

    if (query.search) {
      queryBuilder.andWhere(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.parentId !== undefined) {
      if (query.parentId === null) {
        queryBuilder.andWhere('category.parentId IS NULL');
      } else {
        queryBuilder.andWhere('category.parentId = :parentId', { parentId: query.parentId });
      }
    }

    if (query.level !== undefined) {
      queryBuilder.andWhere('category.level = :level', { level: query.level });
    }

    if (query.isVisible !== undefined) {
      queryBuilder.andWhere('category.isVisible = :isVisible', { isVisible: query.isVisible });
    }

    if (query.isFeatured !== undefined) {
      queryBuilder.andWhere('category.isFeatured = :isFeatured', { isFeatured: query.isFeatured });
    }

    if (query.showInMenu !== undefined) {
      queryBuilder.andWhere('category.showInMenu = :showInMenu', { showInMenu: query.showInMenu });
    }

    // Apply sorting
    const sortField = `category.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [items, total] = await queryBuilder.getManyAndCount();

    // Transform to DTOs
    const dtos = items.map(item => this.toResponseDto(item));

    // Return standardized response
    return ResponseHelpers.wrapPaginated([dtos, total], page, limit);
  }

  /**
   * Get category tree structure
   */
  async getTree(): Promise<CollectionResponse<CategoryTreeDto>> {
    const categories = await this.categoryRepository.find({
      where: { isDeleted: false },
      order: { left: 'ASC' },
    });

    const tree = this.buildTree(categories);
    return ResponseHelpers.wrapCollection(tree, {
      totalItems: tree.length,
      itemCount: tree.length
    });
  }

  /**
   * Get single category by ID
   */
  async findOne(id: string, includeAncestors = false): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const dto = this.toResponseDto(category);

    if (includeAncestors) {
      const ancestorsResponse = await this.getAncestors(category);
      dto.ancestors = ancestorsResponse.items;
    }

    return dto;
  }

  /**
   * Get category by slug
   */
  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { slug, isDeleted: false },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return this.toResponseDto(category);
  }

  /**
   * Update a category
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId?: string,
  ): Promise<ActionResponseDto<CategoryResponseDto>> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check slug uniqueness if changing
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug, id: Not(id) },
      });
      if (existing) {
        throw new ConflictException(`Category with slug ${updateCategoryDto.slug} already exists`);
      }
    }

    // Update category (parentId changes are handled by move operation)
    Object.assign(category, updateCategoryDto);
    category.updatedBy = userId;

    const updatedCategory = await this.categoryRepository.save(category);
    return ActionResponseDto.update(this.toResponseDto(updatedCategory));
  }

  /**
   * Move a category to a new parent (updates nested set values)
   */
  async move(id: string, moveCategoryDto: MoveCategoryDto, userId?: string): Promise<ActionResponseDto<CategoryResponseDto>> {
    return await this.dataSource.transaction(async manager => {
      const categoryRepo = manager.getRepository(Category);

      const category = await categoryRepo.findOne({
        where: { id, isDeleted: false },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      // Can't move to itself
      if (moveCategoryDto.newParentId === id) {
        throw new BadRequestException('Cannot move category to itself');
      }

      let newParent: Category | null = null;
      let newLevel = 0;
      let newLeft: number;

      if (moveCategoryDto.newParentId) {
        newParent = await categoryRepo.findOne({
          where: { id: moveCategoryDto.newParentId, isDeleted: false },
        });

        if (!newParent) {
          throw new NotFoundException(`New parent category ${moveCategoryDto.newParentId} not found`);
        }

        // Check if new parent is a descendant of the category being moved
        if (newParent.left > category.left && newParent.right < category.right) {
          throw new BadRequestException('Cannot move category to its own descendant');
        }

        newLevel = newParent.level + 1;
        newLeft = moveCategoryDto.position === 'first' 
          ? newParent.left + 1 
          : newParent.right;
      } else {
        // Moving to root
        if (moveCategoryDto.position === 'first') {
          newLeft = 1;
        } else {
          const maxRight = await categoryRepo
            .createQueryBuilder('category')
            .select('MAX(category.right)', 'max')
            .getRawOne();
          newLeft = (maxRight?.max || 0) + 1;
        }
      }

      // Calculate the size of the subtree
      const treeSize = category.right - category.left + 1;
      const levelDiff = newLevel - category.level;

      // Perform the move (complex nested set operation)
      // This is simplified - full implementation would need more careful handling
      await this.performNestedSetMove(
        manager,
        category,
        newLeft,
        levelDiff,
        treeSize,
      );

      // Update the category
      category.parentId = newParent?.id || null;
      category.level = newLevel;
      category.updatedBy = userId;

      const movedCategory = await categoryRepo.save(category);
      this.logger.log(`Category ${id} moved successfully`);

      return ActionResponseDto.update(this.toResponseDto(movedCategory));
    });
  }

  /**
   * Delete a category (soft delete)
   */
  async remove(id: string, userId?: string): Promise<ActionResponseDto<CategoryResponseDto>> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has children
    if (!category.isLeaf()) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    // Check if category has products
    if (category.productCount > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    // Soft delete
    category.softDelete(userId);
    await this.categoryRepository.save(category);

    this.logger.log(`Category ${id} soft deleted`);
    const dto = this.toResponseDto(category);
    return ActionResponseDto.delete(dto);
  }

  /**
   * Restore a soft deleted category
   */
  async restore(id: string, userId?: string): Promise<ActionResponseDto<CategoryResponseDto>> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: true },
    });

    if (!category) {
      throw new NotFoundException(`Deleted category with ID ${id} not found`);
    }

    category.restore();
    category.updatedBy = userId;
    const restoredCategory = await this.categoryRepository.save(category);
    
    this.logger.log(`Category ${id} restored`);
    const dto = this.toResponseDto(restoredCategory);
    return new ActionResponseDto(dto, 'Restored successfully');
  }



  /**
   * Get category ancestors (path from root to category)
   */
  async getAncestors(category: Category): Promise<CollectionResponse<CategoryResponseDto>> {
    const ancestors = await this.categoryRepository.find({
      where: {
        left: LessThanOrEqual(category.left),
        right: MoreThanOrEqual(category.right),
        isDeleted: false,
      },
      order: { left: 'ASC' },
    });

    const items = ancestors
      .filter(a => a.id !== category.id)
      .map(a => this.toResponseDto(a));
    
    return ResponseHelpers.wrapCollection(items, {
      totalItems: items.length,
      itemCount: items.length
    });
  }

  /**
   * Get category ancestors by ID (wrapper for controller)
   */
  async getAncestorsById(id: string): Promise<CollectionResponse<CategoryResponseDto>> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.getAncestors(category);
  }

  /**
   * Get category descendants (all children at any level)
   */
  async getDescendants(id: string): Promise<CollectionResponse<CategoryResponseDto>> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const descendants = await this.categoryRepository.find({
      where: {
        left: MoreThanOrEqual(category.left),
        right: LessThanOrEqual(category.right),
        isDeleted: false,
      },
      order: { left: 'ASC' },
    });

    const items = descendants
      .filter(d => d.id !== category.id)
      .map(d => this.toResponseDto(d));
    
    return ResponseHelpers.wrapCollection(items, {
      totalItems: items.length,
      itemCount: items.length
    });
  }

  /**
   * Get direct children of a category
   */
  async getChildren(id: string): Promise<CollectionResponse<CategoryResponseDto>> {
    const children = await this.categoryRepository.find({
      where: { parentId: id, isDeleted: false },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const items = children.map(child => this.toResponseDto(child));
    return ResponseHelpers.wrapCollection(items, {
      totalItems: items.length,
      itemCount: items.length
    });
  }

  /**
   * Get breadcrumb path for a category
   */
  async getBreadcrumb(id: string): Promise<CollectionResponse<{ id: string; name: string; slug: string }>> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const ancestors = await this.categoryRepository.find({
      where: {
        left: LessThanOrEqual(category.left),
        right: MoreThanOrEqual(category.right),
        isDeleted: false,
      },
      order: { left: 'ASC' },
    });

    const breadcrumbItems = ancestors.map(a => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
    }));

    return ResponseHelpers.wrapCollection(breadcrumbItems, {
      totalItems: breadcrumbItems.length,
      itemCount: breadcrumbItems.length
    });
  }

  /**
   * Helper: Build tree structure from flat list
   */
  private buildTree(categories: Category[]): CategoryTreeDto[] {
    const tree: CategoryTreeDto[] = [];
    const map = new Map<string, CategoryTreeDto>();

    // Create DTOs and map
    categories.forEach(category => {
      const dto: CategoryTreeDto = {
        ...this.toResponseDto(category),
        children: [],
      };
      map.set(category.id, dto);
    });

    // Build tree structure
    categories.forEach(category => {
      const dto = map.get(category.id);
      if (dto) {
        if (category.parentId) {
          const parent = map.get(category.parentId);
          if (parent) {
            parent.children.push(dto);
          }
        } else {
          tree.push(dto);
        }
      }
    });

    return tree;
  }

  /**
   * Helper: Perform nested set move operation
   */
  private async performNestedSetMove(
    manager: any,
    category: Category,
    newLeft: number,
    levelDiff: number,
    treeSize: number,
  ): Promise<void> {
    const categoryRepo = manager.getRepository(Category);
    const oldLeft = category.left;
    const oldRight = category.right;
    const distance = newLeft - oldLeft;

    // Step 1: Create space for the subtree
    await categoryRepo.update(
      { left: MoreThanOrEqual(newLeft) },
      { left: () => `"left" + ${treeSize}` },
    );
    await categoryRepo.update(
      { right: MoreThanOrEqual(newLeft) },
      { right: () => `"right" + ${treeSize}` },
    );

    // Step 2: Move the subtree
    await categoryRepo.update(
      {
        left: Between(oldLeft, oldRight),
        right: Between(oldLeft, oldRight),
      },
      {
        left: () => `"left" + ${distance}`,
        right: () => `"right" + ${distance}`,
        level: () => `"level" + ${levelDiff}`,
      },
    );

    // Step 3: Remove the gap
    await categoryRepo.update(
      { left: MoreThanOrEqual(oldRight + 1) },
      { left: () => `"left" - ${treeSize}` },
    );
    await categoryRepo.update(
      { right: MoreThanOrEqual(oldRight + 1) },
      { right: () => `"right" - ${treeSize}` },
    );
  }

  /**
   * Helper: Convert entity to response DTO
   */
  private toResponseDto(category: Category): CategoryResponseDto {
    return plainToInstance(CategoryResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }
}
