import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CancellationReason } from '../enums';

export class CancelSubscriptionDto {
  @ApiProperty({
    enum: CancellationReason,
    description: 'Reason for cancellation',
    example: CancellationReason.CUSTOMER_REQUEST,
  })
  @IsEnum(CancellationReason)
  cancellationReason: CancellationReason;

  @ApiPropertyOptional({
    description: 'Additional cancellation notes',
    example: 'Customer found a better alternative',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  cancellationNotes?: string;

  @ApiPropertyOptional({
    description: 'Override the effective cancellation date (must be future date)',
    example: '2025-02-28T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  cancellationEffectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Whether to cancel immediately (ignoring notice period)',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  immediateCancel?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to refund remaining balance (for immediate cancellations)',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  refundRemaining?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to also cancel all child subscriptions',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  cancelChildren?: boolean;
}
