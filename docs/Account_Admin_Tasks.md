# Accounts Module Admin Interface - Action Plan

## Overview
Implementation of a complete admin interface for the Accounts module in the PIM system, featuring full CRUD operations, relationship management, and statistics dashboard.

## Phase 1: Core Setup & Service Layer (Priority: High)

### 1.1 Create Account Service
- [ ] Create `/admin/src/services/account.service.ts`
  - Implement all API methods matching backend endpoints
  - Handle authentication headers
  - Parse responses using existing API response patterns
  - Methods to implement:
    - `getAccounts(params)` - List with pagination/filters
    - `getAccount(id)` - Get single account (direct response)
    - `createAccount(data)` - Create new account
    - `updateAccount(id, data)` - Update account
    - `deleteAccount(id)` - Soft delete
    - `updateAccountStatus(id, status)` - Status update
    - `getAccountStats()` - Statistics
    - `getSubsidiaries(id)` - Get child accounts

### 1.2 Create TypeScript Types
- [ ] Create `/admin/src/types/dto/accounts.ts`
  - Define Account interface with all 30+ fields
  - Address type (headquartersAddress, shippingAddress, billingAddress)
  - Create/Update DTOs
  - Response wrapper types
  - Statistics response type

### 1.3 Update Navigation
- [ ] Modify `/admin/src/components/layouts/ApplicationShell.tsx`
  - Add "Account Engine" as FIRST section in navigation
  - Include sub-items:
    - Dashboard (statistics overview)
    - Accounts (list/manage)
    - Relationships (parent/subsidiary view)
  - Use `BriefcaseIcon` or `BuildingOfficeIcon` for Account Engine

## Phase 2: List View & Basic CRUD (Priority: High)

### 2.1 Account List Component
- [ ] Create `/admin/src/features/accounts/AccountList.tsx`
  - Table view with pagination (use existing DataTable pattern)
  - Display key fields: legalName, tradeName, accountType, status
  - Action buttons: View, Edit, Delete
  - Status badges with colors
  - Search functionality
  - Filters: accountType, businessSize, status

### 2.2 Account Create Form
- [ ] Create `/admin/src/features/accounts/AccountCreate.tsx`
  - Multi-step form or tabbed interface
  - Sections:
    - Basic Information (names, IDs, type)
    - Business Details (size, classification, website)
    - Addresses (headquarters, shipping, billing)
    - Commercial Information (payment terms, credit limit, etc.)
  - Form validation
  - Success/error handling with toast notifications

### 2.3 Account Edit Form
- [ ] Create `/admin/src/features/accounts/AccountEdit.tsx`
  - Pre-populate form with existing data
  - Track changed fields
  - Confirmation on navigation away with unsaved changes
  - Update only changed fields via PATCH

### 2.4 Account Details View
- [ ] Create `/admin/src/features/accounts/AccountDetails.tsx`
  - Read-only view with all account information
  - Organized sections with cards
  - Quick actions: Edit, Change Status, View Subsidiaries
  - Activity timeline (if available)

## Phase 3: Relationship Management (Priority: Medium)

### 3.1 Parent/Subsidiary Interface
- [ ] Create `/admin/src/features/accounts/AccountRelationships.tsx`
  - Tree view of parent/child relationships
  - Add/remove subsidiary functionality
  - Visual hierarchy display
  - Quick navigation between related accounts

### 3.2 Account Selector Component
- [ ] Create `/admin/src/components/accounts/AccountSelector.tsx`
  - Reusable dropdown/modal for selecting parent accounts
  - Search functionality
  - Filter out current account and its subsidiaries
  - Display account hierarchy in selection

### 3.3 Subsidiary Management
- [ ] Add subsidiary section to AccountDetails
  - List all direct subsidiaries
  - Quick add subsidiary button
  - Remove relationship capability
  - Navigate to subsidiary details

## Phase 4: Statistics Dashboard (Priority: Medium)

