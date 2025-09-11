import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Media, MediaType } from './entities/media.entity';
import { Product } from '../products/entities/product.entity';
import {
  CreateMediaDto,
  UpdateMediaDto,
  MediaQueryDto,
  MediaResponseDto,
} from './dto';
import {
  CollectionResponse,
  ActionResponseDto,
  ResponseHelpers,
} from '../../common/dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads');
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3010');
  }

  /**
   * Upload a new media file
   */
  async upload(
    file: Express.Multer.File,
    createMediaDto: CreateMediaDto,
    userId?: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    this.logger.log(`Uploading media file: ${file.originalname}`);

    // Determine media type from MIME type
    const mediaType = this.getMediaTypeFromMimeType(file.mimetype);

    // Create media entity
    const media = this.mediaRepository.create({
      filename: file.filename,  // Use the generated filename from multer
      path: file.path,
      url: `/uploads/${file.filename}`,  // Store relative URL
      type: mediaType,
      mimeType: file.mimetype,
      size: file.size,
      alt: createMediaDto.alt || file.originalname,  // Use original name as alt if not provided
      title: createMediaDto.title,
      description: createMediaDto.description,
      sortOrder: createMediaDto.sortOrder || 0,
      isPrimary: createMediaDto.isPrimary || false,
      createdBy: userId,
      updatedBy: userId,
      metadata: {
        originalName: file.originalname,  // Store original name in metadata
      },
    });

    // If image, try to get dimensions (you might want to use a library like sharp for this)
    if (mediaType === MediaType.IMAGE) {
      // Placeholder - implement with sharp or similar library
      // media.width = ...
      // media.height = ...
    }

    // Associate with products if provided
    if (createMediaDto.productIds && createMediaDto.productIds.length > 0) {
      const products = await this.productRepository.findBy({
        id: In(createMediaDto.productIds),
      });

      if (products.length !== createMediaDto.productIds.length) {
        throw new BadRequestException('Some product IDs are invalid');
      }

      media.products = products;
    }

    const savedMedia = await this.mediaRepository.save(media);
    const dto = MediaResponseDto.fromEntity(savedMedia);
    return ActionResponseDto.create(dto);
  }

  /**
   * Find all media with filtering and pagination
   */
  async findAll(query: MediaQueryDto): Promise<CollectionResponse<MediaResponseDto>> {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC',
      includeProducts = false 
    } = query;

    // Build query
    let queryBuilder = this.mediaRepository.createQueryBuilder('media');

    // Apply soft delete filter
    queryBuilder.where('media.isDeleted = :isDeleted', { isDeleted: false });

    // Search conditions
    if (query.search) {
      queryBuilder.andWhere(
        '(media.filename LIKE :search OR media.title LIKE :search OR media.description LIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    if (query.type) {
      queryBuilder.andWhere('media.type = :type', { type: query.type });
    }

    if (query.isPrimary !== undefined) {
      queryBuilder.andWhere('media.isPrimary = :isPrimary', { isPrimary: query.isPrimary });
    }

    if (query.mimeType) {
      queryBuilder.andWhere('media.mimeType LIKE :mimeType', { mimeType: query.mimeType });
    }

    // Filter by product
    if (query.productId) {
      queryBuilder
        .innerJoin('media.products', 'product')
        .andWhere('product.id = :productId', { productId: query.productId });
    }

    // Add relations if needed
    if (includeProducts) {
      queryBuilder.leftJoinAndSelect('media.products', 'products');
    }

    // Apply sorting
    const sortField = `media.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [items, total] = await queryBuilder.getManyAndCount();

    // Transform to DTOs
    const dtos = MediaResponseDto.fromEntities(items);

    return ResponseHelpers.wrapPaginated([dtos, total], page, limit);
  }

  /**
   * Find a single media by ID
   */
  async findOne(id: string, includeProducts = false): Promise<MediaResponseDto> {
    const relations = includeProducts ? ['products'] : [];

    const media = await this.mediaRepository.findOne({
      where: { id, isDeleted: false },
      relations,
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return MediaResponseDto.fromEntity(media);
  }

  /**
   * Update media metadata
   */
  async update(
    id: string,
    updateMediaDto: UpdateMediaDto,
    userId?: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    const media = await this.mediaRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['products'],
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Update basic fields
    if (updateMediaDto.alt !== undefined) media.alt = updateMediaDto.alt;
    if (updateMediaDto.title !== undefined) media.title = updateMediaDto.title;
    if (updateMediaDto.description !== undefined) media.description = updateMediaDto.description;
    if (updateMediaDto.sortOrder !== undefined) media.sortOrder = updateMediaDto.sortOrder;
    if (updateMediaDto.isPrimary !== undefined) media.isPrimary = updateMediaDto.isPrimary;

    // Update product associations if provided
    if (updateMediaDto.productIds !== undefined) {
      if (updateMediaDto.productIds.length > 0) {
        const products = await this.productRepository.findBy({
          id: In(updateMediaDto.productIds),
        });

        if (products.length !== updateMediaDto.productIds.length) {
          throw new BadRequestException('Some product IDs are invalid');
        }

        media.products = products;
      } else {
        media.products = [];
      }
    }

    media.updatedBy = userId;

    const updatedMedia = await this.mediaRepository.save(media);
    const dto = MediaResponseDto.fromEntity(updatedMedia);
    return ActionResponseDto.update(dto);
  }

  /**
   * Delete a media file
   */
  async remove(id: string, userId?: string): Promise<ActionResponseDto<MediaResponseDto>> {
    const media = await this.mediaRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['products'],
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Delete physical file
    try {
      await unlinkAsync(media.path);
      this.logger.log(`Deleted file: ${media.path}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${media.path}`, error);
      // Continue with database deletion even if file deletion fails
    }

    // Soft delete from database
    media.softDelete(userId);
    await this.mediaRepository.save(media);

    this.logger.log(`Media ${id} soft deleted by user ${userId}`);
    const dto = MediaResponseDto.fromEntity(media);
    return ActionResponseDto.delete(dto);
  }

  /**
   * Get media for a specific product
   */
  async getProductMedia(productId: string): Promise<CollectionResponse<MediaResponseDto>> {
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
   * Associate media with products
   */
  async associateWithProducts(
    mediaId: string,
    productIds: string[],
    userId?: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, isDeleted: false },
      relations: ['products'],
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${mediaId} not found`);
    }

    const products = await this.productRepository.findBy({
      id: In(productIds),
      isDeleted: false,
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some product IDs are invalid');
    }

    // Add new products while keeping existing ones
    const existingProductIds = media.products.map(p => p.id);
    const newProducts = products.filter(p => !existingProductIds.includes(p.id));
    media.products = [...media.products, ...newProducts];
    media.updatedBy = userId;

    const updatedMedia = await this.mediaRepository.save(media);
    const dto = MediaResponseDto.fromEntity(updatedMedia);
    return ActionResponseDto.update(dto);
  }

  /**
   * Dissociate media from products
   */
  async dissociateFromProducts(
    mediaId: string,
    productIds: string[],
    userId?: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, isDeleted: false },
      relations: ['products'],
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${mediaId} not found`);
    }

    // Remove specified products
    media.products = media.products.filter(p => !productIds.includes(p.id));
    media.updatedBy = userId;

    const updatedMedia = await this.mediaRepository.save(media);
    const dto = MediaResponseDto.fromEntity(updatedMedia);
    return ActionResponseDto.update(dto);
  }

  /**
   * Bulk delete media files
   */
  async bulkDelete(
    ids: string[],
    userId?: string,
  ): Promise<ActionResponseDto<{ affected: number }>> {
    const media = await this.mediaRepository.findBy({
      id: In(ids),
      isDeleted: false,
    });

    // Delete physical files
    for (const item of media) {
      try {
        await unlinkAsync(item.path);
        this.logger.log(`Deleted file: ${item.path}`);
      } catch (error) {
        this.logger.error(`Failed to delete file: ${item.path}`, error);
      }
    }

    // Soft delete from database
    const result = await this.mediaRepository.update(
      { id: In(ids), isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
    );

    const affected = result.affected || 0;
    this.logger.log(`Bulk delete: ${affected} media items deleted`);
    return new ActionResponseDto(
      { affected },
      `${affected} media items deleted successfully`,
    );
  }

  /**
   * Helper: Determine media type from MIME type
   */
  private getMediaTypeFromMimeType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (
      mimeType.startsWith('application/pdf') ||
      mimeType.startsWith('application/msword') ||
      mimeType.startsWith('application/vnd.') ||
      mimeType.startsWith('text/')
    ) {
      return MediaType.DOCUMENT;
    }
    return MediaType.OTHER;
  }
}
