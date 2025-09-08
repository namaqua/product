import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProductLocale } from './product-locale.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductBundle } from './product-bundle.entity';
import { ProductRelationship } from './product-relationship.entity';
import { ProductAttribute } from './product-attribute.entity';
import { ProductMedia } from './product-media.entity';
import { ProductCategory } from './product-category.entity';

export enum ProductType {
  SIMPLE = 'simple',
  CONFIGURABLE = 'configurable',
  BUNDLE = 'bundle',
  VIRTUAL = 'virtual',
}

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('products')
@Index(['sku'])
@Index(['type'])
@Index(['status'])
@Index(['parentId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.SIMPLE,
  })
  type: ProductType;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  // For variant products - reference to parent configurable product
  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Product, (product) => product.children, { nullable: true })
  parent: Product;

  @OneToMany(() => Product, (product) => product.parent)
  children: Product[];

  // Inventory tracking
  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'boolean', default: true })
  trackInventory: boolean;

  @Column({ type: 'boolean', default: true })
  inStock: boolean;

  @Column({ type: 'integer', nullable: true })
  minQuantity: number | null;

  @Column({ type: 'integer', nullable: true })
  maxQuantity: number | null;

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  comparePrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number | null;

  // Physical properties
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  weight: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  weightUnit: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  dimensionUnit: string | null;

  // SEO and visibility
  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any> | null;

  // Version control
  @Column({ type: 'integer', default: 1 })
  version: number;

  // Relationships
  @OneToMany(() => ProductLocale, (locale) => locale.product, {
    cascade: true,
    eager: false,
  })
  locales: ProductLocale[];

  @OneToMany(() => ProductVariant, (variant) => variant.parentProduct)
  variants: ProductVariant[];

  @OneToMany(() => ProductBundle, (bundle) => bundle.bundleProduct)
  bundleItems: ProductBundle[];

  @OneToMany(() => ProductRelationship, (rel) => rel.sourceProduct)
  relatedProducts: ProductRelationship[];

  @OneToMany(() => ProductAttribute, (attr) => attr.product, {
    cascade: true,
  })
  attributes: ProductAttribute[];

  @OneToMany(() => ProductMedia, (media) => media.product, {
    cascade: true,
  })
  media: ProductMedia[];

  @OneToMany(() => ProductCategory, (pc) => pc.product, {
    cascade: true,
  })
  productCategories: ProductCategory[];

  // Audit fields
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, { nullable: true })
  createdBy: User | null;

  @ManyToOne(() => User, { nullable: true })
  updatedBy: User | null;

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  updateInventoryStatus() {
    if (this.trackInventory) {
      this.inStock = this.quantity > 0;
    }
  }

  @BeforeUpdate()
  incrementVersion() {
    this.version++;
  }
}
