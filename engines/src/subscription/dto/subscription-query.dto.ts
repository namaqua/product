import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUUID,
  Min,
  Max,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubscriptionStatus, BillingCycle } from '../enums';

export class SubscriptionQueryDto {
  // Pagination
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  // Sorting
  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: [
      'createdAt',
      'updatedAt',
      'name',
      'status',
      'startDate',
      'endDate',
      'nextBillingDate',
      'totalAmount',
      'billingCycle',
    ],
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  // Filters
  @ApiPropertyOptional({
    description: 'Filter by account ID',
    example: 'uuid-of-account',
  })
  @IsUUID()
  @IsOptional()
  accountId?: string;

  @ApiPropertyOptional({
    description: 'Filter by parent subscription ID',
    example: 'uuid-of-parent',
  })
  @IsUUID()
  @IsOptional()
  parentSubscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by subscription status',
    enum: SubscriptionStatus,
    isArray: true,
  })
  @IsArray()
  @IsEnum(SubscriptionStatus, { each: true })
  @IsOptional()
  status?: SubscriptionStatus[];

  @ApiPropertyOptional({
    description: 'Filter by billing cycle',
    enum: BillingCycle,
    isArray: true,
  })
  @IsArray()
  @IsEnum(BillingCycle, { each: true })
  @IsOptional()
  billingCycle?: BillingCycle[];

  @ApiPropertyOptional({
    description: 'Search by subscription name',
    example: 'premium',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by currency',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Filter by auto-renewal status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by trial status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  hasTrial?: boolean;

  @ApiPropertyOptional({
    description: 'Filter to only show parent subscriptions',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isParent?: boolean;

  @ApiPropertyOptional({
    description: 'Filter to only show child subscriptions',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isChild?: boolean;

  // Date filters
  @ApiPropertyOptional({
    description: 'Filter by start date from',
    example: '2025-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date to',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date from',
    example: '2025-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  endDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date to',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by next billing date from',
    example: '2025-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  nextBillingDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by next billing date to',
    example: '2025-01-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  nextBillingDateTo?: string;

  // Amount filters
  @ApiPropertyOptional({
    description: 'Filter by minimum total amount',
    example: 10.00,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum total amount',
    example: 1000.00,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxAmount?: number;

  // Special filters
  @ApiPropertyOptional({
    description: 'Filter subscriptions expiring in N days',
    example: 30,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  expiringInDays?: number;

  @ApiPropertyOptional({
    description: 'Filter subscriptions with upcoming billing in N days',
    example: 7,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  billingInDays?: number;

  @ApiPropertyOptional({
    description: 'Filter subscriptions with payment failures',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  hasPaymentFailures?: boolean;

  @ApiPropertyOptional({
    description: 'Include soft-deleted subscriptions',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Include related entities (products, invoices, events)',
    example: ['products', 'invoices'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  include?: string[];
}
