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

## Current Status (as of January 10, 2025)

**Backend Core: 100% COMPLETE** ✅
- Monorepo structure at `/Users/colinroets/dev/projects/product/`
- Backend running at http://localhost:3010 with **54 API endpoints**
- Frontend running at http://localhost:5173
- PostgreSQL running in Docker container on port 5433
- Redis available in Docker on port 6380 (optional)
- All core backend modules implemented with new API standards
- Git repository pushed to GitHub

**Frontend Status: 60% COMPLETE** 
- ✅ Authentication flow working (JWT tokens properly sent)
- ✅ Product Management UI (List, Create, Edit - all forms fixed)
- ✅ Category Management UI (Tree view with CRUD, drag-drop)
- ✅ Routing fixed (no more redirect issues)
- ✅ All debug elements removed (clean UI)
- 🔄 Product Details View (basic version, needs enhancement)
- ⏳ Attribute Management UI (not started)
- ⏳ Media/File Upload (not implemented)
- ⏳ User Management UI (not started)

**Recent Fixes (January 10, 2025):**
- ✅ Fixed ProductCreate duplicate handleSubmit error
- ✅ Fixed authentication 401 errors (tokens now sent properly)
- ✅ Fixed routing issues (pages loading wrong components)
- ✅ Fixed auth store hydration race condition
- ✅ Removed all debug UI elements (colored banners, diagnostic box)
- ✅ Added debugAuth() utility for console debugging

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
    "timestamp": "2025-01-10T19:35:12.806Z"
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

## Frontend Components Summary

| Component | Features | Status |
|-----------|----------|--------|
| **Auth** | Login, Logout, Protected Routes, Token Management | ✅ Complete |
| **Product List** | DataTable, Search, Pagination, Actions | ✅ Complete |
| **Product Create** | Form with react-hook-form, Zod validation | ✅ Complete |
| **Product Edit** | Update form with field mappings | ✅ Complete |
| **Product Details** | Basic view with delete action | 🔄 Basic (needs enhancement) |
| **Category Management** | Tree view, CRUD, Drag-drop | ✅ Complete |
| **Attribute Management** | - | ⏳ Not started |
| **Media Upload** | - | ⏳ Not started |
| **User Management** | - | ⏳ Not started |

## Known Issues

1. **Refresh Token Endpoint** 🔴
   - `/auth/refresh` returns 401 Unauthorized
   - Need to implement proper refresh token handling in backend
   - Affects session persistence after token expiry

2. **Media Upload** 🔴
   - No file upload functionality
   - Need multer configuration in backend
   - No image preview in product forms

3. **Product Variants UI** 🟡
   - Backend supports variants but no UI
   - Need variant creation/edit forms

## Critical Configuration Details

**Product DTO Field Names (Fixed):**
- Use `isFeatured` (boolean)
- Use `manageStock` (boolean)
- Use `isVisible` (boolean)
- Use `specialPrice` for sale price
- Use lowercase enums: `'draft'`, `'simple'`
- Backend has `forbidNonWhitelisted: true`

**API Service Configuration:**
- Token stored in localStorage as `access_token`
- Bearer token added to all API requests
- Token manager handles storage/retrieval
- API interceptor handles 401 responses

**Database Configuration:**
- PostgreSQL on port 5433 (not default 5432)
- Database: pim_dev
- Use camelCase columns with quotes: `"isDeleted"`, `"isFeatured"`

## Quick Start Commands

```bash
# Start everything
cd /Users/colinroets/dev/projects/product
docker-compose up -d                    # Start PostgreSQL & Redis
cd pim && npm run start:dev            # Start backend (port 3010)
cd ../pim-admin && npm run dev         # Start frontend (port 5173)

# Test authentication
cd /Users/colinroets/dev/projects/product/shell-scripts
./test-auth-token.sh                   # Test JWT token flow
./test-products-fix.sh                 # Test product endpoints

# Debug in browser console
debugAuth()                             # Check auth state and tokens
localStorage.getItem('access_token')   # View stored token

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3010/api/v1
# Login: admin@test.com / Admin123!
```

## Next Priority Tasks

### Immediate (Current Sprint)
1. **Enhance Product Details View** 🔴
   - Add comprehensive data display
   - Image gallery placeholder
   - Category badges
   - Attribute display
   - Action buttons (Edit, Delete, Duplicate)

2. **Implement Media Upload** 🔴
   - Add multer to backend
   - Create upload endpoints
   - Add image upload to product forms
   - Implement image preview

3. **Build Attribute Management UI** 🟡
   - List attributes with DataTable
   - Create/Edit forms
   - Type-specific field handling
   - Attribute sets

### Next Sprint
1. **User Management UI**
2. **Dashboard with Real Data**
3. **Bulk Operations**
4. **Import/Export UI**

## Documentation Files

All documentation is in `/Users/colinroets/dev/projects/product/pimdocs/`:
1. **README.md** - Main documentation index
2. **PROJECT_INSTRUCTIONS.md** - Project setup and standards
3. **NEXT_STEPS.md** - Current action items (Updated Jan 10, 2025)
4. **LEARNINGS.md** - Important gotchas and solutions
5. **CONTINUITY_PROMPT.md** - This file (Updated Jan 10, 2025)
6. **PIM_API_STANDARDS_AI_REFERENCE.md** - API response formats
7. **FRONTEND_API_UPDATE_STATUS.md** - Frontend service status

## Important Notes

- **Shell Scripts:** Always save in `/Users/colinroets/dev/projects/product/shell-scripts/`
- **Backend Port:** 3010 (avoid conflicts)
- **Database Port:** 5433 (Docker PostgreSQL)
- **API Prefix:** `/api/v1` (configured globally)
- **Debug Utility:** Type `debugAuth()` in browser console to check auth state
- **Always use Incognito Mode** when testing auth changes to avoid cache issues

## Session Request Format

When starting a new session, provide:
1. What you want to work on
2. Any issues from previous session
3. Current priority

Example:
"Continue PIM project. Authentication and routing are fixed. Need to enhance Product Details View and implement media upload. All backend endpoints are ready."

## Current Focus

✅ **COMPLETED TODAY (Jan 10):** 
- Fixed ProductCreate duplicate handleSubmit
- Fixed authentication 401 errors
- Fixed routing issues
- Removed debug UI elements
- All forms working with correct field mappings

🎯 **NEXT PRIORITIES:** 
- Enhance Product Details View
- Implement Media Upload
- Build Attribute Management UI

📊 **Progress:** 60% overall (Frontend catching up to backend)

## Key Debugging Tools

```javascript
// Browser console commands
debugAuth()                          // Check full auth state
localStorage.getItem('access_token') // View JWT token
localStorage.clear()                 // Clear all stored data

// Shell scripts for testing
./test-auth-token.sh                // Test authentication
./test-products-fix.sh              // Test product CRUD
./test-category-ui-integration.sh   // Test categories
```

## Latest State Summary

The PIM system is now in a stable state with:
- ✅ All authentication issues resolved
- ✅ Product management fully functional (List, Create, Edit)
- ✅ Category management with tree operations
- ✅ Clean UI without debug elements
- ✅ Proper token management and API communication
- 🔄 Basic Product Details (needs enhancement)
- ⏳ Media upload not implemented
- ⏳ Attribute UI not started

The system is ready for continued feature development with a solid foundation in place.
