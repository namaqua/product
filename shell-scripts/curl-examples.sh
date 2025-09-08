#!/bin/bash

# Quick endpoint tester with curl examples

echo "========================================="
echo "Quick API Test Commands"
echo "========================================="
echo ""
echo "Your API is WORKING at http://localhost:3010"
echo ""
echo "Copy and paste these commands to test:"
echo ""
echo "1️⃣  Register a new user:"
echo ""
cat << 'EOF'
curl -X POST http://localhost:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }' | python3 -m json.tool
EOF

echo ""
echo "----------------------------------------"
echo ""
echo "2️⃣  Login:"
echo ""
cat << 'EOF'
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }' | python3 -m json.tool
EOF

echo ""
echo "----------------------------------------"
echo ""
echo "3️⃣  Get current user (replace YOUR_TOKEN):"
echo ""
cat << 'EOF'
curl -X GET http://localhost:3010/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  | python3 -m json.tool
EOF

echo ""
echo "----------------------------------------"
echo ""
echo "Or run the automated test:"
echo "./show-all-endpoints.sh"
