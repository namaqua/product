/**
 * Address DTOs and Types - Updated for business rules:
 * - ONE Headquarters Address (required)
 * - ONE Billing Address (can be cloned from HQ)
 * - MULTIPLE Shipping Addresses allowed
 */

// Base Address interface
export interface Address {
  id: string;
  accountId: string;
  addressType: AddressType;
  isDefault: boolean;
  label?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  deliveryInstructions?: string;
  businessHours?: BusinessHours;
  isValidated: boolean;
  validatedAt?: string;
  validationDetails?: any;
  lastUsedAt?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  metadata?: any;
}

// Address type enum - simplified for business rules
export enum AddressType {
  HEADQUARTERS = 'headquarters',
  BILLING = 'billing',
  SHIPPING = 'shipping',
}

// Business hours interface
export interface BusinessHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

// Create Address DTO
export interface CreateAddressDto {
  accountId: string;
  addressType: AddressType;
  isDefault?: boolean;
  label?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  deliveryInstructions?: string;
  businessHours?: BusinessHours;
}

// Update Address DTO
export interface UpdateAddressDto extends Partial<CreateAddressDto> {}

// Query parameters for address listing
export interface AddressesQueryDto {
  accountId?: string;
  addressType?: AddressType;
  isDefault?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Pagination metadata
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  page: number;
  totalPages: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Standardized response types (following API_STANDARDIZATION_PLAN)

// Collection response for lists
export interface AddressesListResponse {
  success: boolean;
  data: {
    items: Address[];
    meta: PaginationMeta;
  };
  timestamp: string;
}

// Action response for create/update/delete
export interface AddressActionResponse {
  success: boolean;
  data: {
    item: Address;
    message: string;
  };
  timestamp: string;
}

// Single item response
export interface AddressSingleResponse {
  success: boolean;
  data: Address;
  timestamp: string;
}

// Set default address DTO
export interface SetDefaultAddressDto {
  addressId: string;
}

// Address validation response
export interface AddressValidationResponse {
  valid: boolean;
  details?: {
    validated: boolean;
    validatedAt: string;
    corrections?: {
      street1?: string;
      street2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    confidence?: number;
  };
}

// Address statistics
export interface AddressStats {
  totalAddresses: number;
  addressesByType: {
    headquarters: number;
    billing: number;
    shipping: number;
  };
  validatedAddresses: number;
  defaultAddresses: number;
}

// Address statistics response
export interface AddressStatsResponse {
  success: boolean;
  data: AddressStats;
  timestamp: string;
}
