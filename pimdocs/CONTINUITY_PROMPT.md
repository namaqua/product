# PIM Project Continuity Prompt

Copy and paste this entire prompt when starting a new chat session:

---

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
- Database: PostgreSQL (pim_dev, pim_test databases created)
- Deployment Target: DigitalOcean
- Constraint: Open source tools only, avoid over-engineering

## Current Status (as of January 2025)

**Environment Setup: 80% COMPLETE**
- Monorepo structure at `/Users/colinroets/dev/projects/product/`
- Backend running at http://localhost:3010
- Frontend running at http://localhost:5173
- PostgreSQL databases created and connected
- Database health check endpoint working at `/health`
- Full admin UI with custom Navy & Orange theme
- Application branded as "Our Products" with cube icon
- Git repository initialized with GitHub remote

**Completed Tasks (14 of 94):**
- ✅ TASK-001: NestJS project initialized
- ✅ TASK-002: Backend dependencies installed
- ✅ TASK-003: PostgreSQL databases created
- ✅ TASK-004: Environment variables configured (.env files)
- ✅ TASK-005: Database configuration complete (TypeORM connected)
- ✅ TASK-006: React frontend initialized with Vite
- ✅ TASK-007: Tailwind CSS configured (v3.4.0)
- ✅ TASK-008: Tailwind components integrated
  - ApplicationShell (sidebar navigation)
  - Button, Modal, Notification components
  - DataTable with sorting/pagination
  - Full Dashboard page
- ✅ TASK-009: Frontend routing/state libraries installed
- ✅ TASK-010: Git repository initialized and pushed to GitHub
- ✅ TASK-011: ESLint and Prettier configured for both projects
- ✅ TASK-012: VS Code workspace configuration complete
- ✅ TASK-013: Base Entity classes created with audit fields and soft delete
  - BaseEntity with audit fields
  - SoftDeleteEntity with soft delete capability
  - AuditSubscriber for automatic tracking
  - Example Product entity
  - Tables auto-created by TypeORM
- ✅ TASK-014: User Entity and Auth Module - COMPLETE
  - User entity with authentication fields
  - JWT authentication with refresh tokens
  - Complete auth endpoints (register, login, logout, etc.)
  - Role-based access control (ADMIN, MANAGER, USER)
  - Protected routes with guards
  - Auto-active users for development (no email verification needed)
  - All endpoints tested and working
- ✅ UI Customization: Navy & Orange theme, "Our Products" branding

**Current Phase:** Phase 1 - Foundation (Week 1 of 4)
**Overall Progress:** 14.9% complete (14/94 tasks)
**Phase 1 Progress:** 44% complete (14/32 tasks)

## Recent Updates & Working Configuration

### Latest Changes (January 2025)
- ✅ All ESLint and Prettier issues resolved
- ✅ Shell scripts directory renamed from "shell scripts" to "shell-scripts" (no spaces)
- ✅ TypeScript types fixed (replaced 'any' with proper types)
- ✅ VS Code workspace configured with format on save
- ✅ All linting tests passing
- ✅ Auth system fully implemented and tested
- ✅ Users set to ACTIVE by default in development (no email verification needed)
- ✅ JWT authentication working with protected routes

### Frontend Components Working
- **Dashboard**: Full dashboard with stats cards and data table
- **ApplicationShell**: Complete layout with responsive sidebar
- **DataTable**: Advanced table with selection, sorting, pagination
- **Components**: Button, Modal, Notification all functional
- **Theme**: Custom Navy Blue primary, Orange accent colors
- **Branding**: "Our Products" with cube icon

### Current Configuration

**Backend (.env):**
```
NODE_ENV=development
PORT=3010
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pim_dev
DATABASE_USER=pim_user
DATABASE_PASSWORD=secure_password_change_me
JWT_SECRET=your-secret-key-change-me-to-something-secure
JWT_EXPIRES_IN=1d
LOG_LEVEL=debug
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3010/api/v1
VITE_APP_NAME=Our Products
```

## Next Priority Tasks

**TASK-015: Create Common Modules** (20 min)
- Create shared DTOs for pagination and filtering
- Common decorators
- Validation pipes
- Global exception filters
- Response interceptors

