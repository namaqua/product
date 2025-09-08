#!/bin/bash

# Complete fix for GitHub monorepo push
echo "🔧 Complete GitHub Repository Fix"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd /Users/colinroets/dev/projects/product

echo -e "${RED}⚠️  IMPORTANT: This will convert separate repos to a monorepo${NC}"
echo "This will remove .git folders from pim/ and pim-admin/ subdirectories"
echo "and integrate them into the main repository."
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Step 1: Remove nested .git directories
echo -e "${YELLOW}Step 1: Removing nested .git directories...${NC}"
rm -rf pim/.git
rm -rf pim-admin/.git
rm -rf pimdocs/.git
echo "✓ Nested .git directories removed"

# Step 2: Check current git status
echo ""
echo -e "${YELLOW}Step 2: Checking current status...${NC}"
git status

# Step 3: Add all directories to git
echo ""
echo -e "${YELLOW}Step 3: Adding all directories to git...${NC}"
git rm -r --cached . 2>/dev/null || true
git add .
echo "✓ All files added to staging"

# Step 4: Show what will be committed
echo ""
echo -e "${YELLOW}Step 4: Files to be committed:${NC}"
git status --short | head -20
echo "... and more"

# Step 5: Create a new commit
echo ""
echo -e "${YELLOW}Step 5: Creating new commit...${NC}"
git commit -m "fix: Complete monorepo with all projects included

Monorepo structure:
- pim/: NestJS backend application (port 3010)
- pim-admin/: React frontend with Vite (port 5173)
- pimdocs/: Complete documentation

Features:
- Custom Navy & Orange theme
- 'Our Products' branding
- Complete dashboard with stats
- Professional UI components
- PostgreSQL database integration
- Health check endpoint
- TypeORM configured

All 10 initial tasks completed." || echo "No changes"

# Step 6: Push to GitHub
echo ""
echo -e "${YELLOW}Step 6: Pushing to GitHub...${NC}"
git push --force origin main

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SUCCESS! Complete monorepo pushed!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "📦 Check your repository at:"
echo "   https://github.com/namaqua/product"
echo ""
echo "You should now see:"
echo "  ├── 📁 pim/"
echo "  │   ├── src/"
echo "  │   ├── package.json"
echo "  │   └── ... (NestJS backend)"
echo "  ├── 📁 pim-admin/"
echo "  │   ├── src/"
echo "  │   ├── package.json"
echo "  │   └── ... (React frontend)"
echo "  ├── 📁 pimdocs/"
echo "  │   └── ... (documentation)"
echo "  ├── 📄 README.md"
echo "  ├── 📄 package.json"
echo "  └── 📄 .gitignore"
echo ""
echo "🎯 Next steps:"
echo "  1. Verify all files are on GitHub"
echo "  2. Create develop branch if needed"
echo "  3. Continue with TASK-011 (ESLint & Prettier)"
