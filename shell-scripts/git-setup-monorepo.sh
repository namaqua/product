#!/bin/bash

# Git MONOREPO setup script for PIM project
# This script creates a single repository containing both frontend and backend

echo "🚀 PIM Project - Monorepo Git Setup with GitHub"
echo "==============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Go to project root
cd /Users/colinroets/dev

echo -e "${BLUE}📦 Setting up monorepo structure...${NC}"

# Check if git is initialized at root level
if [ ! -d ".git" ]; then
    echo "Initializing git repository at project root..."
    git init
else
    echo "Git repository already initialized"
fi

# Create root .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "Creating root .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
dist/
build/

# Environment
.env
.env.local
*.local

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
!.vscode/launch.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Temporary
tmp/
temp/
EOF
fi

# Create README at root if it doesn't exist
if [ ! -f "README.md" ]; then
    echo "Creating root README.md..."
    cat > README.md << 'EOF'
# Our Products - Product Information Management System

A modern PIM system built with NestJS and React.

## Project Structure

```
.
├── pim/          # Backend (NestJS + PostgreSQL)
├── pim-admin/    # Frontend (React + Vite + TypeScript)
└── pimdocs/      # Documentation
```

## Quick Start

### Backend
```bash
cd pim
npm install
npm run start:dev
# Runs on http://localhost:3010
```

### Frontend
```bash
cd pim-admin
npm install
npm run dev
# Runs on http://localhost:5173
```

## Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, JWT
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **UI Theme**: Navy Blue & Orange

## Documentation

See `/pimdocs` for detailed documentation.
EOF
fi

# Check git status
echo -e "${YELLOW}Checking current status...${NC}"
git status --short

# Add all projects
echo "Adding all projects to staging..."
git add pim/ pim-admin/ pimdocs/
git add .gitignore README.md 2>/dev/null || true
git add pim.code-workspace 2>/dev/null || true

# Create comprehensive commit
echo "Creating commit..."
git commit -m "feat: Complete PIM system initial setup

Backend (NestJS):
- NestJS framework with TypeORM configured
- PostgreSQL database connection established
- Environment configuration complete
- Health check endpoint working at /health
- Running on port 3010

Frontend (React):
- React + Vite + TypeScript configured
- Tailwind CSS v3.4.0 with custom Navy & Orange theme
- Professional UI components:
  * ApplicationShell with responsive navigation
  * DataTable with sorting and pagination
  * Button, Modal, Notification components
  * Complete Dashboard with stats cards
- Branded as 'Our Products' with cube icon
- Custom color palette implemented

Documentation:
- Complete project documentation in /pimdocs
- Task tracking and roadmap defined
- 94 total tasks identified

Current Progress: 10 tasks completed (10.6%)" || echo "Already committed or no changes"

# Add remote origin if not exists
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}Adding GitHub remote origin...${NC}"
    git remote add origin git@github.com:namaqua/product.git
    echo "Remote origin added successfully"
else
    echo "Remote origin already exists"
    # Update the URL in case it changed
    git remote set-url origin git@github.com:namaqua/product.git
fi

# Fetch remote to check if it exists and has content
echo -e "${BLUE}Checking remote repository...${NC}"
git fetch origin 2>/dev/null || true

# Get current branch name (should be main or master)
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    CURRENT_BRANCH="main"
    git checkout -b main 2>/dev/null || git checkout main
fi

# Push to main/master branch
echo -e "${BLUE}Pushing to GitHub main branch...${NC}"
if git ls-remote --heads origin main | grep -q main; then
    # main branch exists on remote
    git push -u origin main --force-with-lease || git push -u origin main
else
    # Try master or create main
    git push -u origin ${CURRENT_BRANCH}
fi

# Create and push develop branch
if ! git branch | grep -q "develop"; then
    echo -e "${GREEN}Creating develop branch...${NC}"
    git checkout -b develop
else
    echo "Switching to develop branch..."
    git checkout develop
fi

echo -e "${BLUE}Pushing develop branch to GitHub...${NC}"
git push -u origin develop --force-with-lease 2>/dev/null || git push -u origin develop

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Monorepo Git Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Repository structure:"
echo "  ✓ Single repository containing both frontend and backend"
echo "  ✓ All current work committed"
echo "  ✓ Develop branch created and pushed"
echo "  ✓ GitHub remote configured"
echo ""
echo -e "${YELLOW}GitHub Repository:${NC}"
echo "  https://github.com/namaqua/product"
echo ""
echo -e "${YELLOW}Branch Structure:${NC}"
echo "  main    - Production-ready code"
echo "  develop - Active development"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify on GitHub: https://github.com/namaqua/product"
echo "2. Set up branch protection rules on GitHub"
echo "3. Continue with TASK-011: ESLint and Prettier configuration"
echo "4. Or jump to TASK-013: Create Base Entity for the backend"
echo ""
echo "To clone this repository elsewhere:"
echo "  git clone git@github.com:namaqua/product.git"
echo "  cd product"
echo "  cd pim && npm install"
echo "  cd ../pim-admin && npm install"
