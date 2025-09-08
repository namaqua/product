#!/bin/bash

# Test if the TypeScript compiles without errors

echo "🔧 Testing TypeScript Compilation..."
echo "===================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /Users/colinroets/dev/projects/product/pim

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install --silent
fi

# Try to build
echo -e "\n${YELLOW}Compiling TypeScript...${NC}"
npm run build 2>&1 | tee build.log

# Check if build was successful
if grep -q "error TS" build.log; then
    echo -e "\n${RED}❌ TypeScript compilation failed${NC}"
    echo -e "${YELLOW}Errors found:${NC}"
    grep "error TS" build.log | head -10
    rm build.log
    exit 1
else
    echo -e "\n${GREEN}✅ TypeScript compiled successfully!${NC}"
    rm -f build.log
fi

# Check if dist directory was created
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Build output created in dist/${NC}"
else
    echo -e "${YELLOW}⚠ No dist directory found${NC}"
fi

echo -e "\n${GREEN}===================================${NC}"
echo -e "${GREEN}Build Test Complete!${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""
echo "You can now run:"
echo "  npm run start:dev"
echo ""
echo "Or use the quick start:"
echo "  cd /Users/colinroets/dev/projects/product/shell-scripts"
echo "  ./quick-start.sh"
