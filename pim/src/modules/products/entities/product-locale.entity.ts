import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_locales')
@Unique(['productId', 'localeCode'])
@Index(['productId'])
@Index(['localeCode'])
export class ProductLocale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.locales, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar', length: 10 })
  localeCode: string;

  // Localized content
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  shortDescription: string | null;

  // SEO fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({ type: 'text', nullable: true })
  metaDescription: string | null;

  @Column({ type: 'text', nullable: true })
  metaKeywords: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  urlKey: string | null;

  // Rich content
  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any> | null;

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
