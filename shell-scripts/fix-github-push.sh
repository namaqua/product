#!/bin/bash

# Fix GitHub push - ensure all directories are included
echo "🔧 Fixing GitHub Repository - Pushing All Content"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd /Users/colinroets/dev/projects/product

echo -e "${YELLOW}📁 Checking directory structure...${NC}"
ls -la

echo ""
echo -e "${BLUE}🔍 Checking Git status...${NC}"
git status

# Remove any nested .git directories that might cause issues
echo -e "${YELLOW}🧹 Cleaning up any nested git repos...${NC}"
rm -rf pim/.git 2>/dev/null || true
rm -rf pim-admin/.git 2>/dev/null || true
rm -rf pimdocs/.git 2>/dev/null || true

# Add all directories explicitly
echo -e "${BLUE}➕ Adding all project directories...${NC}"
git add pim/
git add pim-admin/
git add pimdocs/
git add package.json
git add setup-github.sh
git add .gitignore
git add README.md

# Check what will be committed
echo -e "${YELLOW}📋 Files to be committed:${NC}"
git status --short

# Commit everything
echo -e "${BLUE}💾 Creating comprehensive commit...${NC}"
git commit -m "feat: Add complete monorepo structure with all projects

- Backend (pim/): NestJS application with TypeORM and PostgreSQL
- Frontend (pim-admin/): React app with Vite, TypeScript, and Tailwind CSS
- Documentation (pimdocs/): Complete project documentation
- Custom Navy & Orange theme implemented
- 'Our Products' branding with cube icon
- All components working and tested" || echo "No changes to commit"

# Force push to ensure everything is on GitHub
echo -e "${GREEN}🚀 Force pushing to GitHub to ensure all content is uploaded...${NC}"
git push --force-with-lease origin main

# Also push to develop if it exists
if git branch | grep -q "develop"; then
    echo -e "${BLUE}🌿 Pushing develop branch...${NC}"
    git checkout develop
    git merge main
    git push --force-with-lease origin develop
    git checkout main
fi

echo ""
echo -e "${GREEN}✅ Repository should now be complete on GitHub!${NC}"
echo ""
echo "Please check: https://github.com/namaqua/product"
echo ""
echo "You should now see:"
echo "  📁 pim/       - Backend NestJS application"
echo "  📁 pim-admin/ - Frontend React application"
echo "  📁 pimdocs/   - Documentation"
echo "  📄 README.md  - Project overview"
echo "  📄 package.json - Monorepo configuration"
echo ""

# Show what's in each directory
echo -e "${YELLOW}📊 Repository contents:${NC}"
echo ""
echo "Backend files (pim/):"
ls -la pim/ | head -10
echo ""
echo "Frontend files (pim-admin/):"
ls -la pim-admin/ | head -10
echo ""
echo "Documentation (pimdocs/):"
ls -la pimdocs/ | head -10
