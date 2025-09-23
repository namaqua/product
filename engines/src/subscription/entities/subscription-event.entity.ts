import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities';
import { Subscription } from './subscription.entity';
import { SubscriptionEventType } from '../enums';

/**
 * SubscriptionEvent entity - Audit trail for subscription lifecycle events
 */
@Entity('subscription_events')
@Index(['subscriptionId'])
@Index(['eventType'])
@Index(['createdAt'])
@Index(['userId'])
export class SubscriptionEvent extends BaseEntity {
  // Subscription relationship
  @Column({
    type: 'uuid',
    comment: 'Subscription this event belongs to',
  })
  subscriptionId: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.events, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  // Event details
  @Column({
    type: 'enum',
    enum: SubscriptionEventType,
    comment: 'Type of event',
  })
  eventType: SubscriptionEventType;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Human-readable event description',
  })
  description: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Detailed event message',
  })
  details: string | null;

  // Status tracking
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Previous subscription status',
  })
  previousStatus: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'New subscription status',
  })
  newStatus: string | null;

  // Financial impact
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Amount associated with this event',
  })
  amount: number | null;

  @Column({
    type: 'varchar',
    length: 3,
    nullable: true,
    comment: 'Currency for the amount',
  })
  currency: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Invoice number if event is billing-related',
  })
  invoiceNumber: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Payment transaction ID if applicable',
  })
  transactionId: string | null;

  // User tracking
  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'User who triggered this event',
  })
  userId: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Name of user who triggered event',
  })
  userName: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Source of the event (admin, system, customer, webhook)',
  })
  eventSource: string | null;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: 'IP address of the request',
  })
  ipAddress: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'User agent string if from web request',
  })
  userAgent: string | null;

  // Related entities
  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'Related product ID if applicable',
  })
  relatedProductId: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Related product name',
  })
  relatedProductName: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'Parent subscription ID for hierarchy events',
  })
  relatedSubscriptionId: string | null;

  // Event data
  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional event metadata',
  })
  metadata: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Snapshot of subscription state before event',
  })
  previousState: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Snapshot of subscription state after event',
  })
  newState: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Changed fields and their values',
  })
  changes: Record<string, { old: any; new: any }> | null;

  // Error tracking
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this event represents an error',
  })
  isError: boolean;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Error message if applicable',
  })
  errorMessage: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Error code if applicable',
  })
  errorCode: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Stack trace for debugging',
  })
  stackTrace: string | null;

  // Notification tracking
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether customer was notified of this event',
  })
  customerNotified: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'When customer was notified',
  })
  notificationSentAt: Date | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Notification method (email, sms, in-app)',
  })
  notificationMethod: string | null;

  // Webhook tracking
  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this event triggered a webhook',
  })
  webhookSent: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'When webhook was sent',
  })
  webhookSentAt: Date | null;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'HTTP status code of webhook response',
  })
  webhookResponseCode: number | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Webhook response body',
  })
  webhookResponse: string | null;

  // Processing
  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether this event has been processed',
  })
  isProcessed: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'When event was processed',
  })
  processedAt: Date | null;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this event requires manual review',
  })
  requiresReview: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'When event was reviewed',
  })
  reviewedAt: Date | null;

  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'User who reviewed the event',
  })
  reviewedBy: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Review notes',
  })
  reviewNotes: string | null;

  /**
   * Check if event is a lifecycle event
   */
  isLifecycleEvent(): boolean {
    return [
      SubscriptionEventType.CREATED,
      SubscriptionEventType.ACTIVATED,
      SubscriptionEventType.PAUSED,
      SubscriptionEventType.RESUMED,
      SubscriptionEventType.CANCELLED,
      SubscriptionEventType.EXPIRED,
    ].includes(this.eventType);
  }

  /**
   * Check if event is a billing event
   */
  isBillingEvent(): boolean {
    return [
      SubscriptionEventType.INVOICE_GENERATED,
      SubscriptionEventType.PAYMENT_SUCCEEDED,
      SubscriptionEventType.PAYMENT_FAILED,
      SubscriptionEventType.PAYMENT_RETRY,
    ].includes(this.eventType);
  }

  /**
   * Check if event is a modification event
   */
  isModificationEvent(): boolean {
    return [
      SubscriptionEventType.UPGRADED,
      SubscriptionEventType.DOWNGRADED,
      SubscriptionEventType.PRODUCT_ADDED,
      SubscriptionEventType.PRODUCT_REMOVED,
    ].includes(this.eventType);
  }

  /**
   * Check if event should trigger customer notification
   */
  shouldNotifyCustomer(): boolean {
    // Define which events should notify customers
    const notifiableEvents = [
      SubscriptionEventType.ACTIVATED,
      SubscriptionEventType.CANCELLED,
      SubscriptionEventType.PAYMENT_FAILED,
      SubscriptionEventType.EXPIRED,
    ];
    return notifiableEvents.includes(this.eventType) && !this.customerNotified;
  }

  /**
   * Check if event should trigger webhook
   */
  shouldTriggerWebhook(): boolean {
    // All non-error events should trigger webhooks
    return !this.isError && !this.webhookSent;
  }

  /**
   * Get event severity level
   */
  getSeverity(): 'info' | 'warning' | 'error' | 'critical' {
    if (this.isError) {
      if (this.eventType === SubscriptionEventType.PAYMENT_FAILED) {
        return 'critical';
      }
      return 'error';
    }

    if (this.requiresReview) {
      return 'warning';
    }

    return 'info';
  }

  /**
   * Format event for logging
   */
  toLogFormat(): string {
    return JSON.stringify({
      timestamp: this.createdAt,
      subscriptionId: this.subscriptionId,
      eventType: this.eventType,
      description: this.description,
      userId: this.userId,
      severity: this.getSeverity(),
      metadata: this.metadata,
    });
  }
}
