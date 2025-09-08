import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
@Unique(['parentProductId', 'variantProductId'])
@Index(['parentProductId'])
@Index(['variantProductId'])
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  parentProductId: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentProductId' })
  parentProduct: Product;

  @Column({ type: 'uuid' })
  variantProductId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variantProductId' })
  variantProduct: Product;

  // Variant specific data
  @Column({ type: 'jsonb' })
  variantAttributes: Record<string, any>; // e.g., {"color": "red", "size": "M"}

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceModifier: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  weightModifier: number;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
