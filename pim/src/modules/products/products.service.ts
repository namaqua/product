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
import { PaginatedResponseDto, createPaginatedResponse } from '../../common/dto';

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
  ): Promise<ProductResponseDto> {
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
    return this.toResponseDto(savedProduct);
  }

  /**
   * Find all products with filtering and pagination
   */
  async findAll(query: ProductQueryDto): Promise<PaginatedResponseDto<ProductResponseDto>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', includeVariants = false } = query;

    const where: FindOptionsWhere<Product> | FindOptionsWhere<Product>[] = {};

    // Build search conditions
    if (query.search) {
      where.name = Like(`%${query.search}%`);
      // Could also search in description, but TypeORM doesn't support OR easily in FindOptionsWhere
      // For complex queries, we'd use QueryBuilder
    }

    if (query.sku) {
      where.sku = query.sku;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.brand) {
      where.brand = query.brand;
    }

    if (query.manufacturer) {
      where.manufacturer = query.manufacturer;
    }

    if (query.parentId) {
      where.parentId = query.parentId;
    } else if (!includeVariants) {
      // By default, don't include variants unless specifically requested
      where.parentId = IsNull();
    }

    if (query.inStock !== undefined) {
      where.inStock = query.inStock;
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    if (query.isVisible !== undefined) {
      where.isVisible = query.isVisible;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Price range filter (requires QueryBuilder for complex conditions)
    let queryBuilder = this.productRepository.createQueryBuilder('product');
    
    // Apply basic where conditions
    Object.keys(where).forEach(key => {
      if (where[key as keyof typeof where] !== undefined) {
        queryBuilder.andWhere(`product.${key} = :${key}`, { [key]: where[key as keyof typeof where] });
      }
    });

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

    // Apply soft delete filter
    queryBuilder.andWhere('product.isDeleted = :isDeleted', { isDeleted: false });

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

    return createPaginatedResponse(dtos, page, limit, total);
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
  ): Promise<ProductResponseDto> {
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
    return this.toResponseDto(updatedProduct);
  }

  /**
   * Soft delete a product
   */
  async remove(id: string, userId?: string): Promise<void> {
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
  }

  /**
   * Restore a soft deleted product
   */
  async restore(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: true },
    });

    if (!product) {
      throw new NotFoundException(`Deleted product with ID ${id} not found`);
    }

    product.restore();
    const restoredProduct = await this.productRepository.save(product);
    
    this.logger.log(`Product ${id} restored`);
    return this.toResponseDto(restoredProduct);
  }

  /**
   * Update product stock
   */
  async updateStock(
    id: string,
    quantity: number,
    userId?: string,
  ): Promise<ProductResponseDto> {
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
    return this.toResponseDto(updatedProduct);
  }

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(
    ids: string[],
    status: ProductStatus,
    userId?: string,
  ): Promise<number> {
    const result = await this.productRepository.update(
      { id: In(ids), isDeleted: false },
      { status, updatedBy: userId },
    );

    this.logger.log(`Bulk status update: ${result.affected} products updated to ${status}`);
    return result.affected || 0;
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.manageStock = :manageStock', { manageStock: true })
      .andWhere('product.lowStockThreshold IS NOT NULL')
      .andWhere('product.quantity <= product.lowStockThreshold')
      .andWhere('product.isDeleted = :isDeleted', { isDeleted: false })
      .getMany();

    return products.map(product => this.toResponseDto(product));
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 10): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.find({
      where: {
        isFeatured: true,
        isVisible: true,
        isActive: true,
        isDeleted: false,
        status: ProductStatus.PUBLISHED,
      },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      take: limit,
    });

    return products.map(product => this.toResponseDto(product));
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
