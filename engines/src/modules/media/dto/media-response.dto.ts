import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Media, MediaType } from '../entities/media.entity';

@Exclude()
export class MediaResponseDto {
  @Expose()
  @ApiProperty({ description: 'Media ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Original filename' })
  filename: string;

  @Expose()
  @ApiProperty({ description: 'File path' })
  path: string;

  @Expose()
  @ApiProperty({ description: 'Public URL', required: false })
  url: string | null;

  @Expose()
  @ApiProperty({ enum: MediaType, description: 'Media type' })
  type: MediaType;

  @Expose()
  @ApiProperty({ description: 'MIME type' })
  mimeType: string;

  @Expose()
  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @Expose()
  @ApiProperty({ description: 'Human-readable file size' })
  humanReadableSize: string;

  @Expose()
  @ApiProperty({ description: 'Alternative text', required: false })
  alt: string | null;

  @Expose()
  @ApiProperty({ description: 'Media title', required: false })
  title: string | null;

  @Expose()
  @ApiProperty({ description: 'Media description', required: false })
  description: string | null;

  @Expose()
  @ApiProperty({ description: 'Image width in pixels', required: false })
  width: number | null;

  @Expose()
  @ApiProperty({ description: 'Image height in pixels', required: false })
  height: number | null;

  @Expose()
  @ApiProperty({ description: 'Video/audio duration in seconds', required: false })
  duration: number | null;

  @Expose()
  @ApiProperty({ description: 'Thumbnail URLs', required: false })
  thumbnails: Record<string, string> | null;

  @Expose()
  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata: Record<string, any> | null;

  @Expose()
  @ApiProperty({ description: 'Sort order' })
  sortOrder: number;

  @Expose()
  @ApiProperty({ description: 'Is primary media' })
  isPrimary: boolean;

  @Expose()
  @ApiProperty({ description: 'File extension' })
  extension: string;

  @Expose()
  @ApiProperty({ description: 'Is image type' })
  isImage: boolean;

  @Expose()
  @ApiProperty({ description: 'Is video type' })
  isVideo: boolean;

  @Expose()
  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @Expose()
  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;

  @Expose()
  @ApiProperty({ description: 'Created by user ID', required: false })
  createdBy: string | null;

  @Expose()
  @ApiProperty({ description: 'Updated by user ID', required: false })
  updatedBy: string | null;

  @Expose()
  @ApiProperty({ description: 'Version number' })
  version: number;

  /**
   * Create DTO from Media entity (standard pattern)
   */
  static fromEntity(media: Media): MediaResponseDto {
    const dto = new MediaResponseDto();
    Object.assign(dto, media);
    
    // Add calculated fields
    dto.humanReadableSize = media.getHumanReadableSize();
    dto.extension = media.getExtension();
    dto.isImage = media.isImage();
    dto.isVideo = media.isVideo();
    
    // Convert relative URL to absolute URL
    if (media.url) {
      // If URL is already absolute, keep it
      if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
        dto.url = media.url;
      } else {
        // Convert relative URL to absolute
        const baseUrl = process.env.BASE_URL || 'http://localhost:3010';
        dto.url = `${baseUrl}${media.url}`;
      }
    }
    
    return dto;
  }

  /**
   * Create DTOs from array of Media entities (standard pattern)
   */
  static fromEntities(media: Media[]): MediaResponseDto[] {
    return media.map(entity => this.fromEntity(entity));
  }
}
