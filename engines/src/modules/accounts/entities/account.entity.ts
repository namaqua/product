import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { Media } from '../../media/entities/media.entity';
import { Address } from '../../addresses/entities/address.entity';

export enum AccountType {
  CUSTOMER = 'customer',
  PARTNER = 'partner',
  SUPPLIER = 'supplier',
  PROSPECT = 'prospect',
  VENDOR = 'vendor',
  DISTRIBUTOR = 'distributor',
  MANUFACTURER = 'manufacturer',
  OTHER = 'other',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_VERIFICATION = 'pending_verification',
  BLACKLISTED = 'blacklisted',
  SUSPENDED = 'suspended',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  DOCUMENTS_REQUIRED = 'documents_required',
}

export enum BusinessSize {
  STARTUP = 'startup',
  SMB = 'smb',
  MID_MARKET = 'mid_market',
  ENTERPRISE = 'enterprise',
}

export enum OwnershipType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  GOVERNMENT = 'government',
  NONPROFIT = 'nonprofit',
  PARTNERSHIP = 'partnership',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
}

/**
 * Account entity represents a registered business entity
 */
@Entity('accounts')
@Index(['legalName'])
@Index(['tradeName'])
@Index(['registrationNumber'], { unique: true })
@Index(['taxId'], { unique: true })
@Index(['status'])
@Index(['accountType'])
@Index(['verificationStatus'])
export class Account extends BaseEntity {
  // Core Identification
  @Column({ 
    type: 'varchar', 
    length: 255,
    comment: 'Official registered business name' 
  })
  legalName: string;

  @Column({ 
    type: 'varchar', 
    length: 255,
    nullable: true,
    comment: 'Trading name / DBA (doing business as)' 
  })
  tradeName: string | null;

  @Column({ 
    type: 'varchar', 
    length: 100,
    unique: true,
    comment: 'Business registration number (e.g. Handelsregister, Company Number)' 
  })
  registrationNumber: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    unique: true,
    comment: 'Tax/VAT identification number' 
  })
  taxId: string;

  // Articles of Incorporation - linked to Media
  @ManyToMany(() => Media, { nullable: true })
  @JoinTable({
    name: 'account_documents',
    joinColumn: { name: 'account_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'media_id', referencedColumnName: 'id' }
  })
  documents: Media[];

  // Business Classification
  @Column({ 
    type: 'enum',
    enum: AccountType,
    default: AccountType.CUSTOMER,
    comment: 'Type of business account' 
  })
  accountType: AccountType;

  @Column({ 
    type: 'varchar', 
    length: 100,
    nullable: true,
    comment: 'Industry or business sector' 
  })
  industry: string | null;

  @Column({ 
    type: 'varchar', 
    length: 100,
    nullable: true,
    comment: 'Sub-industry classification' 
  })
  subIndustry: string | null;

  @Column({ 
    type: 'enum',
    enum: BusinessSize,
    nullable: true,
    comment: 'Business size classification' 
  })
  businessSize: BusinessSize | null;

  @Column({ 
    type: 'enum',
    enum: OwnershipType,
    nullable: true,
    comment: 'Type of business ownership' 
  })
  ownershipType: OwnershipType | null;

  // Contact & Address Data
  // DEPRECATED: Use addresses relationship instead
  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'DEPRECATED - Headquarters address - Use addresses relation instead' 
  })
  headquartersAddress: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  } | null;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'DEPRECATED - Billing address - Use addresses relation instead' 
  })
  billingAddress: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  } | null;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'DEPRECATED - Shipping address - Use addresses relation instead' 
  })
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  } | null;

  // New Address Relationship - Multiple addresses per account
  @OneToMany(() => Address, address => address.account, {
    cascade: true,
    eager: false
  })
  addresses: Address[];

  @Column({ 
    type: 'varchar', 
    length: 20,
    nullable: true,
    comment: 'Primary phone number' 
  })
  primaryPhone: string | null;

  @Column({ 
    type: 'varchar', 
    length: 255,
    nullable: true,
    comment: 'Primary email address' 
  })
  primaryEmail: string | null;

  @Column({ 
    type: 'varchar', 
    length: 255,
    nullable: true,
    comment: 'Company website URL' 
  })
  websiteUrl: string | null;

  // Relationships
  @Column({ 
    type: 'uuid',
    nullable: true,
    comment: 'Parent account ID (if subsidiary)' 
  })
  parentAccountId: string | null;

  @ManyToOne(() => Account, account => account.childAccounts, { nullable: true })
  @JoinColumn({ name: 'parentAccountId' })
  parentAccount: Account | null;

  @OneToMany(() => Account, account => account.parentAccount)
  childAccounts: Account[];

  // Linked Users - many-to-many relationship
  @ManyToMany(() => User)
  @JoinTable({
    name: 'account_users',
    joinColumn: { name: 'account_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  linkedUsers: User[];

  // Commercial Attributes
  @Column({ 
    type: 'varchar', 
    length: 3,
    default: 'USD',
    comment: 'Preferred currency code' 
  })
  preferredCurrency: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    nullable: true,
    comment: 'Payment terms (e.g., Net 30, Net 60)' 
  })
  paymentTerms: string | null;

  @Column({ 
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    comment: 'Credit limit amount' 
  })
  creditLimit: number | null;

  @Column({ 
    type: 'varchar', 
    length: 50,
    nullable: true,
    comment: 'Credit status' 
  })
  creditStatus: string | null;

  @Column({ 
    type: 'varchar', 
    length: 50,
    nullable: true,
    comment: 'Discount level or price tier' 
  })
  discountLevel: string | null;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Contract reference numbers' 
  })
  contractReferences: string[] | null;

  // Operational Metadata
  @Column({ 
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.PENDING_VERIFICATION,
    comment: 'Account status' 
  })
  status: AccountStatus;

  @Column({ 
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
    comment: 'Document verification status' 
  })
  verificationStatus: VerificationStatus;

  @Column({ 
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Date when account was onboarded' 
  })
  onboardingDate: Date | null;

  @Column({ 
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Last activity date' 
  })
  lastActivityDate: Date | null;

  // Record Owner (CRM User)
  @Column({ 
    type: 'uuid',
    nullable: true,
    comment: 'CRM User ID who owns this record' 
  })
  recordOwnerId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recordOwnerId' })
  recordOwner: User | null;

  /**
   * Helper method to check if account is verified
   */
  isVerified(): boolean {
    return this.verificationStatus === VerificationStatus.VERIFIED;
  }

  /**
   * Helper method to check if account is active
   */
  isActiveAccount(): boolean {
    return this.status === AccountStatus.ACTIVE && this.isActive;
  }

  /**
   * Helper method to get display name (trade name or legal name)
   */
  get displayName(): string {
    return this.tradeName || this.legalName;
  }

  /**
   * Helper method to get the headquarters address
   */
  getHeadquartersAddress(): Address | undefined {
    if (!this.addresses) return undefined;
    return this.addresses.find(addr => addr.addressType === 'headquarters');
  }

  /**
   * Helper method to get addresses by type
   */
  getAddressesByType(type: string): Address[] {
    if (!this.addresses) return [];
    return this.addresses.filter(addr => addr.addressType === type);
  }
}
