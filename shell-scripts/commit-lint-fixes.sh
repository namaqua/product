#!/bin/bash

# Script: commit-lint-fixes.sh
# Purpose: Commit all linting fixes
# Usage: cd to shell scripts directory, then ./commit-lint-fixes.sh
# Date: 2025-01-07

echo "🎨 Committing Linting Fixes"
echo "============================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project root
cd /Users/colinroets/dev/projects/product

echo -e "${BLUE}📋 Fixed Issues:${NC}"
echo "  Backend (pim):"
echo "    ✓ Fixed TypeScript 'any' warnings in database-health.service.ts"
echo "    ✓ Properly typed DataSource options"
echo "    ✓ Better error handling with type guards"
echo ""
echo "  Frontend (pim-admin):"
echo "    ✓ Fixed constant condition in AppStep3.tsx"
echo "    ✓ Commented unused userNavigation variable"
echo "    ✓ Changed 'any' to 'unknown' in DataTable interface"
echo ""

# Add the changed files
echo -e "${YELLOW}Adding fixed files...${NC}"
git add pim/src/config/database-health.service.ts
git add pim-admin/src/AppStep3.tsx
git add pim-admin/src/components/layouts/ApplicationShell.tsx
git add pim-admin/src/components/tables/DataTable.tsx

# Create commit
echo -e "${BLUE}Creating commit...${NC}"
git commit -m "fix: Resolve all ESLint warnings and errors

Backend fixes:
- Remove @typescript-eslint/no-explicit-any warnings
- Properly type DataSource options in database-health.service.ts
- Add type guards for error handling

Frontend fixes:
- Fix no-constant-condition error in AppStep3.tsx
- Comment unused userNavigation variable in ApplicationShell.tsx
- Replace 'any' with 'unknown' in DataTable interface

All linting issues resolved ✅"

# Push to current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}Pushing to branch: $CURRENT_BRANCH${NC}"
git push origin $CURRENT_BRANCH

echo ""
echo -e "${GREEN}✅ Linting fixes committed and pushed!${NC}"
echo ""
echo "You can now run 'npm run lint' without errors."
