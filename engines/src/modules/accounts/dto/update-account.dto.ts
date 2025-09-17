import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatus } from '../entities/account.entity';

/**
 * DTO for updating an existing account
 * All fields are optional
 */
export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiPropertyOptional({ 
    enum: VerificationStatus,
    description: 'Document verification status (admin only)'
  })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;
}
