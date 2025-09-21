#!/bin/bash

# THE SIMPLEST FIX POSSIBLE

echo "Fixing auth in 3 steps..."
echo

# Step 1: Fix database
docker exec postgres-pim psql -U pim_user pim_dev -c "
UPDATE users 
SET password = '\$2a\$10\$0wGy.R/f8U5JMdyO5S/Fh.TqNbKqnfVjjqO8gE5mSxOcB5v3X8wDe',
    \"isActive\" = true,
    status = 'active',
    \"emailVerified\" = true
WHERE email = 'admin@pim.com';
" 2>/dev/null && echo "✓ Database fixed" || echo "✗ Database error"

# Step 2: Check if backend is running
if lsof -i :3010 > /dev/null 2>&1; then
    PORT=3010
elif lsof -i :3000 > /dev/null 2>&1; then
    PORT=3000
else
    echo "✗ Backend not running - start it with: cd engines && npm run start:dev"
    exit 1
fi

echo "✓ Backend running on port $PORT"

# Step 3: Test login
echo "Testing login..."
response=$(curl -s -X POST http://localhost:${PORT}/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@pim.com","password":"Admin123!"}' 2>/dev/null)

if [[ "$response" == *"accessToken"* ]]; then
    echo "✓ AUTH FIXED AND WORKING!"
else
    echo "✗ Still not working. Response: $response"
fi
