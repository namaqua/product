import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  THREE_SIXTY = '360',
}

@Entity('product_media')
@Index(['productId'])
@Index(['mediaType'])
export class ProductMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.media, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  mediaType: MediaType;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  // Localization
  @Column({ type: 'varchar', length: 10, nullable: true })
  localeCode: string | null;

  // Display
  @Column({ type: 'text', nullable: true })
  altText: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  // File metadata
  @Column({ type: 'varchar', length: 255, nullable: true })
  filename: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType: string | null;

  @Column({ type: 'integer', nullable: true })
  fileSize: number | null;

  @Column({ type: 'integer', nullable: true })
  width: number | null;

  @Column({ type: 'integer', nullable: true })
  height: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
