import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { MediaType } from '../entities/media.entity';

export interface ThumbnailConfig {
  name: string;
  width: number;
  height?: number;
  quality?: number;
  fit?: keyof sharp.FitEnum;
}

export interface ProcessedMedia {
  filename: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  type: MediaType;
  width?: number;
  height?: number;
  thumbnails?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  space?: string;
  channels?: number;
  depth?: string;
  density?: number;
  hasAlpha?: boolean;
  orientation?: number;
  exif?: Record<string, any>;
}

@Injectable()
export class MediaProcessorService {
  private readonly logger = new Logger(MediaProcessorService.name);
  private readonly uploadPath: string;
  private readonly thumbnailConfigs: ThumbnailConfig[];

  constructor(private readonly configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads');
    
    // Define thumbnail configurations
    this.thumbnailConfigs = [
      { name: 'thumb', width: 150, height: 150, quality: 80, fit: 'cover' },
      { name: 'small', width: 300, height: 300, quality: 85, fit: 'inside' },
      { name: 'medium', width: 600, height: 600, quality: 85, fit: 'inside' },
      { name: 'large', width: 1200, height: 1200, quality: 90, fit: 'inside' },
      { name: 'gallery', width: 800, height: 800, quality: 90, fit: 'inside' },
    ];
  }

  /**
   * Process uploaded media file
   */
  async processMedia(
    file: Express.Multer.File,
    productSku?: string,
  ): Promise<ProcessedMedia> {
    const mediaType = this.getMediaTypeFromMimeType(file.mimetype);
    
    // Create base result
    const result: ProcessedMedia = {
      filename: file.filename,
      path: file.path,
      url: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      type: mediaType,
    };

    // Process based on media type
    if (mediaType === MediaType.IMAGE) {
      const imageData = await this.processImage(file, productSku);
      Object.assign(result, imageData);
    } else if (mediaType === MediaType.DOCUMENT && file.mimetype === 'application/pdf') {
      const pdfData = await this.processPdf(file, productSku);
      Object.assign(result, pdfData);
    }

    return result;
  }

