# PIM Project Instructions - Continuity Reference

## Project Overview
This document serves as the primary reference for maintaining continuity across all development sessions for the PIM (Personal Information Management) project.

## IMPORTANT: Shell Scripts Location
**ALL shell scripts (.sh files) MUST be created and saved in:**
```
/Users/colinroets/dev/projects/product/shell-scripts/
```
- Shell scripts are LOCAL ONLY (not tracked in Git)
- Never create shell scripts in the project root directory
- Frontend debug scripts go in: `/Users/colinroets/dev/projects/product/shell-scripts/frontend-debug/`

## Core Technology Stack

### Backend
- **Framework**: NestJS (Latest stable version)
- **Database**: PostgreSQL in Docker (port 5433)
- **Infrastructure**: Docker Compose for local development
- **Runtime**: Node.js (LTS version)
- **Package Manager**: npm
- **Process Manager**: PM2 (for production)
- **Reverse Proxy**: Nginx (for production)

### Admin Portal (Frontend)
- **UI Framework**: Tailwind Pro
- **Component Library**: Tailwind UI Pro components
- **Reference Implementation**: `/Users/colinroets/dev/tailwind-admin Pro` (if available)
- **Framework**: React with TypeScript (integrated with Tailwind Pro)
- **Build Tool**: Vite or Next.js (as compatible with Tailwind Pro templates)

## Directory Structure
```
/Users/colinroets/dev/projects/product/
├── engines/               # Main backend application directory (NestJS)
│   ├── src/               # Source code
│   ├── dist/              # Compiled code
│   ├── node_modules/      # Dependencies
│   ├── .env               # Environment variables
│   ├── .env.example       # Environment template
│   ├── package.json       # Project dependencies
│   ├── nest-cli.json      # NestJS configuration
│   └── tsconfig.json      # TypeScript configuration
├── admin/                 # Admin portal (React + Tailwind)
│   ├── src/               # React/TypeScript source
│   ├── public/            # Static assets
│   ├── components/        # React components
│   └── package.json       # Frontend dependencies
├── docs/                  # Project documentation
│   ├── PROJECT_INSTRUCTIONS.md  # This file (main reference)
│   ├── DATABASE_GUIDE.md        # Database access instructions
│   ├── LEARNING_LOG.md          # Lessons learned & pitfalls to avoid
│   ├── VARIANT_TEMPLATES_STATUS.md  # Variant templates implementation
│   ├── UI_DESIGN_GUIDELINES.md  # UI/UX standards
│   ├── MARKETPLACE_IMPLEMENTATION_PLAN.md  # B2B2C marketplace feature
│   ├── MARKETPLACE_MVP_TASKS.md  # Marketplace quick tasks reference
│   ├── SUBSCRIPTIONS_IMPLEMENTATION_PLAN.md  # Subscription engine feature
│   └── TASKS.md                  # Current sprint tasks & priorities
├── docker-compose.yml     # Docker services configuration
├── scripts/               # Database init scripts
└── shell-scripts/         # All project shell scripts
    ├── frontend-debug/    # Frontend troubleshooting scripts
    └── *.sh               # Git and deployment scripts
```

## Development Environment Setup

### Local Development
- **Backend Path**: `/Users/colinroets/dev/projects/product/engines`
- **Frontend Path**: `/Users/colinroets/dev/projects/product/admin`
- **Database**: PostgreSQL in Docker container on port 5433
- **Redis**: Optional Redis in Docker on port 6380
- **Application**: NestJS running on port 3010
- **Environment**: Development mode with hot-reload
- **Docker Compose**: Manages PostgreSQL and Redis containers

### Environment Variables
Create `.env` file in `/Users/colinroets/dev/projects/product/engines/` with:
```
NODE_ENV=development
PORT=3010
DATABASE_HOST=localhost
DATABASE_PORT=5433  # Docker PostgreSQL mapped port
DATABASE_NAME=pim_dev
DATABASE_USER=pim_user
DATABASE_PASSWORD=secure_password_change_me
```

## Database Configuration

