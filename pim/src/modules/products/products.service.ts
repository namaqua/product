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

      if (parentProduct.type !== ProductType.CONFIGURABLE) {
        throw new BadRequestException('Parent product must be of type CONFIGURABLE');
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

      if (parentProduct.type !== ProductType.CONFIGURABLE) {
        throw new BadRequestException('Parent product must be of type CONFIGURABLE');
      }
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
}
