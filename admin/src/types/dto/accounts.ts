// Account Types and DTOs

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Account {
  id: string;
  legalName: string;
  tradeName?: string;
  registrationNumber?: string;
  taxId?: string;
  accountType: 'customer' | 'supplier' | 'partner' | 'vendor' | 'distributor';
  businessSize: 'startup' | 'smb' | 'mid_market' | 'enterprise';
  industryType?: string;
  website?: string;
  email?: string;
  phoneNumber?: string;
  faxNumber?: string;
  
  // Addresses
  headquartersAddress?: Address;
  shippingAddress?: Address;
  billingAddress?: Address;
  
  // Commercial Information
  paymentTerms?: string;
  currency?: string;
  creditLimit?: number;
  accountManagerId?: string;
  
  // Relationships
  parentAccountId?: string;
  parentAccount?: Account;
  subsidiaries?: Account[];
  
  // Associated records
  primaryContactId?: string;
  createdById?: string;
  createdBy?: any; // User object if populated
  documents?: any[]; // Document objects if populated
  
  // Business Classification
  businessClassification?: string;
  annualRevenue?: number;
  employeeCount?: number;
  
  // Status and metadata
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
}

export interface CreateAccountDto {
  legalName: string;
  tradeName?: string;
  registrationNumber?: string;
  taxId?: string;
  accountType: 'customer' | 'supplier' | 'partner' | 'vendor' | 'distributor';
  businessSize: 'startup' | 'smb' | 'mid_market' | 'enterprise';
  industryType?: string;
  website?: string;
  email?: string;
  phoneNumber?: string;
  faxNumber?: string;
  headquartersAddress?: Address;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentTerms?: string;
  currency?: string;
  creditLimit?: number;
  accountManagerId?: string;
  parentAccountId?: string;
  primaryContactId?: string;
  businessClassification?: string;
  annualRevenue?: number;
  employeeCount?: number;
  notes?: string;
  tags?: string[];
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {
  status?: 'active' | 'inactive' | 'suspended' | 'pending_verification';
}

export interface AccountsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  accountType?: 'customer' | 'supplier' | 'partner' | 'vendor' | 'distributor';
  businessSize?: 'startup' | 'smb' | 'mid_market' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  parentAccountId?: string;
}

export interface AccountStats {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  suspendedAccounts: number;
  pendingVerification: number;
  accountsByType: Record<string, number>;
  accountsBySize: Record<string, number>;
  totalCreditLimit: number;
  averageCreditLimit: number;
  parentAccounts: number;
  subsidiaryAccounts: number;
}

// Response types following API standardization
export interface AccountsListResponse {
  success: boolean;
  data: {
    items: Account[];
    meta: {
      totalItems: number;
      itemCount: number;
      page: number;
      totalPages: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
  timestamp: string;
  message?: string;
}

export interface AccountActionResponse {
  success: boolean;
  data: {
    item: Account;
    message: string;
  };
  timestamp: string;
}

// Note: Get by ID returns direct account object, not wrapped
export type AccountSingleResponse = Account;

export interface AccountStatsResponse {
  success: boolean;
  data: AccountStats;
  timestamp: string;
}
