import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { EnhancedMediaService } from './services/enhanced-media.service';
import {
  CreateMediaDto,
  UpdateMediaDto,
  MediaQueryDto,
  MediaResponseDto,
} from './dto';
import {
  CollectionResponse as CollectionResponseDto,
  ActionResponseDto,
} from '../../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// Multer configuration
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
    callback(null, uniqueSuffix);
  },
});

@ApiTags('Media Library')
@Controller('media')
export class EnhancedMediaController {
  constructor(private readonly mediaService: EnhancedMediaService) {}

  /**
   * Upload a single media file
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', { storage }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single media file with automatic processing' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload (image, PDF, or document)',
        },
        alt: {
          type: 'string',
          description: 'Alternative text for accessibility',
        },
        title: {
          type: 'string',
          description: 'Media title',
        },
        description: {
          type: 'string',
          description: 'Media description',
        },
        sortOrder: {
          type: 'number',
          description: 'Sort order for display',
        },
        isPrimary: {
          type: 'boolean',
          description: 'Is this the primary media',
        },
        productIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product IDs to associate with this media',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Media uploaded and processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or request' })
  async uploadSingle(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 50 * 1024 * 1024, // 50MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() createMediaDto: CreateMediaDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.mediaService.uploadSingle(file, createMediaDto, userId);
  }

  /**
   * Batch upload multiple media files
   */
  @Post('upload/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 20, { storage }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple media files at once' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Multiple files to upload (max 20)',
        },
        productIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product IDs to associate with all uploaded media',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Batch upload completed',
    schema: {
      type: 'object',
      properties: {
        successful: {
          type: 'array',
          description: 'Successfully uploaded media',
        },
        failed: {
          type: 'array',
          description: 'Failed uploads with error messages',
        },
        totalProcessed: {
          type: 'number',
          description: 'Total number of files processed',
        },
      },
    },
  })
  async uploadBatch(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('productIds') productIds: string[],
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<any>> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    const result = await this.mediaService.uploadBatch(files, productIds, userId);
    
    return new ActionResponseDto(
      {
        successful: result.successful,
        failed: result.failed,
        totalProcessed: result.totalProcessed,
      },
      `Processed ${result.totalProcessed} files: ${result.successful.length} successful, ${result.failed.length} failed`,
    );
  }

  /**
   * Get all media with advanced filtering
   */
  @Get()
  @ApiOperation({ summary: 'Get all media files with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ['image', 'video', 'document', 'other'] })
  @ApiQuery({ name: 'isPrimary', required: false, type: Boolean })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'includeProducts', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  async findAll(
    @Query() query: MediaQueryDto,
  ): Promise<CollectionResponseDto<MediaResponseDto>> {
    return this.mediaService.findAll(query);
  }

  /**
   * Get media by product SKU
   */
  @Get('product/sku/:sku')
  @ApiOperation({ summary: 'Get all media for a product by SKU' })
  @ApiResponse({ status: 200, description: 'Product media retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getByProductSku(
    @Param('sku') sku: string,
  ): Promise<CollectionResponseDto<MediaResponseDto>> {
    return this.mediaService.findByProductSku(sku);
  }

  /**
   * Get media library statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get media library statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalFiles: { type: 'number' },
        totalSize: { type: 'number' },
        byType: { type: 'object' },
        averageFileSize: { type: 'number' },
        totalProducts: { type: 'number' },
      },
    },
  })
  async getStats(): Promise<{ success: boolean; data: any; timestamp: string }> {
    const stats = await this.mediaService.getLibraryStats();
    
    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get media for a specific product
   */
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get media for a specific product' })
  @ApiResponse({ status: 200, description: 'Product media retrieved successfully' })
  async getProductMedia(
    @Param('productId') productId: string,
  ): Promise<CollectionResponseDto<MediaResponseDto>> {
    return this.mediaService.getProductMedia(productId);
  }

  /**
   * Get single media by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async findOne(
    @Param('id') id: string,
    @Query('includeProducts') includeProducts?: boolean,
  ): Promise<{ success: boolean; data: MediaResponseDto; timestamp: string }> {
    const media = await this.mediaService.findOne(id, includeProducts);
    return {
      success: true,
      data: media,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Set primary media for a product
   */
  @Put('product/:productId/primary/:mediaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set primary media for a product' })
  @ApiResponse({ status: 200, description: 'Primary media set successfully' })
  @ApiResponse({ status: 404, description: 'Product or media not found' })
  async setPrimaryMedia(
    @Param('productId') productId: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.setPrimaryMedia(productId, mediaId, userId);
  }

  /**
   * Regenerate thumbnails for an image
   */
  @Post(':id/regenerate-thumbnails')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate thumbnails for an image' })
  @ApiResponse({ status: 200, description: 'Thumbnails regenerated successfully' })
  @ApiResponse({ status: 400, description: 'Media is not an image' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async regenerateThumbnails(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.regenerateThumbnails(id, userId);
  }

  /**
   * Optimize all images for a product
   */
  @Post('product/:productId/optimize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Optimize all images for a product' })
  @ApiResponse({ 
    status: 200, 
    description: 'Images optimized successfully',
    schema: {
      type: 'object',
      properties: {
        optimized: { type: 'number', description: 'Number of images optimized' },
      },
    },
  })
  async optimizeProductImages(
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ optimized: number }>> {
    return this.mediaService.optimizeProductImages(productId, userId);
  }

  /**
   * Update media metadata
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update media metadata' })
  @ApiResponse({ status: 200, description: 'Media updated successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.update(id, updateMediaDto, userId);
  }

  /**
   * Delete media file
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete media file' })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.remove(id, userId);
  }

  /**
   * Associate media with products
   */
  @Post(':id/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Associate media with products' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['productIds'],
      properties: {
        productIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product IDs to associate',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Media associated successfully' })
  async associateWithProducts(
    @Param('id') id: string,
    @Body('productIds') productIds: string[],
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.associateWithProducts(id, productIds, userId);
  }

  /**
   * Dissociate media from products
   */
  @Delete(':id/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dissociate media from products' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['productIds'],
      properties: {
        productIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product IDs to dissociate',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Media dissociated successfully' })
  async dissociateFromProducts(
    @Param('id') id: string,
    @Body('productIds') productIds: string[],
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<MediaResponseDto>> {
    return this.mediaService.dissociateFromProducts(id, productIds, userId);
  }

  /**
   * Bulk delete media files
   */
  @Post('bulk-delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete media files' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['ids'],
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Media IDs to delete',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  async bulkDelete(
    @Body('ids') ids: string[],
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ affected: number }>> {
    return this.mediaService.bulkDelete(ids, userId);
  }

  /**
   * Clean up orphaned media
   */
  @Post('cleanup/orphaned')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clean up orphaned media files not associated with any products' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dryRun: {
          type: 'boolean',
          default: true,
          description: 'If true, only report what would be deleted without actually deleting',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cleanup completed',
    schema: {
      type: 'object',
      properties: {
        found: { type: 'number', description: 'Number of orphaned files found' },
        deleted: { type: 'number', description: 'Number of files deleted (if not dry run)' },
      },
    },
  })
  async cleanupOrphaned(
    @Body('dryRun') dryRun = true,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<{ found: number; deleted?: number }>> {
    return this.mediaService.cleanupOrphanedMedia(dryRun, userId);
  }
}
