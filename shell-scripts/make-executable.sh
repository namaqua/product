#!/bin/bash

# Make shell scripts executable
echo "Making all migration and variant scripts executable..."

cd /Users/colinroets/dev/projects/product/shell-scripts

# Make all scripts executable
chmod +x run-variant-migration.sh
chmod +x test-variant-endpoints.sh
chmod +x check-and-migrate.sh
chmod +x quick-fix-migration.sh
chmod +x fix-migrations.sh
chmod +x reset-migrations.sh
chmod +x check-compilation.sh
chmod +x get-jwt-token.sh
chmod +x test-variants-auto.sh

echo "✅ All scripts are now executable!"
echo ""
echo "Available scripts:"
echo ""
echo "🚀 Quick Solutions:"
echo "  ./fix-migrations.sh         - Fix migration issues and run (RECOMMENDED)"
echo "  ./reset-migrations.sh       - Reset and re-run migrations cleanly"
echo ""
echo "🔧 Other Tools:"
echo "  ./check-and-migrate.sh      - Check DB and run migration"
echo "  ./quick-fix-migration.sh    - Quick fix for variant migration"
echo "  ./run-variant-migration.sh  - Run migrations directly"
echo "  ./check-compilation.sh      - Check TypeScript compilation"
echo "  ./test-variant-endpoints.sh - Test the variant API endpoints"
echo ""
echo "Start with: ./fix-migrations.sh"
