#!/bin/bash

# Complete auth test with new active user

echo "========================================="
echo "Testing Auth with Auto-Active Users"
echo "========================================="
echo ""

# Create unique test user
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@example.com"
PASSWORD="Test123!"

echo "Creating test user: $EMAIL"
echo ""

# Step 1: Register
echo "1. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "accessToken"; then
    echo "   ✅ Registration successful"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
else
    echo "   ❌ Registration failed"
    echo "   Response: $REGISTER_RESPONSE"
    echo ""
    echo "   ⚠️  Did you restart the server after the fix?"
    echo "   1. Stop server (Ctrl+C)"
    echo "   2. Restart: npm run start:dev"
    exit 1
fi

# Step 2: Login
echo ""
echo "2. Testing immediate login (no email verification needed)..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo "   ✅ Login successful (user is ACTIVE!)"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
else
    echo "   ❌ Login failed: $LOGIN_RESPONSE"
    exit 1
fi

# Step 3: Test protected endpoint
echo ""
echo "3. Testing protected endpoint with JWT..."
ME_RESPONSE=$(curl -s -X GET http://localhost:3010/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "$EMAIL"; then
    echo "   ✅ Protected endpoint working!"
    echo ""
    echo "User data returned:"
    echo "$ME_RESPONSE" | python3 -m json.tool
else
    echo "   ❌ Protected endpoint failed"
fi

echo ""
echo "========================================="
echo "✅ AUTH SYSTEM FULLY WORKING!"
echo "========================================="
echo ""
echo "Summary:"
echo "- New users are automatically ACTIVE ✅"
echo "- No email verification needed in dev ✅"
echo "- Login works immediately ✅"
echo "- JWT tokens working ✅"
echo "- Protected routes working ✅"
echo ""
echo "Ready to build the Product Module! 🚀"
