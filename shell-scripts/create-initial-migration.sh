#!/bin/bash

# Generate and run the first migration for base entities

echo "========================================="
echo "Creating Initial Database Migration"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

# Step 1: Build the project
echo "1. Building the project..."
npm run build
if [ $? -ne 0 ]; then
    echo "   ❌ Build failed. Fix TypeScript errors first."
    exit 1
fi
echo "   ✅ Build successful"

# Step 2: Generate migration
echo ""
echo "2. Generating migration..."
npm run migration:generate -- InitialSchema

# Check if migration was created
MIGRATION_FILE=$(ls -t src/migrations/*.ts 2>/dev/null | head -1)
if [ -n "$MIGRATION_FILE" ]; then
    echo "   ✅ Migration created: $MIGRATION_FILE"
    echo ""
    echo "3. Migration preview:"
    echo "   ----------------------------------------"
    head -30 "$MIGRATION_FILE"
    echo "   ----------------------------------------"
else
    echo "   ⚠️  No migration generated (tables might already be in sync)"
fi

echo ""
echo "========================================="
echo "Next steps:"
echo "========================================="
echo "1. Review the migration file above"
echo "2. Run the migration to create tables:"
echo "   npm run migration:run"
echo ""
echo "3. Check the database for new tables:"
echo "   psql -U pim_user -d pim_dev -h localhost"
echo "   \\dt"
echo "   \\d products"
echo ""
echo "4. To revert if needed:"
echo "   npm run migration:revert"
