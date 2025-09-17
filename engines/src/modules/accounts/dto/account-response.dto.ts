import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { 
  AccountType, 
  AccountStatus, 
  VerificationStatus, 
  BusinessSize, 
  OwnershipType 
} from '../entities/account.entity';
import { UserResponseDto } from '../../users/dto';
import { MediaResponseDto } from '../../media/dto';

/**
 * Address DTO used in Account responses
 */
export class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @Expose()
  street: string;

  @ApiProperty({ description: 'City' })
  @Expose()
  city: string;

  @ApiPropertyOptional({ description: 'State or province' })
  @Expose()
  state?: string;

  @ApiProperty({ description: 'Country' })
  @Expose()
  country: string;

  @ApiProperty({ description: 'Postal code' })
  @Expose()
  postalCode: string;
}

/**
 * Account response DTO following standardized patterns
 */
export class AccountResponseDto {
  @ApiProperty({ description: 'Account unique identifier' })
  @Expose()
  id: string;

  // Core Identification
  @ApiProperty({ description: 'Official registered business name' })
  @Expose()
  legalName: string;

  @ApiPropertyOptional({ description: 'Trading name / DBA (doing business as)' })
  @Expose()
  tradeName: string | null;

  @ApiProperty({ description: 'Business registration number' })
  @Expose()
  registrationNumber: string;

  @ApiProperty({ description: 'Tax/VAT identification number' })
  @Expose()
  taxId: string;

  @ApiPropertyOptional({ 
    description: 'Articles of incorporation and other documents',
    type: [MediaResponseDto]
  })
  @Expose()
  @Type(() => MediaResponseDto)
  documents?: MediaResponseDto[];

  // Business Classification
  @ApiProperty({ enum: AccountType, description: 'Type of business account' })
  @Expose()
  accountType: AccountType;

  @ApiPropertyOptional({ description: 'Industry or business sector' })
  @Expose()
  industry: string | null;

  @ApiPropertyOptional({ description: 'Sub-industry classification' })
  @Expose()
  subIndustry: string | null;

  @ApiPropertyOptional({ enum: BusinessSize, description: 'Business size classification' })
  @Expose()
  businessSize: BusinessSize | null;

  @ApiPropertyOptional({ enum: OwnershipType, description: 'Type of business ownership' })
  @Expose()
  ownershipType: OwnershipType | null;

  // Contact & Address Data
  @ApiProperty({ description: 'Headquarters address', type: AddressDto })
  @Expose()
  @Type(() => AddressDto)
  headquartersAddress: AddressDto;

  @ApiPropertyOptional({ description: 'Billing address', type: AddressDto })
  @Expose()
  @Type(() => AddressDto)
  billingAddress: AddressDto | null;

  @ApiPropertyOptional({ description: 'Shipping address', type: AddressDto })
  @Expose()
  @Type(() => AddressDto)
  shippingAddress: AddressDto | null;

  @ApiProperty({ description: 'Primary phone number' })
  @Expose()
  primaryPhone: string;

  @ApiProperty({ description: 'Primary email address' })
  @Expose()
  primaryEmail: string;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @Expose()
  websiteUrl: string | null;

  // Relationships
  @ApiPropertyOptional({ description: 'Parent account ID (if subsidiary)' })
  @Expose()
  parentAccountId: string | null;

  @ApiPropertyOptional({ description: 'Parent account details' })
  @Expose()
  @Type(() => AccountResponseDto)
  parentAccount?: AccountResponseDto | null;

  @ApiPropertyOptional({ 
    description: 'Child accounts (subsidiaries)',
    type: [AccountResponseDto]
  })
  @Expose()
  @Type(() => AccountResponseDto)
  childAccounts?: AccountResponseDto[];

  @ApiPropertyOptional({ 
    description: 'Linked CRM users',
    type: [UserResponseDto]
  })
  @Expose()
  @Type(() => UserResponseDto)
  linkedUsers?: UserResponseDto[];

  // Commercial Attributes
  @ApiProperty({ description: 'Preferred currency code', default: 'USD' })
  @Expose()
  preferredCurrency: string;

  @ApiPropertyOptional({ description: 'Payment terms (e.g., Net 30, Net 60)' })
  @Expose()
  paymentTerms: string | null;

  @ApiPropertyOptional({ description: 'Credit limit amount' })
  @Expose()
  creditLimit: number | null;

  @ApiPropertyOptional({ description: 'Credit status' })
  @Expose()
  creditStatus: string | null;

  @ApiPropertyOptional({ description: 'Discount level or price tier' })
  @Expose()
  discountLevel: string | null;

  @ApiPropertyOptional({ 
    description: 'Contract reference numbers',
    type: [String]
  })
  @Expose()
  contractReferences: string[] | null;

  // Operational Metadata
  @ApiProperty({ enum: AccountStatus, description: 'Account status' })
  @Expose()
  status: AccountStatus;

  @ApiProperty({ enum: VerificationStatus, description: 'Document verification status' })
  @Expose()
  verificationStatus: VerificationStatus;

  @ApiPropertyOptional({ description: 'Date when account was onboarded' })
  @Expose()
  onboardingDate: Date | null;

  @ApiPropertyOptional({ description: 'Last activity date' })
  @Expose()
  lastActivityDate: Date | null;

  @ApiPropertyOptional({ description: 'CRM User ID who owns this record' })
  @Expose()
  recordOwnerId: string | null;

  @ApiPropertyOptional({ description: 'Record owner details', type: UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  recordOwner?: UserResponseDto | null;

  @ApiProperty({ description: 'Display name (trade name or legal name)' })
  @Expose()
  get displayName(): string {
    return this.tradeName || this.legalName;
  }

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp' })
  @Expose()
  deletedAt?: Date | null;
}
