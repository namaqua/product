# Accounts Module Implementation

## Overview
The Accounts module manages registered business entities in the PIM system. Each account represents a legal business entity with comprehensive information including registration details, addresses, classifications, and relationships with users and other accounts.

## Module Structure

```
/engines/src/modules/accounts/
├── entities/
│   └── account.entity.ts          # Account entity with all fields and relationships
├── dto/
│   ├── index.ts                   # Export barrel
│   ├── account-response.dto.ts    # Response DTO following standards
│   ├── create-account.dto.ts      # Creation DTO with validation
│   ├── update-account.dto.ts      # Update DTO (partial)
│   ├── account-query.dto.ts       # Query/filter DTO with pagination
│   ├── account-stats.dto.ts       # Statistics response DTO
│   └── import-export.dto.ts       # Import/Export DTOs (to be implemented)
├── accounts.controller.ts         # REST API endpoints
├── accounts.service.ts            # Business logic
└── accounts.module.ts             # Module definition
```

## Account Entity Fields

### Core Identification
- **legalName**: Official registered business name
- **tradeName**: DBA (doing business as) name
- **registrationNumber**: Business registration number (unique)
- **taxId**: Tax/VAT identification (unique)
- **documents**: Related Media entities for articles of incorporation (PDFs)

### Business Classification
- **accountType**: customer, partner, supplier, prospect, vendor, distributor, manufacturer, other
- **industry**: Business sector
- **subIndustry**: Sub-sector classification
- **businessSize**: startup, smb, mid_market, enterprise
- **ownershipType**: public, private, government, nonprofit, partnership, sole_proprietorship

### Contact & Address Data
- **headquartersAddress**: Main business address (JSONB)
- **billingAddress**: Billing address if different (JSONB)
- **shippingAddress**: Shipping address if different (JSONB)
- **primaryPhone**: Main contact number
- **primaryEmail**: Main email address
- **websiteUrl**: Company website

### Relationships
- **parentAccount**: Parent company (for subsidiaries)
- **childAccounts**: Subsidiary companies
- **linkedUsers**: Associated CRM users (many-to-many)
- **recordOwner**: CRM user who owns this record

### Commercial Attributes
- **preferredCurrency**: 3-letter currency code
- **paymentTerms**: Net 30, Net 60, etc.
- **creditLimit**: Maximum credit amount
- **creditStatus**: Credit approval status
- **discountLevel**: Price tier or discount percentage
- **contractReferences**: Array of contract numbers

### Operational Metadata
- **status**: active, inactive, pending_verification, blacklisted, suspended
- **verificationStatus**: pending, verified, rejected, documents_required
- **onboardingDate**: When account was fully onboarded
- **lastActivityDate**: Last interaction date
- **Standard fields**: isActive, createdAt, updatedAt, deletedAt, version

## API Endpoints

All endpoints follow standardized response patterns per API_STANDARDIZATION_PLAN.md

