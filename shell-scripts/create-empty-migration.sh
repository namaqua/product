#!/bin/bash

# Create an empty migration for future use

echo "========================================="
echo "Creating Empty Migration Template"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

# Create an empty migration
echo "Creating empty migration for future schema changes..."
npm run migration:create -- AddUserEntity

echo ""
echo "========================================="
echo "Migration template created!"
echo "========================================="
echo ""
echo "You can edit this file later to add schema changes."
echo "This is useful when synchronize is set to false."
echo ""
echo "For now in development:"
echo "- TypeORM auto-syncs your entities (synchronize: true)"
echo "- No manual migrations needed"
echo "- Tables are created/updated automatically"
echo ""
echo "For production later:"
echo "- Set synchronize: false"
echo "- Use migrations for all schema changes"
