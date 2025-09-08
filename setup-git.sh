#!/bin/bash

# Git and GitHub Setup Script for PIM Project
echo "🚀 Setting up Git and GitHub for PIM Project"
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ] || [ ! -d "pim" ]; then
    echo -e "${RED}❌ Error: Not in PIM project root directory${NC}"
    echo "Please run this from /Users/colinroets/dev/projects/product/"
    exit 1
fi

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📁 Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository already initialized${NC}"
fi

# Check current git status
echo -e "\n${YELLOW}📊 Current Git Status:${NC}"
git status --short

# Add all files except those in .gitignore
echo -e "\n${YELLOW}📦 Adding files to Git...${NC}"

# Add documentation files
git add README.md TASKS.md QUICK_REFERENCE.md TROUBLESHOOTING.md DOCUMENTATION_SUMMARY.md
git add GIT_COMMIT_TEMPLATE.md

# Add configuration files
git add docker-compose.yml
git add .gitignore

# Add scripts
git add start-pim.sh stop-pim.sh
git add scripts/init-db.sql

# Add PIM source code (excluding .env)
git add pim/.env.example
git add pim/src/
git add pim/package.json
git add pim/tsconfig.json
git add pim/tsconfig.build.json
git add pim/nest-cli.json
git add pim/.eslintrc.js
git add pim/.prettierrc

# Add parent directory port configuration if it exists
if [ -f "../PORT_CONFIGURATION.md" ]; then
    git add ../PORT_CONFIGURATION.md
fi

echo -e "${GREEN}✅ Files added to staging${NC}"

# Show what will be committed
echo -e "\n${YELLOW}📋 Files to be committed:${NC}"
git status --short

# Create commit
echo -e "\n${YELLOW}💾 Creating commit...${NC}"
git commit -m "feat: Complete PIM backend setup with PostgreSQL on port 5433

- Set up PostgreSQL database in Docker (port 5433 to avoid conflicts)
- Implement complete database schema with i18n support
- Configure NestJS backend with Products, Auth, and Users modules
- Add 6 sample products with localized names
- Temporarily disable authentication for development
- Create Docker Compose configuration
- Add start/stop scripts for easy management
- Fix TypeORM entity mappings and database connections

BREAKING CHANGE: Database now uses port 5433 instead of 5432

Documentation:
- Add comprehensive README with setup instructions
- Create TASKS.md with completed and pending items
- Add QUICK_REFERENCE.md for common commands
- Create TROUBLESHOOTING.md based on issues resolved
- Document port configuration to avoid conflicts

Co-authored-by: Assistant <assistant@anthropic.com>"

echo -e "${GREEN}✅ Commit created${NC}"

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo -e "\n${YELLOW}📡 Remote 'origin' already exists:${NC}"
    git remote -v
    echo ""
    read -p "Do you want to update the remote URL? (y/n): " update_remote
    if [[ $update_remote =~ ^[Yy]$ ]]; then
        read -p "Enter new GitHub repository URL (e.g., https://github.com/username/pim-backend.git): " github_url
        git remote set-url origin "$github_url"
        echo -e "${GREEN}✅ Remote URL updated${NC}"
    fi
else
    echo -e "\n${YELLOW}📡 Setting up GitHub remote...${NC}"
    echo "Please create a new repository on GitHub first:"
    echo "1. Go to https://github.com/new"
    echo "2. Name it something like 'pim-backend' or 'product-management'"
    echo "3. Don't initialize with README (we already have one)"
    echo "4. Create the repository"
    echo ""
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/pim-backend.git): " github_url
    
    if [ -z "$github_url" ]; then
        echo -e "${RED}❌ No URL provided. Skipping remote setup.${NC}"
        echo "You can add it later with: git remote add origin <url>"
    else
        git remote add origin "$github_url"
        echo -e "${GREEN}✅ Remote 'origin' added${NC}"
    fi
fi

# Push to GitHub
if git remote | grep -q "origin"; then
    echo -e "\n${YELLOW}🚀 Pushing to GitHub...${NC}"
    
    # Check if main branch exists, if not create it
    if ! git show-ref --verify --quiet refs/heads/main; then
        git branch -M main
    fi
    
    echo "Pushing to origin/main..."
    if git push -u origin main; then
        echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
        echo ""
        echo -e "${GREEN}🎉 Your code is now on GitHub!${NC}"
        
        # Get the remote URL for display
        remote_url=$(git remote get-url origin)
        # Convert SSH to HTTPS for web URL if needed
        web_url=${remote_url/git@github.com:/https://github.com/}
        web_url=${web_url%.git}
        
        echo -e "Repository URL: ${GREEN}$web_url${NC}"
    else
        echo -e "${RED}❌ Push failed. You might need to:${NC}"
        echo "1. Check your GitHub credentials"
        echo "2. Make sure the repository exists on GitHub"
        echo "3. Try: git push --set-upstream origin main"
    fi
else
    echo -e "\n${YELLOW}⚠️  No remote configured. To push later:${NC}"
    echo "1. Create a repo on GitHub"
    echo "2. git remote add origin <your-repo-url>"
    echo "3. git push -u origin main"
fi

echo ""
echo "============================================"
echo -e "${GREEN}✅ Git setup complete!${NC}"
echo ""
echo "Useful commands:"
echo "  git status           - Check current status"
echo "  git log --oneline    - View commit history"
echo "  git push             - Push new commits"
echo "  git pull             - Pull latest changes"