### ⚠️ IMPORTANT: PostgreSQL Runs in Docker Container
**The database is NOT installed locally on your Mac - it runs INSIDE a Docker container named `postgres-pim`**

### Docker Compose Setup
PostgreSQL runs in Docker container managed by docker-compose.yml:
```yaml
services:
  postgres-pim:
    image: postgres:15-alpine
    ports:
      - "5433:5432"  # Maps to 5433 to avoid conflicts
    environment:
      POSTGRES_USER: pim_user
      POSTGRES_PASSWORD: secure_password_change_me
      POSTGRES_DB: pim_dev
```

### Starting Database
```bash
# Start Docker services
cd /Users/colinroets/dev/projects/product
docker-compose up -d

# Verify containers are running
docker ps | grep pim
```

### TypeORM Configuration
Database connection managed through NestJS TypeORM module with migrations enabled.
Connection uses port 5433 to connect to Docker PostgreSQL.

## Development Guidelines

### Backend Code Structure
- Use NestJS modular architecture
- Follow REST API conventions
- Implement DTOs for data validation
- Use TypeORM entities for database models
- Apply Guards and Interceptors where necessary

### Admin Portal Guidelines
- Use Tailwind Pro components from `/Users/colinroets/dev/tailwind-admin Pro` as reference
- Maintain consistent styling with Tailwind Pro design system
- Implement responsive layouts using Tailwind's mobile-first approach
- Use Tailwind Pro's pre-built components for:
  - Navigation and sidebars
  - Forms and input components
  - Tables and data grids
  - Modals and overlays
  - Dashboard widgets
- Follow Tailwind Pro's patterns for:
  - Authentication screens
  - CRUD interfaces
  - Data visualization
  - Workflow management views

### Git Workflow
- Main branch: `main` (production-ready)
- Development branch: `develop`
- Feature branches: `feature/[feature-name]`
- Commit messages: Clear and descriptive

## DigitalOcean Deployment Preparation

### Requirements for Production
1. **Droplet Specifications**
   - Ubuntu 22.04 LTS
   - Minimum 2GB RAM
   - 1 vCPU
   - 50GB SSD

2. **Software Stack**
   - Node.js (via NodeSource repository)
   - PostgreSQL 
   - Nginx
   - PM2
   - Certbot (for SSL)

3. **Deployment Files Needed**
   - `ecosystem.config.js` (PM2 configuration)
   - `nginx.conf` (Nginx configuration)
   - `.env.production` (Production environment variables)

### Production Environment Variables
```
NODE_ENV=production
PORT=3010
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pim_prod
DATABASE_USER=pim_user
DATABASE_PASSWORD=[strong_production_password]
```

## Project Constraints

### Development Rules
1. **No Over-Engineering**: Implement only requested features
2. **Open Source Only**: All tools and libraries must be open source
3. **Documentation**: Update `/Users/colinroets/dev/projects/product/docs/` for significant changes
4. **Shell Scripts**: ALWAYS save all shell scripts in `/Users/colinroets/dev/projects/product/shell-scripts/` (NEVER in project root)
   ```bash
   cd /Users/colinroets/dev/projects/product/shell-scripts
   chmod +x script-name.sh
   ./script-name.sh
   ```
5. **Testing**: Write tests for critical functionality only
6. **Security**: Follow OWASP guidelines for web security

### Avoided Complexities
- No microservices architecture unless specifically requested
- No real-time features unless explicitly needed
- No caching layers until performance requires it
- No message queues unless async processing is necessary
- No GraphQL - stick to REST API

## Quick Commands Reference

### Backend Development
```bash
# Install dependencies
cd /Users/colinroets/dev/projects/product/engines
npm install

# Run development server
npm run start:dev

# Run migrations
npm run migration:run

# Build for production
npm run build
```

### Admin Portal Development
```bash
# Install dependencies
cd /Users/colinroets/dev/projects/product/admin
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker & Database
```bash
# Start Docker services
cd /Users/colinroets/dev/projects/product
docker-compose up -d

# Stop Docker services
docker-compose down

# ⚠️ NOTE: psql command requires PostgreSQL client installed locally
# If you get "psql: command not found", use Docker instead:

