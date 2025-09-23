/**
 * Subscription Module Interfaces
 * Define contracts and types for the subscription system
 */

// Export all interfaces from this directory
// export * from './subscription.interface';
// export * from './billing.interface';
// export * from './payment-provider.interface';

// Placeholder interfaces for initial setup
export interface ISubscriptionStatus {
  active: 'active';
  cancelled: 'cancelled';
  paused: 'paused';
  pending: 'pending';
  expired: 'expired';
}

export interface IBillingCycle {
  monthly: 'monthly';
  quarterly: 'quarterly';
  annual: 'annual';
  custom: 'custom';
}

export interface IPaymentStatus {
  pending: 'pending';
  processing: 'processing';
  succeeded: 'succeeded';
  failed: 'failed';
  cancelled: 'cancelled';
}
