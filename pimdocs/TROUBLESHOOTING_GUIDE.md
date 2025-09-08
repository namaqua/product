# 🔧 Product Module - Setup & Troubleshooting Guide

## ⚠️ Migration Error Fix

You encountered TypeScript errors with the migration file. Here's the solution:

### Option 1: Use TypeORM Auto-Sync (Recommended for Development)

TypeORM can automatically create tables from your entities in development mode. This is already configured!

**No migrations needed!** Just run:

```bash
cd /Users/colinroets/dev/projects/product/pim
npm run start:dev
```

TypeORM will:
1. Read all entity files
2. Auto-create tables with proper relationships
3. Keep them in sync with your entities

### Option 2: Manual Database Setup

If you prefer to control the database schema:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user if not exists
CREATE DATABASE pim_dev;
CREATE USER pim_user WITH PASSWORD 'secure_password_change_me';
GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;
\q

-- Connect as pim_user
psql -U pim_user -d pim_dev

-- Tables will be auto-created by TypeORM when you run the app
```

## 🚀 Quick Start (3 Steps)

### Step 1: Make scripts executable
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x *.sh
```

### Step 2: Run quick start
```bash
./quick-start.sh
```

### Step 3: Test the API
In another terminal:
```bash
./test-products.sh
```

## 📋 What's Happening Behind the Scenes

When you run `npm run start:dev`:

1. **TypeORM connects** to PostgreSQL
2. **Reads all entities** from `src/**/*.entity.ts`
3. **Auto-creates tables** with:
   - Proper column types
   - Foreign key relationships
   - Indexes
   - Unique constraints
4. **Starts the server** on port 3010

## 🧪 Verify Everything Works

### Test 1: Check server is running
```bash
curl http://localhost:3010/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Test 2: Check tables were created
```bash
export PGPASSWORD='secure_password_change_me'
psql -U pim_user -d pim_dev -h localhost -c "\dt"
```

You should see:
- products
- product_locales
- product_variants
- product_bundles
- product_relationships
- product_attributes
- product_media
- product_categories
- users
- (and more)

### Test 3: Seed sample data
```bash
cd /Users/colinroets/dev/projects/product/pim
npm run seed
```

### Test 4: Get products
```bash
# First login
TOKEN=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Get products
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3010/api/v1/products
```

## 🛠️ Troubleshooting

### Error: "Cannot find module"
```bash
cd /Users/colinroets/dev/projects/product/pim
rm -rf node_modules
npm install
```

### Error: "Port 3010 in use"
```bash
# Find what's using the port
lsof -i :3010

# Kill it
kill -9 <PID>
```

### Error: "Database connection failed"
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Start if needed
brew services start postgresql

# Or on Linux
sudo systemctl start postgresql
```

### Error: TypeScript compilation errors
The migration file had syntax issues, but we don't need it! TypeORM auto-sync handles everything.

If you still want to use migrations later:
1. Delete the migration file
2. Let TypeORM create tables first
3. Generate migrations from existing schema:
```bash
npm run migration:generate -- -n InitialSchema
```

## ✅ Success Checklist

- [ ] PostgreSQL is running
- [ ] Database `pim_dev` exists
- [ ] User `pim_user` has access
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors
- [ ] Health check returns OK
- [ ] Tables are created automatically
- [ ] Sample data is seeded
- [ ] API endpoints work with auth

## 📱 Available Scripts

| Script | Purpose |
|--------|---------|
| `./quick-start.sh` | Start server quickly |
| `./start-product-module.sh` | Full setup and start |
| `./test-products.sh` | Test all API endpoints |
| `./troubleshoot.sh` | Diagnose issues |
| `./test-setup.sh` | Verify installation |

## 🎯 Next Steps

Once everything is running:

1. **Explore the API**
   - Open http://localhost:3010/health
   - Use Postman or curl to test endpoints

2. **Check the database**
   - See the auto-created tables
   - Review the sample products

3. **Build the frontend**
   - Create product list component
   - Add product form
   - Integrate with API

## 💡 Pro Tips

1. **Development Mode Benefits**
   - TypeORM synchronize auto-updates tables
   - Hot reload on code changes
   - Detailed logging

2. **Don't worry about migrations yet**
   - Perfect for development
   - Migrations are for production
   - Generate them later from working schema

3. **Use the seed data**
   - 6 sample products included
   - Test all features
   - Good for UI development

## 📞 Still Having Issues?

Run the troubleshoot script:
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
./troubleshoot.sh
```

This will check:
- Node.js and npm
- PostgreSQL connection
- Database tables
- Project files
- TypeScript compilation
- Port availability

---

**Remember:** The migration errors you saw are not a problem! TypeORM's auto-sync feature handles everything in development mode. Just run `npm run start:dev` and it works! 🚀
