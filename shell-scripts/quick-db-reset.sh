#!/bin/bash

# ===========================================================================
# QUICK DATABASE RESET - Emergency Fix
# ===========================================================================
# Use this for a quick database reset when the main script has issues
# ===========================================================================

set -e

echo "🚨 EMERGENCY DATABASE RESET"
echo "================================"
echo ""

# Quick and dirty database reset
cd /Users/colinroets/dev/projects/product/pim

# 1. Kill backend
echo "1. Stopping backend..."
pkill -f "node.*pim" 2>/dev/null || true
lsof -ti:3010 | xargs kill -9 2>/dev/null || true
sleep 1

# 2. Drop and recreate database
echo "2. Resetting database..."
PGPASSWORD=secure_password_change_me psql -U pim_user -h localhost -p 5432 -d postgres <<EOF
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'pim_dev' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS pim_dev;
CREATE DATABASE pim_dev OWNER pim_user;
EOF

# 3. Start backend (creates tables)
echo "3. Starting backend to create tables..."
npm run start:dev &
BACKEND_PID=$!

# Wait for backend
echo "Waiting for backend..."
for i in {1..20}; do
    if curl -s http://localhost:3010/health > /dev/null 2>&1; then
        echo "✅ Backend ready!"
        break
    fi
    sleep 2
done

# 4. Run seeder
echo "4. Seeding database..."
npm run seed

echo ""
echo "✅ DONE! Backend PID: $BACKEND_PID"
echo "To stop: kill $BACKEND_PID"
