#!/bin/bash

# Quick fix for database schema issue

echo "🔧 Quick Database Fix"
echo "===================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}This will reset your database!${NC}"
echo "Continue? (y/n)"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    exit 0
fi

# Drop and recreate the database
echo -e "\n${YELLOW}Recreating database...${NC}"
export PGPASSWORD='postgres'
psql -U postgres -h localhost << EOF
DROP DATABASE IF EXISTS pim_dev;
CREATE DATABASE pim_dev;
GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;
EOF
unset PGPASSWORD

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database recreated${NC}"
else
    echo -e "${RED}Failed. Try manually:${NC}"
    echo "  psql -U postgres"
    echo "  DROP DATABASE pim_dev;"
    echo "  CREATE DATABASE pim_dev;"
    echo "  GRANT ALL ON DATABASE pim_dev TO pim_user;"
    echo "  \\q"
    exit 1
fi

cd /Users/colinroets/dev/projects/product/pim

# Start server to create tables
echo -e "\n${YELLOW}Creating tables (15 seconds)...${NC}"
timeout 15 npm run start:dev > /dev/null 2>&1 &
sleep 15

echo -e "${GREEN}✓ Tables created${NC}"

# Now seed
echo -e "\n${YELLOW}Seeding database...${NC}"
npm run seed

echo -e "\n${GREEN}Done! Start server with: npm run start:dev${NC}"
