#!/bin/bash

# Script: test-lint.sh
# Purpose: Test that all linting passes
# Usage: cd to shell scripts directory, then ./test-lint.sh
# Date: 2025-01-07

echo "🧪 Testing Linting Configuration"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to project root
cd /Users/colinroets/dev/projects/product

# Test backend linting
echo -e "${BLUE}Testing Backend Linting...${NC}"
cd pim
npm run lint
BACKEND_RESULT=$?
cd ..

if [ $BACKEND_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Backend linting passed!${NC}"
else
    echo -e "${RED}❌ Backend linting failed${NC}"
fi

echo ""

# Test frontend linting
echo -e "${BLUE}Testing Frontend Linting...${NC}"
cd pim-admin
npm run lint
FRONTEND_RESULT=$?
cd ..

if [ $FRONTEND_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend linting passed!${NC}"
else
    echo -e "${RED}❌ Frontend linting failed${NC}"
fi

echo ""

# Summary
if [ $BACKEND_RESULT -eq 0 ] && [ $FRONTEND_RESULT -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 All linting tests passed!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo "Your code is now compliant with ESLint rules."
    echo "Consider running 'npm run format' to ensure consistent formatting."
else
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo -e "${RED}⚠️  Some linting issues remain${NC}"
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo ""
    echo "Please review the errors above and fix them manually."
fi