**TASK-016: Product Module** (2 hours) ⭐ RECOMMENDED NEXT
- Product entity with all PIM fields
- Product categories and attributes
- SKU management
- Inventory tracking
- Product CRUD operations
- THE CORE PIM FUNCTIONALITY!

**TASK-017: Category Module** (1 hour)
- Category entity and hierarchy
- Category management
- Category-product relationships

## Documentation Files

All documentation is in `/Users/colinroets/dev/projects/product/pimdocs/`:
1. **README.md** - Main documentation index
2. **PROJECT_INSTRUCTIONS.md** - Project setup and standards
3. **TASKS.md** - Complete task list (94 tasks)
4. **NEXT_STEPS.md** - Current action items
5. **IMPLEMENTATION_ROADMAP.md** - 20-week plan
6. **ARCHITECTURE_OVERVIEW.md** - System architecture
7. **DOMAIN_MODEL_DATABASE.md** - Database schema (40+ tables)
8. **SERVICE_ARCHITECTURE.md** - NestJS modules structure
9. **ADMIN_PORTAL_ARCHITECTURE.md** - React/Tailwind frontend
10. **API_SPECIFICATIONS.md** - REST API endpoints
11. **WORKFLOW_DEFINITIONS.md** - Business workflows
12. **TROUBLESHOOTING.md** - Common issues and fixes
13. **CONTINUITY_PROMPT.md** - This file (use for new sessions)

## Key Architecture Decisions

1. **Monorepo Structure** - Single repository for all components
2. **Database Design** - PostgreSQL with JSONB for flexibility, 40+ tables designed
3. **Authentication** - JWT-based with refresh tokens
4. **Frontend** - Tailwind CSS components, minimal custom CSS
5. **State Management** - Zustand for global state, React Query for API state

## Current Project Structure

### Root (`/Users/colinroets/dev/projects/product/`)
```
├── pim/            # Backend application
├── pim-admin/      # Frontend application
├── pimdocs/        # Documentation
├── shell-scripts/  # All project shell scripts
├── package.json    # Monorepo scripts
├── .gitignore      # Git ignore rules
└── README.md       # Project overview
```

### Backend (`/Users/colinroets/dev/projects/product/pim/`)
```
src/
├── app.controller.ts (with /health endpoint)
├── app.module.ts (TypeORM configured, AuditSubscriber registered)
├── app.service.ts
├── common/
│   ├── decorators/
│   ├── dto/
│   ├── entities/
│   │   ├── base.entity.ts ✅
│   │   └── index.ts ✅
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── subscribers/
│   │   └── audit.subscriber.ts ✅
│   └── utils/
├── config/
│   ├── database.config.ts ✅
│   └── database-health.service.ts ✅
├── core/
│   └── auth/
├── entities/
│   └── product.entity.ts ✅ (example)
├── main.ts
├── migrations/
├── modules/
│   ├── auth/ ✅
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── decorators/
│   │   ├── guards/
│   │   └── strategies/
│   └── users/ ✅
│       ├── entities/user.entity.ts
│       ├── dto/user.dto.ts
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
└── typeorm.config.ts ✅
```

### Frontend (`/Users/colinroets/dev/projects/product/pim-admin/`)
```
src/
├── App.tsx (imports Dashboard)
├── main.tsx
├── index.css
├── components/
│   ├── common/
│   │   ├── Button.tsx ✅
│   │   ├── Modal.tsx ✅
│   │   └── Notification.tsx ✅
│   ├── layouts/
│   │   └── ApplicationShell.tsx ✅
│   └── tables/
│       └── DataTable.tsx ✅
├── features/
│   └── dashboard/
│       └── Dashboard.tsx ✅
├── hooks/
├── services/
├── stores/
├── types/
└── utils/
    └── classNames.ts ✅
```

## How to Test Current Setup

### Test Backend:
```bash
cd /Users/colinroets/dev/projects/product/pim
npm run start:dev
# Should run on http://localhost:3010
# Test health: curl http://localhost:3010/health
```

