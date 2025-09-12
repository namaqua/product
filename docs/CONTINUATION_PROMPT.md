# PIM Project Continuation Prompt

Copy and paste this prompt to continue the PIM project in a new chat:

---

## Continue PIM Project Development

I'm working on a Product Information Management (PIM) system with these specifications:
- **Framework:** NestJS backend with PostgreSQL
- **Frontend:** React with TypeScript, Vite, TailwindCSS, Zustand
- **Database:** PostgreSQL on port 5433 (Docker)
- **Project Root:** `/Users/colinroets/dev/projects/product`
- **Backend:** `/engines` (port 3010)
- **Frontend:** `/admin` (port 5173)
- **Deployment Target:** DigitalOcean
- **Constraint:** Open source tools only, avoid over-engineering

## Current Status (Sept 12, 2025)

### ✅ Completed (98%)
- **Backend:** 66+ endpoints across all modules
- **Frontend:** All core UIs functional
- **Modules:** Products, Categories, Attributes, Media, Users, Auth
- **Features:** Dashboards with charts, drag-drop categories, media gallery
- **Working:** Full CRUD, role-based auth, file uploads

### 🔧 Active Priority: Product Variants
- **Current:** Basic ProductVariants.tsx exists (40% complete)
- **Missing:** Backend variant endpoints (0% complete)
- **Plan:** `/docs/VARIANT_IMPLEMENTATION_CONTINUATION.md`
- **Timeline:** 2 weeks to completion

## 🎯 Today's Focus: Variant Backend Implementation

### Step 1: Database Migration
Create migration to add variant fields to products table:
- variantAxes (JSONB)
- variantAttributes (JSONB)
- variantGroupId (string)
- inheritedAttributes (boolean)

### Step 2: Create DTOs
In `engines/src/modules/products/dto/variants/`:
- create-variant-group.dto.ts
- update-variant.dto.ts
- bulk-variant-update.dto.ts
- generate-variants.dto.ts

### Step 3: Service Methods
Add to ProductsService:
- createVariantGroup()
- generateVariants()
- bulkUpdateVariants()
- validateVariantAxes()

### Step 4: Controller Endpoints
- POST /products/:id/variants/group
- GET /products/:id/variants
- POST /products/:id/variants/generate
- PUT /products/:id/variants/bulk

## 🚀 Quick Start Commands

```bash
# Start everything
cd /Users/colinroets/dev/projects/product
docker-compose up -d
cd engines && npm run start:dev
cd ../admin && npm run dev

# Login: admin@test.com / Admin123!
```

## API Response Format
All responses follow this structure:
```typescript
{
  success: boolean,
  message: string,
  data: T | { items: T[], meta: {...} },
  timestamp: string
}
```

## Field Conventions
- Use `quantity` (not inventoryQuantity)
- Use `urlKey` (not slug)
- Use `isFeatured` (not featured)
- Status: 'draft' | 'published' | 'archived' (lowercase)

## Known Issues
- Refresh token returns 401 (auth guard conflict)
- Categories/attributes sometimes null in responses

## 📚 Key Documentation
- **Variant Plan:** `/docs/VARIANT_IMPLEMENTATION_CONTINUATION.md`
- **API Standards:** `/docs/API_STANDARDS.md`
- **Tasks:** `/docs/TASKS.md`
- **Quick Reference:** `/docs/QUICK_REFERENCE.md`

## Current Task
Please help me implement the variant backend starting with the database migration.

---

*Priority: Complete Product Variants to reach 100% MVP*
*Backend is sacrosanct - adapt frontend to match*