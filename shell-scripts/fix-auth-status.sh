#!/bin/bash

# Fix for development - make users active by default

echo "========================================="
echo "Auth System Fix & Test"
echo "========================================="
echo ""
echo "Issue: New users were set to PENDING status"
echo "Fix: Set new users to ACTIVE for development"
echo ""

# Test with a new user
EMAIL="active$(date +%s)@example.com"
PASSWORD="Active123!"

echo "1. Testing with new user: $EMAIL"
echo ""

# Register
echo "Registering..."
REGISTER=$(curl -s -X POST http://localhost:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Active\",
    \"lastName\": \"User\"
  }")

if echo "$REGISTER" | grep -q "accessToken"; then
    echo "✅ Registration successful"
    
    # Try to login immediately
    echo ""
    echo "2. Testing login..."
    LOGIN=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\"
      }")
    
    if echo "$LOGIN" | grep -q "accessToken"; then
        echo "✅ Login successful!"
        
        # Extract token and test protected route
        TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
        
        echo ""
        echo "3. Testing protected endpoint..."
        ME=$(curl -s -X GET http://localhost:3010/api/v1/auth/me \
          -H "Authorization: Bearer $TOKEN")
        
        if echo "$ME" | grep -q "$EMAIL"; then
            echo "✅ JWT authentication working!"
            echo ""
            echo "User details:"
            echo "$ME" | python3 -m json.tool 2>/dev/null
        fi
    else
        echo "❌ Login failed: $LOGIN"
    fi
else
    echo "❌ Registration failed: $REGISTER"
    echo ""
    echo "Make sure you've restarted the server after the fix:"
    echo "1. Stop the server (Ctrl+C)"
    echo "2. Start it again: npm run start:dev"
fi

echo ""
echo "========================================="
echo "To fix existing users (like john@example.com):"
echo "========================================="
echo ""
echo "Option 1: Register a new user (they'll be ACTIVE)"
echo "Option 2: Manually update in database:"
echo ""
echo "psql -U pim_user -d pim_dev -h localhost"
echo "UPDATE users SET status = 'active', \"emailVerified\" = true WHERE email = 'john@example.com';"
echo "\q"
echo ""
echo "Then login will work!"
