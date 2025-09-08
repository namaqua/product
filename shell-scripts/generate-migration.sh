#!/bin/bash

# Generate and run first migration for base entities
# This creates the initial database schema

echo "========================================="
echo "Generating First Migration"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

# Build the project first
echo "Building project..."
npm run build

# Generate migration
echo ""
echo "Generating migration for base entities..."
npm run typeorm -- migration:generate -n InitialSchema -d dist/config/database.config.js

echo ""
echo "Migration generated. To run it:"
echo "npm run typeorm -- migration:run -d dist/config/database.config.js"
echo ""
echo "Note: Make sure your database is running and .env is configured"
