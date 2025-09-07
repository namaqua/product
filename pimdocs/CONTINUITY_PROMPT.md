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
- Shell Scripts: `/Users/colinroets/dev/projects/product/shell scripts/` (local only, not in Git)
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

**Completed Tasks (10 of 94):**
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
- ✅ UI Customization: Navy & Orange theme, "Our Products" branding

**Current Phase:** Phase 1 - Foundation (Week 1 of 4)
**Overall Progress:** 10.6% complete (10/94 tasks)
**Phase 1 Progress:** 31% complete (10/32 tasks)

## Recent Updates & Working Configuration

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

**TASK-010: Initialize Git Repository** ✅ COMPLETED
- Monorepo structure created
- GitHub remote configured
- Initial commit pushed

**TASK-011: ESLint and Prettier Configuration** (20 min) ⭐ NEXT
- Configure code quality tools for both projects
- Set up formatting rules
- Add pre-commit hooks if desired

**TASK-012: VS Code Workspace Configuration** (15 min)
- Create workspace settings
- Configure debugging
- Set up recommended extensions

**TASK-013: Create Base Entity** (20 min)
- Create base entity class with audit fields
- Setup for all entities to extend
- Include soft delete capability

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
├── shell scripts/  # All project shell scripts
├── package.json    # Monorepo scripts
├── .gitignore      # Git ignore rules
└── README.md       # Project overview
```

### Backend (`/Users/colinroets/dev/projects/product/pim/`)
```
src/
├── app.controller.ts (with /health endpoint)
├── app.module.ts (TypeORM configured)
├── app.service.ts
├── common/
│   ├── decorators/
│   ├── dto/
│   ├── entities/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
├── config/
│   ├── database.config.ts ✅
│   └── database-health.service.ts ✅
├── core/
│   └── auth/
├── main.ts
├── migrations/
└── modules/
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
- "Let's set up ESLint and Prettier (TASK-011)"
- "Create the base entity class (TASK-013)"
- "Start building the Product module"
- "Add routing to the frontend"
- "Connect frontend to backend API"

## Important Notes

### Shell Scripts Location
**All shell scripts must be saved in:** `/Users/colinroets/dev/projects/product/shell scripts/`
- Shell scripts are LOCAL ONLY (not tracked in Git)
- Git management scripts are in the root of shell scripts/
- Frontend debug scripts are in shell scripts/frontend-debug/
- Always create new scripts in this location
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

# Backend
cd pim
npm run start:dev
npm run build
npm run test

# Frontend
cd pim-admin
npm run dev
npm run build
npm run preview

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

The project structure has been reorganized as a monorepo and pushed to GitHub. The next priorities are:
1. ✅ COMPLETED: Save progress with Git (TASK-010)
2. Set up code quality tools (TASK-011) - NEXT
3. Begin building the backend API structure
4. Connect frontend to backend

**GitHub Repository:** https://github.com/namaqua/product

---

END OF PROMPT - Copy everything above this line
