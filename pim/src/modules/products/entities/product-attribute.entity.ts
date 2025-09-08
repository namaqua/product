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

@Entity('product_attributes')
@Unique(['productId', 'attributeCode', 'localeCode', 'channelCode'])
@Index(['productId'])
@Index(['attributeCode'])
@Index(['localeCode'])
@Index(['channelCode'])
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.attributes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar', length: 100 })
  attributeCode: string;

  // Polymorphic value storage
  @Column({ type: 'text', nullable: true })
  valueText: string | null;

  @Column({ type: 'decimal', precision: 20, scale: 6, nullable: true })
  valueNumber: number | null;

  @Column({ type: 'boolean', nullable: true })
  valueBoolean: boolean | null;

  @Column({ type: 'date', nullable: true })
  valueDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  valueDatetime: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  valueJson: Record<string, any> | null;

  // Multi-value support (for select/multiselect)
  @Column({ type: 'uuid', array: true, nullable: true })
  valueOptions: string[] | null;

  // Scope
  @Column({ type: 'varchar', length: 10, nullable: true })
  localeCode: string | null; // NULL for global attributes

  @Column({ type: 'varchar', length: 50, nullable: true })
  channelCode: string | null; // NULL for global attributes

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
