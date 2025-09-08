# PIM Quick Reference Guide

## 🚀 Starting & Stopping

### Start Everything
```bash
cd /Users/colinroets/dev/projects/product
./start-pim.sh
cd pim && npm run start:dev
```

### Stop Everything
```bash
# Stop backend: Ctrl+C
cd /Users/colinroets/dev/projects/product
./stop-pim.sh
```

## 🔍 Health Checks

```bash
# Check if backend is running
curl http://localhost:3010/health

# Check if PostgreSQL is running
docker ps | grep postgres-pim

# Check database connection
docker exec postgres-pim pg_isready -U pim_user -d pim_dev
```

## 📊 Database Commands

### Connect to Database
```bash
# Using Docker
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# Using psql (if installed)
psql -h localhost -p 5433 -U pim_user -d pim_dev
```

### Common SQL Queries
```sql
-- Count products
SELECT COUNT(*) FROM products;

-- View products with names
SELECT p.sku, p.price, pl.name 
FROM products p 
JOIN product_locales pl ON p.id = pl."productId"
WHERE pl."localeCode" = 'en';

-- Check product status
SELECT sku, status, "isVisible", quantity FROM products;

-- View all tables
\dt

-- Describe table structure
\d products
```

## 🌐 API Testing

### Get Products (No Auth Required)
```bash
# Basic list
curl http://localhost:3010/api/v1/products

# With names
curl 'http://localhost:3010/api/v1/products?includeLocales=true'

# Pretty print
curl -s http://localhost:3010/api/v1/products | python3 -m json.tool

# Get single product
curl http://localhost:3010/api/v1/products/sku/LAPTOP-001

# Statistics
curl http://localhost:3010/api/v1/products/statistics
```

### Authentication (When Enabled)
```bash
# Register user
curl -X POST http://localhost:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# Use token
TOKEN="your-jwt-token-here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3010/api/v1/products
```

## 🐳 Docker Commands

### Container Management
```bash
# List all containers
docker ps

# List PIM containers
docker ps | grep pim

# View logs
docker logs postgres-pim
docker logs postgres-pim --tail 50 -f

# Stop container
docker stop postgres-pim

# Remove container
docker rm postgres-pim

# Clean up volumes (WARNING: Deletes data!)
docker-compose down -v
```

### Database Backup & Restore
```bash
# Backup
docker exec postgres-pim pg_dump -U pim_user pim_dev > backup.sql

# Restore
docker exec -i postgres-pim psql -U pim_user pim_dev < backup.sql
```

## 🔧 Development Commands

### Backend Development
```bash
cd /Users/colinroets/dev/projects/product/pim

# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test
npm run test:watch
npm run test:cov

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run
```

### TypeORM Commands
```bash
# Generate entity
nest g class modules/products/entities/new-entity.entity

# Clear cache
npm run typeorm cache:clear
```

## 🐛 Troubleshooting

### Check What's Using Ports
```bash
# Check specific port
lsof -i :5433  # PostgreSQL
lsof -i :3010  # Backend API

# Check all ports
netstat -an | grep LISTEN
```

### Reset Database
```bash
# Stop everything
./stop-pim.sh

# Remove volume (deletes all data)
docker-compose down -v

# Start fresh
./start-pim.sh
```

### Clear Node Modules
```bash
cd pim
rm -rf node_modules package-lock.json
npm install
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `/pim/.env` | Environment variables |
| `/docker-compose.yml` | Docker services configuration |
| `/scripts/init-db.sql` | Database initialization |
| `/pim/src/modules/products/` | Product module code |
| `/pim/src/config/database.config.ts` | Database configuration |

## 🔗 Useful URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3010 |
| Health Check | http://localhost:3010/health |
| Products API | http://localhost:3010/api/v1/products |
| API Docs (when enabled) | http://localhost:3010/api/docs |
| PostgreSQL | localhost:5433 |

## 📝 Environment Variables

```bash
# Key variables in .env
DATABASE_PORT=5433  # Not 5432!
PORT=3010          # Backend port
JWT_SECRET=your-secret-key-change-me-to-something-secure
```

## 🎯 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Products API returns empty | Check DATABASE_PORT=5433 in .env |
| Port 5432 conflict | Marketplace uses 5432, PIM uses 5433 |
| Authentication errors | Auth is disabled in ProductsController |
| Cannot connect to database | Run `./start-pim.sh` first |
| TypeORM sync issues | synchronize is disabled in database.config.ts |

## 🏃 Quick Test Flow

```bash
# 1. Start services
./start-pim.sh

# 2. Start backend
cd pim && npm run start:dev

# 3. Test health
curl http://localhost:3010/health

# 4. Get products
curl http://localhost:3010/api/v1/products

# 5. Check specific product
curl http://localhost:3010/api/v1/products/sku/LAPTOP-001
```

---

**Remember:** 
- PostgreSQL runs on port **5433** (not 5432)
- Authentication is **temporarily disabled**
- All product names are in the **product_locales** table
