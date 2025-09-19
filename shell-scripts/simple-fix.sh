#!/bin/bash

# Simple solution - use the API's register endpoint
set -e

PORT=3010

echo "========================================"
echo "  SIMPLE FIX - USE API REGISTRATION"
echo "========================================"
echo ""

# Step 1: Delete any existing admin user
echo "Cleaning up any existing admin user..."
docker exec postgres-pim psql -U pim_user -d pim_dev -c "DELETE FROM users WHERE email = 'admin@pim.com';" 2>/dev/null || true

# Step 2: Register through API (let TypeORM handle everything)
echo ""
echo "Registering admin user through API..."
echo "This lets TypeORM handle all the column names and hashing..."
echo ""

RESPONSE=$(curl -s -X POST "http://localhost:$PORT/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pim.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }')

# Check response
if echo "$RESPONSE" | grep -q "accessToken"; then
    echo "✅ SUCCESS! User registered!"
    echo ""
    echo "$RESPONSE" | jq '{email: .user.email, role: .user.role}' 2>/dev/null
    echo ""
    echo "You can now login at: http://localhost:5173"
    echo "Email: admin@pim.com"
    echo "Password: Admin123!"
elif echo "$RESPONSE" | grep -q "already exists"; then
    echo "User already exists. Let's try to login..."
    echo ""
    curl -s -X POST "http://localhost:$PORT/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@pim.com","password":"Admin123!"}' | jq . 2>/dev/null
else
    echo "❌ Registration failed:"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "The backend might have a database connection issue."
    echo ""
    echo "Try:"
    echo "1. Restart the backend:"
    echo "   - Stop with Ctrl+C"
    echo "   - cd /Users/colinroets/dev/projects/product/engines"
    echo "   - npm run start:dev"
    echo ""
    echo "2. Then run: ./shell-scripts/rebuild-users-table.sh"
fi
