# PIM Project Instructions - Continuity Reference

## Project Overview
This document serves as the primary reference for maintaining continuity across all development sessions for the PIM (Personal Information Management) project.

## Core Technology Stack

### Backend
- **Framework**: NestJS (Latest stable version)
- **Database**: PostgreSQL (Latest stable version)
- **Runtime**: Node.js (LTS version)
- **Package Manager**: npm or yarn
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
├── pim/                    # Main backend application directory
│   ├── src/               # Source code
│   ├── dist/              # Compiled code
│   ├── node_modules/      # Dependencies
│   ├── .env               # Environment variables
│   ├── .env.example       # Environment template
│   ├── package.json       # Project dependencies
│   ├── nest-cli.json      # NestJS configuration
│   └── tsconfig.json      # TypeScript configuration
├── pim-admin/             # Admin portal (Tailwind Pro based)
│   ├── src/               # React/TypeScript source
│   ├── public/            # Static assets
│   ├── components/        # Tailwind Pro components
│   └── package.json       # Frontend dependencies
├── pimdocs/               # Project documentation
│   └── PROJECT_INSTRUCTIONS.md  # This file
└── shell-scripts/         # All project shell scripts
    ├── frontend-debug/    # Frontend troubleshooting scripts
    └── *.sh               # Git and deployment scripts
```

## Development Environment Setup

### Local Development
- **Path**: `/Users/colinroets/dev/projects/product/pim`
- **Database**: PostgreSQL running locally on port 5432
- **Application**: NestJS running on port 3010
- **Environment**: Development mode with hot-reload

### Environment Variables
Create `.env` file in `/Users/colinroets/dev/projects/product/pim/` with:
```
NODE_ENV=development
PORT=3010
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pim_dev
DATABASE_USER=pim_user
DATABASE_PASSWORD=[secure_password]
```

## Database Configuration

### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE pim_dev;

-- Create user
CREATE USER pim_user WITH PASSWORD '[secure_password]';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;
```

### TypeORM Configuration
Database connection managed through NestJS TypeORM module with migrations enabled.

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
3. **Documentation**: Update `/Users/colinroets/dev/projects/product/pimdocs/` for significant changes
4. **Shell Scripts**: Save all shell scripts in `/Users/colinroets/dev/projects/product/shell-scripts/`
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
cd /Users/colinroets/dev/projects/product/pim
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
cd /Users/colinroets/dev/projects/product/pim-admin
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database
```bash
# Connect to PostgreSQL
psql -U pim_user -d pim_dev

# Backup database
pg_dump -U pim_user pim_dev > backup.sql

# Restore database
psql -U pim_user pim_dev < backup.sql
```

## Session Continuity Checklist
When starting a new chat session:
1. **USE THE CONTINUITY PROMPT**: Copy the entire contents of `/Users/colinroets/dev/projects/product/pimdocs/CONTINUITY_PROMPT.md`
2. Reference this document for project standards
3. Check current branch and last commit
4. Review pending tasks in TASKS.md
5. Verify environment variables status

**Quick Copy Command:**
```bash
cat /Users/colinroets/dev/projects/product/pimdocs/CONTINUITY_PROMPT.md | pbcopy
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

## Notes for Assistant
- Always check this file first when starting a new session
- Reference Tailwind Pro templates in `/Users/colinroets/dev/tailwind-admin Pro` (if available) for UI implementation
- Save all shell scripts in `/Users/colinroets/dev/projects/product/shell-scripts/`
- Avoid suggesting features not explicitly requested
- Keep solutions simple and deployable
- Focus on working code over theoretical optimizations
- Ask for clarification rather than assuming requirements
- When implementing admin UI, always check if a suitable component exists in Tailwind Pro first

---
*Last Updated: [Current Date]*
*Version: 1.1*
*Changes: Added Tailwind Pro admin portal specifications*
