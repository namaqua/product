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
- Database: PostgreSQL in Docker (port 5433) - pim_dev, pim_test databases
- Infrastructure: Docker Compose for local development
- Deployment Target: DigitalOcean
- Constraint: Open source tools only, avoid over-engineering

## Current Status (as of January 2025)

**Environment Setup: 80% COMPLETE**
- Monorepo structure at `/Users/colinroets/dev/projects/product/`
- Backend running at http://localhost:3010
- Frontend running at http://localhost:5173
- PostgreSQL running in Docker container on port 5433
- Redis available in Docker on port 6380 (optional)
- Database health check endpoint working at `/health`
- Full admin UI with custom Navy & Orange theme
- Application branded as "Our Products" with cube icon
- Git repository initialized with GitHub remote

**Completed Tasks (17 of 94):**
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
- ✅ TASK-015: Common Modules - COMPLETE
  - Shared DTOs for pagination, search, and responses
  - Common decorators (CurrentUser, API docs, validation)
  - Validation and parsing pipes
  - Global exception filters
  - Response interceptors (transform, logging, timeout)
  - Utility functions (helpers, date, validation)
  - Constants and types
  - All integrated with main.ts
- ✅ TASK-016: Product Module - COMPLETE
  - Full Product entity with 40+ fields
  - Complete CRUD operations with 11 endpoints
  - SKU management and inventory tracking
  - Product variants support
  - Soft delete and restore
  - Featured products and low stock alerts
- ✅ TASK-017: Category Module - COMPLETE
  - Nested Set Model for hierarchical data
  - Efficient tree operations (no recursion)
  - 15+ API endpoints including tree navigation
  - Breadcrumb generation
  - Move operations for tree reorganization
  - Many-to-many relationship with products
- ✅ UI Customization: Navy & Orange theme, "Our Products" branding

**Current Phase:** Phase 1 - Foundation (Week 1 of 4)
**Overall Progress:** 18.1% complete (17/94 tasks)
**Phase 1 Progress:** 53.1% complete (17/32 tasks)

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
- ✅ Product Module complete with full CRUD and inventory management
- ✅ Category Module complete with Nested Set Model for tree operations

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
DATABASE_PORT=5433  # Docker PostgreSQL mapped to 5433
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

**TASK-018: Attribute Module** (2 hours) ⭐ NEXT PRIORITY
- Dynamic attribute system
- Attribute groups and templates
- Product-attribute assignments
- Validation rules

**TASK-019: Brand Module** (1 hour)
- Brand entity and management
- Brand-product relationships
- Brand pages and filtering

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
13. **LEARNINGS.md** - Important gotchas and solutions 🆕
14. **PRODUCT_MODULE_COMPLETE.md** - Product module documentation
15. **CATEGORY_MODULE_COMPLETE.md** - Category module documentation 🆕
16. **CONTINUITY_PROMPT.md** - This file (use for new sessions)

## Key Architecture Decisions

1. **Monorepo Structure** - Single repository for all components
2. **Database Design** - PostgreSQL with JSONB for flexibility, 40+ tables designed
3. **Infrastructure** - Docker Compose for local development consistency
4. **Authentication** - JWT-based with refresh tokens
5. **Frontend** - Tailwind CSS components, minimal custom CSS
6. **State Management** - Zustand for global state, React Query for API state
7. **Port Allocation** - Unique ports to avoid conflicts with other projects (3010, 5433, 6380)

## Current Project Structure

### Root (`/Users/colinroets/dev/projects/product/`)
```
├── pim/                # Backend application
├── pim-admin/          # Frontend application
├── pimdocs/            # Documentation
├── shell-scripts/      # All project shell scripts
├── scripts/            # Database init scripts
├── docker-compose.yml  # Docker services configuration
├── package.json        # Monorepo scripts
├── .gitignore          # Git ignore rules
└── README.md           # Project overview
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
│   ├── users/ ✅
│   │   ├── entities/user.entity.ts
│   │   ├── dto/user.dto.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── products/ ✅
│   │   ├── entities/product.entity.ts
│   │   ├── dto/
│   │   ├── products.controller.ts
│   │   ├── products.module.ts
│   │   └── products.service.ts
│   └── categories/ ✅
│       ├── entities/category.entity.ts
│       ├── dto/
│       ├── categories.controller.ts
│       ├── categories.module.ts
│       └── categories.service.ts
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

## Docker Infrastructure

### Starting Services
```bash
cd /Users/colinroets/dev/projects/product
docker-compose up -d  # Starts PostgreSQL on port 5433 and Redis on port 6380
```

### Docker Services
- **PostgreSQL**: Container `postgres-pim` on port 5433 (maps to internal 5432)
- **Redis**: Container `redis-pim` on port 6380 (maps to internal 6379)
- **Network**: `pim-network` bridge network
- **Volumes**: `postgres_pim_data` and `redis_pim_data` for persistence

### Stopping Services
```bash
docker-compose down  # Stop containers
docker-compose down -v  # Stop and remove volumes (WARNING: deletes data)
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
# Connect to PostgreSQL in Docker (port 5433)
psql -U pim_user -d pim_dev -h localhost -p 5433

# Or use Docker exec
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# Check Docker containers
docker ps | grep pim

# Check health endpoint for connection status
curl http://localhost:3010/health
```

## Known Issues & Solutions

**IMPORTANT:** See [LEARNINGS.md](LEARNINGS.md) for detailed gotchas and solutions!


1. **Port Conflicts**: 
   - Backend: 3010 (avoid conflict with other services)
   - Database: 5433 (avoid conflict with marketplace on 5432)
   - Redis: 6380 (avoid conflict with marketplace on 6379)
2. **Tailwind v4 Issues**: Using stable v3.4.0 instead
3. **White Screen Fix**: PostCSS config and proper dependencies resolved
4. **TypeScript Paths**: @ alias configured in vite.config.ts and tsconfig
5. **Docker Database**: Ensure Docker Desktop is running before starting backend

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
**IMPORTANT: ALL shell scripts (.sh files) MUST be saved in:** `/Users/colinroets/dev/projects/product/shell-scripts/`
- Shell scripts are LOCAL ONLY (not tracked in Git)
- NEVER create shell scripts in the project root directory
- Frontend debug scripts go in: `shell-scripts/frontend-debug/`
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
# Docker commands (from root)
cd /Users/colinroets/dev/projects/product
docker-compose up -d    # Start PostgreSQL and Redis
docker-compose down     # Stop services
docker-compose logs -f  # View logs
docker ps              # Check running containers

# Monorepo commands (from root)
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
./test-product-api.sh # Test product endpoints
./test-category-api.sh # Test category endpoints
./commit-lint-fixes.sh # Commit linting fixes

# Git commands
git status
git add .
git commit -m "feat: description"
git push origin develop

# Database
psql -U pim_user -d pim_dev -p 5433  # Connect to Docker PostgreSQL
docker exec -it postgres-pim psql -U pim_user -d pim_dev  # Via Docker

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
7. ✅ COMPLETED: Common utilities (TASK-015)
8. ✅ COMPLETED: Product Module (TASK-016)
9. ✅ COMPLETED: Category Module (TASK-017)
10. **NEXT**: Attribute Module for dynamic product attributes (TASK-018)

**GitHub Repository:** https://github.com/namaqua/product

---

END OF PROMPT - Copy everything above this line
