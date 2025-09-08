#!/bin/bash

# Complete GitHub Push Script for PIM Backend
# This script handles everything from git init to GitHub push

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}   PIM Backend - GitHub Push Setup${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists git; then
    echo -e "${RED}❌ Git is not installed. Please install git first.${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${YELLOW}⚠️  Docker is not installed. It's needed to run the application.${NC}"
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ] || [ ! -d "pim" ]; then
    echo -e "${RED}❌ Error: Not in PIM project root directory${NC}"
    echo "Please run this from /Users/colinroets/dev/projects/product/"
    exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📁 Initializing Git repository...${NC}"
    git init
    git branch -M main
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository already initialized${NC}"
fi

# Add all files
echo -e "${YELLOW}📦 Adding files to Git...${NC}"
git add .
echo -e "${GREEN}✅ Files staged${NC}"

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo -e "${YELLOW}ℹ️  No changes to commit${NC}"
else
    echo -e "${YELLOW}💾 Creating commit...${NC}"
    git commit -m "feat: Complete PIM backend with PostgreSQL, NestJS, and comprehensive documentation

- Full NestJS backend with Products, Auth, and Users modules
- PostgreSQL database on port 5433 (Docker)
- Multi-language support via product_locales
- 6 sample products with complete data
- Comprehensive documentation suite
- GitHub Actions CI/CD pipeline
- Docker Compose setup
- Helper scripts for development

BREAKING CHANGE: Uses PostgreSQL port 5433 to avoid conflicts

Co-authored-by: Assistant <assistant@anthropic.com>" || true
    echo -e "${GREEN}✅ Commit created${NC}"
fi

echo ""
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}       GitHub Repository Setup${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if remote exists
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}📡 Remote 'origin' already configured:${NC}"
    git remote -v
    echo ""
    read -p "Do you want to push to the existing remote? (y/n): " push_existing
    if [[ $push_existing =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🚀 Pushing to GitHub...${NC}"
        if git push -u origin main; then
            echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
        else
            echo -e "${YELLOW}Trying with force push...${NC}"
            git push -u origin main --force
        fi
    else
        read -p "Do you want to change the remote URL? (y/n): " change_remote
        if [[ $change_remote =~ ^[Yy]$ ]]; then
            read -p "Enter new GitHub repository URL: " new_url
            git remote set-url origin "$new_url"
            echo -e "${GREEN}✅ Remote URL updated${NC}"
            git push -u origin main
        fi
    fi
else
    echo -e "${YELLOW}📝 Let's set up your GitHub repository${NC}"
    echo ""
    echo "First, create a new repository on GitHub:"
    echo -e "${BLUE}1. Go to: https://github.com/new${NC}"
    echo "2. Repository name: pim-backend (suggested)"
    echo "3. Description: Product Information Management System - NestJS Backend"
    echo "4. Choose Public or Private"
    echo -e "${RED}5. DO NOT initialize with README, .gitignore, or License${NC}"
    echo "6. Click 'Create repository'"
    echo ""
    
    read -p "Have you created the repository? (y/n): " created_repo
    
    if [[ $created_repo =~ ^[Yy]$ ]]; then
        echo ""
        read -p "Enter your GitHub username: " github_username
        read -p "Enter your repository name (e.g., pim-backend): " repo_name
        
        # Construct URL
        github_url="https://github.com/${github_username}/${repo_name}.git"
        
        echo ""
        echo -e "${YELLOW}🔗 Adding remote: $github_url${NC}"
        git remote add origin "$github_url"
        
        echo -e "${YELLOW}🚀 Pushing to GitHub...${NC}"
        echo ""
        
        if git push -u origin main; then
            echo ""
            echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
            echo ""
            echo -e "${BLUE}=====================================${NC}"
            echo -e "${GREEN}🎉 SUCCESS! Your repository is live!${NC}"
            echo -e "${BLUE}=====================================${NC}"
            echo ""
            echo -e "📂 Repository: ${GREEN}https://github.com/${github_username}/${repo_name}${NC}"
            echo -e "📊 Actions: ${GREEN}https://github.com/${github_username}/${repo_name}/actions${NC}"
            echo -e "🐛 Issues: ${GREEN}https://github.com/${github_username}/${repo_name}/issues${NC}"
            echo ""
        else
            echo ""
            echo -e "${RED}❌ Push failed. This might be an authentication issue.${NC}"
            echo ""
            echo -e "${YELLOW}Try one of these solutions:${NC}"
            echo ""
            echo "1. GitHub CLI (easiest):"
            echo "   brew install gh"
            echo "   gh auth login"
            echo "   git push -u origin main"
            echo ""
            echo "2. Personal Access Token:"
            echo "   • Go to https://github.com/settings/tokens"
            echo "   • Generate new token with 'repo' scope"
            echo "   • Use token as password when pushing"
            echo ""
            echo "3. SSH Keys:"
            echo "   ssh-keygen -t ed25519 -C \"your_email@example.com\""
            echo "   cat ~/.ssh/id_ed25519.pub"
            echo "   • Add key to https://github.com/settings/keys"
            echo "   • Change remote to SSH:"
            echo "   git remote set-url origin git@github.com:${github_username}/${repo_name}.git"
        fi
    else
        echo ""
        echo -e "${YELLOW}No problem! When you're ready:${NC}"
        echo "1. Create repository on GitHub"
        echo "2. git remote add origin <your-repo-url>"
        echo "3. git push -u origin main"
    fi
fi

echo ""
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}         Next Steps${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo "📚 Documentation available:"
echo "   • README.md - Project overview"
echo "   • QUICK_REFERENCE.md - Common commands"
echo "   • TROUBLESHOOTING.md - Problem solutions"
echo "   • TASKS.md - Development roadmap"
echo ""
echo "🚀 To run the application:"
echo "   ./start-pim.sh"
echo "   cd pim && npm run start:dev"
echo ""
echo "🧪 Test the API:"
echo "   curl http://localhost:3010/api/v1/products"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
