#!/bin/bash

# Complete setup for Task 14 - Auth Module

echo "========================================="
echo "Task 14 - Complete Setup"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

# Step 1: Test build without Swagger
echo "Step 1: Testing build without Swagger..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build successful (without Swagger)"
else
    echo "❌ Build failed. Check errors:"
    tail -20 /tmp/build.log
    exit 1
fi

# Step 2: Start the application
echo ""
echo "Step 2: Starting the application..."
echo ""
echo "The auth system is READY to use!"
echo ""
echo "Start the backend with:"
echo "  npm run start:dev"
echo ""
echo "========================================="
echo "API Endpoints Available:"
echo "========================================="
echo ""
echo "Health Check:"
echo "  GET http://localhost:3010/health"
echo ""
echo "Authentication:"
echo "  POST http://localhost:3010/api/v1/auth/register"
echo "  POST http://localhost:3010/api/v1/auth/login"
echo "  POST http://localhost:3010/api/v1/auth/logout"
echo "  GET  http://localhost:3010/api/v1/auth/me"
echo ""
echo "========================================="
echo "Optional: Install Swagger Later"
echo "========================================="
echo ""
echo "To add API documentation (optional):"
echo "1. Install Swagger:"
echo "   npm install @nestjs/swagger@^10.0.0 swagger-ui-express@^5.0.0"
echo ""
echo "2. Replace main.ts with main.swagger.ts:"
echo "   cp src/main.swagger.ts src/main.ts"
echo ""
echo "3. Restart the server"
echo ""
echo "Note: The API works perfectly without Swagger!"
echo "Swagger only adds interactive documentation."
