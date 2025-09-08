#!/bin/bash

# Test Auth Module - Task 14 Verification

echo "========================================="
echo "Testing Auth Module Setup (Task 14)"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

# Check if all auth files exist
echo "1. Checking auth module files..."
AUTH_FILES=(
    "src/modules/users/entities/user.entity.ts"
    "src/modules/users/dto/user.dto.ts"
    "src/modules/users/users.service.ts"
    "src/modules/users/users.controller.ts"
    "src/modules/users/users.module.ts"
    "src/modules/auth/auth.service.ts"
    "src/modules/auth/auth.controller.ts"
    "src/modules/auth/auth.module.ts"
    "src/modules/auth/strategies/jwt.strategy.ts"
    "src/modules/auth/guards/jwt-auth.guard.ts"
    "src/modules/auth/decorators/current-user.decorator.ts"
)

ALL_EXIST=true
for file in "${AUTH_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - NOT FOUND"
        ALL_EXIST=false
    fi
done

if [ "$ALL_EXIST" = false ]; then
    echo ""
    echo "Some files are missing. Please check the implementation."
    exit 1
fi

# Build the project
echo ""
echo "2. Building the project..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed. Check errors:"
    cat /tmp/build.log
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Task 14: Auth Module Files Created"
echo "========================================="
echo ""
echo "To test the auth endpoints:"
echo ""
echo "1. Install dependencies:"
echo "   cd /Users/colinroets/dev/projects/product/shell-scripts"
echo "   chmod +x install-auth-deps.sh"
echo "   ./install-auth-deps.sh"
echo ""
echo "2. Start the backend:"
echo "   cd /Users/colinroets/dev/projects/product/pim"
echo "   npm run start:dev"
echo ""
echo "3. View API documentation:"
echo "   http://localhost:3010/api/docs"
echo ""
echo "4. Test registration (in another terminal):"
echo '   curl -X POST http://localhost:3010/api/v1/auth/register \'
echo '   -H "Content-Type: application/json" \'
echo '   -d "{"email":"admin@example.com","password":"Admin123!","firstName":"Admin","lastName":"User"}"'
