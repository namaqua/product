#!/bin/bash

# Create admin user for PIM system
# This script creates the default admin user if it doesn't exist

API_URL="http://localhost:3010/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up Admin User${NC}"
echo "====================="

# First, try to register the admin user
echo -e "\n${YELLOW}1. Creating admin user...${NC}"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }')

# Check if registration was successful or user already exists
if echo "$REGISTER_RESPONSE" | grep -q "access_token\|accessToken"; then
  echo -e "${GREEN}✓ Admin user created successfully!${NC}"
  echo "  Email: admin@example.com"
  echo "  Password: Admin123!"
  
  # Extract and display user info
  USER_ID=$(echo $REGISTER_RESPONSE | python3 -c "import sys, json; d=json.load(sys.stdin); user=d.get('data',{}).get('user',{}) if 'data' in d else d.get('user',{}); print(user.get('id',''))" 2>/dev/null)
  if [ ! -z "$USER_ID" ]; then
    echo "  User ID: $USER_ID"
  fi
  
elif echo "$REGISTER_RESPONSE" | grep -q "already exists\|conflict\|duplicate"; then
  echo -e "${YELLOW}ℹ Admin user already exists${NC}"
  
  # Try to login to verify credentials
  echo -e "\n${YELLOW}2. Verifying login credentials...${NC}"
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@example.com",
      "password": "Admin123!"
    }')
  
  if echo "$LOGIN_RESPONSE" | grep -q "access_token\|accessToken"; then
    echo -e "${GREEN}✓ Login successful with existing credentials${NC}"
    echo "  Email: admin@example.com"
    echo "  Password: Admin123!"
  else
    echo -e "${RED}✗ Cannot login with default credentials${NC}"
    echo "  The admin user exists but password may be different"
    echo ""
    echo "  Options:"
    echo "  1. Check database for correct credentials"
    echo "  2. Reset password via database"
    echo "  3. Create a new user with different email"
  fi
else
  echo -e "${RED}✗ Failed to create admin user${NC}"
  echo "Response: $REGISTER_RESPONSE"
  echo ""
  echo "Possible issues:"
  echo "1. Backend is not running"
  echo "2. Database is not connected"
  echo "3. Registration endpoint has different requirements"
fi

# Additional test users (optional)
echo -e "\n${YELLOW}3. Creating additional test users (optional)...${NC}"

# Manager user
curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "Manager123!@#",
    "firstName": "Manager",
    "lastName": "User"
  }' > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Manager user created (manager@example.com)${NC}"
fi

# Editor user
curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "editor@example.com",
    "password": "Editor123!@#",
    "firstName": "Editor",
    "lastName": "User"
  }' > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Editor user created (editor@example.com)${NC}"
fi

echo -e "\n${GREEN}Setup complete!${NC}"
echo ""
echo "You can now login with:"
echo "  Email: admin@example.com"
echo "  Password: Admin123!"
echo ""
echo "Frontend URL: http://localhost:5173"
echo "Backend API: http://localhost:3010/api/v1"
