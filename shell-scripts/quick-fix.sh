#!/bin/bash

# Quick Fix for Import/Export Tables
echo "🚀 Quick Fix for Import/Export Tables"
echo "======================================"
echo ""

cd /Users/colinroets/dev/projects/product/engines

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "This script will create the import/export tables using Node.js"
echo ""

# Check if pg module is installed
if [ ! -d "node_modules/pg" ]; then
    echo "📦 Installing pg module..."
    npm install pg
fi

# Run the Node.js migration script
echo "🏗️ Creating tables..."
node run-migration.js

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Success! All tables have been created.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the backend: npm run start:dev"
    echo "2. Test import/export: cd ../shell-scripts && ./test-import-export.sh"
else
    echo ""
    echo -e "${YELLOW}⚠️ If the Node.js script failed, try the Docker version:${NC}"
    echo "   cd ../shell-scripts"
    echo "   ./fix-migration-docker.sh"
fi
