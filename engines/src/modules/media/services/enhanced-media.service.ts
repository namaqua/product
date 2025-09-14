import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Media, MediaType } from '../entities/media.entity';
import { Product } from '../../products/entities/product.entity';
import { MediaService } from '../media.service';
import { MediaProcessorService } from './media-processor.service';
import {
  CreateMediaDto,
  UpdateMediaDto,
  MediaQueryDto,
  MediaResponseDto,
} from '../dto';
import {
  CollectionResponse,
  ActionResponseDto,
  ResponseHelpers,
} from '../../../common/dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

export interface BatchUploadResult {
  successful: MediaResponseDto[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
  totalProcessed: number;
}

@Injectable()
export class EnhancedMediaService {
  private readonly logger = new Logger(EnhancedMediaService.name);
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
    private readonly mediaProcessor: MediaProcessorService,
    private readonly dataSource: DataSource,
    private readonly mediaService: MediaService,
  ) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads');
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3010');
  }

  /**
   * Upload and process a single media file
   */
  async uploadSingle(
    file: Express.Multer.File,
    createMediaDto: CreateMediaDto,
    userId?: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    this.logger.log(`Processing media upload: ${file.originalname}`);

    // Validate file type
    if (!this.mediaProcessor.validateFileType(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }

    // Check file size
    const sizeLimit = this.mediaProcessor.getFileSizeLimit(file.mimetype);
    if (file.size > sizeLimit) {
      throw new BadRequestException(
        `File size exceeds limit of ${Math.round(sizeLimit / 1024 / 1024)}MB`,
      );
    }

    // Get product SKU if associating with a product
    let productSku: string | undefined;
    let products: Product[] = [];
    
    if (createMediaDto.productIds && createMediaDto.productIds.length > 0) {
      products = await this.productRepository.findBy({
        id: In(createMediaDto.productIds),
      });

      if (products.length !== createMediaDto.productIds.length) {
        throw new BadRequestException('Some product IDs are invalid');
      }

      // Use the first product's SKU for naming
      productSku = products[0].sku;
    }

    // Process the media file (generate thumbnails, extract metadata, etc.)
    const processedMedia = await this.mediaProcessor.processMedia(file, productSku);

    // Create media entity
    const media = this.mediaRepository.create({
      filename: file.originalname, // Store original filename
      path: processedMedia.path,
      url: processedMedia.url,
      type: processedMedia.type,
      mimeType: processedMedia.mimeType,
      size: processedMedia.size,
      alt: createMediaDto.alt || file.originalname,
      title: createMediaDto.title,
      description: createMediaDto.description,
      sortOrder: createMediaDto.sortOrder || 0,
      isPrimary: createMediaDto.isPrimary || false,
      width: processedMedia.width,
      height: processedMedia.height,
      thumbnails: processedMedia.thumbnails,
      metadata: {
        ...processedMedia.metadata,
        originalName: file.originalname,
        processedName: processedMedia.filename,
        productSku: productSku,
      },
      products: products,
      createdBy: userId,
      updatedBy: userId,
    });

    const savedMedia = await this.mediaRepository.save(media);
    
    this.logger.log(`Media ${savedMedia.id} created successfully`);
    const dto = MediaResponseDto.fromEntity(savedMedia);
    return ActionResponseDto.create(dto);
  }

  /**
   * Batch upload multiple media files
   */
  async uploadBatch(
    files: Express.Multer.File[],
    productIds?: string[],
    userId?: string,
  ): Promise<BatchUploadResult> {
    this.logger.log(`Processing batch upload of ${files.length} files`);

    const successful: MediaResponseDto[] = [];
    const failed: Array<{ filename: string; error: string }> = [];
    
    // Get products if specified
    let products: Product[] = [];
    let productSku: string | undefined;
    
    if (productIds && productIds.length > 0) {
      products = await this.productRepository.findBy({
        id: In(productIds),
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('Some product IDs are invalid');
      }

      productSku = products[0].sku;
    }

    // Process files in parallel (with concurrency limit)
    const batchSize = 5; // Process 5 files at a time
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (file) => {
          try {
            // Validate file
            if (!this.mediaProcessor.validateFileType(file.mimetype)) {
              failed.push({
                filename: file.originalname,
                error: `Invalid file type: ${file.mimetype}`,
              });
              return;
            }

            const sizeLimit = this.mediaProcessor.getFileSizeLimit(file.mimetype);
            if (file.size > sizeLimit) {
              failed.push({
                filename: file.originalname,
                error: `File size exceeds limit`,
              });
              return;
            }

            // Process the file
            const processedMedia = await this.mediaProcessor.processMedia(file, productSku);

            // Create media entity
            const media = this.mediaRepository.create({
              filename: file.originalname,
              path: processedMedia.path,
              url: processedMedia.url,
              type: processedMedia.type,
              mimeType: processedMedia.mimeType,
              size: processedMedia.size,
              alt: file.originalname,
              width: processedMedia.width,
              height: processedMedia.height,
              thumbnails: processedMedia.thumbnails,
              metadata: {
                ...processedMedia.metadata,
                originalName: file.originalname,
                processedName: processedMedia.filename,
                productSku: productSku,
                batchUpload: true,
              },
              products: products,
              createdBy: userId,
              updatedBy: userId,
            });

            const savedMedia = await this.mediaRepository.save(media);
            successful.push(MediaResponseDto.fromEntity(savedMedia));
          } catch (error) {
            this.logger.error(`Failed to process ${file.originalname}: ${error.message}`);
            failed.push({
              filename: file.originalname,
              error: error.message || 'Processing failed',
            });
          }
        }),
      );
    }

    return {
      successful,
      failed,
      totalProcessed: files.length,
    };
  }

  /**
   * Get media by product SKU
   */
  async findByProductSku(sku: string): Promise<CollectionResponse<MediaResponseDto>> {
    const product = await this.productRepository.findOne({
      where: { sku, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    const media = await this.mediaRepository
      .createQueryBuilder('media')
      .innerJoin('media.products', 'product')
      .where('product.id = :productId', { productId: product.id })
      .andWhere('media.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('media.isPrimary', 'DESC')
      .addOrderBy('media.sortOrder', 'ASC')
      .getMany();

    const dtos = MediaResponseDto.fromEntities(media);
    return ResponseHelpers.wrapCollection(dtos, {
      totalItems: dtos.length,
      itemCount: dtos.length,
    });
  }

  /**
   * Set primary media for a product
   */
  async setPrimaryMedia(
    productId: string,
    mediaId: string,
    userId?: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the product
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: productId, isDeleted: false },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      // Get all media for this product
      const productMedia = await queryRunner.manager
        .createQueryBuilder(Media, 'media')
        .innerJoin('media.products', 'product')
        .where('product.id = :productId', { productId })
        .andWhere('media.isDeleted = :isDeleted', { isDeleted: false })
        .getMany();

      // Update all media to not be primary
      for (const media of productMedia) {
        media.isPrimary = false;
        media.updatedBy = userId;
        await queryRunner.manager.save(media);
      }

      // Set the specified media as primary
      const primaryMedia = productMedia.find((m) => m.id === mediaId);
      if (!primaryMedia) {
        throw new NotFoundException(
          `Media ${mediaId} not found for product ${productId}`,
        );
      }

      primaryMedia.isPrimary = true;
      await queryRunner.manager.save(primaryMedia);

      await queryRunner.commitTransaction();

      const dto = MediaResponseDto.fromEntity(primaryMedia);
      return ActionResponseDto.update(dto);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Regenerate thumbnails for existing media
   */
  async regenerateThumbnails(
    mediaId: string,
    userId?: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, isDeleted: false },
      relations: ['products'],
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${mediaId} not found`);
    }

    if (media.type !== MediaType.IMAGE) {
      throw new BadRequestException('Thumbnails can only be generated for images');
    }

    // Get product SKU if available
    const productSku = media.products.length > 0 ? media.products[0].sku : undefined;

    // Re-process the image
    const processedMedia = await this.mediaProcessor.processMedia(
      {
        filename: media.filename,
        path: media.path,
        mimetype: media.mimeType,
        size: media.size,
      } as Express.Multer.File,
      productSku,
    );

    // Update media with new thumbnails
    media.thumbnails = processedMedia.thumbnails;
    media.updatedBy = userId;

    const updatedMedia = await this.mediaRepository.save(media);
    
    this.logger.log(`Regenerated thumbnails for media ${mediaId}`);
    const dto = MediaResponseDto.fromEntity(updatedMedia);
    return ActionResponseDto.update(dto);
  }

  /**
   * Optimize all images for a product
   */
  async optimizeProductImages(
    productId: string,
    userId?: string,
  ): Promise<ActionResponseDto<{ optimized: number }>> {
    const product = await this.productRepository.findOne({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const media = await this.mediaRepository
      .createQueryBuilder('media')
      .innerJoin('media.products', 'product')
      .where('product.id = :productId', { productId })
      .andWhere('media.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('media.type = :type', { type: MediaType.IMAGE })
      .getMany();

    let optimized = 0;
    for (const item of media) {
      try {
        const optimizedPath = await this.mediaProcessor.optimizeImage(item.path);
        
        // Update file size
        const stats = await fs.stat(optimizedPath);
        item.size = stats.size;
        item.updatedBy = userId;
        
        if (!item.metadata) item.metadata = {};
        item.metadata.optimized = true;
        item.metadata.optimizedAt = new Date();
        
        await this.mediaRepository.save(item);
        optimized++;
      } catch (error) {
        this.logger.error(`Failed to optimize media ${item.id}: ${error.message}`);
      }
    }

    return new ActionResponseDto(
      { optimized },
      `Optimized ${optimized} images for product`,
    );
  }

  /**
   * Get media library statistics
   */
  async getLibraryStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<string, number>;
    averageFileSize: number;
    totalProducts: number;
  }> {
    const query = this.mediaRepository
      .createQueryBuilder('media')
      .where('media.isDeleted = :isDeleted', { isDeleted: false });

    // Get total files and size
    const [totalFiles, totalSizeResult] = await Promise.all([
      query.getCount(),
      query.select('SUM(media.size)', 'totalSize').getRawOne(),
    ]);

    const totalSize = parseInt(totalSizeResult?.totalSize || '0', 10);

    // Get count by type
    const byTypeResult = await this.mediaRepository
      .createQueryBuilder('media')
      .select('media.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('media.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('media.type')
      .getRawMany();

    const byType = byTypeResult.reduce((acc, row) => {
      acc[row.type] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    // Get unique product count
    const productCountResult = await this.mediaRepository
      .createQueryBuilder('media')
      .innerJoin('media.products', 'product')
      .where('media.isDeleted = :isDeleted', { isDeleted: false })
      .select('COUNT(DISTINCT product.id)', 'count')
      .getRawOne();

    const totalProducts = parseInt(productCountResult?.count || '0', 10);

    return {
      totalFiles,
      totalSize,
      byType,
      averageFileSize: totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0,
      totalProducts,
    };
  }

  // Delegate methods to base MediaService
  async findAll(query: MediaQueryDto): Promise<CollectionResponse<MediaResponseDto>> {
    return this.mediaService.findAll(query);
  }

  async findOne(id: string, includeProducts = false): Promise<MediaResponseDto> {
    return this.mediaService.findOne(id, includeProducts);
  }

  async update(
    id: string,
    updateMediaDto: UpdateMediaDto,
    userId?: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.update(id, updateMediaDto, userId);
  }

  async remove(id: string, userId?: string): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.remove(id, userId);
  }

  async getProductMedia(productId: string): Promise<CollectionResponse<MediaResponseDto>> {
    return this.mediaService.getProductMedia(productId);
  }

  async associateWithProducts(
    mediaId: string,
    productIds: string[],
    userId?: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.associateWithProducts(mediaId, productIds, userId);
  }

  async dissociateFromProducts(
    mediaId: string,
    productIds: string[],
    userId?: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.dissociateFromProducts(mediaId, productIds, userId);
  }

  async bulkDelete(
    ids: string[],
    userId?: string,
  ): Promise<ActionResponseDto<{ affected: number }>> {
    return this.mediaService.bulkDelete(ids, userId);
  }

  /**
   * Clean up orphaned media (not associated with any products)
   */
  async cleanupOrphanedMedia(
    dryRun = true,
    userId?: string,
  ): Promise<ActionResponseDto<{ found: number; deleted?: number }>> {
    const orphanedMedia = await this.mediaRepository
      .createQueryBuilder('media')
      .leftJoin('media.products', 'product')
      .where('media.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('product.id IS NULL')
      .getMany();

    if (dryRun) {
      return new ActionResponseDto(
        { found: orphanedMedia.length },
        `Found ${orphanedMedia.length} orphaned media files`,
      );
    }

    // Delete orphaned files
    let deleted = 0;
    for (const media of orphanedMedia) {
      try {
        // Delete physical file
        await fs.unlink(media.path);
        
        // Delete thumbnails if they exist
        if (media.thumbnails) {
          for (const thumbUrl of Object.values(media.thumbnails)) {
            const thumbPath = path.join(this.uploadPath, thumbUrl.replace('/uploads/', ''));
            try {
              await fs.unlink(thumbPath);
            } catch (error) {
              // Ignore errors for thumbnails
            }
          }
        }
        
        // Soft delete from database
        media.softDelete(userId);
        await this.mediaRepository.save(media);
        deleted++;
      } catch (error) {
        this.logger.error(`Failed to delete orphaned media ${media.id}: ${error.message}`);
      }
    }

    return new ActionResponseDto(
      { found: orphanedMedia.length, deleted },
      `Deleted ${deleted} orphaned media files`,
    );
  }
}
