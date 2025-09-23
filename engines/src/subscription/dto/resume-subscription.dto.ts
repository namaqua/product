import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ResumeSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Date when the resume should take effect',
    example: '2025-02-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  resumeEffectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Override the next billing date',
    example: '2025-02-15T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  nextBillingDate?: string;

  @ApiPropertyOptional({
    description: 'Reason for resuming the subscription',
    example: 'Customer returned from travel',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  resumeReason?: string;

  @ApiPropertyOptional({
    description: 'Whether to charge immediately upon resume',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  chargeImmediately?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to prorate the first charge after resume',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  prorateFirstCharge?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to also resume all paused child subscriptions',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  resumeChildren?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to recalculate end date based on paused duration',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  recalculateEndDate?: boolean;
}
