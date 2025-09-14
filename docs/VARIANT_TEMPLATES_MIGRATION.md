# Variant Templates: Migration from localStorage to Database

## Problem with localStorage

Your observation is correct - localStorage has significant limitations for production use:

1. **Device-specific** - Templates don't sync across devices
2. **Browser-specific** - Lost when switching browsers
3. **Volatile** - Can be cleared by browser cache clearing
4. **No backup** - Lost if browser data is deleted
5. **Not shareable** - Can't share templates between team members
6. **No versioning** - Can't track changes or rollback
7. **Size limits** - localStorage has a 5-10MB limit

## Solution: Database-Stored Templates

We've implemented a proper backend solution with the following benefits:

### ✅ Features

1. **Persistent Storage** - Templates stored in PostgreSQL database
2. **User-Specific Templates** - Each user has their own templates
3. **Global Templates** - Admin can create templates available to all users
4. **Usage Tracking** - Track how often each template is used
5. **Metadata Support** - Store additional info like category, suggested pricing
6. **Version Control** - Track creation/update times and who made changes
7. **Duplicate Function** - Easy copy templates for modification
8. **Categories** - Organize templates by type (apparel, electronics, etc.)

### 📊 Database Schema

```sql
CREATE TABLE variant_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  axisName VARCHAR(100) NOT NULL,
  values JSON NOT NULL,  -- Array of values
  metadata JSON,         -- Additional settings
  isGlobal BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  usageCount INT DEFAULT 0,
  createdBy UUID,
  updatedBy UUID,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### 🔄 Migration Plan

1. **Run Database Migration**
```bash
cd /Users/colinroets/dev/projects/product/engines
npm run migration:generate -- -n AddVariantTemplates
npm run migration:run
```

2. **Seed Default Templates**
Call the seed endpoint to create default templates:
```bash
curl -X POST http://localhost:3010/api/v1/variant-templates/seed-defaults \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Auto-Migrate Existing Templates**
The frontend service includes a migration function that will:
- Read templates from localStorage
- Create them in the database
- Clear localStorage after successful migration

### 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/variant-templates` | Get all templates (global + user's) |
| GET | `/api/v1/variant-templates/my-templates` | Get only user's templates |
| GET | `/api/v1/variant-templates/:id` | Get specific template |
| POST | `/api/v1/variant-templates` | Create new template |
| PUT | `/api/v1/variant-templates/:id` | Update template |
| DELETE | `/api/v1/variant-templates/:id` | Delete template |
| POST | `/api/v1/variant-templates/:id/duplicate` | Duplicate template |
| POST | `/api/v1/variant-templates/seed-defaults` | Seed default templates |

### 🚀 Implementation Steps

#### Backend (Already Done ✅)
1. Created `VariantTemplate` entity
2. Created DTOs for create/update/response
3. Created service with CRUD operations
4. Created controller with API endpoints
5. Added module to app.module.ts

#### Frontend (To Do)
1. Update VariantWizard to use API instead of localStorage
2. Add template management UI
3. Run migration function on first load
4. Add template sharing features

### 📝 Default Templates Included

The system comes with these pre-configured templates:

1. **Clothing Sizes** - XS, S, M, L, XL, XXL, XXXL
2. **Standard Colors** - Black, White, Gray, Navy, Red, Blue, Green, Yellow
3. **Storage Capacity** - 64GB, 128GB, 256GB, 512GB, 1TB, 2TB
4. **Memory (RAM)** - 4GB, 8GB, 16GB, 32GB, 64GB
5. **Materials** - Cotton, Polyester, Wool, Leather, Silk, Linen, Synthetic
6. **Shoe Sizes (US)** - 5 through 12 (with half sizes)
7. **Screen Sizes** - 13", 14", 15", 16", 17", 24", 27", 32"

Each template includes:
- Suggested pricing strategies
- Category classification
- Icon and color coding
- Usage statistics

### 🔐 Security & Permissions

- **Personal Templates** - Only visible to creator
- **Global Templates** - Visible to all users (created by admin)
- **Edit/Delete** - Only by owner or admin
- **Duplicate** - Anyone can duplicate any visible template

### 💡 Benefits Over localStorage

| Feature | localStorage | Database |
|---------|-------------|----------|
| Persistence | ❌ Browser only | ✅ Permanent |
| Cross-device | ❌ No | ✅ Yes |
| Backup | ❌ No | ✅ Yes |
| Sharing | ❌ No | ✅ Yes |
| Versioning | ❌ No | ✅ Yes |
| Size limit | ❌ 5-10MB | ✅ Unlimited |
| Search | ❌ Basic | ✅ Advanced |
| Analytics | ❌ No | ✅ Usage tracking |

### 🔄 Auto-Migration Code

The frontend service includes this migration function:

```typescript
async migrateFromLocalStorage(): Promise<void> {
  // Get templates from localStorage
  const stored = localStorage.getItem('variantTemplates');
  if (!stored) return;
  
  const localTemplates = JSON.parse(stored);
  
  // Create each template in database
  for (const template of localTemplates) {
    await variantTemplateService.create({
      name: template.name,
      axisName: template.name,
      values: template.values,
      // ... other fields
    });
  }
  
  // Clear localStorage after migration
  localStorage.removeItem('variantTemplates');
}
```

### 📱 Frontend Integration Example

```typescript
// In VariantWizard component
useEffect(() => {
  loadTemplates();
}, []);

const loadTemplates = async () => {
  try {
    // First, try to migrate any localStorage templates
    await variantTemplateService.migrateFromLocalStorage();
    
    // Then load templates from database
    const response = await variantTemplateService.getAll();
    setTemplates(response.data.items);
  } catch (error) {
    console.error('Failed to load templates:', error);
  }
};
```

## Next Steps

1. **Run the migration** to create the database table
2. **Restart the backend** to load the new module
3. **Update the VariantWizard** to use the API
4. **Test the migration** from localStorage
5. **Add template management UI** for creating/editing templates

This solution provides a production-ready, scalable approach to variant template management that will grow with your application needs.
