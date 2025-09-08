#!/bin/bash

# Simple, guaranteed fix for the database issue

echo "======================================"
echo "   🔧 SIMPLE DATABASE FIX"
echo "======================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "This will:"
echo "  1. Delete the entire database"
echo "  2. Create a fresh database"
echo "  3. Let TypeORM create correct tables"
echo ""
echo -e "${RED}All data will be deleted!${NC}"
echo "Continue? (y/n)"
read -r answer

if [ "$answer" != "y" ]; then
    echo "Cancelled"
    exit 0
fi

# Kill any running Node processes
echo -e "\n${YELLOW}Stopping any running servers...${NC}"
pkill -f node 2>/dev/null
sleep 2

# Delete and recreate database
echo -e "\n${YELLOW}Recreating database...${NC}"
psql -U postgres << EOF
DROP DATABASE IF EXISTS pim_dev;
CREATE DATABASE pim_dev;
GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to recreate database${NC}"
    echo "Try manually:"
    echo "  psql -U postgres"
    echo "  DROP DATABASE IF EXISTS pim_dev;"
    echo "  CREATE DATABASE pim_dev;"
    echo "  GRANT ALL ON DATABASE pim_dev TO pim_user;"
    exit 1
fi

echo -e "${GREEN}✓ Database recreated${NC}"

# Go to backend directory
cd /Users/colinroets/dev/projects/product/pim

# Clean build files
echo -e "\n${YELLOW}Cleaning build files...${NC}"
rm -rf dist/
echo -e "${GREEN}✓ Build files cleaned${NC}"

# Build the project
echo -e "\n${YELLOW}Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Project built${NC}"

# Start server to create tables
echo -e "\n${YELLOW}Starting server to create tables...${NC}"
echo "(This will run for 15 seconds)"

# Run server for 15 seconds to create tables
timeout 15 npm run start:dev 2>&1 | grep -E "Table.*created|successfully started" &

# Wait
sleep 15

echo -e "\n${GREEN}✓ Tables should be created${NC}"

# Check what was created
echo -e "\n${YELLOW}Checking tables...${NC}"
export PGPASSWORD='secure_password_change_me'
psql -U pim_user -d pim_dev -h localhost -c "\dt" 2>/dev/null
unset PGPASSWORD

# Now try seeding
echo -e "\n${YELLOW}Seeding database...${NC}"
npm run seed

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}=====================================${NC}"
    echo -e "${GREEN}   ✅ SUCCESS! Database fixed!${NC}"
    echo -e "${GREEN}=====================================${NC}"
else
    echo -e "\n${YELLOW}If seeding failed, try:${NC}"
    echo "1. Start the server: npm run start:dev"
    echo "2. In another terminal: npm run seed"
fi

echo ""
echo "Next: npm run start:dev"
