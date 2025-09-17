import { IsOptional, IsEnum, IsString, IsUUID, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  AccountType, 
  AccountStatus, 
  VerificationStatus, 
  BusinessSize, 
  OwnershipType 
} from '../entities/account.entity';

/**
 * Query DTO for filtering and pagination of accounts
 */
export class AccountQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term (searches legal name, trade name, registration number, tax ID)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({ description: 'Sort field', example: 'legalName' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    enum: ['ASC', 'DESC'], 
    description: 'Sort direction',
    default: 'DESC'
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  // Specific filters
  @ApiPropertyOptional({ 
    enum: AccountType, 
    description: 'Filter by account type' 
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @ApiPropertyOptional({ 
    enum: AccountStatus, 
    description: 'Filter by account status' 
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiPropertyOptional({ 
    enum: VerificationStatus, 
    description: 'Filter by verification status' 
  })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({ 
    enum: BusinessSize, 
    description: 'Filter by business size' 
  })
  @IsOptional()
  @IsEnum(BusinessSize)
  businessSize?: BusinessSize;

  @ApiPropertyOptional({ 
    enum: OwnershipType, 
    description: 'Filter by ownership type' 
  })
  @IsOptional()
  @IsEnum(OwnershipType)
  ownershipType?: OwnershipType;

  @ApiPropertyOptional({ description: 'Filter by industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Filter by parent account ID' })
  @IsOptional()
  @IsUUID()
  parentAccountId?: string;

  @ApiPropertyOptional({ description: 'Filter by record owner ID' })
  @IsOptional()
  @IsUUID()
  recordOwnerId?: string;

  @ApiPropertyOptional({ description: 'Filter by linked user ID' })
  @IsOptional()
  @IsUUID()
  linkedUserId?: string;

  @ApiPropertyOptional({ description: 'Filter by active status', default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Include child accounts in response' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeChildren?: boolean = false;

  @ApiPropertyOptional({ description: 'Include parent account in response' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeParent?: boolean = false;

  @ApiPropertyOptional({ description: 'Include linked users in response' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeUsers?: boolean = false;

  @ApiPropertyOptional({ description: 'Include documents in response' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDocuments?: boolean = false;

  // Helper getters for type safety
  get pageNum(): number {
    return Number(this.page) || 1;
  }

  get limitNum(): number {
    return Number(this.limit) || 10;
  }

  get skip(): number {
    return (this.pageNum - 1) * this.limitNum;
  }

  get take(): number {
    return this.limitNum;
  }

  // Compatibility with legacy code
  get order(): 'ASC' | 'DESC' {
    return this.sortOrder;
  }
}
