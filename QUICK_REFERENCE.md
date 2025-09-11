# PIM Quick Reference Guide

## 🚀 Starting & Stopping

### Start Everything
```bash
cd /Users/colinroets/dev/projects/product
docker-compose up -d                    # Start PostgreSQL & Redis
cd engines && npm run start:dev         # Start backend (port 3010)
cd admin && npm run dev                 # Start frontend (port 5173)
```

### Quick Start (from root)
```bash
npm run dev                              # Starts both backend and frontend
```

### Stop Everything
```bash
# Stop backend: Ctrl+C
# Stop frontend: Ctrl+C
docker-compose down                      # Stop Docker services
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

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React admin interface |
| **Backend API** | http://localhost:3010/api/v1 | REST API |
| **API Docs** | http://localhost:3010/api/docs | Swagger documentation |
| **PostgreSQL** | localhost:5433 | Database |
| **Redis** | localhost:6380 | Cache (optional) |

## 🔑 Default Credentials

```
Email: admin@test.com
Password: Admin123!
```

## 📊 Database Commands

### Connect to Database
```bash
# Using Docker
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# Using psql directly
psql -h localhost -p 5433 -U pim_user -d pim_dev
```

### Common SQL Queries
```sql
-- Count products
SELECT COUNT(*) FROM products;

-- View products
SELECT id, sku, name, price, quantity FROM products;

-- Check users
SELECT email, role, "isActive" FROM users;

-- View all tables
\dt

-- Describe table structure
\d products
```

## 🌐 API Testing

### Authentication
```bash
# Login to get token
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'

# Save token for reuse
TOKEN="your-jwt-token-here"

# Use token in requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3010/api/v1/products
```

### Products API
```bash
# List products
curl http://localhost:3010/api/v1/products

# Get single product
curl http://localhost:3010/api/v1/products/1

# Create product (requires auth)
curl -X POST http://localhost:3010/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TEST-001",
    "name": "Test Product",
    "price": 99.99,
    "quantity": 100
  }'
```

### Categories API
```bash
# Get category tree
curl http://localhost:3010/api/v1/categories/tree

# Get root categories
curl http://localhost:3010/api/v1/categories/roots
```

## 🐳 Docker Commands

### Container Management
```bash
# View running containers
docker ps

# View logs
docker logs postgres-pim --tail 50 -f

# Restart containers
docker-compose restart

# Clean everything (WARNING: Deletes data!)
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

### Backend (engines/)
```bash
cd engines

# Install dependencies
npm install

# Run in development
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend (admin/)
```bash
cd admin

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Migrations
```bash
cd engines

# Generate migration from entities
npm run migration:generate -- -n MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Check what's using a port
lsof -i :3010  # Backend
lsof -i :5173  # Frontend
lsof -i :5433  # PostgreSQL

# Kill process on port
lsof -ti:3010 | xargs kill -9
```

### Reset Everything
```bash
# From project root
docker-compose down -v                  # Remove containers and volumes
rm -rf engines/node_modules admin/node_modules
npm install                              # Reinstall all dependencies
docker-compose up -d                    # Start fresh
```

### Debug Tools
```javascript
// Browser console commands
debugAuth()                              // Check auth state
localStorage.getItem('access_token')    // View JWT token
localStorage.clear()                     // Clear all data
```

## 📁 Project Structure

```
/Users/colinroets/dev/projects/product/
├── engines/                 # Backend (NestJS)
│   ├── src/
│   │   └── modules/        # Feature modules
│   └── uploads/            # Media files
├── admin/                   # Frontend (React)
│   └── src/
│       ├── components/     # UI components
│       └── features/       # Feature modules
├── docs/                    # Documentation
├── shell-scripts/           # Automation scripts
└── docker-compose.yml       # Docker config
```

## 🎯 Common Tasks

### Test Authentication Flow
```bash
./shell-scripts/test-auth-token.sh
```

### Test Product CRUD
```bash
./shell-scripts/test-products-fix.sh
```

### Upload Test Images
```bash
./shell-scripts/fix-test-images.sh
```

### Push to GitHub
```bash
./shell-scripts/git-push.sh
```

## 📈 API Response Format

All API responses follow this structure:
```json
{
    "success": true,
    "data": {
        // Response data here
    },
    "timestamp": "2025-09-11T19:35:12.806Z"
}
```

## 🔗 Module Endpoints

| Module | Base Path | Key Endpoints |
|--------|-----------|---------------|
| Auth | `/api/v1/auth` | login, register, refresh, profile |
| Products | `/api/v1/products` | CRUD, archive, duplicate |
| Categories | `/api/v1/categories` | tree, roots, ancestors |
| Attributes | `/api/v1/attributes` | CRUD, types, groups |
| Media | `/api/v1/media` | upload, gallery |
| Users | `/api/v1/users` | CRUD, roles |

## 💡 Pro Tips

1. **Always use port 5433** for PostgreSQL (not 5432)
2. **JWT tokens expire** - use refresh endpoint
3. **Use npm workspaces** - install from root directory
4. **Check logs** for debugging: `docker logs postgres-pim`
5. **Use shell scripts** for common tasks
6. **Browser DevTools** - Network tab shows API calls

## 🏃 Quick Test Flow

```bash
# 1. Start everything
cd /Users/colinroets/dev/projects/product
docker-compose up -d
cd engines && npm run start:dev         # Terminal 1
cd admin && npm run dev                 # Terminal 2

# 2. Test backend
curl http://localhost:3010/health

# 3. Login to frontend
# http://localhost:5173
# admin@test.com / Admin123!

# 4. Test API
curl http://localhost:3010/api/v1/products
```

---

**Remember:** 
- PostgreSQL runs on port **5433** (not 5432)
- Backend API prefix is `/api/v1`
- Frontend uses **admin@test.com** for login
- All media files stored in `engines/uploads/`