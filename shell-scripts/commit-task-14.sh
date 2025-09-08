#!/bin/bash

# Commit Task 14 - User Entity and Auth Module

echo "========================================="
echo "Committing Task 14 - Auth Module"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product

# Show status
echo "Files to commit:"
git status --short

echo ""
read -p "Proceed with commit? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A
    git commit -m "feat: implement user entity and auth module (TASK-014)

TASK-014 COMPLETE: Full authentication system

Implementation:
- User entity extending BaseEntity with auth fields
- Complete authentication module with JWT
- Refresh token mechanism
- Role-based access control (ADMIN, MANAGER, USER)
- User status management (ACTIVE, INACTIVE, PENDING, SUSPENDED)
- Password hashing with bcrypt
- Email verification system
- Password reset functionality

Auth Endpoints:
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
- Full CRUD operations for users
- Role and status management
- User statistics endpoint
- Protected admin endpoints

Security Features:
- JWT with 15min access token expiry
- 7-day refresh tokens
- Strong password validation
- Protected routes with guards
- Current user decorator
- Roles decorator for RBAC

API Documentation:
- Swagger/OpenAPI integration
- Interactive docs at /api/docs
- Bearer auth in Swagger UI

Next: TASK-015 - Common modules and utilities"

    git push origin develop
    
    echo ""
    echo "✅ Task 14 committed and pushed!"
    echo ""
    echo "To test:"
    echo "1. Install Swagger: npm install @nestjs/swagger swagger-ui-express"
    echo "2. Start backend: npm run start:dev"
    echo "3. View API docs: http://localhost:3010/api/docs"
else
    echo "Commit cancelled"
fi
