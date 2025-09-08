#!/bin/bash

# Commit Task 13 completion

echo "========================================="
echo "Committing Task 13 - Base Entity"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product

# Check git status
echo "1. Current git status:"
git status --short

echo ""
echo "2. Adding files..."
git add -A

echo ""
echo "3. Creating commit..."
git commit -m "feat: complete base entity implementation (TASK-013)

- Add BaseEntity with audit fields (id, createdAt, updatedAt, createdBy, updatedBy)
- Add SoftDeleteEntity extending BaseEntity with soft delete capability
- Add AuditSubscriber for automatic audit field management
- Add example Product entity demonstrating usage
- Add TypeORM configuration for migrations
- Add migration scripts to package.json
- Register AuditSubscriber in AppModule
- All tests passing, health endpoint confirmed working

Next: TASK-014 - User Entity and Auth Module"

echo ""
echo "4. Pushing to GitHub..."
git push origin develop

echo ""
echo "========================================="
echo "✅ Task 13 committed and pushed!"
echo "========================================="
