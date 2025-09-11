import { Entity, Column, Index } from 'typeorm';
import { SoftDeleteEntity } from '../common/entities';

/**
 * Example Product entity extending SoftDeleteEntity
 * This demonstrates how to use the base entity classes
 */
@Entity('products')
@Index(['sku'], { unique: true })
@Index(['name'])
@Index(['isActive', 'isDeleted'])
export class Product extends SoftDeleteEntity {
  @Column({ 
    type: 'varchar', 
    length: 100, 
    unique: true,
    comment: 'Stock Keeping Unit - unique product identifier' 
  })
  sku: string;

  @Column({ 
    type: 'varchar', 
    length: 255,
    comment: 'Product display name' 
  })
  name: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: 'Product description' 
  })
  description: string | null;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0,
    comment: 'Product price' 
  })
  price: number;

  @Column({ 
    type: 'integer', 
    default: 0,
    comment: 'Available quantity in stock' 
  })
  quantity: number;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'Additional product attributes as JSON' 
  })
  attributes: Record<string, any> | null;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'draft',
    comment: 'Product status: draft, active, discontinued' 
  })
  status: 'draft' | 'active' | 'discontinued';

  /**
   * Check if product is available for purchase
   */
  isAvailable(): boolean {
    return (
      this.isActive && 
      !this.isDeleted && 
      this.status === 'active' && 
      this.quantity > 0
    );
  }

  /**
   * Update stock quantity
   */
  updateStock(quantity: number): void {
    this.quantity = Math.max(0, this.quantity + quantity);
  }
}
