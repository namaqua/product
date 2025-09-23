import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus, BillingCycle, CancellationReason } from '../enums';

export class SubscriptionProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  subscriptionId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  productSku: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  isRecurring: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SubscriptionResponseDto {
  @ApiProperty({
    description: 'Subscription ID',
    example: 'uuid-of-subscription',
  })
  id: string;

  @ApiProperty({
    description: 'Account ID',
    example: 'uuid-of-account',
  })
  accountId: string;

  @ApiPropertyOptional({
    description: 'Parent subscription ID',
    example: 'uuid-of-parent',
    nullable: true,
  })
  parentSubscriptionId: string | null;

  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'Subscription name',
    example: 'Premium Monthly Plan',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Subscription description',
    nullable: true,
  })
  description: string | null;

  // Billing
  @ApiProperty({
    description: 'Billing cycle',
    enum: BillingCycle,
  })
  billingCycle: BillingCycle;

  @ApiPropertyOptional({
    description: 'Custom billing days',
    nullable: true,
  })
  customBillingDays: number | null;

  @ApiProperty({
    description: 'Billing day of month',
    example: 1,
  })
  billingDayOfMonth: number;

  @ApiProperty({
    description: 'Currency',
    example: 'USD',
  })
  currency: string;

  // Amounts
  @ApiProperty({
    description: 'Base amount',
    example: 99.99,
  })
  baseAmount: number;

  @ApiProperty({
    description: 'Discount amount',
    example: 10.00,
  })
  discountAmount: number;

  @ApiProperty({
    description: 'Discount percentage',
    example: 10,
  })
  discountPercentage: number;

  @ApiProperty({
    description: 'Tax amount',
    example: 8.50,
  })
  taxAmount: number;

  @ApiProperty({
    description: 'Tax percentage',
    example: 8.5,
  })
  taxPercentage: number;

  @ApiProperty({
    description: 'Total amount',
    example: 98.49,
  })
  totalAmount: number;

  // Dates
  @ApiProperty({
    description: 'Start date',
    example: '2025-01-01T00:00:00Z',
  })
  startDate: Date;

  @ApiPropertyOptional({
    description: 'End date',
    example: '2025-12-31T23:59:59Z',
    nullable: true,
  })
  endDate: Date | null;

  @ApiPropertyOptional({
    description: 'Next billing date',
    example: '2025-02-01T00:00:00Z',
    nullable: true,
  })
  nextBillingDate: Date | null;

  @ApiPropertyOptional({
    description: 'Last billing date',
    example: '2025-01-01T00:00:00Z',
    nullable: true,
  })
  lastBillingDate: Date | null;

  // Trial
  @ApiProperty({
    description: 'Has trial period',
    example: false,
  })
  hasTrial: boolean;

  @ApiPropertyOptional({
    description: 'Trial days',
    nullable: true,
  })
  trialDays: number | null;

  @ApiPropertyOptional({
    description: 'Trial end date',
    nullable: true,
  })
  trialEndDate: Date | null;

  // Pause/Resume
  @ApiPropertyOptional({
    description: 'Paused at',
    nullable: true,
  })
  pausedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Resumed at',
    nullable: true,
  })
  resumedAt: Date | null;

  @ApiProperty({
    description: 'Total paused days',
    example: 0,
  })
  totalPausedDays: number;

  // Cancellation
  @ApiPropertyOptional({
    description: 'Cancellation date',
    nullable: true,
  })
  cancellationDate: Date | null;

  @ApiPropertyOptional({
    description: 'Cancellation effective date',
    nullable: true,
  })
  cancellationEffectiveDate: Date | null;

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    enum: CancellationReason,
    nullable: true,
  })
  cancellationReason: CancellationReason | null;

  @ApiPropertyOptional({
    description: 'Cancellation notes',
    nullable: true,
  })
  cancellationNotes: string | null;

  @ApiProperty({
    description: 'Notice period days',
    example: 30,
  })
  noticePeriodDays: number;

  // Payment
  @ApiPropertyOptional({
    description: 'Payment method last 4 digits',
    example: '4242',
    nullable: true,
  })
  paymentMethodLast4: string | null;

  @ApiPropertyOptional({
    description: 'Payment method type',
    example: 'card',
    nullable: true,
  })
  paymentMethodType: string | null;

  @ApiPropertyOptional({
    description: 'Payment provider',
    example: 'stripe',
    nullable: true,
  })
  paymentProvider: string | null;

  @ApiProperty({
    description: 'Auto-renewal enabled',
    example: true,
  })
  autoRenew: boolean;

  @ApiProperty({
    description: 'Max retry attempts',
    example: 3,
  })
  maxRetryAttempts: number;

  // Metadata
  @ApiPropertyOptional({
    description: 'Additional metadata',
    nullable: true,
  })
  metadata: Record<string, any> | null;

  @ApiPropertyOptional({
    description: 'Settings',
    nullable: true,
  })
  settings: Record<string, any> | null;

  @ApiPropertyOptional({
    description: 'Usage limits',
    nullable: true,
  })
  usageLimits: Record<string, any> | null;

  @ApiPropertyOptional({
    description: 'Current usage',
    nullable: true,
  })
  currentUsage: Record<string, any> | null;

  // Status flags
  @ApiProperty({
    description: 'Is currently active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Is in trial period',
    example: false,
  })
  isInTrial: boolean;

  @ApiProperty({
    description: 'Is paused',
    example: false,
  })
  isPaused: boolean;

  @ApiProperty({
    description: 'Is cancelled',
    example: false,
  })
  isCancelled: boolean;

  @ApiProperty({
    description: 'Has child subscriptions',
    example: false,
  })
  hasChildren: boolean;

  // Timestamps
  @ApiProperty({
    description: 'Created date',
    example: '2025-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated date',
    example: '2025-01-01T00:00:00Z',
  })
  updatedAt: Date;

  // Relations (optional, based on include parameter)
  @ApiPropertyOptional({
    description: 'Products in this subscription',
    type: [SubscriptionProductResponseDto],
  })
  products?: SubscriptionProductResponseDto[];

  @ApiPropertyOptional({
    description: 'Child subscriptions',
    type: [SubscriptionResponseDto],
  })
  children?: SubscriptionResponseDto[];

  @ApiPropertyOptional({
    description: 'Invoice count',
    example: 5,
  })
  invoiceCount?: number;

  @ApiPropertyOptional({
    description: 'Last invoice date',
    example: '2025-01-01T00:00:00Z',
  })
  lastInvoiceDate?: Date;

  @ApiPropertyOptional({
    description: 'Total revenue',
    example: 499.95,
  })
  totalRevenue?: number;
}

// List response with pagination
export class SubscriptionListResponseDto {
  @ApiProperty({
    description: 'List of subscriptions',
    type: [SubscriptionResponseDto],
  })
  items: SubscriptionResponseDto[];

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Has next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Has previous page',
    example: false,
  })
  hasPrevious: boolean;
}

// Standardized API response wrapper
export class StandardizedSubscriptionResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Subscription retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
    type: SubscriptionResponseDto,
  })
  data: SubscriptionResponseDto;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2025-01-01T00:00:00Z',
  })
  timestamp: string;
}

export class StandardizedSubscriptionListResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Subscriptions retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
    type: SubscriptionListResponseDto,
  })
  data: SubscriptionListResponseDto;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2025-01-01T00:00:00Z',
  })
  timestamp: string;
}
