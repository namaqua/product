/**
 * Subscription Module Enums
 * Enumerated types for subscription system
 */

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  CUSTOM = 'custom',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentAttemptStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum SubscriptionEventType {
  // Lifecycle events
  CREATED = 'created',
  ACTIVATED = 'activated',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  
  // Billing events
  INVOICE_GENERATED = 'invoice_generated',
  PAYMENT_SUCCEEDED = 'payment_succeeded',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_RETRY = 'payment_retry',
  
  // Modification events
  UPGRADED = 'upgraded',
  DOWNGRADED = 'downgraded',
  PRODUCT_ADDED = 'product_added',
  PRODUCT_REMOVED = 'product_removed',
  
  // Hierarchy events
  PARENT_ASSIGNED = 'parent_assigned',
  CHILD_ADDED = 'child_added',
  CHILD_REMOVED = 'child_removed',
}

export enum DunningStatus {
  NOT_REQUIRED = 'not_required',
  IN_PROGRESS = 'in_progress',
  GRACE_PERIOD = 'grace_period',
  SUSPENDED = 'suspended',
  RESOLVED = 'resolved',
  FAILED = 'failed',
}

export enum CancellationReason {
  CUSTOMER_REQUEST = 'customer_request',
  NON_PAYMENT = 'non_payment',
  FRAUD = 'fraud',
  OTHER = 'other',
}
