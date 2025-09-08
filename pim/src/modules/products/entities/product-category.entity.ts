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

@Entity('product_categories')
@Unique(['productId', 'categoryId'])
@Index(['productId'])
@Index(['categoryId'])
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.productCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid' })
  categoryId: string;

  // TODO: Add Category entity relation when Category module is created
  // @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'categoryId' })
  // category: Category;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
