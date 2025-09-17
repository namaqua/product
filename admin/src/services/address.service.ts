import api from './api';
import {
  Address,
  CreateAddressDto,
  UpdateAddressDto,
  AddressesQueryDto,
  AddressesListResponse,
  AddressActionResponse,
  AddressSingleResponse,
  SetDefaultAddressDto,
  AddressValidationResponse,
  AddressStatsResponse,
  AddressType,
} from '../types/dto/addresses';

/**
 * Address Service
 * Handles all API interactions for the Addresses module
 * Following API standardization plan
 */
class AddressService {
  private readonly baseUrl = '/addresses';

  /**
   * Get all addresses for an account
   * Returns wrapped response with items and meta
   */
  async getAddressesByAccount(accountId: string): Promise<AddressesListResponse> {
    const response = await api.get<AddressesListResponse>(`${this.baseUrl}/account/${accountId}`);
    return response.data;
  }

  /**
   * Get paginated list of addresses
   * Returns wrapped response with items and meta
   */
  async getAddresses(params?: AddressesQueryDto): Promise<AddressesListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = queryParams.toString() 
      ? `${this.baseUrl}?${queryParams.toString()}` 
      : this.baseUrl;

    const response = await api.get<AddressesListResponse>(url);
    return response.data;
  }

  /**
   * Get addresses by type for an account
   * Returns wrapped response with items and meta
   */
  async getAddressesByType(accountId: string, type: AddressType): Promise<AddressesListResponse> {
    const response = await api.get<AddressesListResponse>(
      `${this.baseUrl}/account/${accountId}/type/${type}`
    );
    return response.data;
  }

  /**
   * Get the default address of a specific type for an account
   * Returns single address or null
   */
  async getDefaultAddress(accountId: string, type: AddressType): Promise<AddressSingleResponse | null> {
    const response = await api.get<AddressSingleResponse>(
      `${this.baseUrl}/account/${accountId}/default/${type}`
    );
    return response.data;
  }

  /**
   * Get single address by ID
   * Returns wrapped single address
   */
  async getAddress(id: string): Promise<AddressSingleResponse> {
    const response = await api.get<AddressSingleResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create a new address
   * Returns wrapped response with item and message
   */
  async createAddress(data: CreateAddressDto): Promise<AddressActionResponse> {
    // Clean up the data to ensure proper formatting
    const cleanedData = {
      accountId: data.accountId,
      addressType: data.addressType,
      isDefault: data.isDefault || false,
      label: data.label || null,
      contactName: data.contactName || null,
      phone: data.phone || null,
      email: data.email || null,
      street1: data.street1,
      street2: data.street2 || null,
      city: data.city,
      state: data.state || null,
      postalCode: data.postalCode,
      country: data.country,
      county: data.county || null,
      deliveryInstructions: data.deliveryInstructions || null,
    };

    // Remove null/undefined values for cleaner payload
    const payload = Object.entries(cleanedData).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    console.log('[AddressService] Creating address with payload:', payload);
    
    const response = await api.post<AddressActionResponse>(this.baseUrl, payload);
    console.log('[AddressService] Create response:', response.data);
    
    return response.data;
  }

  /**
   * Update an existing address
   * Returns wrapped response with item and message
   */
  async updateAddress(id: string, data: UpdateAddressDto): Promise<AddressActionResponse> {
    // Clean up the data similar to create
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    console.log('[AddressService] Updating address with payload:', cleanedData);
    
    const response = await api.patch<AddressActionResponse>(`${this.baseUrl}/${id}`, cleanedData);
    console.log('[AddressService] Update response:', response.data);
    
    return response.data;
  }

  /**
   * Delete an address
   * Returns wrapped response with item and message
   */
  async deleteAddress(id: string): Promise<AddressActionResponse> {
    const response = await api.delete<AddressActionResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Set an address as the default for its type
   * Returns wrapped response with item and message
   */
  async setAsDefault(id: string): Promise<AddressActionResponse> {
    const response = await api.post<AddressActionResponse>(`${this.baseUrl}/${id}/set-default`, {});
    return response.data;
  }

  /**
   * Clone headquarters address as billing address
   * Returns wrapped response with new billing address
   */
  async cloneHQAsBilling(accountId: string): Promise<AddressActionResponse> {
    const response = await api.post<AddressActionResponse>(
      `${this.baseUrl}/account/${accountId}/clone-hq-to-billing`,
      {}
    );
    return response.data;
  }

  /**
   * Validate an address
   * Returns validation result
   */
  async validateAddress(id: string): Promise<AddressValidationResponse> {
    const response = await api.post<AddressValidationResponse>(`${this.baseUrl}/${id}/validate`, {});
    return response.data;
  }

  /**
   * Track usage of an address
   * Returns nothing (204 No Content)
   */
  async trackUsage(id: string): Promise<void> {
    await api.post(`${this.baseUrl}/${id}/track-usage`, {});
  }

  /**
   * Migrate legacy address data for an account
   * Returns wrapped response with message
   */
  async migrateLegacyAddresses(accountId: string, accountData: any): Promise<AddressActionResponse> {
    const response = await api.post<AddressActionResponse>(
      `${this.baseUrl}/account/${accountId}/migrate`,
      accountData
    );
    return response.data;
  }

  /**
   * Bulk create addresses
   * Returns wrapped response with items and message
   */
  async bulkCreateAddresses(addresses: CreateAddressDto[]): Promise<AddressActionResponse> {
    const response = await api.post<AddressActionResponse>(`${this.baseUrl}/bulk`, { addresses });
    return response.data;
  }

  /**
   * Bulk delete addresses
   * Returns wrapped response with message
   */
  async bulkDeleteAddresses(addressIds: string[]): Promise<AddressActionResponse> {
    const response = await api.post<AddressActionResponse>(`${this.baseUrl}/bulk-delete`, { addressIds });
    return response.data;
  }

  /**
   * Get address statistics
   * Returns wrapped response with stats data
   */
  async getAddressStats(accountId?: string): Promise<AddressStatsResponse> {
    const url = accountId 
      ? `${this.baseUrl}/stats?accountId=${accountId}`
      : `${this.baseUrl}/stats`;
    
    const response = await api.get<AddressStatsResponse>(url);
    return response.data;
  }

  /**
   * Export addresses to CSV
   * Returns CSV data as blob
   */
  async exportAddresses(params?: AddressesQueryDto): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = queryParams.toString() 
      ? `${this.baseUrl}/export?${queryParams.toString()}` 
      : `${this.baseUrl}/export`;

    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  /**
   * Import addresses from CSV
   * Returns wrapped response with results
   */
  async importAddresses(file: File): Promise<AddressActionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<AddressActionResponse>(
      `${this.baseUrl}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  }

  /**
   * Copy address to another account
   * Returns wrapped response with new address
   */
  async copyAddress(addressId: string, targetAccountId: string): Promise<AddressActionResponse> {
    const response = await api.post<AddressActionResponse>(
      `${this.baseUrl}/${addressId}/copy`,
      { targetAccountId }
    );
    return response.data;
  }

  /**
   * Search addresses
   * Returns wrapped response with items and meta
   */
  async searchAddresses(query: string): Promise<AddressesListResponse> {
    const response = await api.get<AddressesListResponse>(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  }
}

// Export singleton instance
export const addressService = new AddressService();
