import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PauseSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Date when the pause should take effect',
    example: '2025-01-15T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  pauseEffectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Planned resume date (optional)',
    example: '2025-02-15T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  plannedResumeDate?: string;

  @ApiPropertyOptional({
    description: 'Reason for pausing the subscription',
    example: 'Customer traveling for extended period',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  pauseReason?: string;

  @ApiPropertyOptional({
    description: 'Whether to pause billing immediately',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  pauseBillingImmediately?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to extend subscription end date by paused duration',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  extendEndDate?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to also pause all child subscriptions',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  pauseChildren?: boolean;
}
