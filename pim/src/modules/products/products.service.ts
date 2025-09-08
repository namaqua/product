import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Like, Between, MoreThan } from 'typeorm';
import {
  Product,
  ProductLocale,
  ProductVariant,
  ProductBundle,
  ProductRelationship,
  ProductAttribute,
  ProductMedia,
  ProductCategory,
  ProductType,
  ProductStatus,
} from './entities';
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

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductLocale)
    private readonly localeRepository: Repository<ProductLocale>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductBundle)
    private readonly bundleRepository: Repository<ProductBundle>,
    @InjectRepository(ProductRelationship)
    private readonly relationshipRepository: Repository<ProductRelationship>,
    @InjectRepository(ProductAttribute)
    private readonly attributeRepository: Repository<ProductAttribute>,
    @InjectRepository(ProductMedia)
    private readonly mediaRepository: Repository<ProductMedia>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * DEBUG: Simple direct query without any complex logic
   */
  async getSimpleProducts(): Promise<any> {
    console.log('🔍 DEBUG: Running simple products query');
    try {
      // Check database connection info
      const dbInfo = await this.dataSource.query(`
        SELECT current_database() as database,
               current_user as user,
               inet_server_addr() as server_addr,
               inet_server_port() as server_port,
               version() as version
      `);
      console.log('📊 Database info:', dbInfo);
      
      // Check all tables and their row counts
      const tables = await this.dataSource.query(`
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `);
      console.log('📊 Tables:', tables);
      
      // First, try raw SQL
      const rawResult = await this.dataSource.query('SELECT COUNT(*) as count FROM products');
      console.log('📊 Raw SQL count:', rawResult);
      
      // Check what table TypeORM thinks it should use
      const metadata = this.productRepository.metadata;
      console.log('📋 Table name:', metadata.tableName);
      console.log('📋 Schema:', metadata.schema);
      
      // Try another raw query
      const rawProducts = await this.dataSource.query('SELECT id, sku, status FROM products LIMIT 5');
      console.log('📊 Raw products:', rawProducts);
      
      // Most basic TypeORM query
      const products = await this.productRepository.find();
      console.log(`📊 TypeORM found ${products.length} products`);
      
      return {
        rawCount: rawResult,
        rawProducts: rawProducts,
        typeormProducts: products,
        tableInfo: {
          tableName: metadata.tableName,
          schema: metadata.schema
        }
      };
    } catch (error) {
      console.error('❌ Error in simple query:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  async create(createProductDto: CreateProductDto, userId: string): Promise<ProductResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if SKU already exists
      const existingProduct = await this.productRepository.findOne({
        where: { sku: createProductDto.sku },
      });

      if (existingProduct) {
        throw new ConflictException(`Product with SKU ${createProductDto.sku} already exists`);
      }

      // Create the product
      const product = this.productRepository.create({
        ...createProductDto,
        createdBy: { id: userId } as any,
        updatedBy: { id: userId } as any,
      });

      const savedProduct = await queryRunner.manager.save(Product, product);

      // Save locales if provided
      if (createProductDto.locales?.length) {
        const locales = createProductDto.locales.map((locale) =>
          this.localeRepository.create({
            ...locale,
            productId: savedProduct.id,
          }),
        );
        await queryRunner.manager.save(ProductLocale, locales);
      }

      // Save attributes if provided
      if (createProductDto.attributes?.length) {
        const attributes = createProductDto.attributes.map((attr) =>
          this.attributeRepository.create({
            ...attr,
            productId: savedProduct.id,
          }),
        );
        await queryRunner.manager.save(ProductAttribute, attributes);
      }

      // Save media if provided
      if (createProductDto.media?.length) {
        const media = createProductDto.media.map((m, index) =>
          this.mediaRepository.create({
            ...m,
            productId: savedProduct.id,
            isPrimary: index === 0 && !m.isPrimary ? true : m.isPrimary,
          }),
        );
        await queryRunner.manager.save(ProductMedia, media);
      }

      // Save categories if provided
      if (createProductDto.categoryIds?.length) {
        const categories = createProductDto.categoryIds.map((categoryId, index) =>
          this.categoryRepository.create({
            productId: savedProduct.id,
            categoryId,
            isPrimary: index === 0,
          }),
        );
        await queryRunner.manager.save(ProductCategory, categories);
      }

      // Save variants if it's a configurable product
      if (product.type === ProductType.CONFIGURABLE && createProductDto.variants?.length) {
        const variants = createProductDto.variants.map((variant) =>
          this.variantRepository.create({
            ...variant,
            parentProductId: savedProduct.id,
          }),
        );
        await queryRunner.manager.save(ProductVariant, variants);
      }

      // Save bundle items if it's a bundle product
      if (product.type === ProductType.BUNDLE && createProductDto.bundleItems?.length) {
        const bundleItems = createProductDto.bundleItems.map((item) =>
          this.bundleRepository.create({
            ...item,
            bundleProductId: savedProduct.id,
          }),
        );
        await queryRunner.manager.save(ProductBundle, bundleItems);
      }

      // Save relationships if provided
      if (createProductDto.relationships?.length) {
        const relationships = createProductDto.relationships.map((rel) =>
          this.relationshipRepository.create({
            ...rel,
            sourceProductId: savedProduct.id,
          }),
        );
        await queryRunner.manager.save(ProductRelationship, relationships);
      }

      await queryRunner.commitTransaction();

      // Fetch and return the complete product
      return this.findOne(savedProduct.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create product: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find all products with filtering and pagination
   */
  async findAll(filterDto: FilterProductDto): Promise<PaginatedProductResponse> {
    console.log('🔍 findAll called with filters:', filterDto);
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      sku,
      type,
      status,
      statuses,
      isVisible,
      isFeatured,
      inStock,
      minPrice,
      maxPrice,
      minQuantity,
      categoryIds,
      parentId,
      localeCode,
      includeLocales,
      includeAttributes,
      includeMedia,
      includeCategories,
      includeVariants,
      includeRelationships,
    } = filterDto;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Apply filters
    if (search) {
      queryBuilder.leftJoin('product.locales', 'searchLocale');
      queryBuilder.andWhere(
        '(product.sku ILIKE :search OR searchLocale.name ILIKE :search OR searchLocale.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sku) {
      queryBuilder.andWhere('product.sku ILIKE :sku', { sku: `%${sku}%` });
    }

    if (type) {
      queryBuilder.andWhere('product.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    if (statuses?.length) {
      queryBuilder.andWhere('product.status IN (:...statuses)', { statuses });
    }

    if (isVisible !== undefined) {
      queryBuilder.andWhere('product.isVisible = :isVisible', { isVisible });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    if (inStock !== undefined) {
      queryBuilder.andWhere('product.inStock = :inStock', { inStock });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (minQuantity !== undefined) {
      queryBuilder.andWhere('product.quantity >= :minQuantity', { minQuantity });
    }

    if (categoryIds?.length) {
      queryBuilder
        .leftJoin('product.productCategories', 'filterCategory')
        .andWhere('filterCategory.categoryId IN (:...categoryIds)', { categoryIds });
    }

    if (parentId !== undefined) {
      queryBuilder.andWhere('product.parentId = :parentId', { parentId });
    }

    // Include relations based on flags
    if (includeLocales) {
      queryBuilder.leftJoinAndSelect('product.locales', 'locale');
      if (localeCode) {
        queryBuilder.andWhere('locale.localeCode = :localeCode', { localeCode });
      }
    }

    if (includeAttributes) {
      queryBuilder.leftJoinAndSelect('product.attributes', 'attribute');
    }

    if (includeMedia) {
      queryBuilder.leftJoinAndSelect('product.media', 'media');
      queryBuilder.orderBy('media.isPrimary', 'DESC');
      queryBuilder.addOrderBy('media.sortOrder', 'ASC');
    }

    if (includeCategories) {
      queryBuilder.leftJoinAndSelect('product.productCategories', 'category');
    }

    if (includeVariants) {
      queryBuilder.leftJoinAndSelect('product.variants', 'variant');
    }

    if (includeRelationships) {
      queryBuilder.leftJoinAndSelect('product.relatedProducts', 'relationship');
    }

    // Apply sorting
    const sortField = sortBy === 'name' && includeLocales ? 'locale.name' : `product.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    console.log('🔍 Executing query...');
    const query = queryBuilder.getQuery();
    console.log('📝 SQL Query:', query);
    const [items, total] = await queryBuilder.getManyAndCount();
    console.log(`📊 Found ${total} products`);

    // Transform to response format
    const transformedItems = items.map((item) => this.transformToResponse(item));

    return {
      items: transformedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    };
  }

  /**
   * Find a single product by ID
   */
  async findOne(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'locales',
        'attributes',
        'media',
        'productCategories',
        'variants',
        'bundleItems',
        'relatedProducts',
      ],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.transformToResponse(product);
  }

  /**
   * Find a product by SKU
   */
  async findBySku(sku: string): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { sku },
      relations: [
        'locales',
        'attributes',
        'media',
        'productCategories',
        'variants',
        'bundleItems',
        'relatedProducts',
      ],
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    return this.transformToResponse(product);
  }

  /**
   * Update a product
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<ProductResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this.productRepository.findOne({ where: { id } });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Check SKU uniqueness if updating
      if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
        const existingProduct = await this.productRepository.findOne({
          where: { sku: updateProductDto.sku },
        });

        if (existingProduct) {
          throw new ConflictException(`Product with SKU ${updateProductDto.sku} already exists`);
        }
      }

      // Update product fields
      Object.assign(product, updateProductDto, {
        updatedBy: { id: userId } as any,
      });

      await queryRunner.manager.save(Product, product);

      // Update locales if provided
      if (updateProductDto.locales) {
        // Delete existing locales
        await queryRunner.manager.delete(ProductLocale, { productId: id });

        // Create new locales
        const locales = updateProductDto.locales.map((locale) =>
          this.localeRepository.create({
            ...locale,
            productId: id,
          }),
        );
        await queryRunner.manager.save(ProductLocale, locales);
      }

      // Update attributes if provided
      if (updateProductDto.attributes) {
        await queryRunner.manager.delete(ProductAttribute, { productId: id });

        const attributes = updateProductDto.attributes.map((attr) =>
          this.attributeRepository.create({
            ...attr,
            productId: id,
          }),
        );
        await queryRunner.manager.save(ProductAttribute, attributes);
      }

      // Update media if provided
      if (updateProductDto.media) {
        await queryRunner.manager.delete(ProductMedia, { productId: id });

        const media = updateProductDto.media.map((m, index) =>
          this.mediaRepository.create({
            ...m,
            productId: id,
            isPrimary: index === 0 && !m.isPrimary ? true : m.isPrimary,
          }),
        );
        await queryRunner.manager.save(ProductMedia, media);
      }

      // Update categories if provided
      if (updateProductDto.categoryIds) {
        await queryRunner.manager.delete(ProductCategory, { productId: id });

        const categories = updateProductDto.categoryIds.map((categoryId, index) =>
          this.categoryRepository.create({
            productId: id,
            categoryId,
            isPrimary: index === 0,
          }),
        );
        await queryRunner.manager.save(ProductCategory, categories);
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update product: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete a product (soft delete)
   */
  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.softRemove(product);
  }

  /**
   * Restore a soft-deleted product
   */
  async restore(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (!product.deletedAt) {
      throw new BadRequestException(`Product with ID ${id} is not deleted`);
    }

    await this.productRepository.recover(product);
    return this.findOne(id);
  }

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(bulkUpdateDto: BulkUpdateStatusDto): Promise<BulkOperationResponse> {
    const { productIds, status } = bulkUpdateDto;

    try {
      const result = await this.productRepository.update(
        { id: In(productIds) },
        { status },
      );

      return {
        success: true,
        processedCount: result.affected || 0,
        failedCount: productIds.length - (result.affected || 0),
      };
    } catch (error) {
      this.logger.error(`Bulk status update failed: ${error.message}`, error.stack);
      return {
        success: false,
        processedCount: 0,
        failedCount: productIds.length,
        errors: [{ productId: 'all', error: error.message }],
      };
    }
  }

  /**
   * Bulk update product visibility
   */
  async bulkUpdateVisibility(
    bulkUpdateDto: BulkUpdateVisibilityDto,
  ): Promise<BulkOperationResponse> {
    const { productIds, isVisible } = bulkUpdateDto;

    try {
      const result = await this.productRepository.update(
        { id: In(productIds) },
        { isVisible },
      );

      return {
        success: true,
        processedCount: result.affected || 0,
        failedCount: productIds.length - (result.affected || 0),
      };
    } catch (error) {
      this.logger.error(`Bulk visibility update failed: ${error.message}`, error.stack);
      return {
        success: false,
        processedCount: 0,
        failedCount: productIds.length,
        errors: [{ productId: 'all', error: error.message }],
      };
    }
  }

  /**
   * Duplicate a product
   */
  async duplicate(id: string, newSku: string, userId: string): Promise<ProductResponse> {
    const sourceProduct = await this.findOne(id);

    const createDto: CreateProductDto = {
      sku: newSku,
      type: sourceProduct.type,
      status: ProductStatus.DRAFT,
      quantity: sourceProduct.quantity,
      trackInventory: sourceProduct.trackInventory,
      minQuantity: sourceProduct.minQuantity,
      maxQuantity: sourceProduct.maxQuantity,
      price: sourceProduct.price,
      comparePrice: sourceProduct.comparePrice,
      costPrice: sourceProduct.costPrice,
      weight: sourceProduct.weight,
      weightUnit: sourceProduct.weightUnit,
      length: sourceProduct.length,
      width: sourceProduct.width,
      height: sourceProduct.height,
      dimensionUnit: sourceProduct.dimensionUnit,
      isVisible: false, // Start as hidden
      isFeatured: sourceProduct.isFeatured,
      sortOrder: sourceProduct.sortOrder,
      metadata: sourceProduct.metadata,
      customFields: sourceProduct.customFields,
      locales: sourceProduct.locales?.map((locale) => ({
        localeCode: locale.localeCode,
        name: `${locale.name} (Copy)`,
        description: locale.description,
        shortDescription: locale.shortDescription,
        metaTitle: locale.metaTitle,
        metaDescription: locale.metaDescription,
        metaKeywords: locale.metaKeywords,
        urlKey: locale.urlKey ? `${locale.urlKey}-copy` : null,
        features: locale.features,
        specifications: locale.specifications,
      })),
    };

    return this.create(createDto, userId);
  }

  /**
   * Update product inventory
   */
  async updateInventory(
    id: string,
    quantity: number,
    operation: 'set' | 'increment' | 'decrement' = 'set',
  ): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (!product.trackInventory) {
      throw new BadRequestException(`Product ${product.sku} does not track inventory`);
    }

    let newQuantity: number;

    switch (operation) {
      case 'increment':
        newQuantity = product.quantity + quantity;
        break;
      case 'decrement':
        newQuantity = product.quantity - quantity;
        if (newQuantity < 0) {
          throw new BadRequestException(`Insufficient inventory for product ${product.sku}`);
        }
        break;
      default:
        newQuantity = quantity;
    }

    product.quantity = newQuantity;
    await this.productRepository.save(product);

    return this.transformToResponse(product);
  }

  /**
   * Get product statistics
   */
  async getStatistics(): Promise<any> {
    const totalProducts = await this.productRepository.count();
    const publishedProducts = await this.productRepository.count({
      where: { status: ProductStatus.PUBLISHED },
    });
    const draftProducts = await this.productRepository.count({
      where: { status: ProductStatus.DRAFT },
    });
    const outOfStock = await this.productRepository.count({
      where: { inStock: false, trackInventory: true },
    });
    const lowStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.trackInventory = true')
      .andWhere('product.quantity > 0')
      .andWhere('product.quantity <= product.minQuantity')
      .getCount();

    return {
      total: totalProducts,
      published: publishedProducts,
      draft: draftProducts,
      outOfStock,
      lowStock,
      byType: await this.getProductCountByType(),
      byStatus: await this.getProductCountByStatus(),
    };
  }

  /**
   * Helper: Get product count by type
   */
  private async getProductCountByType() {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('product.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.type')
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count, 10);
      return acc;
    }, {});
  }

  /**
   * Helper: Get product count by status
   */
  private async getProductCountByStatus() {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('product.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.status')
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count, 10);
      return acc;
    }, {});
  }

  /**
   * Helper: Transform entity to response DTO
   */
  private transformToResponse(product: Product): ProductResponse {
    const primaryImage = product.media?.find((m) => m.isPrimary)?.url;
    const defaultLocale = product.locales?.find((l) => l.localeCode === 'en') || product.locales?.[0];

    return {
      ...product,
      primaryImage,
      defaultName: defaultLocale?.name,
      defaultDescription: defaultLocale?.description,
    } as ProductResponse;
  }
}
