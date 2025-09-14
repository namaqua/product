# PIM Project - Streamlined Continuity Prompt

## Quick Reference
- **Project**: `/Users/colinroets/dev/projects/product/`
- **Backend**: `/engines` (NestJS, port 3010) 
- **Frontend**: `/admin` (React + Tailwind, port 5173)
- **Database**: PostgreSQL Docker (port 5433)
- **Status**: Core features 98% complete, Variants ✅ COMPLETE

## Start Commands
```bash
cd /Users/colinroets/dev/projects/product
docker-compose up -d
cd engines && npm run start:dev
cd ../admin && npm run dev
# Login: admin@test.com / Admin123!
```

## Current State (December 12, 2024)
### ✅ Completed Modules (Production Ready)
- **Auth**: JWT with refresh tokens, role-based access
- **Products**: Full CRUD, 66+ endpoints
- **Categories**: Nested set model, drag-drop tree UI
- **Attributes**: 13 types, EAV pattern, groups
- **Media**: Upload, gallery, lightbox, associations
- **Users**: Full management, roles, bulk operations
- **Dashboards**: Dual dashboard with charts & metrics
- **✅ VARIANTS**: Multi-axis generation, matrix view, templates (COMPLETE Dec 12)

### 🚀 Next Priority: Import/Export System
**Timeline**: Week 1 (Dec 12-19)
- CSV/Excel import for products
- Bulk variant import
- Export with filters
- Template downloads
- Import mapping UI

### 🔄 Active Development Queue
1. **Import/Export** (5 days) - Starting now
2. **Advanced Search** (5 days) - Elasticsearch, faceted search
3. **Bulk Operations UI** (4 days) - Bulk editor, mass assignments
4. **Workflow Engine** (4 days) - Approvals, notifications

## Variant System Summary (COMPLETE)
```typescript
// Backend: All methods implemented
✅ createVariantGroup()
✅ getVariantGroup()
✅ generateVariants()
✅ updateVariant()
✅ bulkUpdateVariants()
✅ syncVariantInventory()
✅ dissolveVariantGroup()
✅ getVariantMatrix()
✅ searchVariants()

// Frontend: All components built
✅ VariantWizard - Multi-axis creation
✅ VariantMatrix - Grid view editor
✅ TemplateManager - 30+ templates
✅ variant.service - Full API integration
```

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
- `variantAxes` (for variant combinations)
- Status values: `'draft'`, `'published'`, `'archived'` (lowercase)

## Known Issues
- Refresh token endpoint returns 401 (auth guard conflict)
- Categories/attributes null in some product responses
- Large file uploads timeout (>50MB)

## Key Documentation
- **Variant Docs**: `/docs/VARIANT_IMPLEMENTATION_CONTINUATION.md` ✅
- **Task Tracking**: `/docs/TASKS.md`
- **Setup Guide**: `/docs/PROJECT_INSTRUCTIONS.md`
- **API Standards**: `/docs/API_STANDARDS.md`

## Database Migration Commands
```bash
# Create new migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Import/Export Sprint Plan (Current)
**Week 1 Goals:**
1. CSV parser integration (Papa Parse)
2. Import mapping interface
3. Validation layer
4. Product import endpoint
5. Variant bulk import
6. Export with filters
7. Template system

## Development Principles
- Backend is sacrosanct - adapt frontend to match
- Avoid over-engineering - simple solutions first
- Follow existing patterns from other modules
- Maintain API response standardization
- Use open source tools only
- Shell scripts go in `/shell-scripts/` (not tracked in Git)

## Quick Test Endpoints
```bash
# Test auth
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'

# Get products with variants
curl http://localhost:3010/api/products?includeVariants=true \
  -H "Authorization: Bearer TOKEN"

# Get variant matrix
curl http://localhost:3010/api/products/PRODUCT_ID/variants/matrix \
  -H "Authorization: Bearer TOKEN"
```

## Next Session Checklist
1. Check Docker status: `docker ps`
2. Verify services running: `pm2 list` or check terminals
3. Review `/docs/TASKS.md` for current priorities
4. Check git status: `git status`
5. Run any pending migrations

---
*Updated: December 12, 2024 | Version: 4.0 | Priority: Import/Export System*