# Accounts Module - Quick Reference Guide

## Module Created Successfully! ✅

The PIM Accounts module has been created with full API and DTO implementation following all project standards.

## What Was Created

### Core Module Files
- ✅ **Entity**: `/engines/src/modules/accounts/entities/account.entity.ts`
- ✅ **Controller**: `/engines/src/modules/accounts/accounts.controller.ts`  
- ✅ **Service**: `/engines/src/modules/accounts/accounts.service.ts`
- ✅ **Module**: `/engines/src/modules/accounts/accounts.module.ts`

### DTOs (Following API Standards)
- ✅ `account-response.dto.ts` - Response DTO with all fields
- ✅ `create-account.dto.ts` - Creation with validation
- ✅ `update-account.dto.ts` - Partial update
- ✅ `account-query.dto.ts` - Filtering & pagination
- ✅ `account-stats.dto.ts` - Statistics response
- ✅ `import-export.dto.ts` - Import/export operations (spec created)

### Shell Scripts Created
All scripts are in `/Users/colinroets/dev/projects/product/shell-scripts/`:

1. **setup-accounts-module.sh** - Initial module setup
2. **create-accounts-migration.sh** - Database migration creation
3. **test-accounts-api.sh** - Test basic CRUD operations
4. **setup-accounts-import-export.sh** - Import/export setup
5. **generate-test-accounts.sh** - Generate test CSV data
6. **test-accounts-import-export.sh** - Test import/export
7. **complete-accounts-setup.sh** - Full setup automation
8. **verify-accounts-module.sh** - Health check & verification

## Quick Setup Commands

```bash
# Make all scripts executable
chmod +x /Users/colinroets/dev/projects/product/shell-scripts/*accounts*.sh

# Run complete setup (recommended)
/Users/colinroets/dev/projects/product/shell-scripts/complete-accounts-setup.sh

# Or manually:
# 1. Create migration
/Users/colinroets/dev/projects/product/shell-scripts/create-accounts-migration.sh

# 2. Run migration
cd /Users/colinroets/dev/projects/product/engines
npm run migration:run

# 3. Start application
npm run start:dev

# 4. Test the API
/Users/colinroets/dev/projects/product/shell-scripts/test-accounts-api.sh
```

## Account Object Structure

```typescript
Account = {
  // Core Identification
  id: UUID
  legalName: string
  tradeName?: string
  registrationNumber: string (unique)
  taxId: string (unique)
  documents: Media[] (PDFs)

  // Business Classification  
  accountType: 'customer' | 'partner' | 'supplier' | ...
  industry?: string
  subIndustry?: string
  businessSize?: 'startup' | 'smb' | 'mid_market' | 'enterprise'
  ownershipType?: 'public' | 'private' | 'government' | ...

  // Contact & Address
  headquartersAddress: Address
  billingAddress?: Address
  shippingAddress?: Address
  primaryPhone: string
  primaryEmail: string
  websiteUrl?: string

  // Relationships
  parentAccount?: Account
  childAccounts: Account[]
  linkedUsers: User[]
  recordOwner?: User

  // Commercial
  preferredCurrency: string (default: 'USD')
  paymentTerms?: string
  creditLimit?: number
  creditStatus?: string
  discountLevel?: string
  contractReferences?: string[]

  // Operational
  status: 'active' | 'inactive' | 'pending_verification' | ...
  verificationStatus: 'pending' | 'verified' | 'rejected' | ...
  onboardingDate?: Date
  lastActivityDate?: Date
}
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/accounts` | Create account | Manager/Admin |
| GET | `/api/accounts` | List with filters | Yes |
| GET | `/api/accounts/stats` | Statistics | Manager/Admin |
| GET | `/api/accounts/:id` | Get by ID | Yes |
| GET | `/api/accounts/:id/subsidiaries` | Get children | Yes |
| PATCH | `/api/accounts/:id` | Update account | Manager/Admin |
| PATCH | `/api/accounts/:id/status` | Update status | Manager/Admin |
| PATCH | `/api/accounts/:id/verification` | Verify account | Admin only |
| POST | `/api/accounts/:id/users` | Link users | Manager/Admin |
| DELETE | `/api/accounts/:id/users` | Unlink users | Manager/Admin |
| POST | `/api/accounts/:id/documents` | Add documents | Manager/Admin |
| DELETE | `/api/accounts/:id/documents` | Remove docs | Manager/Admin |
| DELETE | `/api/accounts/:id` | Soft delete | Admin only |

