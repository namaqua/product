## Project Context

I'm working on a PIM (Product Information Management) system with the following specifications:

**Project Paths:**
- Project Root: `/Users/colinroets/dev/projects/product/` (Monorepo)
- Backend: `/Users/colinroets/dev/projects/product/pim` (NestJS)
- Frontend: `/Users/colinroets/dev/projects/product/pim-admin` (React + Tailwind)
- Documentation: `/Users/colinroets/dev/projects/product/pimdocs`
- Shell Scripts: `/Users/colinroets/dev/projects/product/shell-scripts/` (local only, not in Git)
- GitHub Repository: `git@github.com:namaqua/product.git`

**Technology Stack:**
- Backend: NestJS, PostgreSQL, TypeORM, JWT auth
- Frontend: React, TypeScript, Tailwind CSS v3.4, Vite
- Database: PostgreSQL in Docker (port 5433) - pim_dev, pim_test databases
- Infrastructure: Docker Compose for local development
- Deployment Target: DigitalOcean
- Constraint: Open source tools only, avoid over-engineering

## Current Status (as of September 11, 2025 - 14:40 CEST)

**Backend Core: 100% COMPLETE** ✅
- Monorepo structure at `/Users/colinroets/dev/projects/product/`
- Backend running at http://localhost:3010 with **66+ API endpoints**
- Frontend running at http://localhost:5173
- PostgreSQL running in Docker container on port 5433
- Redis available in Docker on port 6380 (optional)
- All core backend modules implemented with new API standards
- Git repository pushed to GitHub

**Frontend Status: 70% COMPLETE** 
- ✅ Authentication flow working (JWT tokens properly sent)
- ✅ Product Management UI (List, Create, Edit, Details - all working)
- ✅ Product Duplicate feature (frontend implementation)
- ✅ Product Archive/Unarchive feature
- ✅ Category Management UI (Tree view with CRUD, drag-drop)
- ✅ Routing fixed (no more redirect issues)
- ✅ All debug elements removed (clean UI)
- ✅ URL slug editing with auto-generate
- ✅ **Media/File Upload (COMPLETE - September 11, 2025)**
  - MediaUpload component with drag & drop
  - Gallery with primary image selection
  - Lightbox viewer for full-size images
  - Integration in ProductEdit and ProductDetails
  - Real images working (fixed black square issue)
- ⏳ Attribute Management UI (not started)
- ⏳ User Management UI (not started)

**Recent Fixes (September 11, 2025 - 14:40):**
- ✅ Fixed Media display issues (were test images, now using real images)
- ✅ MediaUpload component fully integrated
- ✅ Image gallery with lightbox in ProductDetails
- ✅ Media management in ProductEdit
- ✅ Proper URL generation for media files
- ✅ Static file serving verified and working

## Working Credentials

**Admin User:**
- Email: `admin@test.com`
- Password: `Admin123!`
- Role: admin

**Additional Users in Database:**
- `admin@example.com` (admin role)
- `product-test@example.com` (manager role)

## Backend API Standards

**Response Structure (Wrapped Format):**
```json
{
    "success": true,
    "data": {
        // Actual response data here
    },
    "timestamp": "2025-09-11T19:35:12.806Z"
}
```

**Collection Response Format:**
```json
{
    "success": true,
    "data": {
        "items": [...],
        "meta": {
            "totalItems": 100,
            "itemCount": 20,
            "itemsPerPage": 20,
            "totalPages": 5,
            "currentPage": 1
        }
    }
}
```

**Action Response Format (POST/PUT/DELETE):**
```json
{
    "success": true,
    "data": {
        "item": { /* created/updated/deleted entity */ },
        "message": "Product created successfully"
    }
}
```

## Backend Modules Summary

| Module | Endpoints | Status | Key Features |
|--------|-----------|--------|--------------|
| **Auth** | 8 | ✅ Complete | JWT with refresh tokens, role guards |
| **Users** | 9 | ✅ Complete | CRUD, role management, profile |
| **Products** | 11 | ✅ Complete | CRUD, variants, bulk ops, archive |
| **Categories** | 15+ | ✅ Complete | Nested set, tree ops, drag-drop |
| **Attributes** | 14 | ✅ Complete | EAV pattern, 13 types, groups |
| **Media** | 9 | ✅ Complete | Upload, gallery, associations |

## Frontend Components Summary

| Component | Features | Status |
|-----------|----------|--------|
| **Auth** | Login, Logout, Protected Routes, Token Management | ✅ Complete |
| **Product List** | DataTable, Search, Pagination, Actions | ✅ Complete |
| **Product Create** | Form with react-hook-form, Zod validation | ✅ Complete |
| **Product Edit** | Update form, URL slug edit, Media upload | ✅ Complete |
| **Product Details** | Full view, Gallery, Lightbox, All actions | ✅ Complete |
| **Category Management** | Tree view, CRUD, Drag-drop | ✅ Complete |
| **Media Upload** | Drag-drop, Progress, Gallery, Primary selection | ✅ Complete |
| **Attribute Management** | - | ⏳ Not started |
| **User Management** | - | ⏳ Not started |

## Critical Field Mappings (Frontend → Backend)

**Product Fields:**
- Use `quantity` (NOT `inventoryQuantity`)
- Use `urlKey` (NOT `slug`)
- Use `isFeatured` (NOT `featured`)
- Use `specialPrice` (NOT `compareAtPrice`)
- Use lowercase enums: `'draft'`, `'simple'`, `'published'`, `'archived'`
- Backend has `forbidNonWhitelisted: true` - only send valid fields

