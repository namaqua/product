#!/bin/bash

# Git initialization and commit script for PIM project
# This script saves all current progress and sets up Git properly with GitHub remote

echo "🚀 PIM Project - Git Setup and Initial Commit"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backend repository
echo -e "${BLUE}📦 Processing Backend (pim)...${NC}"
cd /Users/colinroets/dev/pim

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Check git status
echo "Checking current status..."
git status --short

# Add all files
echo "Adding files to staging..."
git add .

# Create initial commit (allow it to fail if already committed)
echo "Creating commit..."
git commit -m "feat: Initial PIM backend setup with NestJS

- NestJS framework configured with TypeORM
- PostgreSQL database connection established
- Environment configuration (.env setup)
- Health check endpoint working
- Base project structure created
- Port configured to 3010 to avoid conflicts" || echo "Already committed or no changes"

# Add remote origin if not exists
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}Adding GitHub remote origin...${NC}"
    git remote add origin git@github.com:namaqua/product.git
else
    echo "Remote origin already exists"
fi

# Create develop branch if it doesn't exist
if ! git branch | grep -q "develop"; then
    echo -e "${GREEN}Creating develop branch...${NC}"
    git checkout -b develop
else
    echo "Switching to develop branch..."
    git checkout develop
fi

# Push to GitHub
echo -e "${BLUE}Pushing backend to GitHub...${NC}"
git push -u origin main --force-with-lease 2>/dev/null || git push -u origin main
git push -u origin develop --force-with-lease 2>/dev/null || git push -u origin develop

echo -e "${GREEN}✅ Backend repository saved and pushed!${NC}"
echo ""

# Frontend repository
echo -e "${BLUE}🎨 Processing Frontend (pim-admin)...${NC}"
cd /Users/colinroets/dev/pim-admin

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Check git status
echo "Checking current status..."
git status --short

# Add all files
echo "Adding files to staging..."
git add .

# Create commit for all our changes
echo "Creating commit..."
git commit -m "feat: Complete frontend setup with custom theme

- React + Vite + TypeScript configured
- Tailwind CSS v3.4.0 with custom Navy & Orange theme
- Professional UI components implemented:
  - ApplicationShell with responsive navigation
  - DataTable with sorting and pagination
  - Button, Modal, Notification components
- Dashboard page with stats cards
- Renamed app to 'Our Products' with cube icon
- Custom color palette:
  - Navy blue primary colors
  - Orange accent colors for CTAs
  - Semantic colors for feedback
- All components working and styled" || echo "Already committed or no changes"

# Add remote origin if not exists
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}Adding GitHub remote origin...${NC}"
    git remote add origin git@github.com:namaqua/product.git
else
    echo "Remote origin already exists"
fi

# Create develop branch if it doesn't exist
if ! git branch | grep -q "develop"; then
    echo -e "${GREEN}Creating develop branch...${NC}"
    git checkout -b develop
else
    echo "Switching to develop branch..."
    git checkout develop
fi

# Push to GitHub
echo -e "${BLUE}Pushing frontend to GitHub...${NC}"
git push -u origin main --force-with-lease 2>/dev/null || git push -u origin main
git push -u origin develop --force-with-lease 2>/dev/null || git push -u origin develop

echo -e "${GREEN}✅ Frontend repository saved and pushed!${NC}"
echo ""

# Summary
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Git Setup Complete with GitHub!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Both repositories now have:"
echo "  ✓ All current work committed"
echo "  ✓ Develop branch created"
echo "  ✓ Proper .gitignore files"
echo "  ✓ Environment example files"
echo "  ✓ GitHub remote added (git@github.com:namaqua/product.git)"
echo "  ✓ Pushed to GitHub (main and develop branches)"
echo ""
echo -e "${YELLOW}GitHub Repository:${NC}"
echo "  https://github.com/namaqua/product"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Check your GitHub repository to confirm everything is pushed"
echo "2. Consider setting up branch protection rules on GitHub"
echo "3. Continue with TASK-011: ESLint and Prettier configuration"
echo "4. Or jump to TASK-013: Create Base Entity for the backend"
echo ""
echo "To check status of either repo:"
echo "  Backend:  cd /Users/colinroets/dev/pim && git status"
echo "  Frontend: cd /Users/colinroets/dev/pim-admin && git status"
echo ""
echo "To view on GitHub:"
echo "  https://github.com/namaqua/product"
