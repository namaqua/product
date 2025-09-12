# PIM Quick Reference

## Project Status
- **Core Features**: 98% Complete
- **Active Work**: Product Variants Implementation
- **Timeline**: 2 weeks to MVP completion

## Access Points
```bash
# Start everything
cd /Users/colinroets/dev/projects/product
docker-compose up -d
cd engines && npm run start:dev
cd ../admin && npm run dev

# URLs
Frontend: http://localhost:5173
Backend: http://localhost:3010/api/v1
Swagger: http://localhost:3010/api/docs
Login: admin@test.com / Admin123!
```

## Current Implementation Status

### ✅ Completed Modules
| Module | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Auth | 8 endpoints | Login, Guards, Refresh | ✅ 100% |
| Products | 11 endpoints | List, CRUD, Details | ✅ 100% |
| Categories | 15+ endpoints | Tree, Drag-drop | ✅ 100% |
| Attributes | 14 endpoints | Full management UI | ✅ 100% |
| Media | 9 endpoints | Upload, Gallery | ✅ 100% |
| Users | 9 endpoints | Full management | ✅ 100% |
| **Total** | **66+ endpoints** | **All UIs** | **✅ 98%** |

### 🔧 Active: Product Variants
- **Current**: Basic parent-child UI (40% done)
- **Needed**: Backend endpoints, wizard UI, matrix view
- **Reference**: `/docs/VARIANT_IMPLEMENTATION_CONTINUATION.md`

## This Week's Focus (Sept 12-19)
1. Create variant database migration
2. Implement variant DTOs
3. Add variant service methods
4. Create controller endpoints
5. Test API with Postman

## API Response Format
```typescript
{
  success: boolean,
  message: string,
  data: T | { items: T[], meta: {...} },
  timestamp: string
}
```

## Common Field Names
- `quantity` (not inventoryQuantity)
- `urlKey` (not slug)  
- `isFeatured` (not featured)
- `status`: 'draft' | 'published' | 'archived'

## Known Issues
- Auth refresh token returns 401
- Categories/attributes sometimes null in responses

## Key Commands
```bash
# Database
docker exec -it product-postgres-1 psql -U postgres -d pim_dev

# Logs
docker logs product-postgres-1
pm2 logs engines

# Testing
cd shell-scripts
./test-products-fix.sh
./test-media-api.sh
```

## Documentation Map
- **Active Plan**: `/docs/VARIANT_IMPLEMENTATION_CONTINUATION.md`
- **Tasks**: `/docs/TASKS.md`
- **API Standards**: `/docs/API_STANDARDS.md`
- **Setup**: `/docs/PROJECT_INSTRUCTIONS.md`

---
*Priority: Complete Product Variants Implementation*
*Timeline: 2 weeks to MVP*
*Last Updated: Sept 12, 2025*