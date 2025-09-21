#!/bin/bash

# TEST IF PRODUCTS API WORKS

echo "🧪 Testing Products API..."
echo "=========================="

# Get token
TOKEN=$(curl -s -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pim.com","password":"Admin123!"}' | \
  grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Could not login. Is backend running?"
    exit 1
fi

echo "✅ Logged in successfully"

# Test products endpoint
echo ""
echo "📦 Fetching products..."
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3010/api/products?page=1&limit=5 | \
  python3 -m json.tool | head -30

echo ""
echo "✅ If you see products above, everything works!"
