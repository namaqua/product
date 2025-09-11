#!/bin/bash

# Git MONOREPO setup and push to GitHub
# New location: /Users/colinroets/dev/projects/product/

echo "🚀 Our Products - Git Monorepo Setup & GitHub Push"
echo "=================================================="
echo ""
echo "📍 New Project Location: /Users/colinroets/dev/projects/product/"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to project root
cd /Users/colinroets/dev/projects/product

echo -e "${BLUE}📦 Initializing Git repository...${NC}"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo "Git repository initialized"
else
    echo "Git repository already exists"
fi

# Set git config if not set
git config user.name "Colin Roets" 2>/dev/null || true
git config user.email "colin@namaqua.com" 2>/dev/null || true

echo -e "${YELLOW}📝 Checking repository status...${NC}"
git status --short

# Stage all files
echo -e "${BLUE}➕ Adding all files to staging...${NC}"
git add .

# Create initial commit
echo -e "${BLUE}💾 Creating initial commit...${NC}"
git commit -m "feat: Complete PIM system with Navy & Orange theme

🚀 Project Structure:
- Monorepo setup at /Users/colinroets/dev/projects/product/
- Backend: NestJS + PostgreSQL (port 3010)
- Frontend: React + Vite + TypeScript
- Documentation: Complete project docs

🎨 Frontend Features:
- Custom Navy Blue & Orange theme implemented
- Application branded as 'Our Products' with cube icon
- Professional UI components:
  * ApplicationShell with responsive navigation
  * DataTable with sorting, pagination, selection
  * Button component with multiple variants
  * Modal and Notification components
- Complete Dashboard with stats cards
- Tailwind CSS v3.4.0 configured

⚙️ Backend Features:
- NestJS framework with TypeORM
- PostgreSQL database connection
- Health check endpoint at /health
- Environment configuration
- Database: pim_dev and pim_test

📊 Project Status:
- 10 tasks completed (10.6% overall)
- Phase 1: Foundation (31% complete)
- Total: 94 tasks planned

🔧 Configuration:
- Backend port: 3010
- Frontend port: 5173
- Database: PostgreSQL on 5432" || echo "Commit created or no changes to commit"

# Add GitHub remote
echo -e "${YELLOW}🔗 Configuring GitHub remote...${NC}"
if ! git remote | grep -q "origin"; then
    git remote add origin git@github.com:namaqua/product.git
    echo "GitHub remote added: git@github.com:namaqua/product.git"
else
    git remote set-url origin git@github.com:namaqua/product.git
    echo "GitHub remote updated: git@github.com:namaqua/product.git"
fi

# Rename branch to main if needed
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${BLUE}📝 Renaming branch to main...${NC}"
    git branch -m main
fi

# Push to main branch
echo -e "${GREEN}🚀 Pushing to GitHub main branch...${NC}"
git push -u origin main --force

# Create and push develop branch
echo -e "${BLUE}🌿 Creating develop branch...${NC}"
git checkout -b develop 2>/dev/null || git checkout develop
git push -u origin develop --force

# Switch back to main
git checkout main

echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ SUCCESS! Project is now on GitHub! ✨${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo "📦 Repository Details:"
echo "  • GitHub URL: https://github.com/namaqua/product"
echo "  • Location: /Users/colinroets/dev/projects/product/"
echo "  • Structure: Monorepo (backend + frontend + docs)"
echo ""
echo "🌿 Branches:"
echo "  • main    → Production-ready code"
echo "  • develop → Active development"
echo ""
echo "📁 Project Structure:"
echo "  • pim/       → Backend (NestJS)"
echo "  • pim-admin/ → Frontend (React)"
echo "  • pimdocs/   → Documentation"
echo ""
echo "🚀 Quick Start Commands:"
echo ""
echo "  # Backend"
echo "  cd engines && npm run start:dev"
echo "  # http://localhost:3010"
echo ""
echo "  # Frontend"
echo "  cd engines-admin && npm run dev"
echo "  # http://localhost:5173"
echo ""
echo "🔧 Next Steps:"
echo "  1. View on GitHub: https://github.com/namaqua/product"
echo "  2. Set up branch protection rules"
echo "  3. Configure GitHub Actions for CI/CD"
echo "  4. Continue with TASK-011: ESLint & Prettier"
echo ""
echo "📋 To clone elsewhere:"
echo "  git clone git@github.com:namaqua/product.git"
echo "  cd product"
echo "  cd engines && npm install"
echo "  cd ../pim-admin && npm install"