**Media Fields:**
- URL field contains full URLs (http://localhost:3010/uploads/...)
- Use `mediaService.getMediaUrl()` helper for URL handling
- Primary image marked with `isPrimary: true`

## Known Issues

1. **Refresh Token Endpoint** 🔴
   - `/auth/refresh` returns 401 Unauthorized
   - Need to implement proper refresh token handling in backend
   - Affects session persistence after token expiry

2. **Categories/Attributes in Product Response** 🟡
   - GET `/products/{id}` returns null for categories and attributes
   - Backend API enhancement needed (requires discussion)
   - Currently showing "No categories/attributes assigned"

3. **Product Variants UI** 🟡
   - Backend supports variants but no UI
   - Need variant creation/edit forms

## Quick Start Commands

```bash
# Start everything
cd /Users/colinroets/dev/projects/product
docker-compose up -d                    # Start PostgreSQL & Redis
cd engines && npm run start:dev            # Start backend (port 3010)
cd ../admin && npm run dev         # Start frontend (port 5173)

# Test scripts (all in shell-scripts/)
./test-auth-token.sh                   # Test JWT token flow
./test-products-fix.sh                 # Test product endpoints
./test-media-api.sh                    # Test media endpoints
./test-product-media-display.sh        # Test media display
./fix-test-images.sh                   # Upload real test images

# Debug in browser console
debugAuth()                             # Check auth state and tokens
localStorage.getItem('access_token')   # View stored token

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3010/api/v1
# API Docs: http://localhost:3010/api/docs
# Login: admin@test.com / Admin123!
```

## Next Priority Tasks

### Immediate (Current Sprint)
1. **Build Attribute Management UI** 🔴
   - List attributes with DataTable
   - Create/Edit forms with type-specific fields
   - Attribute groups/sets management
   - Value management for select types

2. **User Management UI** 🟡
   - User list with search/filter
   - Create/Edit user forms
   - Role assignment interface
   - Password reset functionality

3. **Dashboard Enhancement** 🟡
   - Connect to real APIs
   - Product statistics
   - Recent activities
   - Quick actions

### Next Sprint
1. **Product Variants UI**
2. **Bulk Operations Interface**
3. **Advanced Search & Filtering**
4. **Import/Export UI**
5. **Reporting Dashboard**

## Documentation Files

All documentation is in `/Users/colinroets/dev/projects/product/docs/`:
1. **README.md** - Main documentation index
2. **PROJECT_INSTRUCTIONS.md** - Project setup and standards
3. **NEXT_STEPS.md** - Current action items
4. **LEARNINGS.md** - Important gotchas and solutions
5. **CONTINUITY_PROMPT.md** - This file (Updated Sept 11, 2025 - 14:40)
6. **PIM_API_STANDARDS_AI_REFERENCE.md** - API response formats
7. **FRONTEND_API_UPDATE_STATUS.md** - Frontend service status
8. **TASKS.md** - Complete task list (Updated Sept 11, 2025 - 14:40)
9. **API_STANDARDIZATION_PLAN.md** - API standardization guide

## Important Notes

- **CRITICAL: Backend API and DTOs are SACROSANCT** - Do NOT change backend APIs or DTOs. The frontend must adapt to the backend structure. If backend changes seem necessary, ASK FIRST before suggesting any modifications.
- **Shell Scripts:** Always save in `/Users/colinroets/dev/projects/product/shell-scripts/`
- **Backend Port:** 3010 (avoid conflicts)
- **Database Port:** 5433 (Docker PostgreSQL)
- **API Prefix:** `/api/v1` (configured globally)
- **Debug Utility:** Type `debugAuth()` in browser console to check auth state
- **Always use Incognito Mode** when testing auth changes to avoid cache issues
- **Media Files:** Stored in `/uploads/` directory, served statically

## Session Request Format

When starting a new session, provide:
1. What you want to work on
2. Any issues from previous session
3. Current priority

Example:
"Continue PIM project. Media management is complete with working image display. Need to implement Attribute Management UI next. All backend endpoints are ready."

## Current Focus

✅ **COMPLETED TODAY (Sept 11, 14:40):** 
- Fixed Media display issues (replaced test images with real ones)
- Completed MediaUpload component integration
- Added image gallery with lightbox to ProductDetails
- Integrated media management in ProductEdit
- Verified static file serving and URL generation

🎯 **NEXT PRIORITIES:** 
- Build Attribute Management UI (backend ready)
- Create User Management UI (backend ready)
- Enhance Dashboard with real data

📊 **Progress:** 70% overall (Frontend catching up to backend)

## Key Debugging Tools

```javascript
// Browser console commands
debugAuth()                          // Check full auth state
localStorage.getItem('access_token') // View JWT token
localStorage.clear()                 // Clear all stored data

// Shell scripts for testing
./test-auth-token.sh                // Test authentication
./test-products-fix.sh              // Test product CRUD
./test-media-api.sh                 // Test media endpoints
./fix-test-images.sh                // Upload real test images
```

## Latest State Summary

The PIM system is now in a stable state with:
- ✅ All authentication issues resolved
- ✅ Product management fully functional (List, Create, Edit, Details)
- ✅ Product actions complete (Edit, Duplicate, Archive, Delete)
- ✅ Category management with tree operations
- ✅ Media management with working image display
- ✅ Clean UI with professional notifications
- ✅ Proper field mappings throughout
- ✅ URL slug management with auto-generate
- ✅ Attribute UI not started
- ✅ User Management UI not started

The system is ready for Attribute Management UI implementation as the next major feature.