### 4.1 Account Dashboard
- [ ] Create `/admin/src/features/accounts/AccountDashboard.tsx`
  - Statistics cards (total, active, by type, by size)
  - Charts using existing chart components:
    - Account distribution by type (pie/donut)
    - Accounts by business size (bar)
    - Status distribution (stacked bar)
    - Recent activity timeline
  - Quick actions panel
  - Top accounts by credit limit/revenue

### 4.2 Statistics Integration
- [ ] Integrate stats endpoint data
  - Real-time statistics updates
  - Caching strategy with React Query
  - Auto-refresh interval

## Phase 5: Advanced Features (Priority: Low)

### 5.1 Bulk Operations
- [ ] Create `/admin/src/features/accounts/AccountBulkActions.tsx`
  - Multi-select in list view
  - Bulk status update
  - Bulk export to CSV
  - Bulk delete (with confirmation)

### 5.2 Advanced Filters
- [ ] Create `/admin/src/features/accounts/AccountFilters.tsx`
  - Filter panel with all fields
  - Save filter presets
  - Complex queries (AND/OR conditions)
  - Date range filters

### 5.3 Import/Export
- [ ] Add to Import/Export module
  - CSV upload for bulk account creation
  - Template download
  - Validation preview
  - Export with filters

## Phase 6: Routing & Integration (Priority: High)

### 6.1 Update App Routes
- [ ] Modify `/admin/src/App.tsx`
  - Add account routes:
    - `/accounts` - List view
    - `/accounts/dashboard` - Statistics dashboard
    - `/accounts/new` - Create form
    - `/accounts/:id` - Details view
    - `/accounts/:id/edit` - Edit form
    - `/accounts/relationships` - Relationship manager

### 6.2 Authentication Integration
- [ ] Ensure all account operations use JWT token
- [ ] Handle 401 responses appropriately
- [ ] Add role-based permissions (if needed)

## Testing Checklist

### Manual Testing
- [ ] Test all CRUD operations
- [ ] Verify pagination works correctly
- [ ] Test all filters and search
- [ ] Verify parent/subsidiary relationships
- [ ] Test status updates
- [ ] Verify statistics accuracy
- [ ] Test error scenarios (network, validation)
- [ ] Test responsive design (mobile, tablet, desktop)

### Integration Testing
- [ ] Use existing test script: `/shell-scripts/test-accounts-fixed.sh`
- [ ] Verify data persistence
- [ ] Test concurrent operations
- [ ] Verify soft delete behavior

## File Structure Summary

```
/admin/src/
├── services/
│   └── account.service.ts
├── types/
│   └── dto/
│       └── accounts.ts
├── features/
│   └── accounts/
│       ├── AccountList.tsx
│       ├── AccountCreate.tsx
│       ├── AccountEdit.tsx
│       ├── AccountDetails.tsx
│       ├── AccountDashboard.tsx
│       ├── AccountRelationships.tsx
│       ├── AccountBulkActions.tsx
│       └── AccountFilters.tsx
└── components/
    └── accounts/
        └── AccountSelector.tsx
```

## Implementation Order (Recommended)

1. **Day 1**: Service layer, types, navigation update
2. **Day 2**: List view and basic CRUD forms
3. **Day 3**: Details view and dashboard
4. **Day 4**: Relationship management
5. **Day 5**: Testing and refinement

## Design Patterns to Follow

- Use existing patterns from Products module
- Maintain consistent Tailwind styling (blue for primary, never indigo)
- Follow existing response handling patterns
- Use React Query for data fetching
- Implement toast notifications for user feedback
- Follow existing form validation patterns
- Use existing modal/dialog components

## Notes

- Backend is fully functional - focus on UI implementation
- Response format differs between list (wrapped) and get by ID (direct)
- Soft delete is already implemented - just hide deleted items
- Statistics endpoint provides pre-calculated metrics
- Use existing authentication flow with JWT tokens

## Success Criteria

- [ ] All CRUD operations working smoothly
- [ ] Parent/subsidiary relationships manageable
- [ ] Statistics dashboard showing real-time data
- [ ] Responsive design working on all devices
- [ ] Error handling implemented throughout
- [ ] Loading states for all async operations
- [ ] Toast notifications for all user actions
- [ ] Navigation properly highlights active section