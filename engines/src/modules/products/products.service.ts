import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between, In, Not, IsNull } from 'typeorm';
import { Product, ProductStatus, ProductType } from './entities/product.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductResponseDto,
} from './dto';
import {
  CreateVariantGroupDto,
  UpdateVariantDto,
  BulkVariantUpdateDto,
  VariantGroupResponseDto,
  VariantQueryDto,
  GenerateVariantsDto,
  VariantSummary,
  VariantMatrixDto,
  PriceAdjustmentType,
  BulkUpdateOperation,
  PricingStrategy,
  SkuGenerationStrategy,
  InventoryOperation,
} from './dto/variants';
import { plainToInstance } from 'class-transformer';
import { 
  CollectionResponse, 
  ActionResponseDto,
  ResponseHelpers 
} from '../../common/dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Create a new product
   */
  async create(
    createProductDto: CreateProductDto,
    userId?: string,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    this.logger.log(`Creating product with SKU: ${createProductDto.sku}`);

    // Check if SKU already exists
    const existingProduct = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new ConflictException(`Product with SKU ${createProductDto.sku} already exists`);
    }

    // Validate parent product if specified
    if (createProductDto.parentId) {
      const parentProduct = await this.productRepository.findOne({
        where: { id: createProductDto.parentId },
      });

      if (!parentProduct) {
        throw new NotFoundException(`Parent product with ID ${createProductDto.parentId} not found`);
      }

      // Allow simple variants for any product type except CONFIGURABLE
      // CONFIGURABLE is reserved for complex product builders (PC with components)
      // Simple variants (T-shirt sizes) can have any parent type
      // Only validate if the parent is already marked as CONFIGURABLE to ensure consistency
      if (parentProduct.type === ProductType.CONFIGURABLE && !parentProduct.isConfigurable) {
        // This is a misconfigured product - should not happen
        throw new BadRequestException('Parent product configuration is invalid');
      }
    }

    // Create product entity
    const product = this.productRepository.create({
      ...createProductDto,
      createdBy: userId,
      updatedBy: userId,
      inStock: createProductDto.quantity ? createProductDto.quantity > 0 : false,
    });

    // Generate URL key if not provided
    if (!product.urlKey && product.name) {
      product.urlKey = this.generateUrlKey(product.name);
    }

    const savedProduct = await this.productRepository.save(product);
    const dto = this.toResponseDto(savedProduct);
    return ActionResponseDto.create(dto);
  }

  /**
   * Find all products with filtering and pagination
   */
  async findAll(query: ProductQueryDto): Promise<CollectionResponse<ProductResponseDto>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', includeVariants = false } = query;

    // Build query using QueryBuilder from the start
    let queryBuilder = this.productRepository.createQueryBuilder('product');
    
    // Apply soft delete filter
    queryBuilder.where('product.isDeleted = :isDeleted', { isDeleted: false });

    // Search conditions
    if (query.search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search OR product.sku LIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    if (query.sku) {
      queryBuilder.andWhere('product.sku = :sku', { sku: query.sku });
    }

    if (query.type) {
      queryBuilder.andWhere('product.type = :type', { type: query.type });
    }

    if (query.status) {
      queryBuilder.andWhere('product.status = :status', { status: query.status });
    }

    if (query.brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand: query.brand });
    }

    if (query.manufacturer) {
      queryBuilder.andWhere('product.manufacturer = :manufacturer', { manufacturer: query.manufacturer });
    }

    // Handle parentId filtering
    if (query.parentId) {
      queryBuilder.andWhere('product.parentId = :parentId', { parentId: query.parentId });
    } else if (!includeVariants) {
      // By default, don't include variants unless specifically requested
      queryBuilder.andWhere('product.parentId IS NULL');
    }

    if (query.inStock !== undefined) {
      queryBuilder.andWhere('product.inStock = :inStock', { inStock: query.inStock });
    }

    if (query.isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured: query.isFeatured });
    }

    if (query.isVisible !== undefined) {
      queryBuilder.andWhere('product.isVisible = :isVisible', { isVisible: query.isVisible });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: query.isActive });
    }

    // Apply price range
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      if (query.minPrice !== undefined && query.maxPrice !== undefined) {
        queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
        });
      } else if (query.minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
      } else if (query.maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
      }
    }

    // Apply tags filter
    if (query.tags && query.tags.length > 0) {
      queryBuilder.andWhere('product.tags && :tags', { tags: query.tags });
    }

    // Add relations if needed
    if (includeVariants) {
      queryBuilder.leftJoinAndSelect('product.variants', 'variant');
    }

    // Apply sorting
    const sortField = `product.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [items, total] = await queryBuilder.getManyAndCount();

    // Transform to DTOs
    const dtos = items.map(item => this.toResponseDto(item));

    return ResponseHelpers.wrapPaginated([dtos, total], page, limit);
  }

  /**
   * Find a single product by ID
   */
  async findOne(id: string, includeVariants = false): Promise<ProductResponseDto> {
    const relations = includeVariants ? ['variants'] : [];
    
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
      relations,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.toResponseDto(product);
  }

  /**
   * Find a product by SKU
   */
  async findBySku(sku: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { sku, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    return this.toResponseDto(product);
  }

  /**
   * Update a product
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId?: string,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check SKU uniqueness if changing
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku, id: Not(id) },
      });

      if (existingProduct) {
        throw new ConflictException(`Product with SKU ${updateProductDto.sku} already exists`);
      }
    }

    // Validate parent product if changing
    if (updateProductDto.parentId && updateProductDto.parentId !== product.parentId) {
      const parentProduct = await this.productRepository.findOne({
        where: { id: updateProductDto.parentId },
      });

      if (!parentProduct) {
        throw new NotFoundException(`Parent product with ID ${updateProductDto.parentId} not found`);
      }

      // Allow simple variants for any product type
      // CONFIGURABLE type is reserved for complex product builders
      // Simple parent-child variants don't require specific parent type
    }

    // Update product
    Object.assign(product, updateProductDto);
    product.updatedBy = userId;

    // Update stock status if quantity changed
    if (updateProductDto.quantity !== undefined) {
      product.inStock = updateProductDto.quantity > 0;
    }

    // Generate URL key if name changed and no URL key provided
    if (updateProductDto.name && !updateProductDto.urlKey && !product.urlKey) {
      product.urlKey = this.generateUrlKey(updateProductDto.name);
    }

    const updatedProduct = await this.productRepository.save(product);
    const dto = this.toResponseDto(updatedProduct);
    return ActionResponseDto.update(dto);
  }

  /**
   * Soft delete a product
   */
  async remove(id: string, userId?: string): Promise<ActionResponseDto<ProductResponseDto>> {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if product has variants
    if (product.hasVariants()) {
      throw new BadRequestException('Cannot delete product with variants. Delete variants first.');
    }

    // Soft delete
    product.softDelete(userId);
    await this.productRepository.save(product);

    this.logger.log(`Product ${id} soft deleted by user ${userId}`);
    const dto = this.toResponseDto(product);
    return ActionResponseDto.delete(dto);
  }

  /**
   * Restore a soft deleted product
   */
  async restore(id: string): Promise<ActionResponseDto<ProductResponseDto>> {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: true },
    });

    if (!product) {
      throw new NotFoundException(`Deleted product with ID ${id} not found`);
    }

    product.restore();
    const restoredProduct = await this.productRepository.save(product);
    
    this.logger.log(`Product ${id} restored`);
    const dto = this.toResponseDto(restoredProduct);
    return new ActionResponseDto(dto, 'Restored successfully');
  }

  /**
   * Update product stock
   */
  async updateStock(
    id: string,
    quantity: number,
    userId?: string,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (!product.manageStock) {
      throw new BadRequestException('Stock is not managed for this product');
    }

    product.updateStock(quantity);
    product.updatedBy = userId;

    const updatedProduct = await this.productRepository.save(product);
    
    this.logger.log(`Stock updated for product ${id}: ${quantity}`);
    const dto = this.toResponseDto(updatedProduct);
    return new ActionResponseDto(dto, 'Stock updated successfully');
  }

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(
    ids: string[],
    status: ProductStatus,
    userId?: string,
  ): Promise<ActionResponseDto<{ affected: number }>> {
    const result = await this.productRepository.update(
      { id: In(ids), isDeleted: false },
      { status, updatedBy: userId },
    );

    this.logger.log(`Bulk status update: ${result.affected} products updated to ${status}`);
    const affected = result.affected || 0;
    return new ActionResponseDto(
      { affected },
      `${affected} products updated successfully`
    );
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<CollectionResponse<ProductResponseDto>> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.manageStock = :manageStock', { manageStock: true })
      .andWhere('product.lowStockThreshold IS NOT NULL')
      .andWhere('product.quantity <= product.lowStockThreshold')
      .andWhere('product.isDeleted = :isDeleted', { isDeleted: false })
      .getMany();

    const dtos = products.map(product => this.toResponseDto(product));
    return ResponseHelpers.wrapCollection(dtos, {
      totalItems: dtos.length,
      itemCount: dtos.length
    });
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10): Promise<CollectionResponse<ProductResponseDto>> {
    // Ensure limit is a number
    const numericLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const safeLimit = isNaN(numericLimit) ? 10 : Math.max(1, Math.min(100, numericLimit));

    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isFeatured = :isFeatured', { isFeatured: true })
      .andWhere('product.isVisible = :isVisible', { isVisible: true })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .andWhere('product.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('product.status = :status', { status: ProductStatus.PUBLISHED })
      .orderBy('product.sortOrder', 'ASC')
      .addOrderBy('product.createdAt', 'DESC')
      .take(safeLimit)
      .getMany();

    const dtos = products.map(product => this.toResponseDto(product));
    return ResponseHelpers.wrapCollection(dtos, {
      totalItems: dtos.length,
      itemCount: dtos.length
    });
  }

  /**
   * Helper: Generate URL key from name
   */
  private generateUrlKey(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Helper: Convert entity to response DTO
   */
  private toResponseDto(product: Product): ProductResponseDto {
    const dto = plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });

    // Add calculated fields
    dto.effectivePrice = product.getEffectivePrice();
    dto.isOnSale = product.isOnSale();
    dto.isLowStock = product.isLowStock();
    dto.hasVariants = product.hasVariants();
    dto.isVariant = product.isVariant();
    dto.isAvailable = product.isAvailable();

    return dto;
  }

  // ============ VARIANT MANAGEMENT METHODS ============

  /**
   * Create a variant group for a configurable product
   */
  async createVariantGroup(
    dto: CreateVariantGroupDto,
    userId?: string,
  ): Promise<ActionResponseDto<VariantGroupResponseDto>> {
    this.logger.log(`Creating variant group for parent ${dto.parentId}`);

    // Get parent product
    const parent = await this.productRepository.findOne({
      where: { id: dto.parentId, isDeleted: false },
    });

    if (!parent) {
      throw new NotFoundException(`Parent product ${dto.parentId} not found`);
    }

    // Update parent to be configurable
    parent.type = ProductType.CONFIGURABLE;
    parent.isConfigurable = true;
    parent.variantGroupId = parent.id;
    parent.variantAttributes = dto.variantAttributes || ['sku', 'price', 'quantity'];
    parent.updatedBy = userId;

    await this.productRepository.save(parent);

    // If initial combinations provided, generate variants
    let variants: Product[] = [];
    if (dto.combinations) {
      const generateDto: GenerateVariantsDto = {
        parentId: dto.parentId,
        combinations: dto.combinations,
        skuStrategy: dto.generateSku ? SkuGenerationStrategy.PATTERN : SkuGenerationStrategy.CUSTOM,
        skuPattern: dto.skuPattern || '{parent}-{axes}',
        inheritFields: dto.inheritFields,
      };
      
      const result = await this.generateVariants(dto.parentId, generateDto, userId);
      variants = result.item.variants || [];
    }

    // Prepare response
    const response = await this.getVariantGroup(dto.parentId);
    // Response is already an ActionResponseDto, just return it
    return response;
  }

  /**
   * Get variant group information
   */
  async getVariantGroup(parentId: string): Promise<ActionResponseDto<VariantGroupResponseDto>> {
    const parent = await this.productRepository.findOne({
      where: { id: parentId, isDeleted: false },
      relations: ['variants'],
    });

    if (!parent) {
      throw new NotFoundException(`Parent product ${parentId} not found`);
    }

    if (!parent.isConfigurable) {
      throw new BadRequestException(`Product ${parentId} is not a configurable product`);
    }

    // Get all variants
    const variants = parent.variants.filter(v => !v.isDeleted);

    // Extract available values for each axis
    const availableValues: Record<string, Set<string>> = {};
    variants.forEach(variant => {
      if (variant.variantAxes) {
        Object.entries(variant.variantAxes).forEach(([axis, value]) => {
          if (!availableValues[axis]) {
            availableValues[axis] = new Set();
          }
          availableValues[axis].add(String(value));
        });
      }
    });

    // Calculate statistics
    const statistics = {
      total: variants.length,
      active: variants.filter(v => v.isActive).length,
      published: variants.filter(v => v.status === ProductStatus.PUBLISHED).length,
      outOfStock: variants.filter(v => !v.inStock).length,
      priceRange: {
        min: variants.length > 0 ? Math.min(...variants.map(v => v.price || 0)) : 0,
        max: variants.length > 0 ? Math.max(...variants.map(v => v.price || 0)) : 0,
      },
      totalStock: variants.reduce((sum, v) => sum + (v.quantity || 0), 0),
    };

    const response: VariantGroupResponseDto = {
      parentId: parent.id,
      parentSku: parent.sku,
      parentName: parent.name,
      variantGroupId: parent.variantGroupId || parent.id,
      variantAxes: Object.keys(availableValues),
      variantAttributes: parent.variantAttributes || [],
      variantCount: variants.length,
      availableValues: Object.fromEntries(
        Object.entries(availableValues).map(([k, v]) => [k, Array.from(v)])
      ),
      variants: variants.map(v => this.toVariantSummary(v)),
      statistics,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
    };

    return new ActionResponseDto(response, 'Variant group retrieved successfully');
  }

  /**
   * Generate variants from combinations
   */
  async generateVariants(
    parentId: string,
    dto: GenerateVariantsDto,
    userId?: string,
  ): Promise<ActionResponseDto<{ created: number; skipped: number; variants: Product[] }>> {
    this.logger.log(`Generating variants for parent ${parentId}`);

    const parent = await this.productRepository.findOne({
      where: { id: parentId, isDeleted: false },
    });

    if (!parent) {
      throw new NotFoundException(`Parent product ${parentId} not found`);
    }

    // Convert VariantCombination[] to Record<string, string[]>
    const axesRecord: Record<string, string[]> = {};
    dto.combinations.forEach(combo => {
      axesRecord[combo.axis] = combo.values;
    });
    
    // Generate all combinations
    const combinations = this.generateCombinations(axesRecord);
    const created: Product[] = [];
    let skipped = 0;

    for (const combination of combinations) {
      // Check if combination already exists
      if (dto.skipExisting) {
        const existing = await this.findVariantByCombination(parentId, combination);
        if (existing) {
          skipped++;
          continue;
        }
      }

      // Generate SKU
      const sku = this.generateVariantSku(
        parent.sku,
        combination,
        dto.skuStrategy || SkuGenerationStrategy.PATTERN,
        dto.skuPattern || '{parent}-{axes}',
        dto.customSkus,
      );

      // Calculate price
      const price = this.calculateVariantPrice(
        parent.price || 0,
        combination,
        dto.pricingStrategy || PricingStrategy.FIXED,
        dto.basePrice,
        dto.pricingRules,
        dto.customPrices,
      );

      // Create variant
      const variant = this.productRepository.create({
        sku,
        name: `${parent.name} - ${Object.values(combination).join(' ')}`,
        type: ProductType.SIMPLE,
        status: dto.initialStatus as ProductStatus || ProductStatus.DRAFT,
        price,
        quantity: dto.inventory?.defaultQuantity || 0,
        manageStock: dto.inventory?.manageStock ?? true,
        lowStockThreshold: dto.inventory?.lowStockThreshold,
        parentId: parent.id,
        variantGroupId: parent.variantGroupId || parent.id,
        variantAxes: combination,
        inheritedAttributes: true,
        isVisible: dto.isVisible ?? true,
        attributes: dto.defaultAttributes,
        createdBy: userId,
        updatedBy: userId,
      });

      // Inherit fields from parent
      if (dto.inheritFields) {
        dto.inheritFields.forEach(field => {
          if (parent[field] !== undefined) {
            variant[field] = parent[field];
          }
        });
      }

      created.push(await this.productRepository.save(variant));
    }

    this.logger.log(`Generated ${created.length} variants, skipped ${skipped}`);
    return new ActionResponseDto({
      created: created.length,
      skipped,
      variants: created,
    }, `Generated ${created.length} variants successfully`);
  }

  /**
   * Update a single variant
   */
  async updateVariant(
    variantId: string,
    dto: UpdateVariantDto,
    userId?: string,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    const variant = await this.productRepository.findOne({
      where: { id: variantId, isDeleted: false },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ${variantId} not found`);
    }

    if (!variant.isVariant()) {
      throw new BadRequestException(`Product ${variantId} is not a variant`);
    }

    // Update variant
    Object.assign(variant, dto);
    variant.updatedBy = userId;

    // Update stock status if quantity changed
    if (dto.quantity !== undefined) {
      variant.inStock = dto.quantity > 0;
    }

    const updated = await this.productRepository.save(variant);
    return ActionResponseDto.update(this.toResponseDto(updated));
  }

  /**
   * Bulk update variants
   */
  async bulkUpdateVariants(
    dto: BulkVariantUpdateDto,
    userId?: string,
  ): Promise<ActionResponseDto<{ updated: number; results: ProductResponseDto[] }>> {
    this.logger.log(`Bulk updating ${dto.variantIds.length} variants`);

    const variants = await this.productRepository.findBy({
      id: In(dto.variantIds),
      isDeleted: false,
    });

    if (variants.length === 0) {
      throw new NotFoundException('No variants found with provided IDs');
    }

    const updated: Product[] = [];

    for (const variant of variants) {
      // Apply status update
      if (dto.status) {
        variant.status = dto.status as ProductStatus;
      }

      // Apply visibility update
      if (dto.isVisible !== undefined) {
        variant.isVisible = dto.isVisible;
      }

      // Apply price adjustment
      if (dto.priceAdjustment && variant.price) {
        variant.price = this.applyPriceAdjustment(
          variant.price,
          dto.priceAdjustment.type,
          dto.priceAdjustment.value,
        );
      }

      // Apply cost adjustment
      if (dto.costAdjustment && variant.cost) {
        variant.cost = this.applyPriceAdjustment(
          variant.cost,
          dto.costAdjustment.type,
          dto.costAdjustment.value,
        );
      }

      // Apply inventory adjustment
      if (dto.inventoryAdjustment) {
        variant.quantity = this.applyInventoryAdjustment(
          variant.quantity,
          dto.inventoryAdjustment.operation,
          dto.inventoryAdjustment.value,
        );
        variant.inStock = variant.quantity > 0;
      }

      // Apply other updates
      if (dto.manageStock !== undefined) {
        variant.manageStock = dto.manageStock;
      }

      if (dto.lowStockThreshold !== undefined) {
        variant.lowStockThreshold = dto.lowStockThreshold;
      }

      if (dto.attributes) {
        variant.attributes = { ...variant.attributes, ...dto.attributes };
      }

      if (dto.tags) {
        variant.tags = dto.tags;
      }

      if (dto.inheritedAttributes !== undefined) {
        variant.inheritedAttributes = dto.inheritedAttributes;
      }

      variant.updatedBy = userId;
      updated.push(await this.productRepository.save(variant));
    }

    const results = updated.map(v => this.toResponseDto(v));
    return new ActionResponseDto({
      updated: updated.length,
      results,
    }, `Updated ${updated.length} variants successfully`);
  }

  /**
   * Sync variant inventory with parent
   */
  async syncVariantInventory(parentId: string): Promise<ActionResponseDto<{ synced: number }>> {
    const parent = await this.productRepository.findOne({
      where: { id: parentId, isDeleted: false },
      relations: ['variants'],
    });

    if (!parent) {
      throw new NotFoundException(`Parent product ${parentId} not found`);
    }

    const variants = parent.variants.filter(v => !v.isDeleted);
    const totalQuantity = variants.reduce((sum, v) => sum + v.quantity, 0);

    parent.quantity = totalQuantity;
    parent.inStock = totalQuantity > 0;
    await this.productRepository.save(parent);

    this.logger.log(`Synced inventory for ${parentId}: total quantity ${totalQuantity}`);
    return new ActionResponseDto({ synced: variants.length }, 'Inventory synced successfully');
  }

  /**
   * Dissolve a variant group
   */
  async dissolveVariantGroup(
    parentId: string,
    userId?: string,
  ): Promise<ActionResponseDto<{ affected: number }>> {
    const parent = await this.productRepository.findOne({
      where: { id: parentId, isDeleted: false },
      relations: ['variants'],
    });

    if (!parent) {
      throw new NotFoundException(`Parent product ${parentId} not found`);
    }

    // Update parent
    parent.type = ProductType.SIMPLE;
    parent.isConfigurable = false;
    parent.variantGroupId = null;
    parent.variantAttributes = null;
    parent.updatedBy = userId;
    await this.productRepository.save(parent);

    // Convert variants to standalone products
    const variants = parent.variants.filter(v => !v.isDeleted);
    for (const variant of variants) {
      variant.parentId = null;
      variant.variantGroupId = null;
      variant.variantAxes = null;
      variant.inheritedAttributes = false;
      variant.updatedBy = userId;
      await this.productRepository.save(variant);
    }

    this.logger.log(`Dissolved variant group ${parentId}, affected ${variants.length} variants`);
    return new ActionResponseDto({ affected: variants.length }, 'Variant group dissolved successfully');
  }

  /**
   * Get variant matrix view
   */
  async getVariantMatrix(parentId: string): Promise<ActionResponseDto<VariantMatrixDto>> {
    const parent = await this.productRepository.findOne({
      where: { id: parentId, isDeleted: false },
      relations: ['variants'],
    });

    if (!parent) {
      throw new NotFoundException(`Parent product ${parentId} not found`);
    }

    const variants = parent.variants.filter(v => !v.isDeleted);

    // Extract axes and their values
    const axisValues: Record<string, Set<string>> = {};
    const axes: Set<string> = new Set();

    variants.forEach(variant => {
      if (variant.variantAxes) {
        Object.entries(variant.variantAxes).forEach(([axis, value]) => {
          axes.add(axis);
          if (!axisValues[axis]) {
            axisValues[axis] = new Set();
          }
          axisValues[axis].add(String(value));
        });
      }
    });

    // Generate all possible combinations
    const axisArray = Array.from(axes);
    const allCombinations = this.generateCombinations(
      Object.fromEntries(
        axisArray.map(axis => [axis, Array.from(axisValues[axis] || [])])
      )
    );

    // Map existing variants
    const variantMap = new Map(
      variants.map(v => [
        JSON.stringify(v.variantAxes || {}),
        v,
      ])
    );

    // Build matrix
    const matrix = allCombinations.map(combination => {
      const key = JSON.stringify(combination);
      const variant = variantMap.get(key);

      return {
        axes: combination,
        id: variant?.id,
        sku: variant?.sku,
        price: variant?.price,
        quantity: variant?.quantity,
        status: variant?.status,
      };
    });

    const response: VariantMatrixDto = {
      parentId: parent.id,
      axes: axisArray,
      axisValues: Object.fromEntries(
        Object.entries(axisValues).map(([k, v]) => [k, Array.from(v)])
      ),
      matrix,
      summary: {
        total: allCombinations.length,
        created: variants.length,
        missing: allCombinations.length - variants.length,
      },
    };

    return new ActionResponseDto(response, 'Variant matrix retrieved successfully');
  }

  /**
   * Search variants across all products
   */
  async searchVariants(query: VariantQueryDto): Promise<CollectionResponse<ProductResponseDto>> {
    const { page = 1, limit = 20, sortBy = 'sortOrder', sortOrder = 'ASC' } = query;

    let queryBuilder = this.productRepository.createQueryBuilder('product');
    
    queryBuilder.where('product.isDeleted = :isDeleted', { isDeleted: false });
    queryBuilder.andWhere('product.parentId IS NOT NULL');

    if (query.parentId) {
      queryBuilder.andWhere('product.parentId = :parentId', { parentId: query.parentId });
    }

    if (query.variantGroupId) {
      queryBuilder.andWhere('product.variantGroupId = :variantGroupId', {
        variantGroupId: query.variantGroupId,
      });
    }

    if (query.variantAxes) {
      queryBuilder.andWhere('product.variantAxes @> :variantAxes', {
        variantAxes: JSON.stringify(query.variantAxes),
      });
    }

    if (query.status) {
      queryBuilder.andWhere('product.status = :status', { status: query.status });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.sku LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Apply sorting
    const sortField = `product.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    const dtos = items.map(item => this.toResponseDto(item));

    return ResponseHelpers.wrapPaginated([dtos, total], page, limit);
  }

  // ============ VARIANT HELPER METHODS ============

  /**
   * Find variant by combination
   */
  private async findVariantByCombination(
    parentId: string,
    combination: Record<string, any>,
  ): Promise<Product | null> {
    return this.productRepository.findOne({
      where: {
        parentId,
        variantAxes: combination,
        isDeleted: false,
      },
    });
  }

  /**
   * Generate all combinations from axes
   */
  private generateCombinations(axes: Record<string, string[]>): Record<string, any>[] {
    const keys = Object.keys(axes);
    if (keys.length === 0) return [];

    const result: Record<string, any>[] = [];
    const values = keys.map(k => axes[k]);
    const lengths = values.map(v => v.length);
    const total = lengths.reduce((a, b) => a * b, 1);

    for (let i = 0; i < total; i++) {
      const combination: Record<string, any> = {};
      let temp = i;

      for (let j = keys.length - 1; j >= 0; j--) {
        combination[keys[j]] = values[j][temp % lengths[j]];
        temp = Math.floor(temp / lengths[j]);
      }

      result.push(combination);
    }

    return result;
  }

  /**
   * Generate variant SKU
   */
  private generateVariantSku(
    parentSku: string,
    combination: Record<string, any>,
    strategy: SkuGenerationStrategy,
    pattern: string,
    customSkus?: Record<string, string>,
  ): string {
    const combinationKey = Object.values(combination).join('-');

    if (customSkus && customSkus[combinationKey]) {
      return customSkus[combinationKey];
    }

    switch (strategy) {
      case SkuGenerationStrategy.SEQUENTIAL:
        return `${parentSku}-${Date.now()}`;

      case SkuGenerationStrategy.PATTERN:
        let sku = pattern.replace('{parent}', parentSku);
        sku = sku.replace('{axes}', combinationKey);
        Object.entries(combination).forEach(([key, value]) => {
          sku = sku.replace(`{${key}}`, String(value));
        });
        return sku;

      default:
        return `${parentSku}-${combinationKey}`;
    }
  }

  /**
   * Calculate variant price
   */
  private calculateVariantPrice(
    basePrice: number,
    combination: Record<string, any>,
    strategy: PricingStrategy,
    customBase?: number,
    rules?: Record<string, any>,
    customPrices?: Record<string, number>,
  ): number {
    const combinationKey = Object.values(combination).join('-');

    if (customPrices && customPrices[combinationKey]) {
      return customPrices[combinationKey];
    }

    const price = customBase || basePrice;

    switch (strategy) {
      case PricingStrategy.PERCENTAGE_INCREASE:
        return price * 1.1; // 10% increase

      case PricingStrategy.AXIS_BASED:
        let adjustedPrice = price;
        if (rules) {
          // Handle rules as a Record of axis -> adjustments
          Object.entries(rules).forEach(([axis, axisRules]) => {
            const value = combination[axis];
            if (value && axisRules && axisRules[value]) {
              const adjustment = axisRules[value];
              if (typeof adjustment === 'number') {
                adjustedPrice += adjustment;
              } else if (adjustment && adjustment.type === 'percentage') {
                adjustedPrice *= (1 + adjustment.value / 100);
              } else if (adjustment && adjustment.type === 'fixed') {
                adjustedPrice += adjustment.value;
              }
            }
          });
        }
        return adjustedPrice;

      default:
        return price;
    }
  }

  /**
   * Apply price adjustment
   */
  private applyPriceAdjustment(
    currentPrice: number,
    type: PriceAdjustmentType,
    value: number,
  ): number {
    switch (type) {
      case PriceAdjustmentType.FIXED:
        return currentPrice + value;
      case PriceAdjustmentType.PERCENTAGE:
        return currentPrice * (1 + value / 100);
      case PriceAdjustmentType.ABSOLUTE:
        return value;
      default:
        return currentPrice;
    }
  }

  /**
   * Apply inventory adjustment
   */
  private applyInventoryAdjustment(
    currentQuantity: number,
    operation: InventoryOperation | string,
    value: number,
  ): number {
    switch (operation) {
      case InventoryOperation.SET:
      case 'set':
        return value;
      case InventoryOperation.ADD:
      case 'add':
      case 'increment':
        return currentQuantity + value;
      case InventoryOperation.SUBTRACT:
      case 'subtract':
      case 'decrement':
        return Math.max(0, currentQuantity - value);
      case 'multiply':
        return Math.floor(currentQuantity * value);
      default:
        return currentQuantity;
    }
  }

  /**
   * Convert product to variant summary
   */
  private toVariantSummary(product: Product): VariantSummary {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      variantAxes: product.variantAxes || {},
      price: product.price || 0,
      quantity: product.quantity,
      status: product.status,
      isVisible: product.isVisible,
      thumbnail: undefined, // Optional field
    };
  }
}