### Import/Export (After Implementation)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts/import` | Import from file |
| POST | `/api/accounts/import/validate` | Validate file |
| POST | `/api/accounts/export` | Export to file |
| GET | `/api/accounts/template` | Download template |
| PATCH | `/api/accounts/bulk` | Bulk update |
| DELETE | `/api/accounts/bulk` | Bulk delete |

## Testing Examples

### Create Account
```bash
curl -X POST http://localhost:3010/api/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "legalName": "Acme Corporation Ltd.",
    "tradeName": "Acme Corp",
    "registrationNumber": "HRB123456",
    "taxId": "DE123456789",
    "accountType": "customer",
    "industry": "Technology",
    "businessSize": "enterprise",
    "headquartersAddress": {
      "street": "123 Main St",
      "city": "Berlin",
      "country": "Germany",
      "postalCode": "10115"
    },
    "primaryPhone": "+49-30-123456",
    "primaryEmail": "contact@acme.de"
  }'
```

### Query Accounts
```bash
# With filters
GET /api/accounts?accountType=customer&status=active&businessSize=enterprise

# With search
GET /api/accounts?search=Acme&includeUsers=true&includeDocuments=true

# With pagination
GET /api/accounts?page=1&limit=20&sortBy=legalName&sortOrder=ASC
```

## Import/Export Implementation

To complete import/export functionality:

1. **Install packages** (if not already):
```bash
cd /Users/colinroets/dev/projects/product/engines
npm install papaparse xlsx @nestjs/platform-express
npm install --save-dev @types/multer
```

2. **Add service methods**:
   - See `/shell-scripts/implement-accounts-import-export.md`
   - Implement `importAccounts()`, `exportAccounts()`, `generateTemplate()`

3. **Add controller endpoints**:
   - Copy from `/shell-scripts/add-import-export-endpoints.ts`
   - Add file upload interceptors and streaming responses

4. **Test import/export**:
```bash
/Users/colinroets/dev/projects/product/shell-scripts/test-accounts-import-export.sh
```

## Verification

Run the verification script to check everything is properly installed:
```bash
/Users/colinroets/dev/projects/product/shell-scripts/verify-accounts-module.sh
```

## Common Issues & Solutions

### Migration Not Running
```bash
# Ensure PostgreSQL is running
docker-compose up -d postgres-pim

# Check connection
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# Run migration manually
cd engines && npm run migration:run
```

### TypeScript Errors
```bash
# Check for compilation errors
cd engines && npx tsc --noEmit

# Common fix: missing imports
# The auth guards may need to be imported in controller
```

### Auth Token Issues
```bash
# Ensure admin user exists
# Check auth module is working
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

## Standards Compliance

✅ **Follows API Standardization**:
- CollectionResponse for lists
- ActionResponseDto for mutations
- Standardized error handling

✅ **Follows DTO Standards**:
- Proper validation decorators
- Swagger documentation
- Type transformations

✅ **Follows Module Patterns**:
- Modular architecture
- Service/Controller separation
- Repository pattern with TypeORM

✅ **Security**:
- JWT authentication
- Role-based access control
- Input validation

## Next Steps

1. ✅ **Basic Setup Complete** - Core CRUD operations ready
2. ⏳ **Import/Export** - Implement service methods for file operations
3. ⏳ **Advanced Features** - Workflow integration, automated verification
4. ⏳ **Frontend Integration** - Admin portal UI for account management

---
*Module Version: 1.0.0*
*Created: January 2025*
*Documentation: /engines/src/modules/accounts/README.md*