# Connect via Docker exec (RECOMMENDED - always works)
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# Only works if psql is installed locally:
# psql -U pim_user -d pim_dev -h localhost -p 5433

# View Docker logs
docker-compose logs -f postgres-pim

# Backup database
docker exec postgres-pim pg_dump -U pim_user pim_dev > backup.sql

# Restore database
docker exec -i postgres-pim psql -U pim_user pim_dev < backup.sql
```

## Session Continuity Checklist
When starting a new chat session:
1. **USE THE CONTINUITY PROMPT**: Copy the entire contents of `/Users/colinroets/dev/projects/product/docs/CONTINUITY_PROMPT.md`
2. Reference this document for project standards
3. Ensure Docker is running: `docker ps`
4. Start database if needed: `docker-compose up -d`
5. Check current branch and last commit
6. Review pending tasks in TASKS.md
7. Verify environment variables status

**Quick Copy Command:**
```bash
cat /Users/colinroets/dev/projects/product/docs/CONTINUITY_PROMPT.md | pbcopy
```
Then paste into new chat session.

## Admin Portal Implementation Notes

### Tailwind Pro Integration
- **Reference Path**: `/Users/colinroets/dev/tailwind-admin Pro` (if available)
- Use existing Tailwind Pro templates and components where possible
- Do not recreate components that already exist in Tailwind Pro
- Customize only where specific PIM functionality requires it
- Maintain Tailwind Pro's design language and patterns

### Key Admin Portal Features
1. **Dashboard** - Product statistics, workflow status, recent activities
2. **Product Management** - CRUD interfaces using Tailwind Pro table components
3. **Attribute Management** - Form builders with Tailwind Pro form components
4. **Category Tree** - Hierarchical navigation using Tailwind Pro sidebar patterns
5. **Media Gallery** - Grid layouts with Tailwind Pro card components
6. **Workflow Manager** - Kanban/status boards using Tailwind Pro layouts
7. **Import/Export** - File upload interfaces with Tailwind Pro upload components
8. **User Management** - Admin screens using Tailwind Pro user list templates
9. **Marketplace Management** - Seller onboarding, approval workflows, offerings management
10. **Subscription Engine** - Recurring billing, subscription lifecycle, tiered plans

## Major Features Implementation

### Marketplace Feature (B2B2C)
**Documentation**: `/docs/MARKETPLACE_IMPLEMENTATION_PLAN.md`
- Extends existing Account API for seller functionality
- Product offerings model (multiple sellers per product)
- Commission calculation and disbursement tracking
- Multi-level approval workflow (0-5 stages)
- Integration with existing Product and Account APIs
- 6-week MVP timeline with 5 implementation phases

### Subscription Engine
**Documentation**: `/docs/SUBSCRIPTIONS_IMPLEMENTATION_PLAN.md`
- Recurring billing and subscription lifecycle management
- Tiered plans with feature flags
- Usage-based billing support
- Parent-child subscription relationships
- Proration and mid-cycle adjustments
- Payment provider integration ready
- 25-step implementation plan (currently 28% complete)

## Notes for Assistant
- Always check this file first when starting a new session
- Review LEARNING_LOG.md to avoid repeated issues
- **CRITICAL**: PostgreSQL runs in Docker container `postgres-pim`, NOT locally
- Reference Tailwind Pro templates in `/Users/colinroets/dev/tailwind-admin Pro` (if available) for UI implementation
- **CRITICAL**: Save ALL shell scripts in `/Users/colinroets/dev/projects/product/shell-scripts/` (NEVER in project root)
- Shell scripts are LOCAL ONLY and not tracked in Git
- **UI COLORS**: Use `blue` for primary actions, NEVER use `indigo` - see `/docs/UI_DESIGN_GUIDELINES.md`
- Avoid suggesting features not explicitly requested
- Keep solutions simple and deployable
- Focus on working code over theoretical optimizations
- Ask for clarification rather than assuming requirements
- When implementing admin UI, always check if a suitable component exists in Tailwind Pro first

---
*Last Updated: January 2025*
*Version: 1.3*
*Changes: Added Marketplace and Subscription Engine features to project scope*
