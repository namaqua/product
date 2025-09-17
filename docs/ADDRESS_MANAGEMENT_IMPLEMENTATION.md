# Address Management Implementation

## Overview
Added comprehensive postal address management to the PIM system, allowing multiple addresses per account with one default registered address.

## Database
- **Table**: `addresses`
- **Container**: `postgres-pim`
- **Database**: `pim_dev`
- **User**: `pim_user`

## Features Implemented

### Backend (NestJS)
- **Entity**: `/engines/src/modules/addresses/entities/address.entity.ts`
- **Service**: Full CRUD operations, default management, validation
- **Controller**: RESTful endpoints with Swagger documentation
- **DTOs**: Type-safe data transfer objects
- **Module**: Integrated into app.module.ts

### Frontend (React + Tailwind)
- **Component**: `/admin/src/features/accounts/AccountAddresses.tsx`
- **Route**: `/accounts/:id/addresses`
- **Features**:
  - Visual address cards grouped by type
  - Add/Edit/Delete addresses
  - Set default addresses
  - Address validation
  - Modal forms

### Address Types
- `registered` - Official registered business address
- `billing` - Billing address
- `shipping` - Shipping address  
- `warehouse` - Warehouse location
- `office` - Office location
- `other` - Other addresses

## Migration Scripts

Run these from `/Users/colinroets/dev/projects/product/shell-scripts/`:

### 1. Check Database Setup
```bash
chmod +x check-pim-database.sh
./check-pim-database.sh
```

### 2. Run Migration
```bash
chmod +x migrate-pim-addresses.sh
./migrate-pim-addresses.sh
```

This will:
- Create the `addresses` table
- Set up all indexes and constraints
- Migrate existing address data from accounts table
- Add foreign key relationships

## Usage

### Backend API Endpoints
- `GET /addresses/account/:accountId` - Get all addresses for an account
- `GET /addresses/:id` - Get specific address
- `POST /addresses` - Create new address
- `PATCH /addresses/:id` - Update address
- `DELETE /addresses/:id` - Delete address
- `POST /addresses/:id/set-default` - Set as default
- `POST /addresses/:id/validate` - Validate address

### Frontend UI
1. Navigate to any account detail page
2. Click "Manage Addresses" button
3. Add, edit, or delete addresses as needed
4. Set default addresses per type

## Key Features
- ✅ Multiple addresses per account
- ✅ One default address per type constraint
- ✅ Address validation tracking
- ✅ Usage statistics
- ✅ Business hours support
- ✅ Delivery instructions
- ✅ Contact details per address
- ✅ Geolocation support (lat/lng)
- ✅ Legacy data migration

## Account Entity Updates
The `Account` entity has been updated:
- Added `addresses` relationship (OneToMany)
- Legacy address fields marked as deprecated
- Helper methods: `getDefaultAddress()`, `getAddressesByType()`

## Important Notes
- Legacy address fields in accounts table are preserved but deprecated
- New addresses use the separate `addresses` table
- One default address per type is enforced via unique constraint
- Addresses are cascade deleted when account is deleted

## Next Steps After Migration
1. Restart backend: `cd engines && npm run start:dev`
2. Access admin portal
3. Test address management from any account page

## Troubleshooting

If migration fails:
1. Check Docker is running: `docker ps | grep postgres-pim`
2. Start if needed: `docker-compose up -d`
3. Verify credentials match docs/POSTGRES_DOCKER_QUICKREF.md
4. Check existing tables: `docker exec postgres-pim psql -U pim_user -d pim_dev -c "\dt"`

---
*Created: January 2025*
*Module: Address Management*
*Status: Complete*
