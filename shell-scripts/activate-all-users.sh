#!/bin/bash

# Quick fix for existing users in database

echo "========================================="
echo "Fixing Existing Users in Database"
echo "========================================="
echo ""
echo "This will activate all existing users for development"
echo ""

# Update all users to active status
PGPASSWORD=secure_password_change_me psql -U pim_user -d pim_dev -h localhost << EOF
-- Show existing users
SELECT email, status, "emailVerified" FROM users;

-- Activate all users for development
UPDATE users 
SET status = 'active', 
    "emailVerified" = true 
WHERE status = 'pending';

-- Show updated users
SELECT email, status, "emailVerified" FROM users;
EOF

echo ""
echo "✅ All users are now ACTIVE!"
echo ""
echo "You can now login with any registered user:"
echo "- john@example.com / John123!"
echo "- Or any other user you registered"
echo ""
echo "Test login:"
echo 'curl -X POST http://localhost:3010/api/v1/auth/login \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"email":"john@example.com","password":"John123!"}'"'"
