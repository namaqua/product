#!/bin/bash

# Script: remove-scripts-from-git.sh
# Purpose: Remove shell scripts from git tracking while keeping them locally
# Usage: ./shell\ scripts/remove-scripts-from-git.sh
# Date: 2025-01-07

echo "🔧 Removing Shell Scripts from Git Tracking"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to project root
cd /Users/colinroets/dev/projects/product

echo -e "${YELLOW}📋 This will:${NC}"
echo "  1. Remove 'shell scripts/' from git tracking"
echo "  2. Keep the files locally for your use"
echo "  3. Update .gitignore to prevent future tracking"
echo ""

# Remove shell scripts from git index but keep files locally
echo -e "${BLUE}📝 Removing shell scripts from git index...${NC}"
git rm -r --cached "shell scripts/" 2>/dev/null || true
git rm -r --cached scripts/ 2>/dev/null || true

# Check what will be committed
echo ""
echo -e "${YELLOW}📊 Changes to be committed:${NC}"
git status --short

# Commit the changes
echo ""
echo -e "${BLUE}💾 Creating commit...${NC}"
git commit -m "chore: Remove shell scripts from version control

- Shell scripts are development utilities only
- Not part of the application build
- Added to .gitignore to prevent tracking
- Scripts remain locally for development use"

# Push to remote
echo ""
echo -e "${GREEN}🚀 Pushing to GitHub...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
git push origin $CURRENT_BRANCH

echo ""
echo -e "${GREEN}✅ Complete!${NC}"
echo ""
echo "Shell scripts have been removed from Git but remain on your local machine."
echo "They will no longer be tracked or pushed to GitHub."
echo ""
echo -e "${YELLOW}📁 Local scripts still available at:${NC}"
echo "   /Users/colinroets/dev/projects/product/shell scripts/"
echo ""
echo "You can continue using them for development tasks."
