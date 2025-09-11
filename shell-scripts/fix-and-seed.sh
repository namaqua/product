#!/bin/bash

echo "🗑️ Removing problematic backup entities directory..."

cd /Users/colinroets/dev/projects/product/pim

# Remove the backup directory completely
rm -rf src/modules/products/_backup_entities.DISABLED

echo "✅ Backup directory removed"

# Try to run seed again
echo "🌱 Running seed..."
npm run seed
