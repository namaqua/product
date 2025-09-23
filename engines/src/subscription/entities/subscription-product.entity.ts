import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../common/entities';
import { Subscription } from './subscription.entity';
import { Product } from '../../modules/products/entities/product.entity';

/**
 * SubscriptionProduct entity - Junction table linking subscriptions to products
 * Handles products included in a subscription with their specific pricing
 */
@Entity('subscription_products')
@Unique(['subscriptionId', 'productId'])
@Index(['subscriptionId'])
@Index(['productId'])
@Index(['isActive'])
export class SubscriptionProduct extends BaseEntity {
  // Subscription relationship
  @Column({
    type: 'uuid',
    comment: 'Subscription ID',
  })
  subscriptionId: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.subscriptionProducts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  // Product relationship
  @Column({
    type: 'uuid',
    comment: 'Product ID',
  })
  productId: string;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // Product details
  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Product name at time of subscription',
  })
  productName: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Product SKU at time of subscription',
  })
  productSku: string;

  // Quantity and pricing
  @Column({
    type: 'integer',
    default: 1,
    comment: 'Quantity of product in subscription',
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Unit price per product',
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Discount amount per unit',
  })
  discountAmount: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Discount percentage',
  })
  discountPercentage: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Total price (quantity * (unitPrice - discount))',
  })
  totalPrice: number;

  // Billing configuration
  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether this product is recurring',
  })
  isRecurring: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this is a one-time setup fee',
  })
  isSetupFee: boolean;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Billing frequency override (in days)',
  })
  billingFrequencyDays: number | null;

  // Dates
  @Column({
    type: 'timestamp with time zone',
    comment: 'Date when product was added to subscription',
  })
  addedDate: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date when product will be removed from subscription',
  })
  removalDate: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Last billing date for this product',
  })
  lastBilledDate: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Next billing date for this product',
  })
  nextBillingDate: Date | null;

  // Usage-based billing
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this product uses usage-based billing',
  })
  isUsageBased: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Usage tracking configuration',
  })
  usageConfig: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Current usage data',
  })
  currentUsage: Record<string, any> | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Usage limit for this product',
  })
  usageLimit: number | null;

  // Trial configuration
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this product has a trial period',
  })
  hasTrial: boolean;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Trial period in days',
  })
  trialDays: number | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Trial end date for this product',
  })
  trialEndDate: Date | null;

  // Additional configuration
  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Product-specific configuration',
  })
  configuration: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Product metadata at time of subscription',
  })
  metadata: Record<string, any> | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Notes about this product in the subscription',
  })
  notes: string | null;

  // Sorting and display
  @Column({
    type: 'integer',
    default: 0,
    comment: 'Sort order for display',
  })
  sortOrder: number;

  /**
   * Calculate the line total for this product
   */
  calculateLineTotal(): number {
    const discountedPrice = this.unitPrice - this.discountAmount;
    return Math.round(discountedPrice * this.quantity * 100) / 100;
  }

  /**
   * Check if product is in trial period
   */
  isInTrial(): boolean {
    if (!this.hasTrial || !this.trialEndDate) return false;
    return new Date() < this.trialEndDate;
  }

  /**
   * Check if product should be billed
   */
  shouldBeBilled(): boolean {
    if (!this.isActive) return false;
    if (!this.isRecurring && this.lastBilledDate) return false;
    if (this.removalDate && this.removalDate <= new Date()) return false;
    if (this.isInTrial()) return false;
    return true;
  }

  /**
   * Check if usage limit exceeded
   */
  isUsageLimitExceeded(): boolean {
    if (!this.isUsageBased || !this.usageLimit) return false;
    const currentUsageValue = this.currentUsage?.value || 0;
    return currentUsageValue >= this.usageLimit;
  }
}
