# PIM Project Continuation Prompt

Copy and paste this prompt to continue the PIM project in a new chat:

---

## Continue PIM Project Development

I'm working on a Product Information Management (PIM) system with these specifications:
- **Framework:** NestJS backend with PostgreSQL
- **Frontend:** React with TypeScript, Vite, TailwindCSS, Zustand
- **Database:** PostgreSQL on port 5433 (Docker)
- **Docs Path:** `/Users/colinroets/dev/projects/product/pimdocs`
- **Project Root:** `/Users/colinroets/dev/projects/product`
- **Backend:** `/Users/colinroets/dev/projects/product/pim` (port 3010)
- **Frontend:** `/Users/colinroets/dev/projects/product/pim-admin` (port 5173)
- **Shell Scripts:** `/Users/colinroets/dev/projects/product/shell-scripts`

## Current Status

### ✅ Completed
1. **Backend (NestJS):**
   - Full REST API with 54 endpoints
   - JWT authentication with refresh tokens
   - Products, Categories, Attributes, Users modules
   - Nested Set Model for category hierarchy
   - TransformInterceptor wrapping all responses in `{success, data, timestamp}` structure
   - Role-based authorization (USER, MANAGER, ADMIN)
   - Running on port 3010 with path `/api/v1`

2. **Frontend (React):**
   - Authentication flow working (login/logout)
   - Product listing page with DataTable component
   - API service layer with Axios
   - Zustand stores for state management
   - TailwindCSS styling with dark mode support
   - Fixed response unwrapping to handle backend's wrapped structure

### 🔧 Just Fixed
- Products query error where `parentId IS NULL` was incorrectly handled
- Frontend now properly unwraps backend responses from `response.data.data`
- Login flow working with admin@test.com / Admin123!

### 📁 Key Files to Reference
- **Full instructions:** `/Users/colinroets/dev/projects/product/docs/PROJECT_INSTRUCTIONS.md`
- **Learnings:** `/Users/colinroets/dev/projects/product/docs/LEARNINGS.md` (CRITICAL - contains all gotchas and solutions)
- **Next Steps:** `/Users/colinroets/dev/projects/product/docs/NEXT_STEPS.md`
- **Backend Response Structure:** All responses wrapped in `{success: true, data: {...}, timestamp: "..."}`

## 🎯 Next Priority Tasks

### Task 1: Product Create/Edit Form
Build a comprehensive product form with:
- Dynamic fields based on product type (SIMPLE, CONFIGURABLE, VIRTUAL, BUNDLE)
- Category multi-select with tree view
- Attribute management
- Price and inventory fields
- SEO metadata section
- Form validation with react-hook-form + Zod

### Task 2: Category Management UI
- Tree view component with drag-and-drop
- CRUD operations with modals
- Bulk operations
- Visual hierarchy display

### Task 3: Fix Remaining Issues
- Product images/media upload
- Refresh token endpoint (currently returns 401)
- Product variants UI for configurable products

## 🚀 Quick Start Commands

```bash
# Start Docker containers
cd /Users/colinroets/dev/projects/product
docker-compose up -d

# Start backend (if not running)
cd /Users/colinroets/dev/projects/product/pim
npm run start:dev

# Start frontend (if not running)
cd /Users/colinroets/dev/projects/product/pim-admin
npm run dev

# Test if everything is working
cd /Users/colinroets/dev/projects/product/shell-scripts
./test-products-fix.sh
```

## ⚠️ Important Notes
1. Backend uses port 3010, PostgreSQL on 5433 (not default ports)
2. All API responses are wrapped - use `response.data.data` in frontend
3. Always check LEARNINGS.md for solutions to common issues
4. Shell scripts go in `/shell-scripts/` directory
5. Backend needs restart after module changes
6. Use quotes around camelCase columns in PostgreSQL queries

## Current Question/Task
Please help me build the product create/edit form component with proper validation and category selection.

---

*End of prompt - paste everything above into new chat*
