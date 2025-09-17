import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Account } from '../../accounts/entities/account.entity';

export enum AddressType {
  HEADQUARTERS = 'headquarters',  // Primary business location (only one allowed)
  BILLING = 'billing',            // Billing address (only one allowed)
  SHIPPING = 'shipping',           // Shipping addresses (multiple allowed)
}

/**
 * Address entity represents postal addresses for accounts
 * Business Rules:
 * - Each account MUST have ONE headquarters address
 * - Each account can have ONE billing address (can be same as HQ)
 * - Each account can have MULTIPLE shipping addresses
 */
@Entity('addresses')
@Index(['accountId', 'addressType'])
@Index(['accountId', 'isDefault'])
@Index(['postalCode'])
@Index(['city', 'country'])
export class Address extends BaseEntity {
  // Relationship to Account
  @Column({ 
    type: 'uuid',
    comment: 'Account this address belongs to' 
  })
  accountId: string;

  @ManyToOne(() => Account, account => account.addresses, { 
    onDelete: 'CASCADE',
    nullable: false 
  })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  // Address Type
  @Column({ 
    type: 'enum',
    enum: AddressType,
    comment: 'Type of address (headquarters, billing, or shipping)' 
  })
  addressType: AddressType;

  // Default Flag (only applicable for shipping addresses)
  @Column({ 
    type: 'boolean',
    default: false,
    comment: 'Is this the default address for its type (only relevant for shipping)' 
  })
  isDefault: boolean;

  // Address Label
  @Column({ 
    type: 'varchar', 
    length: 100,
    nullable: true,
    comment: 'Custom label for this address (e.g., "Warehouse 1", "East Coast")' 
  })
  label: string | null;

  // Contact Information
  @Column({ 
    type: 'varchar', 
    length: 255,
    nullable: true,
    comment: 'Name of contact person at this address' 
  })
  contactName: string | null;

  @Column({ 
    type: 'varchar', 
    length: 20,
    nullable: true,
    comment: 'Phone number for this address' 
  })
  phone: string | null;

  @Column({ 
    type: 'varchar', 
    length: 255,
    nullable: true,
    comment: 'Email for this address' 
  })
  email: string | null;

  // Address Lines
  @Column({ 
    type: 'varchar', 
    length: 255,
    comment: 'Street address line 1' 
  })
  street1: string;

  @Column({ 
    type: 'varchar', 
    length: 255,
    nullable: true,
    comment: 'Street address line 2 (apartment, suite, unit, etc.)' 
  })
  street2: string | null;

  @Column({ 
    type: 'varchar', 
    length: 100,
    comment: 'City' 
  })
  city: string;

  @Column({ 
    type: 'varchar', 
    length: 100,
    nullable: true,
    comment: 'State, Province, or Region' 
  })
  state: string | null;

  @Column({ 
    type: 'varchar', 
    length: 20,
    comment: 'Postal or ZIP code' 
  })
  postalCode: string;

  @Column({ 
    type: 'varchar', 
    length: 2,
    comment: 'ISO 3166-1 alpha-2 country code' 
  })
  country: string;

  @Column({ 
    type: 'varchar', 
    length: 100,
    nullable: true,
    comment: 'County or district' 
  })
  county: string | null;

  // Geolocation (optional)
  @Column({ 
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    comment: 'Latitude coordinate' 
  })
  latitude: number | null;

  @Column({ 
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    comment: 'Longitude coordinate' 
  })
  longitude: number | null;

  // Delivery Instructions (mainly for shipping addresses)
  @Column({ 
    type: 'text',
    nullable: true,
    comment: 'Special delivery or access instructions' 
  })
  deliveryInstructions: string | null;

  // Business Hours (optional)
  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Business hours for this location' 
  })
  businessHours: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  } | null;

  // Validation
  @Column({ 
    type: 'boolean',
    default: false,
    comment: 'Has this address been validated' 
  })
  isValidated: boolean;

  @Column({ 
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'When the address was last validated' 
  })
  validatedAt: Date | null;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Validation details from address validation service' 
  })
  validationDetails: any | null;

  // Usage tracking
  @Column({ 
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Last time this address was used' 
  })
  lastUsedAt: Date | null;

  @Column({ 
    type: 'integer',
    default: 0,
    comment: 'Number of times this address has been used' 
  })
  usageCount: number;

  /**
   * Helper method to get full address as a string
   */
  get fullAddress(): string {
    const parts = [
      this.street1,
      this.street2,
      this.city,
      this.state,
      this.postalCode,
      this.country,
    ].filter(Boolean);
    return parts.join(', ');
  }

  /**
   * Helper method to get a formatted address
   */
  getFormattedAddress(): string {
    let address = this.street1;
    if (this.street2) {
      address += `\n${this.street2}`;
    }
    address += `\n${this.city}`;
    if (this.state) {
      address += `, ${this.state}`;
    }
    address += ` ${this.postalCode}`;
    address += `\n${this.country}`;
    return address;
  }

  /**
   * Helper method to check if this is the headquarters address
   */
  isHeadquartersAddress(): boolean {
    return this.addressType === AddressType.HEADQUARTERS;
  }

  /**
   * Helper method to check if this is the billing address
   */
  isBillingAddress(): boolean {
    return this.addressType === AddressType.BILLING;
  }

  /**
   * Helper method to check if this is a shipping address
   */
  isShippingAddress(): boolean {
    return this.addressType === AddressType.SHIPPING;
  }
}
