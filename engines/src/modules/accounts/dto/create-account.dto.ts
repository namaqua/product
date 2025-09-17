import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  IsUUID,
  ValidateNested,
  IsUrl,
  IsPhoneNumber,
  MaxLength,
  MinLength,
  IsNumber,
  Min,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  AccountType, 
  AccountStatus, 
  BusinessSize, 
  OwnershipType 
} from '../entities/account.entity';

/**
 * Address DTO for creating/updating addresses
 */
export class CreateAddressDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ description: 'State or province', example: 'NY' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ description: 'Country', example: 'USA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiProperty({ description: 'Postal code', example: '10001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode: string;
}

/**
 * DTO for creating a new account
 */
export class CreateAccountDto {
  // Core Identification
  @ApiProperty({ 
    description: 'Official registered business name',
    example: 'Acme Corporation Ltd.'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  legalName: string;

  @ApiPropertyOptional({ 
    description: 'Trading name / DBA (doing business as)',
    example: 'Acme Corp'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tradeName?: string;

  @ApiProperty({ 
    description: 'Business registration number',
    example: 'HRB123456'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[A-Z0-9\-\/]+$/i, {
    message: 'Registration number must contain only alphanumeric characters, hyphens, and slashes'
  })
  registrationNumber: string;

  @ApiProperty({ 
    description: 'Tax/VAT identification number',
    example: 'DE123456789'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Z0-9\-]+$/i, {
    message: 'Tax ID must contain only alphanumeric characters and hyphens'
  })
  taxId: string;

  @ApiPropertyOptional({ 
    description: 'Document IDs (Media) for articles of incorporation',
    type: [String],
    example: ['media-id-1', 'media-id-2']
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  documentIds?: string[];

  // Business Classification
  @ApiProperty({ 
    enum: AccountType,
    description: 'Type of business account',
    example: AccountType.CUSTOMER
  })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiPropertyOptional({ 
    description: 'Industry or business sector',
    example: 'Technology'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ 
    description: 'Sub-industry classification',
    example: 'Software Development'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subIndustry?: string;

  @ApiPropertyOptional({ 
    enum: BusinessSize,
    description: 'Business size classification'
  })
  @IsOptional()
  @IsEnum(BusinessSize)
  businessSize?: BusinessSize;

  @ApiPropertyOptional({ 
    enum: OwnershipType,
    description: 'Type of business ownership'
  })
  @IsOptional()
  @IsEnum(OwnershipType)
  ownershipType?: OwnershipType;

  // Contact & Address Data
  @ApiProperty({ 
    description: 'Headquarters address',
    type: CreateAddressDto
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  headquartersAddress: CreateAddressDto;

  @ApiPropertyOptional({ 
    description: 'Billing address (if different from headquarters)',
    type: CreateAddressDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  billingAddress?: CreateAddressDto;

  @ApiPropertyOptional({ 
    description: 'Shipping address (if different from headquarters)',
    type: CreateAddressDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  shippingAddress?: CreateAddressDto;

  @ApiProperty({ 
    description: 'Primary phone number',
    example: '+1-555-123-4567'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  primaryPhone: string;

  @ApiProperty({ 
    description: 'Primary email address',
    example: 'contact@acme.com'
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  primaryEmail: string;

  @ApiPropertyOptional({ 
    description: 'Company website URL',
    example: 'https://www.acme.com'
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  websiteUrl?: string;

  // Relationships
  @ApiPropertyOptional({ 
    description: 'Parent account ID (if subsidiary)',
    example: 'parent-account-uuid'
  })
  @IsOptional()
  @IsUUID()
  parentAccountId?: string;

  @ApiPropertyOptional({ 
    description: 'Linked user IDs',
    type: [String],
    example: ['user-id-1', 'user-id-2']
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  linkedUserIds?: string[];

  // Commercial Attributes
  @ApiPropertyOptional({ 
    description: 'Preferred currency code',
    example: 'USD',
    default: 'USD'
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  @MinLength(3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'Currency must be a 3-letter code'
  })
  preferredCurrency?: string;

  @ApiPropertyOptional({ 
    description: 'Payment terms',
    example: 'Net 30'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentTerms?: string;

  @ApiPropertyOptional({ 
    description: 'Credit limit amount',
    example: 50000.00
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ 
    description: 'Credit status',
    example: 'Approved'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  creditStatus?: string;

  @ApiPropertyOptional({ 
    description: 'Discount level or price tier',
    example: 'Gold'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  discountLevel?: string;

  @ApiPropertyOptional({ 
    description: 'Contract reference numbers',
    type: [String],
    example: ['CONTRACT-001', 'CONTRACT-002']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contractReferences?: string[];

  // Operational Metadata
  @ApiPropertyOptional({ 
    enum: AccountStatus,
    description: 'Account status',
    default: AccountStatus.PENDING_VERIFICATION
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiPropertyOptional({ 
    description: 'CRM User ID who owns this record',
    example: 'user-uuid'
  })
  @IsOptional()
  @IsUUID()
  recordOwnerId?: string;
}
