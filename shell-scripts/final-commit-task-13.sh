#!/bin/bash

# Final commit for Task 13 with all updates

echo "========================================="
echo "Final Commit for Task 13"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product

# Show what will be committed
echo "Files to be committed:"
git status --short

echo ""
read -p "Commit these changes? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Add all changes
    git add -A
    
    # Create commit
    git commit -m "feat: complete Task 13 - Base Entity implementation ✅

TASK-013 COMPLETE: Base Entity with audit fields and soft delete

Implementation:
- BaseEntity with audit fields (id, createdAt, updatedAt, createdBy, updatedBy, version, isActive)
- SoftDeleteEntity with soft delete capability (deletedAt, deletedBy, isDeleted)
- AuditSubscriber for automatic audit field management
- Example Product entity demonstrating usage
- TypeORM configuration with auto-sync in development

Status:
- Backend running successfully on port 3010
- Database connected and tables auto-created
- Health endpoint confirmed working
- TypeORM synchronize: true for development
- Ready for Task 14: User Entity and Auth Module

Files created/modified:
- src/common/entities/base.entity.ts
- src/common/entities/index.ts
- src/common/subscribers/audit.subscriber.ts
- src/entities/product.entity.ts
- src/app.module.ts (registered AuditSubscriber)
- typeorm.config.ts (migration configuration)
- package.json (migration scripts)
- shell-scripts/test-base-entity.sh and related test scripts

No manual migration needed - TypeORM auto-sync handles schema in development"

    # Push to GitHub
    echo ""
    echo "Pushing to GitHub..."
    git push origin develop
    
    echo ""
    echo "========================================="
    echo "✅ Task 13 Successfully Committed!"
    echo "========================================="
    echo ""
    echo "GitHub: https://github.com/namaqua/product"
    echo "Branch: develop"
    echo ""
    echo "Next: Task 14 - User Entity and Auth Module"
else
    echo "Commit cancelled"
fi
