#!/bin/bash

# MINIMAL FIX - Just fix the createdBy error

echo "🔧 Fixing createdBy error..."

# Add the missing columns
docker exec postgres-pim psql -U pim_user -d pim_dev << 'EOF'
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS "createdBy" UUID,
ADD COLUMN IF NOT EXISTS "updatedBy" UUID;

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS "createdBy" UUID,
ADD COLUMN IF NOT EXISTS "updatedBy" UUID;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS "createdBy" UUID,
ADD COLUMN IF NOT EXISTS "updatedBy" UUID;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS "createdBy" UUID,
ADD COLUMN IF NOT EXISTS "updatedBy" UUID;
EOF

echo "✅ Fixed!"
echo ""
echo "Restart backend:"
echo "  cd /Users/colinroets/dev/projects/product/engines && npm run start:dev"
