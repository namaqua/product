import api from './api';
import {
  Account,
  CreateAccountDto,
  UpdateAccountDto,
  AccountsQueryDto,
  AccountsListResponse,
  AccountActionResponse,
  AccountSingleResponse,
  AccountStatsResponse,
  AccountStats,
} from '../types/dto/accounts';

/**
 * Account Service
 * Handles all API interactions for the Accounts module
 * Following API standardization plan
 */
class AccountService {
  private readonly baseUrl = '/accounts';

  /**
   * Get paginated list of accounts
   * Returns wrapped response with items and meta
   */
  async getAccounts(params?: AccountsQueryDto): Promise<AccountsListResponse> {
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

    const response = await api.get<AccountsListResponse>(url);
    return response.data;
  }

  /**
   * Get single account by ID
   * Backend currently returns account directly (not wrapped per API standard)
   * This method handles both formats for compatibility
   */
  async getAccount(id: string): Promise<Account> {
    const response = await api.get<any>(`${this.baseUrl}/${id}`);
    
    // Handle both wrapped and direct responses for compatibility
    if (response.data && typeof response.data === 'object') {
      // If it has a 'success' field, it's wrapped (future standardized response)
      if ('success' in response.data && 'data' in response.data) {
        console.log('Account API: Using wrapped response format (standardized)');
        return response.data.data;
      }
      // Otherwise it's the account directly (current format)
      if ('id' in response.data && 'legalName' in response.data) {
        console.log('Account API: Using direct response format (current)');
        return response.data as Account;
      }
    }
    
    throw new Error('Invalid response format from server');
  }

  /**
   * Create a new account
   * Returns wrapped response with item and message
   */
  async createAccount(data: CreateAccountDto): Promise<AccountActionResponse> {
    const response = await api.post<AccountActionResponse>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update an existing account
   * Returns wrapped response with item and message
   */
  async updateAccount(id: string, data: UpdateAccountDto): Promise<AccountActionResponse> {
    const response = await api.patch<AccountActionResponse>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Delete an account (soft delete)
   * Returns wrapped response with item and message
   */
  async deleteAccount(id: string): Promise<AccountActionResponse> {
    const response = await api.delete<AccountActionResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Update account status
   * Returns wrapped response with item and message
   */
  async updateAccountStatus(
    id: string, 
    status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
  ): Promise<AccountActionResponse> {
    const response = await api.patch<AccountActionResponse>(
      `${this.baseUrl}/${id}/status`, 
      { status }
    );
    return response.data;
  }

  /**
   * Get account statistics
   * Returns wrapped response with stats data
   */
  async getAccountStats(): Promise<AccountStatsResponse> {
    const response = await api.get<AccountStatsResponse>(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Get subsidiary accounts for a parent account
   * Returns wrapped response with items and meta
   */
  async getSubsidiaries(id: string): Promise<AccountsListResponse> {
    const response = await api.get<AccountsListResponse>(`${this.baseUrl}/${id}/subsidiaries`);
    return response.data;
  }

  /**
   * Bulk update account statuses
   * Returns wrapped response with items and message
   */
  async bulkUpdateStatus(
    accountIds: string[], 
    status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
  ): Promise<AccountActionResponse> {
    const response = await api.patch<AccountActionResponse>(
      `${this.baseUrl}/bulk/status`, 
      { accountIds, status }
    );
    return response.data;
  }

  /**
   * Export accounts to CSV
   * Returns CSV data as blob
   */
  async exportAccounts(params?: AccountsQueryDto): Promise<Blob> {
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
   * Import accounts from CSV
   * Returns wrapped response with results
   */
  async importAccounts(file: File): Promise<AccountActionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<AccountActionResponse>(
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
   * Search accounts by name or tax ID
   * Returns wrapped response with items and meta
   */
  async searchAccounts(query: string): Promise<AccountsListResponse> {
    const response = await api.get<AccountsListResponse>(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  }

  /**
   * Validate account data before creation
   * Returns validation results
   */
  async validateAccount(data: CreateAccountDto): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const response = await api.post<{ valid: boolean; errors?: string[] }>(
        `${this.baseUrl}/validate`,
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        return { valid: false, errors: error.response.data.errors || ['Validation failed'] };
      }
      throw error;
    }
  }

  /**
   * Get account activity history
   * Returns wrapped response with activity items
   */
  async getAccountActivity(id: string): Promise<any> {
    const response = await api.get(`${this.baseUrl}/${id}/activity`);
    return response.data;
  }

  /**
   * Restore a soft-deleted account
   * Returns wrapped response with item and message
   */
  async restoreAccount(id: string): Promise<AccountActionResponse> {
    const response = await api.post<AccountActionResponse>(`${this.baseUrl}/${id}/restore`);
    return response.data;
  }

  /**
   * Set parent account relationship
   * Returns wrapped response with item and message
   */
  async setParentAccount(accountId: string, parentAccountId: string | null): Promise<AccountActionResponse> {
    const response = await api.patch<AccountActionResponse>(
      `${this.baseUrl}/${accountId}/parent`,
      { parentAccountId }
    );
    return response.data;
  }

  /**
   * Get accounts by parent ID (get all children of a parent)
   * Returns wrapped response with items and meta
   */
  async getAccountsByParent(parentId: string): Promise<AccountsListResponse> {
    const response = await api.get<AccountsListResponse>(
      `${this.baseUrl}?parentAccountId=${parentId}`
    );
    return response.data;
  }

  /**
   * Get account hierarchy (parent and all descendants)
   * Returns hierarchy structure
   */
  async getAccountHierarchy(id: string): Promise<any> {
    const response = await api.get(`${this.baseUrl}/${id}/hierarchy`);
    return response.data;
  }
}

// Export singleton instance
export const accountService = new AccountService();
