#!/bin/bash

# Check PostgreSQL and database setup

echo "========================================="
echo "Database Connectivity Check"
echo "========================================="
echo ""

# Check if PostgreSQL is running
echo "1. Checking if PostgreSQL is running..."
if pg_isready > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL is running"
else
    echo "   ❌ PostgreSQL is not running"
    echo "   Start it with: brew services start postgresql"
    exit 1
fi

# Check if we can connect to the database
echo ""
echo "2. Testing database connection..."
PGPASSWORD=secure_password_change_me psql -U pim_user -d pim_dev -h localhost -c "SELECT current_database();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Successfully connected to pim_dev database"
else
    echo "   ❌ Cannot connect to database"
    echo "   Possible issues:"
    echo "   - Wrong password in .env file"
    echo "   - Database 'pim_dev' doesn't exist"
    echo "   - User 'pim_user' doesn't exist"
    echo ""
    echo "   To create database and user:"
    echo "   psql -U postgres"
    echo "   CREATE USER pim_user WITH PASSWORD 'secure_password_change_me';"
    echo "   CREATE DATABASE pim_dev OWNER pim_user;"
    echo "   CREATE DATABASE pim_test OWNER pim_user;"
    echo "   \q"
fi

# Check tables (if any exist)
echo ""
echo "3. Checking for existing tables..."
PGPASSWORD=secure_password_change_me psql -U pim_user -d pim_dev -h localhost -c "\dt" 2>/dev/null | grep -E "products|users"
if [ $? -eq 0 ]; then
    echo "   ✅ Some tables exist"
else
    echo "   ℹ️  No tables yet (run migrations to create them)"
fi

echo ""
echo "========================================="
echo "Next steps:"
echo "========================================="
echo "1. If database connection works, start the app:"
echo "   cd /Users/colinroets/dev/projects/product/pim"
echo "   npm run start:dev"
echo ""
echo "2. Generate and run migrations:"
echo "   npm run build"
echo "   npm run migration:generate -- InitialSchema"
echo "   npm run migration:run"
