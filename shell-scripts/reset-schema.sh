#!/bin/bash

# Reset database tables to match entity definitions

echo "🔄 Database Schema Reset"
echo "========================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}This will drop and recreate all tables to match entity definitions.${NC}"
echo -e "${RED}WARNING: This will delete all existing data!${NC}"
echo ""
echo "Continue? (y/n)"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

# Connect to database and drop all tables
echo -e "\n${YELLOW}1. Dropping all existing tables...${NC}"
export PGPASSWORD='secure_password_change_me'

psql -U pim_user -d pim_dev -h localhost << EOF
-- Drop all tables in public schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO pim_user;
GRANT ALL ON SCHEMA public TO public;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All tables dropped${NC}"
else
    echo -e "${RED}✗ Failed to drop tables${NC}"
    exit 1
fi

unset PGPASSWORD

# Navigate to backend
cd /Users/colinroets/dev/projects/product/pim

# Start the server briefly to recreate tables
echo -e "\n${YELLOW}2. Starting server to recreate tables...${NC}"
echo "The server will start and create tables. Press Ctrl+C after you see 'Nest application successfully started'"
echo ""
echo "Press Enter to continue..."
read

# Start server (this will create tables via TypeORM sync)
timeout 10 npm run start:dev 2>&1 | grep -E "successfully started|Table.*has been created" &
PID=$!

# Wait for tables to be created
sleep 10

# Kill the server
kill $PID 2>/dev/null

echo -e "\n${GREEN}✓ Tables recreated from entity definitions${NC}"

# Check what tables were created
echo -e "\n${YELLOW}3. Checking created tables...${NC}"
export PGPASSWORD='secure_password_change_me'
echo "Tables in database:"
psql -U pim_user -d pim_dev -h localhost -t -c "\dt" | grep -E "products|users"

# Check products table structure
echo -e "\n${YELLOW}4. Products table structure:${NC}"
psql -U pim_user -d pim_dev -h localhost -c "\d products" | head -20

unset PGPASSWORD

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}Schema reset complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start the server: npm run start:dev"
echo "2. Run seed again: npm run seed"
