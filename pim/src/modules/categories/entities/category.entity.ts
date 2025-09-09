import { Entity, Column, Index, ManyToMany, OneToMany, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entities';
import { Product } from '../../products/entities/product.entity';

/**
 * Category entity using Nested Set Model for hierarchical data
 * This allows efficient querying of tree structures
 * 
 * Nested Set Model explanation:
 * - Each node has left and right values
 * - All descendants of a node have left/right values between parent's left/right
 * - Leaf nodes have right = left + 1
 * - Node has (right - left - 1) / 2 descendants
 */
@Entity('categories')
@Index(['slug'], { unique: true })
@Index(['left', 'right'])
@Index(['parentId'])
@Index(['level'])
@Index(['isActive'])
export class Category extends SoftDeleteEntity {
  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Category name',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'URL-friendly slug',
  })
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Category description',
  })
  description: string | null;

  // Nested Set Model fields
  @Column({
    type: 'integer',
    comment: 'Nested set left value',
  })
  left: number;

  @Column({
    type: 'integer',
    comment: 'Nested set right value',
  })
  right: number;

  @Column({
    type: 'integer',
    default: 0,
    comment: 'Depth level in tree (0 = root)',
  })
  level: number;

  // Parent relationship
  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'Parent category ID',
  })
  parentId: string | null;

  @ManyToOne(() => Category, category => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category | null;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  // Product relationships
  @ManyToMany(() => Product, product => product.categories)
  products: Product[];

  // Display settings
  @Column({
    type: 'integer',
    default: 0,
    comment: 'Sort order for display',
  })
  sortOrder: number;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether category is visible',
  })
  isVisible: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether to show in navigation menu',
  })
  showInMenu: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether category is featured',
  })
  isFeatured: boolean;

  // SEO fields
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

  // Images
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Category image URL',
  })
  imageUrl: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Category banner URL',
  })
  bannerUrl: string | null;

  // Attributes that can be inherited by products
  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Default attributes for products in this category',
  })
  defaultAttributes: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Required attributes for products in this category',
  })
  requiredAttributes: string[] | null;

  // Statistics (denormalized for performance)
  @Column({
    type: 'integer',
    default: 0,
    comment: 'Number of direct products',
  })
  productCount: number;

  @Column({
    type: 'integer',
    default: 0,
    comment: 'Total products including subcategories',
  })
  totalProductCount: number;

  /**
   * Check if this category is a root category
   */
  isRoot(): boolean {
    return this.parentId === null && this.level === 0;
  }

  /**
   * Check if this category is a leaf (has no children)
   */
  isLeaf(): boolean {
    return this.right === this.left + 1;
  }

  /**
   * Get the number of descendants
   */
  getDescendantCount(): number {
    return (this.right - this.left - 1) / 2;
  }

  /**
   * Check if this category is a descendant of another
   */
  isDescendantOf(ancestor: Category): boolean {
    return this.left > ancestor.left && this.right < ancestor.right;
  }

  /**
   * Check if this category is an ancestor of another
   */
  isAncestorOf(descendant: Category): boolean {
    return descendant.left > this.left && descendant.right < this.right;
  }

  /**
   * Generate slug from name
   */
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (!this.slug && this.name) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }

  /**
   * Get breadcrumb path (requires ancestors to be loaded)
   */
  getBreadcrumb(ancestors: Category[]): string {
    const path = ancestors.map(a => a.name);
    path.push(this.name);
    return path.join(' > ');
  }

  /**
   * Get URL path
   */
  getUrlPath(ancestors: Category[]): string {
    const slugs = ancestors.map(a => a.slug);
    slugs.push(this.slug);
    return '/' + slugs.join('/');
  }
}
