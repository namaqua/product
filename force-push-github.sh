#!/bin/bash

# Resolve GitHub push issues and force push the complete monorepo
echo "🔧 Resolving GitHub Push Issues"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd /Users/colinroets/dev/projects/product

echo -e "${YELLOW}📊 Current Git Status:${NC}"
git status --short

echo ""
echo -e "${BLUE}🔍 Checking remote status...${NC}"
git remote -v

echo ""
echo -e "${YELLOW}📥 Fetching from remote...${NC}"
git fetch origin

echo ""
echo -e "${RED}⚠️  WARNING: This will force push to GitHub${NC}"
echo "This will overwrite the remote repository with your local version."
echo "Make sure you want to replace everything on GitHub with your local files."
echo ""
read -p "Continue with force push? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Step 1: Ensure we're on the right branch
echo ""
echo -e "${BLUE}Step 1: Checking branch...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Switching to main branch..."
    git checkout -b main 2>/dev/null || git checkout main
fi

# Step 2: Remove nested git repos if they exist
echo ""
echo -e "${BLUE}Step 2: Cleaning nested git directories...${NC}"
if [ -d "pim/.git" ]; then
    rm -rf pim/.git
    echo "Removed pim/.git"
fi
if [ -d "pim-admin/.git" ]; then
    rm -rf pim-admin/.git
    echo "Removed pim-admin/.git"
fi
if [ -d "pimdocs/.git" ]; then
    rm -rf pimdocs/.git
    echo "Removed pimdocs/.git"
fi

# Step 3: Reset and re-add everything
echo ""
echo -e "${BLUE}Step 3: Re-adding all files...${NC}"
git rm -r --cached . 2>/dev/null || true
git add -A
echo "✓ All files staged"

# Step 4: Commit
echo ""
echo -e "${BLUE}Step 4: Creating commit...${NC}"
git commit -m "feat: Complete PIM monorepo with all components

Project Structure:
├── pim/          - NestJS backend (port 3010)
├── pim-admin/    - React frontend (port 5173)
├── pimdocs/      - Documentation
└── package.json  - Monorepo configuration

Features Implemented:
✅ Backend with TypeORM and PostgreSQL
✅ Frontend with React, Vite, TypeScript
✅ Custom Navy & Orange theme
✅ 'Our Products' branding with cube icon
✅ Complete dashboard with stats
✅ Professional UI components
✅ Health check endpoint
✅ 10 initial tasks completed

Tech Stack:
- NestJS + TypeORM + PostgreSQL
- React + Vite + TypeScript + Tailwind CSS v3.4
- Monorepo structure with npm workspaces" || echo "No changes to commit"

# Step 5: Force push to main
echo ""
echo -e "${GREEN}Step 5: Force pushing to GitHub main branch...${NC}"
git push origin main --force

# Step 6: Create and push develop branch
echo ""
echo -e "${BLUE}Step 6: Creating develop branch...${NC}"
git branch -D develop 2>/dev/null || true
git checkout -b develop
git push origin develop --force

# Step 7: Switch back to main
git checkout main

echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ COMPLETE! Repository force pushed to GitHub!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo "📦 Your repository is now live at:"
echo "   ${BLUE}https://github.com/namaqua/product${NC}"
echo ""
echo "📁 Repository structure:"
echo "   main branch:"
echo "   ├── pim/         (NestJS backend)"
echo "   ├── pim-admin/   (React frontend)"
echo "   ├── pimdocs/     (Documentation)"
echo "   ├── README.md"
echo "   ├── package.json"
echo "   └── .gitignore"
echo ""
echo "🌿 Branches:"
echo "   - main (default)"
echo "   - develop (for active development)"
echo ""
echo "✨ Everything should now be visible on GitHub!"
echo ""
echo "🎯 Next: Continue with TASK-011 (ESLint & Prettier setup)"
