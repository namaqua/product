import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address, AddressType } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  /**
   * Create a new address for an account
   * Enforces business rules:
   * - Only ONE headquarters address
   * - Only ONE billing address  
   * - Multiple shipping addresses allowed
   */
  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    this.logger.log(`Creating address with data: ${JSON.stringify(createAddressDto)}`);
    
    // Validate required fields
    if (!createAddressDto.accountId) {
      throw new BadRequestException('Account ID is required');
    }
    if (!createAddressDto.street1) {
      throw new BadRequestException('Street address is required');
    }
    if (!createAddressDto.city) {
      throw new BadRequestException('City is required');
    }
    if (!createAddressDto.postalCode) {
      throw new BadRequestException('Postal code is required');
    }
    if (!createAddressDto.country) {
      throw new BadRequestException('Country is required');
    }

    // Check business rules based on address type
    if (createAddressDto.addressType === AddressType.HEADQUARTERS) {
      // Check if headquarters already exists
      const existingHQ = await this.addressRepository.findOne({
        where: { 
          accountId: createAddressDto.accountId,
          addressType: AddressType.HEADQUARTERS
        }
      });
      if (existingHQ) {
        throw new BadRequestException('Account already has a headquarters address. Only one headquarters address is allowed.');
      }
      // HQ is always marked as default
      createAddressDto.isDefault = true;
    }

    if (createAddressDto.addressType === AddressType.BILLING) {
      // Check if billing already exists
      const existingBilling = await this.addressRepository.findOne({
        where: { 
          accountId: createAddressDto.accountId,
          addressType: AddressType.BILLING
        }
      });
      if (existingBilling) {
        throw new BadRequestException('Account already has a billing address. Only one billing address is allowed.');
      }
      // Billing is always marked as default
      createAddressDto.isDefault = true;
    }

    // For shipping addresses, handle default flag
    if (createAddressDto.addressType === AddressType.SHIPPING && createAddressDto.isDefault) {
      // Clear other default shipping addresses
      await this.clearDefaultAddress(createAddressDto.accountId, AddressType.SHIPPING);
    }

    // Create the address entity with all provided data
    const address = this.addressRepository.create({
      accountId: createAddressDto.accountId,
      addressType: createAddressDto.addressType,
      isDefault: createAddressDto.isDefault || false,
      label: createAddressDto.label || null,
      contactName: createAddressDto.contactName || null,
      phone: createAddressDto.phone || null,
      email: createAddressDto.email || null,
      street1: createAddressDto.street1,
      street2: createAddressDto.street2 || null,
      city: createAddressDto.city,
      state: createAddressDto.state || null,
      postalCode: createAddressDto.postalCode,
      country: createAddressDto.country,
      county: createAddressDto.county || null,
      deliveryInstructions: createAddressDto.deliveryInstructions || null,
      businessHours: createAddressDto.businessHours || null,
      latitude: createAddressDto.latitude || null,
      longitude: createAddressDto.longitude || null,
    });
    
    this.logger.log(`Saving address entity: ${JSON.stringify(address)}`);
    
    const savedAddress = await this.addressRepository.save(address);
    
    this.logger.log(`Address saved with ID: ${savedAddress.id}`);
    
    return savedAddress;
  }

  /**
   * Clone headquarters address as billing address
   */
  async cloneHQAsBilling(accountId: string): Promise<Address> {
    // Get headquarters address
    const hqAddress = await this.addressRepository.findOne({
      where: { 
        accountId,
        addressType: AddressType.HEADQUARTERS
      }
    });

    if (!hqAddress) {
      throw new NotFoundException('No headquarters address found to clone');
    }

    // Check if billing already exists
    const existingBilling = await this.addressRepository.findOne({
      where: { 
        accountId,
        addressType: AddressType.BILLING
      }
    });

    if (existingBilling) {
      throw new BadRequestException('Account already has a billing address');
    }

    // Create billing address from HQ
    const billingAddress = this.addressRepository.create({
      accountId: hqAddress.accountId,
      addressType: AddressType.BILLING,
      label: 'Same as Headquarters',
      isDefault: true,
      contactName: hqAddress.contactName,
      phone: hqAddress.phone,
      email: hqAddress.email,
      street1: hqAddress.street1,
      street2: hqAddress.street2,
      city: hqAddress.city,
      state: hqAddress.state,
      postalCode: hqAddress.postalCode,
      country: hqAddress.country,
      county: hqAddress.county,
      latitude: hqAddress.latitude,
      longitude: hqAddress.longitude,
      deliveryInstructions: hqAddress.deliveryInstructions,
      businessHours: hqAddress.businessHours,
    });

    return this.addressRepository.save(billingAddress);
  }

  /**
   * Get all addresses for an account
   */
  async findAllByAccount(accountId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { accountId },
      order: { 
        addressType: 'ASC', // HQ first, then Billing, then Shipping
        isDefault: 'DESC',
        createdAt: 'DESC' 
      },
    });
  }

  /**
   * Get a specific address by ID
   */
  async findOne(id: string): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  /**
   * Update an address
   * Cannot change address type to avoid breaking business rules
   */
  async update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    this.logger.log(`Updating address ${id} with data: ${JSON.stringify(updateAddressDto)}`);
    
    const address = await this.findOne(id);

    // Don't allow changing address type
    if (updateAddressDto.addressType && updateAddressDto.addressType !== address.addressType) {
      throw new BadRequestException('Cannot change address type. Delete and create a new address instead.');
    }

    // For shipping addresses, handle default flag
    if (address.addressType === AddressType.SHIPPING && 
        updateAddressDto.isDefault && 
        !address.isDefault) {
      await this.clearDefaultAddress(address.accountId, AddressType.SHIPPING);
    }

    // Don't allow removing default from HQ or Billing
    if ((address.addressType === AddressType.HEADQUARTERS || 
         address.addressType === AddressType.BILLING) && 
        updateAddressDto.isDefault === false) {
      updateAddressDto.isDefault = true; // Force it to remain default
    }

    // Update the address with provided data
    Object.assign(address, updateAddressDto);
    
    const updatedAddress = await this.addressRepository.save(address);
    
    this.logger.log(`Address updated: ${JSON.stringify(updatedAddress)}`);
    
    return updatedAddress;
  }

  /**
   * Delete an address
   * Cannot delete headquarters if it's the only address
   */
  async remove(id: string): Promise<void> {
    const address = await this.findOne(id);
    
    // Don't allow deleting headquarters if other addresses depend on it
    if (address.addressType === AddressType.HEADQUARTERS) {
      const otherAddresses = await this.addressRepository.count({
        where: { 
          accountId: address.accountId,
        }
      });

      if (otherAddresses > 1) {
        throw new BadRequestException('Cannot delete headquarters address while other addresses exist');
      }
    }

    // If deleting default shipping address, set another as default
    if (address.addressType === AddressType.SHIPPING && address.isDefault) {
      const otherShipping = await this.addressRepository.find({
        where: { 
          accountId: address.accountId,
          addressType: AddressType.SHIPPING,
        },
        order: { createdAt: 'ASC' },
      });

      const nextDefault = otherShipping.find(a => a.id !== id);
      if (nextDefault) {
        nextDefault.isDefault = true;
        await this.addressRepository.save(nextDefault);
      }
    }

    await this.addressRepository.remove(address);
  }

  /**
   * Set a shipping address as default
   * Only applies to shipping addresses
   */
  async setAsDefault(addressId: string): Promise<Address> {
    const address = await this.findOne(addressId);
    
    // Only shipping addresses can have their default status changed
    if (address.addressType !== AddressType.SHIPPING) {
      throw new BadRequestException('Only shipping addresses can have their default status changed');
    }

    if (address.isDefault) {
      return address; // Already default
    }

    // Clear other default shipping addresses
    await this.clearDefaultAddress(address.accountId, AddressType.SHIPPING);

    address.isDefault = true;
    return this.addressRepository.save(address);
  }

  /**
   * Get the headquarters address for an account
   */
  async getHeadquartersAddress(accountId: string): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { 
        accountId,
        addressType: AddressType.HEADQUARTERS,
      },
    });
  }

  /**
   * Get the billing address for an account
   */
  async getBillingAddress(accountId: string): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { 
        accountId,
        addressType: AddressType.BILLING,
      },
    });
  }

  /**
   * Get all shipping addresses for an account
   */
  async getShippingAddresses(accountId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { 
        accountId,
        addressType: AddressType.SHIPPING,
      },
      order: { 
        isDefault: 'DESC',
        createdAt: 'DESC' 
      },
    });
  }

  /**
   * Get the default shipping address for an account
   */
  async getDefaultShippingAddress(accountId: string): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { 
        accountId,
        addressType: AddressType.SHIPPING,
        isDefault: true,
      },
    });
  }

  /**
   * Get addresses by type for an account
   */
  async getAddressesByType(accountId: string, addressType: AddressType): Promise<Address[]> {
    return this.addressRepository.find({
      where: { 
        accountId,
        addressType,
      },
      order: { 
        isDefault: 'DESC',
        createdAt: 'DESC' 
      },
    });
  }

  /**
   * Clear the default flag for all shipping addresses
   * Only applies to shipping addresses
   */
  private async clearDefaultAddress(accountId: string, addressType: AddressType): Promise<void> {
    if (addressType !== AddressType.SHIPPING) {
      return; // Only shipping addresses can have multiple entries
    }

    await this.addressRepository.update(
      { 
        accountId,
        addressType: AddressType.SHIPPING,
        isDefault: true,
      },
      { isDefault: false }
    );
  }

  /**
   * Validate an address (stub for future address validation service)
   */
  async validateAddress(address: Address): Promise<{ valid: boolean; details?: any }> {
    // TODO: Integrate with address validation service
    // For now, just do basic validation
    const isValid = !!(
      address.street1 &&
      address.city &&
      address.postalCode &&
      address.country
    );

    address.isValidated = isValid;
    address.validatedAt = isValid ? new Date() : null;
    await this.addressRepository.save(address);

    return {
      valid: isValid,
      details: {
        validated: isValid,
        validatedAt: new Date(),
      },
    };
  }

  /**
   * Track address usage
   */
  async trackUsage(addressId: string): Promise<void> {
    await this.addressRepository.update(addressId, {
      lastUsedAt: new Date(),
      usageCount: () => 'usage_count + 1',
    });
  }

  /**
   * Migrate legacy address data from account to addresses table
   */
  async migrateLegacyAddresses(accountId: string, account: any): Promise<void> {
    const addressesToCreate: Partial<Address>[] = [];

    // Migrate headquarters address if exists
    if (account.headquartersAddress) {
      const existingHQ = await this.getHeadquartersAddress(accountId);
      if (!existingHQ) {
        addressesToCreate.push({
          accountId,
          addressType: AddressType.HEADQUARTERS,
          isDefault: true,
          label: 'Headquarters',
          street1: account.headquartersAddress.street || '',
          city: account.headquartersAddress.city || '',
          state: account.headquartersAddress.state,
          postalCode: account.headquartersAddress.postalCode || '',
          country: account.headquartersAddress.country || 'US',
          phone: account.phoneNumber,
          email: account.email,
        });
      }
    }

    // Migrate billing address if exists and different from HQ
    if (account.billingAddress) {
      const existingBilling = await this.getBillingAddress(accountId);
      if (!existingBilling) {
        addressesToCreate.push({
          accountId,
          addressType: AddressType.BILLING,
          isDefault: true,
          label: 'Billing',
          street1: account.billingAddress.street || '',
          city: account.billingAddress.city || '',
          state: account.billingAddress.state,
          postalCode: account.billingAddress.postalCode || '',
          country: account.billingAddress.country || 'US',
        });
      }
    }

    // Migrate shipping address if exists
    if (account.shippingAddress) {
      addressesToCreate.push({
        accountId,
        addressType: AddressType.SHIPPING,
        isDefault: true,
        label: 'Primary Shipping',
        street1: account.shippingAddress.street || '',
        city: account.shippingAddress.city || '',
        state: account.shippingAddress.state,
        postalCode: account.shippingAddress.postalCode || '',
        country: account.shippingAddress.country || 'US',
      });
    }

    // Create all addresses
    for (const addressData of addressesToCreate) {
      const address = this.addressRepository.create(addressData);
      await this.addressRepository.save(address);
    }
  }
}
