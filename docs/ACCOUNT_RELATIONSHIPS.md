# Account Relationship Management

## Overview
The Account Relationship Management system provides comprehensive tools for managing parent-subsidiary relationships between accounts and assigning users as account managers. This system works entirely with the existing backend structure without requiring any modifications.

## Features Implemented

### 1. Account Selector Component
**Location:** `/admin/src/components/accounts/AccountSelector.tsx`

A reusable dropdown component for selecting accounts with:
- Search functionality
- Type-ahead filtering
- Account type and size display
- Ability to exclude specific accounts
- Clear button functionality
- Loading states

**Usage Example:**
```tsx
<AccountSelector
  value={selectedAccountId}
  onChange={setSelectedAccountId}
  label="Parent Account"
  placeholder="Select an account..."
  excludeIds={[currentAccountId]} // Exclude specific accounts
  clearable={true}
/>
```

### 2. Account Relationships Manager
**Location:** `/admin/src/features/accounts/AccountRelationships.tsx`
**Route:** `/accounts/relationships`

Comprehensive interface for managing parent-subsidiary relationships:

#### Features:
- **Tree View**: Hierarchical display of account relationships
  - Expandable/collapsible nodes
  - Visual hierarchy with indentation
  - Shows subsidiary count for each parent
  - Click to select accounts for management

- **List View**: Alternative flat view of relationships
  - Groups parent accounts with their subsidiaries
  - Quick access to view and remove relationships

- **Actions Panel**: 
  - Add subsidiary to selected account
  - Remove parent relationship
  - View account details
  - Edit account

- **Statistics Panel**:
  - Total accounts count
  - Parent accounts count
  - Subsidiary accounts count

#### How It Works:
1. Select an account from the tree or list
2. Use the Actions panel to:
   - Add new subsidiaries (excludes current descendants)
   - Remove parent relationships
   - Navigate to account details

### 3. User Account Assignment Manager
**Location:** `/admin/src/features/accounts/UserAccountAssignment.tsx`
**Route:** `/accounts/user-assignments`

Manages which users are assigned as account managers:

#### Features:
- **Two View Modes**:
  1. **By Users**: Shows users and their managed accounts
  2. **By Accounts**: Shows accounts and their assigned managers

- **User View Features**:
  - Search users by name or email
  - See count of accounts each user manages
  - Quick assignment of accounts to users
  - Remove user from accounts

- **Account View Features**:
  - Table view of all accounts
  - Shows current account manager
  - Quick assignment/removal of managers

- **Statistics Dashboard**:
  - Total users count
  - Total accounts count
  - Assigned accounts count
  - Unassigned accounts count

#### How It Works:
The system uses the existing `accountManagerId` field in accounts:
- Each account can have ONE account manager (user)
- Users can manage MULTIPLE accounts
- Assignment is done by updating the account's `accountManagerId`

### 4. Enhanced Account Forms
Updated both AccountCreate and AccountEdit components:

#### Parent Account Selection:
- Replaced text input with AccountSelector dropdown
- Search and select parent accounts
- Automatic exclusion of invalid options (self, descendants)
- Clear visual feedback

#### Information Notices:
- Added helpful blue info boxes explaining relationships
- Clear instructions about currency behavior
- Warnings about non-converting currency changes

## Navigation Structure

The Account Engine section in the navigation now includes:
1. **Dashboard** - Statistics and overview
2. **Accounts** - List and manage accounts
3. **Relationships** - Parent/subsidiary management
4. **User Assignments** - User-account assignments

## Technical Implementation

### Data Flow:
1. **Relationships**: Uses `parentAccountId` field in accounts
2. **User Assignments**: Uses `accountManagerId` field in accounts
3. **No Backend Changes**: Works entirely with existing API structure

### Components Created:
```
/admin/src/
├── components/
│   └── accounts/
│       └── AccountSelector.tsx         # Reusable account selector
└── features/
    └── accounts/
        ├── AccountRelationships.tsx    # Relationship manager
        └── UserAccountAssignment.tsx   # User assignment manager
```

### Routes Added:
- `/accounts/relationships` - Relationship management interface
- `/accounts/user-assignments` - User assignment interface

## Usage Guide

### Managing Parent-Subsidiary Relationships

#### Adding a Subsidiary:
1. Navigate to Account Relationships
2. Select the parent account from tree/list
3. Click "Add Subsidiary" in Actions panel
4. Select the account to make subsidiary
5. Click "Add" to confirm

#### Removing a Parent Relationship:
1. Select the subsidiary account
2. Click "Remove Parent" in Actions panel
3. Account becomes a root-level account

#### Creating Relationships During Account Creation:
1. In AccountCreate form, go to Relationships tab
2. Use the Parent Account dropdown to select parent
3. Save the account

### Managing User Assignments

#### Assigning a User to an Account:
1. Navigate to User Assignments
2. In "By Users" view, select a user
3. Use the Account selector to choose an account
4. Click "Assign to Account"

#### Removing a User from an Account:
1. Find the account in either view
2. Click the remove/trash icon
3. Assignment is immediately removed

#### Viewing User's Accounts:
1. Switch to "By Users" view
2. Each user card shows their managed accounts
3. Count badge shows total accounts managed

## Limitations & Considerations

### Current Limitations:
1. **One Manager Per Account**: Each account can only have one account manager
2. **No Multi-Level Permissions**: All managers have same access level
3. **No Bulk Operations**: Assignments are one-at-a-time
4. **No History Tracking**: Changes aren't logged

### Future Enhancements (Would Require Backend Changes):
1. **Multiple Managers**: Allow multiple users per account
2. **Role-Based Access**: Different permission levels for managers
3. **Assignment History**: Track who assigned/removed users
4. **Bulk Operations**: Assign multiple accounts at once
5. **Team Assignments**: Assign teams instead of individuals

## Best Practices

### For Relationships:
1. Establish clear hierarchy before creating accounts
2. Avoid circular relationships (backend prevents this)
3. Use meaningful names for parent accounts
4. Keep hierarchy depth reasonable (3-4 levels max)

### For User Assignments:
1. Assign managers based on expertise/region
2. Balance account load across users
3. Review unassigned accounts regularly
4. Update assignments when users leave

## Testing the Features

### Test Relationship Management:
```bash
1. Create parent account "ACME Corp"
2. Create child account "ACME West"
3. Go to Relationships, verify tree shows hierarchy
4. Add another subsidiary "ACME East"
5. Remove parent from "ACME East"
6. Verify it becomes root account
```

### Test User Assignments:
```bash
1. Go to User Assignments
2. Select a user
3. Assign them to an account
4. Switch to "By Accounts" view
5. Verify assignment shows correctly
6. Remove assignment
7. Verify statistics update
```

## Troubleshooting

### Common Issues:

#### Can't select account as parent:
- Account may be excluded (is child of current)
- Account may be inactive
- Search may be too restrictive

#### User assignment not showing:
- Refresh the page
- Check if user is active
- Verify account exists

#### Tree not expanding:
- Check browser console for errors
- Verify accounts have correct parentAccountId
- Try refreshing the page

## Conclusion

The Account Relationship Management system provides a robust, user-friendly interface for managing complex account hierarchies and user assignments without requiring any backend modifications. The system leverages existing data structures while providing modern UI components for efficient management.
