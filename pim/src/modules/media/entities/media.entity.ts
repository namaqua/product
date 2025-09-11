import { Entity, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entities';
import { Product } from '../../products/entities/product.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  OTHER = 'other',
}

/**
 * Media entity - Manages product media files (images, videos, documents)
 */
@Entity('media')
@Index(['filename'])
@Index(['type'])
@Index(['mimeType'])
export class Media extends SoftDeleteEntity {
  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Original filename',
  })
  filename: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: 'Stored file path',
  })
  path: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Public URL for accessing the file',
  })
  url: string | null;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
    comment: 'Media type classification',
  })
  type: MediaType;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'MIME type of the file',
  })
  mimeType: string;

  @Column({
    type: 'integer',
    comment: 'File size in bytes',
  })
  size: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Alternative text for accessibility',
  })
  alt: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Media title',
  })
  title: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Media description',
  })
  description: string | null;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Image width in pixels',
  })
  width: number | null;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Image height in pixels',
  })
  height: number | null;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Video/audio duration in seconds',
  })
  duration: number | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Thumbnail versions with different sizes',
  })
  thumbnails: Record<string, string> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional metadata (EXIF, etc.)',
  })
  metadata: Record<string, any> | null;

  @Column({
    type: 'integer',
    default: 0,
    comment: 'Sort order for display',
  })
  sortOrder: number;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Is this the primary media for products',
  })
  isPrimary: boolean;

  // Many-to-many relationship with products
  @ManyToMany(() => Product, { cascade: false })
  @JoinTable({
    name: 'product_media',
    joinColumn: { name: 'mediaId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products: Product[];

  /**
   * Check if media is an image
   */
  isImage(): boolean {
    return this.type === MediaType.IMAGE;
  }

  /**
   * Check if media is a video
   */
  isVideo(): boolean {
    return this.type === MediaType.VIDEO;
  }

  /**
   * Get file extension
   */
  getExtension(): string {
    const parts = this.filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Get human-readable file size
   */
  getHumanReadableSize(): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (this.size === 0) return '0 B';
    const i = Math.floor(Math.log(this.size) / Math.log(1024));
    return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
