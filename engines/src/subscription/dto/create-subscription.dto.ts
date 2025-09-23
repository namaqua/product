import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsDateString,
  MaxLength,
  MinLength,
  Min,
  Max,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubscriptionStatus, BillingCycle } from '../enums';

export class CreateSubscriptionProductDto {
  @ApiProperty({
    description: 'Product ID to add to subscription',
    example: 'uuid-of-product',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Custom price override for this product',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Discount amount for this product',
    example: 10.00,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Whether this is a recurring charge',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Account ID that owns this subscription',
    example: 'uuid-of-account',
  })
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    description: 'Subscription name/description',
    example: 'Premium Monthly Plan',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed subscription description',
    example: 'Full access to all premium features with monthly billing',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent subscription ID for bundled subscriptions',
    example: 'uuid-of-parent-subscription',
  })
  @IsUUID()
  @IsOptional()
  parentSubscriptionId?: string;

  @ApiPropertyOptional({
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
    description: 'Initial subscription status',
  })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  // Billing configuration
  @ApiProperty({
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
    description: 'Billing frequency',
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiPropertyOptional({
    description: 'Custom billing cycle days (when billingCycle is CUSTOM)',
    example: 15,
    minimum: 1,
    maximum: 365,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  customBillingDays?: number;

  @ApiPropertyOptional({
    description: 'Day of month for billing (1-28)',
    example: 1,
    minimum: 1,
    maximum: 28,
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(28)
  @Type(() => Number)
  billingDayOfMonth?: number;

  @ApiPropertyOptional({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
    default: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  // Pricing
  @ApiProperty({
    description: 'Base subscription amount before discounts/taxes',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  baseAmount: number;

  @ApiPropertyOptional({
    description: 'Discount amount applied',
    example: 10.00,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Discount percentage',
    example: 10,
    minimum: 0,
    maximum: 100,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Tax percentage',
    example: 8.5,
    minimum: 0,
    maximum: 100,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  taxPercentage?: number;

  // Important dates
  @ApiProperty({
    description: 'Subscription start date',
    example: '2025-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({
    description: 'Subscription end date (null for ongoing)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  // Trial period
  @ApiPropertyOptional({
    description: 'Whether subscription has a trial period',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasTrial?: boolean;

  @ApiPropertyOptional({
    description: 'Trial period in days',
    example: 14,
    minimum: 1,
    maximum: 365,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  trialDays?: number;

  // Payment information
  @ApiPropertyOptional({
    description: 'Payment service provider token',
    example: 'tok_1234567890',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  payerToken?: string;

  @ApiPropertyOptional({
    description: 'Payment method identifier',
    example: 'pm_1234567890',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentMethodId?: string;

  @ApiPropertyOptional({
    description: 'Payment provider name (stripe, paypal, mock)',
    example: 'stripe',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  paymentProvider?: string;

  @ApiPropertyOptional({
    description: 'Last 4 digits of payment method',
    example: '4242',
    minLength: 4,
    maxLength: 4,
  })
  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(4)
  paymentMethodLast4?: string;

  @ApiPropertyOptional({
    description: 'Payment method type (card, bank, etc)',
    example: 'card',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  paymentMethodType?: string;

  // Auto-renewal
  @ApiPropertyOptional({
    description: 'Whether subscription auto-renews',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum payment retry attempts',
    example: 3,
    minimum: 0,
    maximum: 10,
    default: 3,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  maxRetryAttempts?: number;

  @ApiPropertyOptional({
    description: 'Notice period in days for cancellation',
    example: 30,
    minimum: 0,
    maximum: 365,
    default: 30,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(365)
  @Type(() => Number)
  noticePeriodDays?: number;

  // Products
  @ApiPropertyOptional({
    description: 'Products to include in the subscription',
    type: [CreateSubscriptionProductDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSubscriptionProductDto)
  products?: CreateSubscriptionProductDto[];

  // Metadata
  @ApiPropertyOptional({
    description: 'Additional subscription metadata',
    example: { source: 'website', campaign: 'new-year-promo' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Custom subscription settings',
    example: { emailNotifications: true, autoUpgrade: false },
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Usage limits and quotas',
    example: { apiCalls: 10000, storage: '100GB' },
  })
  @IsObject()
  @IsOptional()
  usageLimits?: Record<string, any>;
}
