#!/bin/bash

# Script: git-commit-push.sh
# Purpose: Quick commit and push changes to GitHub
# Usage: ./shell\ scripts/git-commit-push.sh "commit message"
# Date: 2025-01-07

echo "🚀 Git Commit and Push Helper"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to project root
cd /Users/colinroets/dev/projects/product

# Check if commit message was provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide a commit message${NC}"
    echo "Usage: ./shell\\ scripts/git-commit-push.sh \"your commit message\""
    exit 1
fi

COMMIT_MESSAGE="$1"

# Show current status
echo -e "${YELLOW}📊 Current Git Status:${NC}"
git status --short
echo ""

# Add all changes
echo -e "${BLUE}➕ Adding all changes...${NC}"
git add .

# Create commit
echo -e "${BLUE}💾 Creating commit...${NC}"
git commit -m "$COMMIT_MESSAGE"

if [ $? -eq 0 ]; then
    # Push to current branch
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "${GREEN}🚀 Pushing to branch: $CURRENT_BRANCH${NC}"
    git push origin $CURRENT_BRANCH
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Successfully committed and pushed!${NC}"
        echo -e "${GREEN}📦 View on GitHub: https://github.com/namaqua/product${NC}"
    else
        echo -e "${RED}❌ Push failed. You may need to pull first or resolve conflicts.${NC}"
        echo "Try: git pull origin $CURRENT_BRANCH"
    fi
else
    echo -e "${YELLOW}⚠️  No changes to commit or commit failed.${NC}"
fi
