# PIM Project - Streamlined Continuity Prompt

## Quick Reference
- **Project**: `/Users/colinroets/dev/projects/product/`
- **Backend**: `/engines` (NestJS, port 3010) 
- **Frontend**: `/admin` (React + Tailwind, port 5173)
- **Database**: PostgreSQL Docker (port 5433)
- **Status**: Core features 98% complete

## Start Commands
```bash
cd /Users/colinroets/dev/projects/product
docker-compose up -d
cd engines && npm run start:dev
cd ../admin && npm run dev
# Login: admin@test.com / Admin123!
```

## Current State (Sept 12, 2025)
### ✅ Core Modules Complete
- **Backend**: 66+ endpoints across all modules
- **Auth**: JWT with refresh tokens, role-based access
- **Products**: Full CRUD, basic variants, duplicate, archive
- **Categories**: Nested set model, drag-drop tree UI
- **Attributes**: 13 types, EAV pattern, groups, options
- **Media**: Upload, gallery, lightbox, product associations
- **Users**: Full management, roles, bulk operations
- **Dashboards**: Dual dashboard system with charts & metrics

### 🔧 Active Development: Product Variants
- **Frontend**: 40% complete (basic UI exists)
- **Backend**: 0% complete (needs implementation)
- **Plan**: `/docs/VARIANT_IMPLEMENTATION_CONTINUATION.md`
- **Timeline**: 2 weeks to completion

### 🚧 Remaining Features
- Advanced variant UI (wizard, matrix view)
- Import/Export functionality
- Bulk operations interface
- Advanced search & filtering

## API Response Standards
```typescript
// All endpoints follow this pattern:
{
  success: boolean,
  message: string,
  data: T | { items: T[], meta: {...} },
  timestamp: string
}
```

## Field Naming Conventions
- `quantity` (not inventoryQuantity)
- `urlKey` (not slug)
- `isFeatured` (not featured)
- Status values: `'draft'`, `'published'`, `'archived'` (lowercase)

## Known Issues
- Refresh token endpoint returns 401 (auth guard conflict)
- Categories/attributes null in some product responses

## Key Documentation
- **Variant Plan**: `/docs/VARIANT_IMPLEMENTATION_CONTINUATION.md`
- **Setup Guide**: `/docs/PROJECT_INSTRUCTIONS.md`
- **API Standards**: `/docs/API_STANDARDS.md`
- **Task Tracking**: `/docs/TASKS.md`

## Next Sprint Focus
Implementing Product Variants Backend (Week 1):
1. Database migration for variant fields
2. Create variant DTOs (6 files)
3. Implement service methods (12+)
4. Add controller endpoints (10+)
5. Test with Postman

Then Frontend Enhancement (Week 2):
1. Variant Creation Wizard
2. Matrix View for bulk editing
3. Integration with ProductEdit

## Development Principles
- Backend is sacrosanct - adapt frontend to match
- Avoid over-engineering - simple solutions first
- Follow existing patterns from other modules
- Maintain API response standardization
- Use open source tools only

---
*Updated: Sept 12, 2025 | Version: 3.0 | Priority: Variant Implementation*