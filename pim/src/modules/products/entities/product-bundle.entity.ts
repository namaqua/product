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

@Entity('product_bundles')
@Unique(['bundleProductId', 'componentProductId'])
@Index(['bundleProductId'])
@Index(['componentProductId'])
export class ProductBundle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bundleProductId: string;

  @ManyToOne(() => Product, (product) => product.bundleItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bundleProductId' })
  bundleProduct: Product;

  @Column({ type: 'uuid' })
  componentProductId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'componentProductId' })
  componentProduct: Product;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ type: 'boolean', default: true })
  isRequired: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
