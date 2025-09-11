import { Entity, Column, Index, OneToMany, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entities';
import { Category } from '../../categories/entities/category.entity';
import { AttributeValue } from '../../attributes/entities/attribute-value.entity';
import { Media } from '../../media/entities/media.entity';

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

/**
 * Product entity - Core PIM entity for managing product information
 */
@Entity('products')
@Index(['sku'], { unique: true })
@Index(['type'])
@Index(['status'])
@Index(['parentId'])
@Index(['isActive'])
export class Product extends SoftDeleteEntity {
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: 'Stock Keeping Unit - unique product identifier',
  })
  sku: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.SIMPLE,
    comment: 'Product type classification',
  })
  type: ProductType;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
    comment: 'Current workflow status',
  })
  status: ProductStatus;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Product name/title',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Detailed product description',
  })
  description: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Short product description for listings',
  })
  shortDescription: string | null;

  // Pricing
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Base product price',
  })
  price: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Cost of goods sold',
  })
  cost: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Special/sale price',
  })
  specialPrice: number | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Special price start date',
  })
  specialPriceFrom: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Special price end date',
  })
  specialPriceTo: Date | null;

  // Inventory
  @Column({
    type: 'integer',
    default: 0,
    comment: 'Current stock quantity',
  })
  quantity: number;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether stock is tracked for this product',
  })
  manageStock: boolean;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether product is in stock',
  })
  inStock: boolean;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Minimum quantity for low stock alerts',
  })
  lowStockThreshold: number | null;

  // Physical attributes
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    nullable: true,
    comment: 'Product weight in kg',
  })
  weight: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Product length in cm',
  })
  length: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Product width in cm',
  })
  width: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Product height in cm',
  })
  height: number | null;

  // SEO
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'SEO meta title',
  })
  metaTitle: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'SEO meta description',
  })
  metaDescription: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'SEO meta keywords',
  })
  metaKeywords: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'URL slug for product page',
  })
  urlKey: string | null;

  // Hierarchical relationship for variants
  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'Parent product ID for variants',
  })
  parentId: string | null;

  @ManyToOne(() => Product, (product) => product.variants, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Product | null;

  @OneToMany(() => Product, (product) => product.parent)
  variants: Product[];

  // Category relationships
  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];

  // Attribute values (EAV pattern)
  @OneToMany(() => AttributeValue, (value) => value.product)
  attributeValues: AttributeValue[];

  // Media relationships
  @ManyToMany(() => Media, (media) => media.products)
  media: Media[];

  // Additional data
  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Custom attributes as JSON',
  })
  attributes: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Product features list',
  })
  features: string[] | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Product specifications',
  })
  specifications: Record<string, any> | null;

  @Column({
    type: 'simple-array',
    nullable: true,
    comment: 'Product tags for categorization',
  })
  tags: string[] | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Product barcode (EAN/UPC)',
  })
  barcode: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Manufacturer part number',
  })
  mpn: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Product brand name',
  })
  brand: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Product manufacturer',
  })
  manufacturer: string | null;

  // Visibility
  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether product is visible in catalog',
  })
  isVisible: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether product is featured',
  })
  isFeatured: boolean;

  @Column({
    type: 'integer',
    default: 0,
    comment: 'Sort order for display',
  })
  sortOrder: number;

  /**
   * Check if product is available for sale
   */
  isAvailable(): boolean {
    return (
      this.isActive &&
      this.status === ProductStatus.PUBLISHED &&
      this.isVisible &&
      !this.isDeleted
    );
  }

  /**
   * Check if product has variants
   */
  hasVariants(): boolean {
    return this.type === ProductType.CONFIGURABLE && this.variants?.length > 0;
  }

  /**
   * Check if product is a variant
   */
  isVariant(): boolean {
    return this.parentId !== null;
  }

  /**
   * Get effective price (special price if active, otherwise regular price)
   */
  getEffectivePrice(): number | null {
    const now = new Date();
    if (
      this.specialPrice !== null &&
      (!this.specialPriceFrom || this.specialPriceFrom <= now) &&
      (!this.specialPriceTo || this.specialPriceTo >= now)
    ) {
      return this.specialPrice;
    }
    return this.price;
  }

  /**
   * Check if product is on sale
   */
  isOnSale(): boolean {
    const effectivePrice = this.getEffectivePrice();
    return effectivePrice !== null && effectivePrice < (this.price || 0);
  }

  /**
   * Update stock quantity
   */
  updateStock(quantity: number): void {
    this.quantity = quantity;
    this.inStock = quantity > 0;
  }

  /**
   * Check if stock is low
   */
  isLowStock(): boolean {
    if (!this.manageStock) return false;
    if (this.lowStockThreshold === null) return false;
    return this.quantity <= this.lowStockThreshold;
  }
}