### Test Auth System:
```bash
# Register (users are auto-active in dev)
curl -X POST http://localhost:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'

# Login (works immediately, no email verification needed)
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Test Frontend:
```bash
cd /Users/colinroets/dev/projects/product/pim-admin
npm run dev
# Should run on http://localhost:5173
# Full dashboard with navigation should display
```

### Test Both (Monorepo):
```bash
cd /Users/colinroets/dev/projects/product
npm run dev  # Runs both backend and frontend concurrently
```

### Test Database:
```bash
psql -U pim_user -d pim_dev -h localhost
# Or check health endpoint for connection status
```

## Known Issues & Solutions

1. **Port 3000 Conflict**: Backend changed to port 3010
2. **Tailwind v4 Issues**: Using stable v3.4.0 instead
3. **White Screen Fix**: PostCSS config and proper dependencies resolved
4. **TypeScript Paths**: @ alias configured in vite.config.ts and tsconfig

## Session Request Examples

Please help me continue with the next task: [SPECIFY WHICH TASK]

Example requests:
- "Open the VS Code workspace (TASK-012)"
- "Create the base entity class (TASK-013)"
- "Start building the Product module"
- "Add routing to the frontend"
- "Connect frontend to backend API"

## Important Notes

### Shell Scripts Location
**All shell scripts must be saved in:** `/Users/colinroets/dev/projects/product/shell-scripts/`
- Shell scripts are LOCAL ONLY (not tracked in Git)
- To execute scripts:
  ```bash
  cd /Users/colinroets/dev/projects/product/shell-scripts
  chmod +x script-name.sh
  ./script-name.sh
  ```
- Git management scripts are in the root of shell-scripts/
- Frontend debug scripts are in shell-scripts/frontend-debug/
- These are development utilities only, not part of the build

## Component Usage Examples

### Using the ApplicationShell:
```typescript
import ApplicationShell from '@/components/layouts/ApplicationShell'

export default function MyPage() {
  return (
    <ApplicationShell currentPath="/my-page">
      {/* Page content */}
    </ApplicationShell>
  )
}
```

### Using the DataTable:
```typescript
import DataTable, { Column } from '@/components/tables/DataTable'

const columns: Column<MyType>[] = [
  {
    key: 'name',
    header: 'Name',
    accessor: (item) => item.name,
    sortable: true
  }
]

<DataTable
  data={items}
  columns={columns}
  keyExtractor={(item) => item.id}
/>
```

## Quick Reference Commands

```bash
# Monorepo commands (from root)
cd /Users/colinroets/dev/projects/product
npm run dev           # Run both backend and frontend
npm run build         # Build both projects
npm run test          # Run tests
npm run lint          # Lint both projects
npm run format        # Format both projects

# Backend
cd pim
npm run start:dev
npm run build
npm run test
npm run lint
npm run format

# Frontend
cd pim-admin
npm run dev
npm run build
npm run preview
npm run lint
npm run format

# Shell Scripts
cd /Users/colinroets/dev/projects/product/shell-scripts
./test-lint.sh        # Test all linting
./commit-lint-fixes.sh # Commit linting fixes

# Git commands
git status
git add .
git commit -m "feat: description"
git push origin develop

# Database
psql -U pim_user -d pim_dev

# Check what's using a port
lsof -i :3010

# Database migrations
npm run migration:generate -- -n MigrationName
npm run migration:run
```

## Current Focus

The project has a solid foundation with authentication fully implemented. The next priorities are:
1. ✅ COMPLETED: Environment setup (TASK-001 to TASK-009)
2. ✅ COMPLETED: Git repository initialized (TASK-010)
3. ✅ COMPLETED: Code quality tools (TASK-011)
4. ✅ COMPLETED: VS Code workspace (TASK-012)
5. ✅ COMPLETED: Base Entity classes (TASK-013)
6. ✅ COMPLETED: Auth system with JWT (TASK-014)
7. **NEXT**: Build Product Module - the core PIM functionality (TASK-016)
8. Or build common utilities first (TASK-015)

**GitHub Repository:** https://github.com/namaqua/product

---

END OF PROMPT - Copy everything above this line
