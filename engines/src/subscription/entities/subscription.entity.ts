import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../common/entities';
import { Account } from '../../modules/accounts/entities/account.entity';
import { SubscriptionProduct } from './subscription-product.entity';
import { SubscriptionInvoice } from './subscription-invoice.entity';
import { SubscriptionEvent } from './subscription-event.entity';
import {
  SubscriptionStatus,
  BillingCycle,
  CancellationReason,
} from '../enums';

/**
 * Subscription entity - Core entity for managing recurring billing and services
 */
@Entity('subscriptions')
@Index(['accountId'])
@Index(['parentSubscriptionId'])
@Index(['status'])
@Index(['nextBillingDate'])
@Index(['cancellationEffectiveDate'])
@Index(['payerToken'])
export class Subscription extends SoftDeleteEntity {
  // Account relationship
  @Column({
    type: 'uuid',
    comment: 'Account that owns this subscription',
  })
  accountId: string;

  @ManyToOne(() => Account, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  // Parent-child relationship for hierarchical subscriptions
  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'Parent subscription ID for bundled/master subscriptions',
  })
  parentSubscriptionId: string | null;

  @ManyToOne(() => Subscription, (subscription) => subscription.childSubscriptions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentSubscriptionId' })
  parentSubscription: Subscription | null;

  @OneToMany(() => Subscription, (subscription) => subscription.parentSubscription)
  childSubscriptions: Subscription[];

  // Status and lifecycle
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
    comment: 'Current subscription status',
  })
  status: SubscriptionStatus;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Subscription name/description',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Detailed subscription description',
  })
  description: string | null;

  // Billing configuration
  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
    comment: 'Billing frequency',
  })
  billingCycle: BillingCycle;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Custom billing cycle days (when billingCycle is CUSTOM)',
  })
  customBillingDays: number | null;

  @Column({
    type: 'integer',
    default: 1,
    comment: 'Day of month for billing (1-28)',
  })
  billingDayOfMonth: number;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'USD',
    comment: 'Currency code (ISO 4217)',
  })
  currency: string;

  // Pricing
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Base subscription amount before discounts/taxes',
  })
  baseAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Discount amount applied',
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
    default: 0,
    comment: 'Tax amount',
  })
  taxAmount: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Tax percentage',
  })
  taxPercentage: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Total amount to be charged (base - discount + tax)',
  })
  totalAmount: number;

  // Important dates
  @Column({
    type: 'timestamp with time zone',
    comment: 'Subscription start date',
  })
  startDate: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Subscription end date (null for ongoing)',
  })
  endDate: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Next billing date',
  })
  nextBillingDate: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Last successful billing date',
  })
  lastBillingDate: Date | null;

  // Trial period
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether subscription has a trial period',
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
    comment: 'Trial end date',
  })
  trialEndDate: Date | null;

  // Pause/Resume functionality
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date when subscription was paused',
  })
  pausedAt: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date when subscription was resumed',
  })
  resumedAt: Date | null;

  @Column({
    type: 'integer',
    default: 0,
    comment: 'Total number of days paused',
  })
  totalPausedDays: number;

  // Cancellation
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date when cancellation was requested',
  })
  cancellationDate: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date when cancellation becomes effective',
  })
  cancellationEffectiveDate: Date | null;

  @Column({
    type: 'enum',
    enum: CancellationReason,
    nullable: true,
    comment: 'Reason for cancellation',
  })
  cancellationReason: CancellationReason | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Additional cancellation notes',
  })
  cancellationNotes: string | null;

  @Column({
    type: 'integer',
    default: 30,
    comment: 'Notice period in days for cancellation',
  })
  noticePeriodDays: number;

  // Payment information
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Payment service provider token',
  })
  payerToken: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Payment method identifier',
  })
  paymentMethodId: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Payment provider name (stripe, paypal, mock)',
  })
  paymentProvider: string | null;

  @Column({
    type: 'varchar',
    length: 4,
    nullable: true,
    comment: 'Last 4 digits of payment method',
  })
  paymentMethodLast4: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Payment method type (card, bank, etc)',
  })
  paymentMethodType: string | null;

  // Auto-renewal
  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether subscription auto-renews',
  })
  autoRenew: boolean;

  @Column({
    type: 'integer',
    default: 3,
    comment: 'Maximum payment retry attempts',
  })
  maxRetryAttempts: number;

  // Metadata
  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional subscription metadata',
  })
  metadata: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Custom subscription settings',
  })
  settings: Record<string, any> | null;

  // Usage tracking
  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Usage limits and quotas',
  })
  usageLimits: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Current usage statistics',
  })
  currentUsage: Record<string, any> | null;

  // Relations
  @OneToMany(() => SubscriptionProduct, (sp) => sp.subscription)
  subscriptionProducts: SubscriptionProduct[];

  @OneToMany(() => SubscriptionInvoice, (invoice) => invoice.subscription)
  invoices: SubscriptionInvoice[];

  @OneToMany(() => SubscriptionEvent, (event) => event.subscription)
  events: SubscriptionEvent[];

  /**
   * Check if subscription is currently active
   */
  isCurrentlyActive(): boolean {
    return (
      this.status === SubscriptionStatus.ACTIVE &&
      !this.isDeleted &&
      (!this.endDate || this.endDate > new Date())
    );
  }

  /**
   * Check if subscription is in trial period
   */
  isInTrial(): boolean {
    if (!this.hasTrial || !this.trialEndDate) return false;
    return new Date() < this.trialEndDate;
  }

  /**
   * Check if subscription can be cancelled
   */
  canBeCancelled(): boolean {
    return [
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.PENDING,
      SubscriptionStatus.PAUSED,
    ].includes(this.status);
  }

  /**
   * Check if subscription can be paused
   */
  canBePaused(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && !this.parentSubscriptionId;
  }

  /**
   * Check if subscription can be resumed
   */
  canBeResumed(): boolean {
    return this.status === SubscriptionStatus.PAUSED;
  }

  /**
   * Calculate prorated amount for a given period
   */
  calculateProratedAmount(days: number): number {
    const daysInCycle = this.getDaysInBillingCycle();
    const dailyRate = this.totalAmount / daysInCycle;
    return Math.round(dailyRate * days * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get number of days in the current billing cycle
   */
  getDaysInBillingCycle(): number {
    switch (this.billingCycle) {
      case BillingCycle.MONTHLY:
        return 30;
      case BillingCycle.QUARTERLY:
        return 90;
      case BillingCycle.ANNUAL:
        return 365;
      case BillingCycle.CUSTOM:
        return this.customBillingDays || 30;
      default:
        return 30;
    }
  }

  /**
   * Check if payment retry is needed
   */
  needsPaymentRetry(): boolean {
    return (
      this.status === SubscriptionStatus.ACTIVE &&
      this.nextBillingDate &&
      this.nextBillingDate <= new Date() &&
      this.autoRenew
    );
  }
}
