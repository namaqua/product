# Directory Structure Migration Guide

## Overview
This document describes the directory renaming performed on September 11, 2025 to simplify the project structure.

## Changes Made

### Directory Renames
- `docs` → `docs` (Documentation)
- `admin` → `admin` (Frontend React application)
- `engines` → `engines` (Backend NestJS application)

### Rationale
1. **Clarity**: Shorter, more intuitive names
2. **Consistency**: Removes redundant "pim" prefix since we're already in the product monorepo
3. **Standards**: Aligns with common naming conventions (docs, admin, engines/backend)

## Migration Process

### Step 1: Make Scripts Executable
```bash
chmod +x make-executable.sh
./make-executable.sh
```

### Step 2: Run the Migration
```bash
./shell-scripts/rename-directories.sh
```

This script will:
1. Stop all running services
2. Create a backup of configuration files
3. Rename the directories
4. Update all references in:
   - docker-compose.yml
   - package.json files
   - VS Code settings
   - Workspace configuration
   - Shell scripts
   - Documentation files
   - .gitignore

### Step 3: Reinstall Dependencies
```bash
cd engines && npm install
cd ../admin && npm install
```

### Step 4: Test the Migration
```bash
./shell-scripts/test-rename.sh
```

### Step 5: Start Services
```bash
# Start Docker services
docker-compose up -d

# Start Backend (in one terminal)
cd engines && npm run start:dev

# Start Frontend (in another terminal)
cd admin && npm run dev
```

## Updated Paths

### Before
```
/Users/colinroets/dev/projects/product/
├── pim/                 # Backend NestJS
├── pim-admin/           # Frontend React
├── pimdocs/             # Documentation
└── shell-scripts/       # Utility scripts
```

### After
```
/Users/colinroets/dev/projects/product/
├── engines/             # Backend NestJS
├── admin/               # Frontend React
├── docs/                # Documentation
└── shell-scripts/       # Utility scripts
```

## Service URLs (Unchanged)
- Backend API: http://localhost:3010
- Frontend: http://localhost:5173
- API Docs: http://localhost:3010/api/docs
- PostgreSQL: localhost:5433
- Redis: localhost:6380

## Reverting Changes

If you need to revert the migration:

```bash
# Use the backup directory created during migration
./shell-scripts/revert-rename.sh backups/rename-backup-[timestamp]
```

## Git Considerations

After successful migration and testing:

```bash
# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "refactor: rename directories for clarity
- pimdocs -> docs
- pim-admin -> admin  
- pim -> engines
- Update all references in config files and documentation"

# Push to remote
git push origin main
```

## Files Automatically Updated

The migration script automatically updates references in:

1. **Configuration Files**
   - docker-compose.yml
   - package.json (root and subdirectories)
   - .gitignore
   - .vscode/settings.json
   - product.code-workspace

2. **Shell Scripts**
   - All *.sh files in shell-scripts/

3. **Documentation**
   - All *.md files in docs/
   - All *.md files in project root

## Manual Review Required

After migration, manually review:

1. **TypeScript Configuration**
   - engines/tsconfig.json - Check path mappings
   - admin/tsconfig.json - Check path mappings

2. **Build Configuration**
   - admin/vite.config.ts - Check any absolute paths

3. **Import Statements**
   - Generally shouldn't need changes as they use relative paths
   - Check any absolute imports if present

## Troubleshooting

### Services Won't Start
```bash
# Clean install dependencies
rm -rf engines/node_modules admin/node_modules
cd engines && npm install
cd ../admin && npm install
```

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### TypeScript Errors
- Check tsconfig.json files for any hardcoded paths
- Verify path mappings are updated

## Benefits of New Structure

1. **Cleaner Repository**: More intuitive directory names
2. **Better Organization**: Clear separation of concerns
3. **Industry Standards**: Follows common naming patterns
4. **Easier Navigation**: Shorter paths to type
5. **Future-Proof**: "engines" allows for multiple backend services if needed

## Notes

- The database names remain unchanged (pim_dev, pim_test)
- Docker network can optionally be renamed to "product-network"
- All API endpoints remain the same
- No code changes required, only path updates
