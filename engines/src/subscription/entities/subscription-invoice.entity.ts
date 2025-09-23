import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities';
import { Subscription } from './subscription.entity';
import { InvoiceStatus, DunningStatus } from '../enums';

/**
 * SubscriptionInvoice entity - Manages billing invoices for subscriptions
 */
@Entity('subscription_invoices')
@Index(['subscriptionId'])
@Index(['invoiceNumber'], { unique: true })
@Index(['status'])
@Index(['dueDate'])
@Index(['paidDate'])
export class SubscriptionInvoice extends BaseEntity {
  // Subscription relationship
  @Column({
    type: 'uuid',
    comment: 'Subscription this invoice belongs to',
  })
  subscriptionId: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.invoices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  // Invoice identification
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: 'Unique invoice number',
  })
  invoiceNumber: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'External invoice reference from payment provider',
  })
  externalInvoiceId: string | null;

  // Status
  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
    comment: 'Current invoice status',
  })
  status: InvoiceStatus;

  @Column({
    type: 'enum',
    enum: DunningStatus,
    default: DunningStatus.NOT_REQUIRED,
    comment: 'Dunning process status',
  })
  dunningStatus: DunningStatus;

  // Billing period
  @Column({
    type: 'timestamp with time zone',
    comment: 'Start of billing period',
  })
  periodStartDate: Date;

  @Column({
    type: 'timestamp with time zone',
    comment: 'End of billing period',
  })
  periodEndDate: Date;

  // Amounts
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Subtotal amount before discounts and taxes',
  })
  subtotalAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Total discount amount',
  })
  discountAmount: number;

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
    comment: 'Tax rate percentage',
  })
  taxRate: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Total amount due',
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Amount already paid',
  })
  paidAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Remaining balance',
  })
  balanceAmount: number;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'USD',
    comment: 'Currency code (ISO 4217)',
  })
  currency: string;

  // Important dates
  @Column({
    type: 'timestamp with time zone',
    comment: 'Invoice generation date',
  })
  invoiceDate: Date;

  @Column({
    type: 'timestamp with time zone',
    comment: 'Payment due date',
  })
  dueDate: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date when invoice was paid',
  })
  paidDate: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date when invoice was cancelled',
  })
  cancelledDate: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date when refund was issued',
  })
  refundedDate: Date | null;

  // Payment information
  @Column({
    type: 'integer',
    default: 0,
    comment: 'Number of payment attempts',
  })
  paymentAttempts: number;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Last payment attempt date',
  })
  lastPaymentAttemptDate: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Next scheduled payment retry date',
  })
  nextRetryDate: Date | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Payment transaction ID',
  })
  paymentTransactionId: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Payment method used',
  })
  paymentMethod: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Last payment error message',
  })
  lastPaymentError: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Payment error code',
  })
  lastPaymentErrorCode: string | null;

  // Line items
  @Column({
    type: 'jsonb',
    comment: 'Detailed line items for the invoice',
  })
  lineItems: Array<{
    productId: string;
    productSku: string;
    productName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    totalPrice: number;
    metadata?: Record<string, any>;
  }>;

  // Proration
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this invoice includes proration',
  })
  hasProration: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Proration details',
  })
  prorationDetails: Record<string, any> | null;

  // Customer information (snapshot at time of invoice)
  @Column({
    type: 'jsonb',
    comment: 'Customer details at time of invoice',
  })
  customerDetails: {
    accountId: string;
    name: string;
    email: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    taxId?: string;
  };

  // Billing address
  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Billing address for the invoice',
  })
  billingAddress: {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;

  // Additional information
  @Column({
    type: 'text',
    nullable: true,
    comment: 'Internal notes about the invoice',
  })
  internalNotes: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Customer-facing notes on the invoice',
  })
  customerNotes: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Terms and conditions',
  })
  termsAndConditions: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional invoice metadata',
  })
  metadata: Record<string, any> | null;

  // Dunning
  @Column({
    type: 'integer',
    default: 0,
    comment: 'Current dunning level (0-4)',
  })
  dunningLevel: number;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'When dunning process started',
  })
  dunningStartedAt: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'When to suspend if payment not received',
  })
  suspensionDate: Date | null;

  // Flags
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether invoice was manually marked as paid',
  })
  isManuallyPaid: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether invoice is disputed',
  })
  isDisputed: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether invoice has been sent to customer',
  })
  isSent: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date when invoice was sent',
  })
  sentDate: Date | null;

  /**
   * Check if invoice is overdue
   */
  isOverdue(): boolean {
    return (
      this.status === InvoiceStatus.PENDING &&
      this.dueDate < new Date() &&
      this.balanceAmount > 0
    );
  }

  /**
   * Check if invoice can be paid
   */
  canBePaid(): boolean {
    return (
      [InvoiceStatus.PENDING, InvoiceStatus.FAILED].includes(this.status) &&
      this.balanceAmount > 0
    );
  }

  /**
   * Check if dunning should be started
   */
  shouldStartDunning(): boolean {
    return (
      this.isOverdue() &&
      this.dunningStatus === DunningStatus.NOT_REQUIRED &&
      this.paymentAttempts > 0
    );
  }

  /**
   * Calculate days overdue
   */
  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.dueDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get next dunning action date based on level
   */
  getNextDunningDate(): Date | null {
    if (this.dunningStatus !== DunningStatus.IN_PROGRESS) return null;
    
    const dunningSchedule = [3, 7, 14, 21]; // Days after due date
    if (this.dunningLevel >= dunningSchedule.length) return null;
    
    const daysAfterDue = dunningSchedule[this.dunningLevel];
    const nextDate = new Date(this.dueDate);
    nextDate.setDate(nextDate.getDate() + daysAfterDue);
    return nextDate;
  }
}
