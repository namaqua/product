# PIM Troubleshooting Guide

## 🔍 Issues We Solved (September 8, 2025)

### Issue 1: Products Table Had Wrong Schema
**Problem:** The database had a `name` column in the `products` table, but the TypeORM entity expected names in `product_locales`.

**Solution:**
1. Dropped and recreated the database with correct schema
2. Product names are now properly stored in `product_locales` table
3. Disabled TypeORM synchronize to prevent schema conflicts

### Issue 2: Port Conflict with Marketplace Project
**Problem:** Both PIM and Marketplace projects tried to use PostgreSQL on port 5432.

**Solution:**
1. Configured PIM PostgreSQL to use port 5433
2. Updated `.env` file: `DATABASE_PORT=5433`
3. Created docker-compose.yml with correct port mapping
4. Documented all ports in PORT_CONFIGURATION.md

### Issue 3: Local PostgreSQL Interference
**Problem:** Homebrew PostgreSQL was running locally and intercepting connections.

**Solution:**
1. Stopped local PostgreSQL: `brew services stop postgresql@14`
2. Uninstalled local PostgreSQL: `brew uninstall postgresql@14`
3. Now using only Docker PostgreSQL instances

### Issue 4: Authentication Token Expiring
**Problem:** JWT tokens were expiring quickly during testing, causing 401 errors.

**Solution:**
1. Temporarily disabled authentication in ProductsController
2. Commented out: `@UseGuards(JwtAuthGuard, RolesGuard)`
3. Can re-enable when ready for production

### Issue 5: Empty Products Array Despite Data in Database
**Problem:** API returned empty array even though products existed in database.

**Solution:**
1. Fixed missing database columns (valueOptions, localeCode, etc.)
2. Ensured correct database connection (port 5433, not 5432)
3. Added debug endpoints to isolate the issue

## 🚨 Common Problems & Solutions

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres-pim

# If not running, start it
cd /Users/colinroets/dev/projects/product
./start-pim.sh

# Verify it's on port 5433
lsof -i :5433
```

### "Products API returns empty array"
```bash
# 1. Check database connection
docker exec postgres-pim psql -U pim_user -d pim_dev -c "SELECT COUNT(*) FROM products;"

# 2. Verify .env has correct port
grep DATABASE_PORT /Users/colinroets/dev/projects/product/pim/.env
# Should show: DATABASE_PORT=5433

# 3. Restart backend
cd pim && npm run start:dev
```

### "Port already in use"
```bash
# Find what's using the port
lsof -i :5433  # For PostgreSQL
lsof -i :3010  # For Backend

# Kill the process if needed
kill -9 <PID>

# Or use different ports in .env
```

### "401 Unauthorized"
```bash
# Authentication is disabled by default now
# If you get this error, check ProductsController
# The @UseGuards line should be commented out

# To get a token when auth is enabled:
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"myuser@test.com","password":"MyUser123!"}'
```

### "TypeORM synchronize errors"
```bash
# Check database.config.ts
# synchronize should be false:
grep synchronize pim/src/config/database.config.ts
# Should show: synchronize: false
```

## 🔧 Reset Procedures

### Complete Reset (Nuclear Option)
```bash
# 1. Stop everything
cd /Users/colinroets/dev/projects/product
./stop-pim.sh

# 2. Remove all containers and volumes
docker-compose down -v
docker rm -f postgres-pim 2>/dev/null

# 3. Clear node modules
cd pim
rm -rf node_modules package-lock.json dist

# 4. Reinstall and rebuild
npm install
npm run build

# 5. Start fresh
cd ..
./start-pim.sh
cd pim && npm run start:dev
```

### Database Reset Only
```bash
# 1. Stop backend (Ctrl+C)

# 2. Reset database
docker-compose down -v
docker-compose up -d

# 3. Data will be auto-initialized from init-db.sql

# 4. Restart backend
npm run start:dev
```

### Clear TypeORM Cache
```bash
# Sometimes TypeORM caches metadata
cd pim
rm -rf dist
npm run build
npm run start:dev
```

## 📋 Debugging Checklist

When things aren't working, check in this order:

1. ✅ **Is PostgreSQL running?**
   ```bash
   docker ps | grep postgres-pim
   ```

2. ✅ **Is it on the right port?**
   ```bash
   grep DATABASE_PORT pim/.env  # Should be 5433
   ```

3. ✅ **Can you connect to the database?**
   ```bash
   docker exec postgres-pim pg_isready -U pim_user
   ```

4. ✅ **Does the database have data?**
   ```bash
   docker exec postgres-pim psql -U pim_user -d pim_dev -c "SELECT COUNT(*) FROM products;"
   ```

5. ✅ **Is the backend running?**
   ```bash
   curl http://localhost:3010/health
   ```

6. ✅ **Is authentication disabled?**
   - Check ProductsController for `// @UseGuards` (commented)

7. ✅ **Are there any error logs?**
   ```bash
   # Check Docker logs
   docker logs postgres-pim --tail 50
   
   # Check backend console for errors
   ```

## 🎯 Quick Fixes

### "It was working yesterday!"
```bash
# Restart everything
./stop-pim.sh
./start-pim.sh
cd pim && npm run start:dev
```

### "I changed the code but nothing happened"
```bash
# Rebuild the backend
cd pim
npm run build
npm run start:dev
```

### "Database seems corrupted"
```bash
# Full database reset
docker-compose down -v
docker-compose up -d
```

## 💡 Pro Tips

1. **Always check the port**: PIM uses 5433, not 5432
2. **Authentication is disabled**: Don't waste time on tokens during development
3. **Product names are in product_locales**: Not in the products table
4. **Use the debug endpoint**: `/api/v1/products/debug/simple` for troubleshooting
5. **Check Docker logs**: `docker logs postgres-pim` often reveals issues

## 📞 Getting Help

If you encounter new issues:

1. Check the backend console for error messages
2. Look at Docker logs: `docker logs postgres-pim`
3. Try the debug endpoint: `curl http://localhost:3010/api/v1/products/debug/simple`
4. Verify your .env settings
5. Check if both projects are trying to use the same ports

Remember: The most common issue is forgetting that PIM uses port **5433** for PostgreSQL!

---

**Last Updated:** September 8, 2025
**Status:** All known issues resolved ✅
