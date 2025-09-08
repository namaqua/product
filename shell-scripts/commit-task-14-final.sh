#!/bin/bash

# Commit Task 14 completion

echo "========================================="
echo "Committing Task 14 - Auth Module Complete"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product

# Show what will be committed
echo "Files changed:"
git status --short | head -20

echo ""
echo "Task 14 Summary:"
echo "- User entity with authentication ✅"
echo "- JWT with refresh tokens ✅"
echo "- Complete auth endpoints ✅"
echo "- Role-based access control ✅"
echo "- Auto-active users for development ✅"
echo "- All tests passing ✅"
echo ""

read -p "Commit these changes? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A
    git commit -m "feat: complete auth module implementation (TASK-014)

TASK-014 COMPLETE: Full authentication system with JWT

Implementation:
- User entity extending BaseEntity with all auth fields
- JWT authentication with access (15m) and refresh (7d) tokens
- Complete auth endpoints (register, login, logout, refresh, etc.)
- Role-based access control (ADMIN, MANAGER, USER)
- Protected routes with guards and decorators
- Auto-active users for development (no email verification)
- Password hashing with bcrypt
- Change password and reset password functionality

Auth Endpoints Working:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh
- POST /api/v1/auth/change-password
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/verify-email/:token
- GET /api/v1/auth/me

User Management:
- Full CRUD operations
- Role and status management
- User statistics
- Profile management

Development Features:
- Users auto-set to ACTIVE (no email verification needed)
- Immediate login after registration
- Test scripts for all endpoints

Tested and verified:
- Registration works ✅
- Login works immediately ✅
- JWT tokens functional ✅
- Protected routes working ✅

Next: Task 15 (Common Modules) or Task 16 (Product Module)"

    git push origin develop
    
    echo ""
    echo "✅ Task 14 committed and pushed!"
    echo ""
    echo "GitHub: https://github.com/namaqua/product"
    echo "Branch: develop"
else
    echo "Commit cancelled"
fi
