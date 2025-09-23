import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsDateString,
  MaxLength,
  MinLength,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubscriptionStatus, BillingCycle } from '../enums';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Subscription name/description',
    example: 'Updated Premium Plan',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Detailed subscription description',
    example: 'Updated description with new features',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: SubscriptionStatus,
    description: 'Updated subscription status',
  })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  // Billing configuration updates
  @ApiPropertyOptional({
    enum: BillingCycle,
    description: 'Updated billing frequency',
  })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

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
    example: 15,
    minimum: 1,
    maximum: 28,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(28)
  @Type(() => Number)
  billingDayOfMonth?: number;

  // Pricing updates
  @ApiPropertyOptional({
    description: 'Updated base subscription amount',
    example: 129.99,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  baseAmount?: number;

  @ApiPropertyOptional({
    description: 'Updated discount amount',
    example: 20.00,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Updated discount percentage',
    example: 15,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Updated tax percentage',
    example: 9.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  taxPercentage?: number;

  // Date updates
  @ApiPropertyOptional({
    description: 'Updated subscription end date',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Updated next billing date',
    example: '2025-02-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  nextBillingDate?: string;

  // Payment information updates
  @ApiPropertyOptional({
    description: 'Updated payment service provider token',
    example: 'tok_new_1234567890',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  payerToken?: string;

  @ApiPropertyOptional({
    description: 'Updated payment method identifier',
    example: 'pm_new_1234567890',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentMethodId?: string;

  @ApiPropertyOptional({
    description: 'Updated payment provider',
    example: 'paypal',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  paymentProvider?: string;

  @ApiPropertyOptional({
    description: 'Updated last 4 digits of payment method',
    example: '1234',
    minLength: 4,
    maxLength: 4,
  })
  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(4)
  paymentMethodLast4?: string;

  @ApiPropertyOptional({
    description: 'Updated payment method type',
    example: 'bank',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  paymentMethodType?: string;

  // Auto-renewal settings
  @ApiPropertyOptional({
    description: 'Whether subscription should auto-renew',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @ApiPropertyOptional({
    description: 'Updated maximum payment retry attempts',
    example: 5,
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  maxRetryAttempts?: number;

  @ApiPropertyOptional({
    description: 'Updated notice period in days',
    example: 60,
    minimum: 0,
    maximum: 365,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(365)
  @Type(() => Number)
  noticePeriodDays?: number;

  // Metadata updates
  @ApiPropertyOptional({
    description: 'Updated subscription metadata',
    example: { updatedBy: 'admin', reason: 'customer-request' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Updated subscription settings',
    example: { emailNotifications: false },
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Updated usage limits and quotas',
    example: { apiCalls: 20000, storage: '200GB' },
  })
  @IsObject()
  @IsOptional()
  usageLimits?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Updated current usage statistics',
    example: { apiCalls: 5000, storage: '50GB' },
  })
  @IsObject()
  @IsOptional()
  currentUsage?: Record<string, any>;
}