### Basic CRUD Operations
- `POST /api/accounts` - Create new account
- `GET /api/accounts` - List accounts with filtering/pagination
- `GET /api/accounts/:id` - Get account by ID
- `PATCH /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Soft delete account

### Status Management
- `PATCH /api/accounts/:id/status` - Update account status
- `PATCH /api/accounts/:id/verification` - Update verification status (admin only)

### Relationship Management
- `GET /api/accounts/:id/subsidiaries` - Get subsidiary accounts
- `POST /api/accounts/:id/users` - Link users to account
- `DELETE /api/accounts/:id/users` - Unlink users from account
- `POST /api/accounts/:id/documents` - Add documents to account
- `DELETE /api/accounts/:id/documents` - Remove documents from account

### Analytics & Reporting
- `GET /api/accounts/stats` - Get account statistics

### Bulk Operations (Planned)
- `PATCH /api/accounts/bulk` - Bulk update accounts
- `DELETE /api/accounts/bulk` - Bulk delete accounts

### Import/Export (Planned)
- `POST /api/accounts/import` - Import from CSV/Excel
- `POST /api/accounts/import/validate` - Validate import file
- `POST /api/accounts/import/preview` - Preview with mapping
- `POST /api/accounts/export` - Export to CSV/Excel
- `GET /api/accounts/template` - Download import template

## Query Parameters

The `AccountQueryDto` supports comprehensive filtering:

```typescript
{
  // Pagination
  page?: number;          // Page number (1-based)
  limit?: number;         // Items per page (max 100)
  
  // Sorting
  sortBy?: string;        // Field to sort by
  sortOrder?: 'ASC' | 'DESC';
  
  // Search
  search?: string;        // Search in name, trade name, registration, tax ID
  
  // Filters
  accountType?: AccountType;
  status?: AccountStatus;
  verificationStatus?: VerificationStatus;
  businessSize?: BusinessSize;
  ownershipType?: OwnershipType;
  industry?: string;
  parentAccountId?: string;
  recordOwnerId?: string;
  linkedUserId?: string;
  isActive?: boolean;
  
  // Include relations
  includeChildren?: boolean;
  includeParent?: boolean;
  includeUsers?: boolean;
  includeDocuments?: boolean;
}
```

## Response Formats

### Collection Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "meta": {
      "totalItems": 100,
      "itemCount": 10,
      "page": 1,
      "totalPages": 10,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrevious": false
    }
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Action Response
```json
{
  "success": true,
  "data": {
    "item": {...},
    "message": "Account created successfully"
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Statistics Response
```json
{
  "total": 1000,
  "active": 850,
  "inactive": 50,
  "pendingVerification": 75,
  "verified": 900,
  "blacklisted": 25,
  "byType": {
    "customer": 500,
    "supplier": 300,
    "partner": 200
  },
  "bySize": {
    "smb": 600,
    "enterprise": 400
  },
  "byIndustry": {...},
  "byOwnership": {...},
  "parentAccounts": 100,
  "subsidiaryAccounts": 50,
  "avgLinkedUsers": 3.5,
  "avgDocuments": 2.1
}
```

## Security & Permissions

The module uses JWT authentication and role-based access control:

- **Public endpoints**: None
- **Authenticated users**: Can view accounts
- **Managers**: Can create, update accounts, manage relationships
- **Admins**: Full access including verification, bulk operations, deletion

## Database Schema

### Tables Created
1. `accounts` - Main account table with all fields
2. `account_users` - Junction table for account-user relationships
3. `account_documents` - Junction table for account-document relationships

### Indexes
- Unique: registrationNumber, taxId
- Standard: legalName, tradeName, status, accountType, verificationStatus

### Foreign Keys
- parentAccountId → accounts.id (self-referential)
- recordOwnerId → users.id
- account_users → accounts.id, users.id
- account_documents → accounts.id, media.id

## Setup Instructions

1. **Add module to app.module.ts**:
   ```bash
   ./shell-scripts/setup-accounts-module.sh
   ```

2. **Create database migration**:
   ```bash
   ./shell-scripts/create-accounts-migration.sh
   ```

3. **Run migration**:
   ```bash
   cd engines
   npm run migration:run
   ```

4. **Test the API**:
   ```bash
   ./shell-scripts/test-accounts-api.sh
   ```

## Import/Export Functionality (Planned)

### Supported Formats
- CSV (comma-separated values)
- Excel (.xlsx)
- JSON

### Import Features
- Field mapping interface
- Validation before import
- Update existing or create new
- Skip invalid rows option
- Error reporting

### Export Features
- Filter before export
- Select fields to include
- Include/exclude relationships
- Multiple format support

### Sample CSV Format
```csv
legalName,tradeName,registrationNumber,taxId,accountType,industry,businessSize
"Acme Corp","Acme","HRB123","DE123","customer","Technology","enterprise"
```

## Testing

### Manual Testing Scripts
- `test-accounts-api.sh` - Test basic CRUD operations
- `test-accounts-import-export.sh` - Test import/export functionality
- `generate-test-accounts.sh` - Generate test CSV data

### Automated Tests (To be implemented)
- Unit tests for service methods
- Integration tests for API endpoints
- E2E tests for complete workflows

## Future Enhancements

1. **Advanced Import/Export**
   - Excel multi-sheet support
   - Scheduled exports
   - Import history tracking

2. **Workflow Integration**
   - Account approval workflows
   - Automated verification
   - Document expiry tracking

3. **Advanced Analytics**
   - Account growth trends
   - Activity heatmaps
   - Relationship graphs

4. **Integration Points**
   - Orders module integration
   - Opportunities tracking
   - Support case linking

## Troubleshooting

### Common Issues

1. **Migration fails**
   - Ensure PostgreSQL is running: `docker-compose up -d postgres-pim`
   - Check for existing tables: `docker exec -it postgres-pim psql -U pim_user -d pim_dev`

2. **API returns 401**
   - Ensure valid JWT token
   - Check user roles and permissions

3. **Unique constraint violations**
   - Check for duplicate registrationNumber or taxId
   - Use updateExisting option in imports

## Related Documentation
- [API Standardization Plan](../../../docs/API_STANDARDIZATION_PLAN.md)
- [PIM API DTO Standards](../../../docs/PIM_API_DTO_STANDARDS.md)
- [Import/Export Implementation](../../../docs/IMPORT_EXPORT_IMPLEMENTATION.md)

---
*Module created: January 2025*
*Version: 1.0.0*