  /**
   * Process image file and generate thumbnails
   */
  private async processImage(
    file: Express.Multer.File,
    productSku?: string,
  ): Promise<Partial<ProcessedMedia>> {
    try {
      // Get image metadata
      const image = sharp(file.path);
      const metadata = await image.metadata();
      
      // Generate thumbnails
      const thumbnails = await this.generateThumbnails(
        file.path,
        file.filename,
        productSku,
      );

      // Extract EXIF data if available
      let exifData = {};
      if (metadata.exif) {
        try {
          exifData = await this.extractExifData(metadata);
        } catch (error) {
          this.logger.warn(`Failed to extract EXIF data: ${error.message}`);
        }
      }

      return {
        width: metadata.width,
        height: metadata.height,
        thumbnails,
        metadata: {
          format: metadata.format,
          space: metadata.space,
          channels: metadata.channels,
          depth: metadata.depth,
          density: metadata.density,
          hasAlpha: metadata.hasAlpha,
          orientation: metadata.orientation,
          exif: exifData,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to process image: ${error.message}`);
      throw new BadRequestException('Failed to process image file');
    }
  }

  /**
   * Generate multiple thumbnail sizes for an image
   */
  private async generateThumbnails(
    imagePath: string,
    originalFilename: string,
    productSku?: string,
  ): Promise<Record<string, string>> {
    const thumbnails: Record<string, string> = {};
    const fileExt = path.extname(originalFilename);
    const baseDir = path.dirname(imagePath);
    
    // Create thumbnails directory
    const thumbsDir = path.join(baseDir, 'thumbnails');
    await this.ensureDirectoryExists(thumbsDir);

    for (const config of this.thumbnailConfigs) {
      try {
        // Generate thumbnail filename
        const thumbFilename = this.generateThumbnailFilename(
          originalFilename,
          config.name,
          productSku,
        );
        const thumbPath = path.join(thumbsDir, thumbFilename);

        // Process and save thumbnail
        const sharpInstance = sharp(imagePath);
        
        // Apply resize with fit option
        if (config.height) {
          sharpInstance.resize(config.width, config.height, {
            fit: config.fit || 'cover',
            withoutEnlargement: true,
          });
        } else {
          sharpInstance.resize(config.width, null, {
            withoutEnlargement: true,
          });
        }

        // Apply quality settings based on format
        if (fileExt === '.jpg' || fileExt === '.jpeg') {
          sharpInstance.jpeg({ quality: config.quality || 85 });
        } else if (fileExt === '.png') {
          sharpInstance.png({ quality: config.quality || 90 });
        } else if (fileExt === '.webp') {
          sharpInstance.webp({ quality: config.quality || 85 });
        }

        await sharpInstance.toFile(thumbPath);

        // Store relative URL
        thumbnails[config.name] = `/uploads/thumbnails/${thumbFilename}`;
        
        this.logger.debug(`Generated ${config.name} thumbnail: ${thumbFilename}`);
      } catch (error) {
        this.logger.error(
          `Failed to generate ${config.name} thumbnail: ${error.message}`,
        );
      }
    }

    return thumbnails;
  }

  /**
   * Generate thumbnail filename based on SKU or original filename
   */
  private generateThumbnailFilename(
    originalFilename: string,
    sizeName: string,
    productSku?: string,
  ): string {
    const fileExt = path.extname(originalFilename);
    const timestamp = Date.now();
    
    if (productSku) {
      // Use SKU-based naming: SKU_sizeName_timestamp.ext
      const sanitizedSku = productSku.replace(/[^a-zA-Z0-9-_]/g, '_');
      return `${sanitizedSku}_${sizeName}_${timestamp}${fileExt}`;
    } else {
      // Use UUID-based naming when no SKU available
      const nameWithoutExt = path.basename(originalFilename, fileExt);
      return `${nameWithoutExt}_${sizeName}_${timestamp}${fileExt}`;
    }
  }

  /**
   * Process PDF file and generate preview
   */
  private async processPdf(
    file: Express.Multer.File,
    productSku?: string,
  ): Promise<Partial<ProcessedMedia>> {
    try {
      // Get PDF file stats
      const stats = await fs.stat(file.path);
      
      // Generate PDF preview thumbnail (first page)
      // Note: This requires additional tools like pdf-thumbnail or imagemagick
      // For now, we'll just store metadata
      
      const metadata: Record<string, any> = {
        fileSize: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isPdf: true,
      };

      // If you want to generate PDF thumbnails, you'd need to install and use
      // a package like pdf-thumbnail or pdf2pic
      // Example:
      // const pdfPreview = await this.generatePdfPreview(file.path, productSku);
      // if (pdfPreview) {
      //   return {
      //     thumbnails: { preview: pdfPreview },
      //     metadata,
      //   };
      // }

      return { metadata };
    } catch (error) {
      this.logger.error(`Failed to process PDF: ${error.message}`);
      return {};
    }
  }

  /**
   * Extract and clean EXIF data from image metadata
   */
  private async extractExifData(metadata: sharp.Metadata): Promise<Record<string, any>> {
    const exif: Record<string, any> = {};
    
    // Extract common EXIF fields
    if (metadata.exif) {
      try {
        // Parse EXIF buffer if needed
        // This is a simplified version - you might want to use a dedicated EXIF parser
        const exifBuffer = metadata.exif;
        
        // Basic EXIF fields that might be available
        exif.orientation = metadata.orientation;
        exif.density = metadata.density;
        
        // Add more EXIF parsing as needed
      } catch (error) {
        this.logger.warn(`Failed to parse EXIF data: ${error.message}`);
      }
    }
    
    return exif;
  }

  /**
   * Optimize image for web
   */
  async optimizeImage(
    inputPath: string,
    outputPath?: string,
    options?: {
      quality?: number;
      maxWidth?: number;
      maxHeight?: number;
      format?: 'jpeg' | 'png' | 'webp';
    },
  ): Promise<string> {
    const { quality = 85, maxWidth = 2048, maxHeight = 2048, format } = options || {};
    
    const output = outputPath || inputPath.replace(/\.[^.]+$/, `_optimized.${format || 'jpg'}`);
    
    try {
      let pipeline = sharp(inputPath)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });

      // Apply format-specific optimizations
      if (format === 'jpeg' || (!format && inputPath.match(/\.jpe?g$/i))) {
        pipeline = pipeline.jpeg({ quality, progressive: true });
      } else if (format === 'png' || (!format && inputPath.match(/\.png$/i))) {
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
      } else if (format === 'webp') {
        pipeline = pipeline.webp({ quality });
      }

      await pipeline.toFile(output);
      
      this.logger.debug(`Optimized image saved to: ${output}`);
      return output;
    } catch (error) {
      this.logger.error(`Failed to optimize image: ${error.message}`);
      throw new BadRequestException('Failed to optimize image');
    }
  }

  /**
   * Generate watermarked version of an image
   */
  async addWatermark(
    imagePath: string,
    watermarkPath: string,
    position: 'center' | 'southeast' | 'southwest' | 'northeast' | 'northwest' = 'southeast',
  ): Promise<string> {
    const outputPath = imagePath.replace(/\.[^.]+$/, '_watermarked.jpg');
    
    try {
      const image = sharp(imagePath);
      const watermark = sharp(watermarkPath);
      
      // Get dimensions
      const imageMetadata = await image.metadata();
      const watermarkMetadata = await watermark.metadata();
      
      // Resize watermark to be proportional to image
      const watermarkWidth = Math.min(
        watermarkMetadata.width,
        Math.floor(imageMetadata.width * 0.2),
      );
      
      const resizedWatermark = await watermark
        .resize(watermarkWidth)
        .toBuffer();
      
      // Composite watermark onto image
      await image
        .composite([
          {
            input: resizedWatermark,
            gravity: position,
          },
        ])
        .toFile(outputPath);
      
      this.logger.debug(`Watermarked image saved to: ${outputPath}`);
      return outputPath;
    } catch (error) {
      this.logger.error(`Failed to add watermark: ${error.message}`);
      throw new BadRequestException('Failed to add watermark');
    }
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Determine media type from MIME type
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

  /**
   * Validate file type
   */
  validateFileType(
    mimeType: string,
    allowedTypes: string[] = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  ): boolean {
    return allowedTypes.includes(mimeType);
  }

  /**
   * Get file size limit based on type
   */
  getFileSizeLimit(mimeType: string): number {
    if (mimeType.startsWith('image/')) {
      return 10 * 1024 * 1024; // 10MB for images
    }
    if (mimeType.startsWith('video/')) {
      return 100 * 1024 * 1024; // 100MB for videos
    }
    if (mimeType === 'application/pdf') {
      return 50 * 1024 * 1024; // 50MB for PDFs
    }
    return 25 * 1024 * 1024; // 25MB default
  }
}
