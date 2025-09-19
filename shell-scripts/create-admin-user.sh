#!/bin/bash
# Create EXACT user requested - admin@test.com / Admin123!

echo "🔐 Creating admin@test.com user"
echo "================================"
echo ""

# Create the user with the exact credentials requested
docker exec postgres-pim psql -U pim_user -d pim_dev << 'EOF'
-- Ensure table exists with all needed columns
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    "isActive" BOOLEAN DEFAULT true,
    "emailVerified" BOOLEAN DEFAULT true,
    "refreshToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP,
    "emailVerificationToken" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP,
    "deletedBy" UUID,
    "isDeleted" BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1
);

-- Delete any existing user with this email
DELETE FROM users WHERE email = 'admin@test.com';

-- Create admin@test.com with password Admin123!
-- This is the bcrypt hash of 'Admin123!'
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    role,
    status,
    "isActive",
    "emailVerified",
    "createdAt",
    "updatedAt",
    version
) VALUES (
    gen_random_uuid(),
    'admin@test.com',
    '$2a$10$K7L1OJ0TfgLqRxlq6dqQzOXUREtSgJxq2xqKU5hR8wjLr6Y7aaqJu',
    'Admin',
    'User',
    'ADMIN',
    'ACTIVE',
    true,
    true,
    NOW(),
    NOW(),
    1
);

-- Verify the user was created
SELECT email, "firstName", "lastName", role, status, "isActive" 
FROM users 
WHERE email = 'admin@test.com';
EOF

echo ""
echo "✅ User Created Successfully!"
echo ""
echo "📧 Email: admin@test.com"
echo "🔑 Password: Admin123!"
echo "👤 Role: ADMIN"
echo ""
echo "Test the login with:"
echo "curl -X POST http://localhost:3010/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"admin@test.com\",\"password\":\"Admin123!\"}'"
