# Documentation Index

## 📚 All Documentation Files

### Core Project Documentation

| File | Purpose | When to Use |
|------|---------|------------|
| **PROJECT_INSTRUCTIONS.md** | Main project reference, technology stack, directory structure | Start of every session, project overview |
| **CONTINUITY_PROMPT.md** | Session continuity prompt | Copy/paste at start of new chat sessions |
| **UI_DESIGN_GUIDELINES.md** | UI/UX standards, color schemes (blue not indigo) | When implementing frontend features |

### Database & Infrastructure

| File | Purpose | When to Use |
|------|---------|------------|
| **DATABASE_GUIDE.md** | Complete PostgreSQL Docker guide | Database access, troubleshooting |
| **POSTGRES_DOCKER_QUICKREF.md** | Quick reference for Docker PostgreSQL commands | Quick lookup for database commands |

### Learning & Troubleshooting

| File | Purpose | When to Use |
|------|---------|------------|
| **LEARNING_LOG.md** | Lessons learned, common pitfalls, best practices | Avoid repeating mistakes |
| **VARIANT_TEMPLATES_TROUBLESHOOTING.md** | Specific fixes for variant templates issues | Variant template problems |

### Feature Documentation

| File | Purpose | When to Use |
|------|---------|------------|
| **VARIANT_TEMPLATES_STATUS.md** | Current implementation status of variant templates | Check variant templates implementation |
| **VARIANT_TEMPLATES_MIGRATION.md** | Migration guide from localStorage to database | Understanding the migration process |
| **VARIANT_TEMPLATES_SUMMARY.md** | High-level overview of variant templates solution | Quick overview of the feature |

### Development Guides

| File | Purpose | When to Use |
|------|---------|------------|
| **API_STRUCTURE.md** | API design patterns and conventions | Creating new endpoints |
| **README.md** | Public repository documentation | External/public reference |

## 🔑 Key Rules to Remember

1. **PostgreSQL is in Docker** - Container: `postgres-pim`, Port: 5433
2. **Use `docker exec`** for all database commands
3. **UUID columns** - Never use varchar with length for User IDs
4. **Shell scripts** - Always in `/shell-scripts/` folder
5. **UI Colors** - Use `blue`, never `indigo`
6. **No over-engineering** - Simple, working solutions

## 🚀 Quick Start for New Sessions

1. Copy `CONTINUITY_PROMPT.md` content
2. Review `PROJECT_INSTRUCTIONS.md` 
3. Check `LEARNING_LOG.md` for pitfalls
4. Verify Docker is running: `docker ps | grep postgres-pim`
5. Start backend: `npm run start:dev`

## 📝 When Adding New Features

1. Check if similar patterns exist in `LEARNING_LOG.md`
2. Follow conventions in `API_STRUCTURE.md`
3. Update relevant status documents
4. Add troubleshooting notes if issues encountered
5. Document in appropriate status file

## 🔧 When Troubleshooting

1. Check specific troubleshooting guide if exists
2. Review `LEARNING_LOG.md` for similar issues
3. Use `POSTGRES_DOCKER_QUICKREF.md` for database
4. Check Docker logs: `docker logs postgres-pim`
5. Verify TypeScript compilation: `npx tsc --noEmit`

---
*Last Updated: January 2025*
*Purpose: Quick navigation of all project documentation*
