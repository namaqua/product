#!/bin/bash

# Create Admin User for Accounts Testing
# This script ensures an admin user exists with the correct credentials

echo "========================================="
echo "CREATE ADMIN USER FOR TESTING"
echo "========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "\n${YELLOW}Step 1: Check database connection${NC}"
docker exec postgres-pim psql -U pim_user -d pim_dev -c "SELECT version();" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${RED}Database not accessible. Starting Docker...${NC}"
  cd /Users/colinroets/dev/projects/product
  docker-compose up -d postgres-pim
  sleep 5
fi

echo -e "${GREEN}✓ Database connected${NC}"

echo -e "\n${YELLOW}Step 2: Check users table${NC}"
TABLE_EXISTS=$(docker exec postgres-pim psql -U pim_user -d pim_dev -t -c "\dt users" 2>/dev/null | grep users | wc -l)

if [ $TABLE_EXISTS -eq 0 ]; then
  echo -e "${RED}Users table doesn't exist!${NC}"
  echo "Running migrations..."
  cd /Users/colinroets/dev/projects/product/engines
  npm run migration:run
  sleep 3
fi

echo -e "\n${YELLOW}Step 3: Create or update admin user${NC}"

# The bcrypt hash for "Admin123!@#" with 10 rounds
# This was generated using bcrypt.hashSync("Admin123!@#", 10)
PASSWORD_HASH='$2b$10$YGqzhmpDbLKav2YYTRuJCOeMtuOEtXtD5Jj5Kg9NwMzBcs0d7mD0O'

echo "Creating admin@example.com with password: Admin123!@#"

# Create or update the admin user
docker exec postgres-pim psql -U pim_user -d pim_dev << EOF
-- First, check if user exists
DO \$\$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@example.com') INTO user_exists;
  
  IF user_exists THEN
    -- Update existing user
    UPDATE users 
    SET 
      password = '$PASSWORD_HASH',
      role = 'admin',
      "firstName" = 'Admin',
      "lastName" = 'User',
      "isActive" = true,
      "updatedAt" = NOW()
    WHERE email = 'admin@example.com';
    
    RAISE NOTICE 'Updated existing admin user';
  ELSE
    -- Create new user
    INSERT INTO users (
      id, 
      email, 
      password, 
      "firstName", 
      "lastName", 
      role, 
      "isActive", 
      "createdAt", 
      "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'admin@example.com',
      '$PASSWORD_HASH',
      'Admin',
      'User',
      'admin',
      true,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created new admin user';
  END IF;
END\$\$;
EOF

echo -e "\n${YELLOW}Step 4: Verify admin user${NC}"
docker exec postgres-pim psql -U pim_user -d pim_dev -t -c "
  SELECT email, role, \"isActive\" 
  FROM users 
  WHERE email = 'admin@example.com';
" 2>/dev/null

echo -e "\n${YELLOW}Step 5: Create manager user for testing${NC}"
docker exec postgres-pim psql -U pim_user -d pim_dev << EOF
INSERT INTO users (
  id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'manager@example.com',
  '$PASSWORD_HASH',
  'Manager',
  'User',
  'manager',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET 
  password = '$PASSWORD_HASH',
  role = 'manager';
EOF

echo -e "\n${YELLOW}Step 6: Create regular user for testing${NC}"
docker exec postgres-pim psql -U pim_user -d pim_dev << EOF
INSERT INTO users (
  id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'user@example.com',
  '$PASSWORD_HASH',
  'Regular',
  'User',
  'user',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET 
  password = '$PASSWORD_HASH',
  role = 'user';
EOF

echo -e "\n${YELLOW}Step 7: List all users${NC}"
docker exec postgres-pim psql -U pim_user -d pim_dev -c "
  SELECT email, role, \"isActive\", \"createdAt\"
  FROM users 
  ORDER BY \"createdAt\" DESC
  LIMIT 10;
"

echo -e "\n${YELLOW}Step 8: Test authentication${NC}"

# Make sure server is running
curl -s http://localhost:3010 > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Starting server..."
  cd /Users/colinroets/dev/projects/product/engines
  npm run start:dev > /dev/null 2>&1 &
  echo -n "Waiting for server"
  for i in {1..20}; do
    curl -s http://localhost:3010 > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo -e "\n${GREEN}✓ Server started${NC}"
      break
    fi
    echo -n "."
    sleep 1
  done
fi

# Test login
echo -e "\nTesting login for admin@example.com..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!@#"}')

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
  echo -e "${GREEN}✓ Authentication successful!${NC}"
  echo "Response (truncated):"
  echo "$LOGIN_RESPONSE" | jq -r '.accessToken' | head -c 50
  echo "..."
else
  echo -e "${RED}✗ Authentication failed${NC}"
  echo "Response:"
  echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
fi

echo -e "\n========================================="
echo -e "${GREEN}SETUP COMPLETE${NC}"
echo -e "========================================="
echo -e "\nCredentials for testing:"
echo -e "  Admin:    admin@example.com    / Admin123!@#"
echo -e "  Manager:  manager@example.com  / Admin123!@#"
echo -e "  User:     user@example.com     / Admin123!@#"
echo -e "\nNow you can run:"
echo -e "  ${YELLOW}./test-accounts-api.sh${NC}"
echo -e "  ${YELLOW}./generate-test-accounts.sh${NC}"
