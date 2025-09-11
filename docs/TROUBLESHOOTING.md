# Troubleshooting Guide

## 🔴 Current Issue: Frontend White Screen

### Problem
The React frontend starts but shows only a white screen with no content.

### Common Causes
1. Missing PostCSS configuration file
2. Tailwind CSS v4 compatibility issues (v4 is too new)
3. Missing @types/node for path imports in vite.config.ts
4. Dependencies not properly installed

### Solution
Run the fix script:

```bash
cd /Users/colinroets/dev/pim-admin
chmod +x fix-all.sh
./fix-all.sh
```

Or manually fix:

```bash
cd /Users/colinroets/dev/pim-admin

# 1. Clean and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 2. Install missing dependencies
npm install --save-dev @types/node

# 3. Downgrade Tailwind to stable v3
npm uninstall tailwindcss
npm install -D tailwindcss@^3.4.0

# 4. Create PostCSS config if missing
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 5. Restart dev server
npm run dev
```

### Debugging Steps
1. **Check browser console** (F12) for errors
2. **Verify files are loading**: Network tab should show main.tsx loading
3. **Test with simple component**: The debug App.tsx shows if React is working
4. **Check Tailwind**: Blue text in debug component confirms Tailwind works

---

## 🔴 Previous Issue: Backend Not Initialized (RESOLVED)

### Problem
The NestJS backend project directory `/Users/colinroets/dev/pim` exists but is empty (no package.json).

### Solution
Run the backend setup script:

```bash
cd /Users/colinroets/dev/pimdocs
chmod +x setup-backend.sh
./setup-backend.sh
```

This script will:
1. Install NestJS CLI globally (if not installed)
2. Create the NestJS project properly
3. Install all required dependencies
4. Create the .env file
5. Set up the folder structure

### After Running the Script

1. **Navigate to the backend:**
   ```bash
   cd /Users/colinroets/dev/pim
   ```

2. **Verify files exist:**
   ```bash
   ls -la
   # Should see: package.json, src/, node_modules/, etc.
   ```

3. **Start the backend:**
   ```bash
   npm run start:dev
   ```

4. **Test it's working:**
   - Open browser to http://localhost:3000
   - You should see "Hello World!"

---

## Docker-Specific Issues

### Issue: Docker not running
**Error:** `Cannot connect to the Docker daemon`

**Solution:**
1. Start Docker Desktop application
2. Wait for Docker to fully start
3. Verify Docker is running:
   ```bash
   docker --version
   docker ps
   ```

### Issue: Port conflicts with other projects
**Error:** `bind: address already in use`

**Solution:**
1. Check what's using the ports:
   ```bash
   lsof -i :5433  # PostgreSQL
   lsof -i :6380  # Redis
   lsof -i :3010  # Backend
   ```
2. Stop conflicting services or change ports in docker-compose.yml

### Issue: Database data lost after docker-compose down
**Error:** Tables don't exist after restarting Docker

**Solution:**
1. Never use `docker-compose down -v` unless you want to delete data
2. Use `docker-compose down` (without -v) to preserve volumes
3. To backup before removing:
   ```bash
   docker exec postgres-pim pg_dump -U pim_user pim_dev > backup.sql
   ```

### Issue: Can't connect to database from backend
**Error:** `ECONNREFUSED 127.0.0.1:5433`

**Solution:**
1. Ensure Docker container is running:
   ```bash
   docker ps | grep postgres-pim
   ```
2. Check .env has correct port:
   ```
   DATABASE_PORT=5433
   ```
3. Test connection directly:
   ```bash
   psql -U pim_user -d pim_dev -h localhost -p 5433
   ```

## Common Issues & Solutions

### Issue: NestJS CLI not found
**Error:** `command not found: nest`

**Solution:**
```bash
npm install -g @nestjs/cli
```

### Issue: Port already in use
**Error:** `Error: listen EADDRINUSE: address already in use :::3010`

**Solution:**
1. Find what's using the port:
   ```bash
   lsof -i :3010  # Backend port
   lsof -i :5433  # Database port
   ```
2. Kill the process or change the port in .env:
   ```env
   PORT=3011  # Use different port for backend
   ```

### Issue: Database connection failed
**Error:** `error: password authentication failed for user "pim_user"`

**Solution:**
1. Verify Docker containers are running:
   ```bash
   docker ps | grep pim
   # Should see postgres-pim container
   ```
2. If not running, start Docker services:
   ```bash
   cd /Users/colinroets/dev/projects/product
   docker-compose up -d
   ```
3. Check if using correct port (5433 not 5432):
   ```bash
   # Backend .env should have:
   DATABASE_PORT=5433
   ```
4. Connect via Docker:
   ```bash
   docker exec -it postgres-pim psql -U pim_user -d pim_dev
   ```
5. If password issue persists, check docker-compose.yml for correct password

### Issue: Frontend won't start
**Error:** `command not found: vite`

**Solution:**
```bash
cd /Users/colinroets/dev/pim-admin
npm install
npm run dev
```

### Issue: Permission denied when running scripts
**Error:** `Permission denied`

**Solution:**
```bash
chmod +x script-name.sh
```

### Issue: npm install fails
**Error:** Various npm errors

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Use different npm registry:
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

---

## Verification Checklist

### Backend Health Check
```bash
cd /Users/colinroets/dev/projects/product/pim

# 1. Check files exist
ls package.json src/ 

# 2. Check dependencies installed
ls node_modules/

# 3. Ensure Docker is running
docker ps | grep pim

# 4. Test startup
npm run start:dev

# 5. Check API response
curl http://localhost:3010/health
```

### Frontend Health Check
```bash
cd /Users/colinroets/dev/projects/product/pim-admin

# 1. Check files exist
ls package.json src/

# 2. Check dependencies installed
ls node_modules/

# 3. Test startup
npm run dev

# 4. Open browser to http://localhost:5173
```

### Database Health Check
```bash
# 1. Check Docker container is running
docker ps | grep postgres-pim

# 2. Connect to PostgreSQL (port 5433)
psql -U pim_user -d pim_dev -h localhost -p 5433

# 3. Or connect via Docker exec
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# 4. List databases
\l

# 5. Check tables
\dt

# 6. Exit
\q
```

---

## Complete Reset Instructions

If everything is broken, here's how to start over:

### 1. Clean Up
```bash
# Stop and remove Docker containers
cd /Users/colinroets/dev/projects/product
docker-compose down -v  # -v removes volumes (database data)

# Remove existing projects (if needed)
rm -rf pim/node_modules pim/dist
rm -rf pim-admin/node_modules pim-admin/dist

# Clean Docker system (optional, removes all unused containers/images)
docker system prune -a
```

### 2. Run Setup Scripts
```bash
# Backend
cd /Users/colinroets/dev/pimdocs
./setup-backend.sh

# Frontend (if needed)
# Create a new setup-frontend.sh or manually create
```

### 3. Verify Everything
Follow the verification checklist above.

---

## Getting Help

### Check Logs
- Backend logs: Watch the terminal running `npm run start:dev`
- Frontend logs: Watch the terminal running `npm run dev`
- PostgreSQL logs: `/usr/local/var/log/postgresql@14.log` (adjust version)

### Debug Mode
Add to backend .env:
```env
LOG_LEVEL=debug
```

### Documentation References
- [TASKS.md](TASKS.md) - See what should be completed
- [NEXT_STEPS.md](NEXT_STEPS.md) - Current action items
- [PROJECT_INSTRUCTIONS.md](PROJECT_INSTRUCTIONS.md) - Project setup reference

### Common Commands Reference
```bash
# Docker
cd /Users/colinroets/dev/projects/product
docker-compose up -d           # Start services
docker-compose down            # Stop services
docker-compose logs -f         # View logs
docker ps                      # List running containers

# Backend
cd engines
npm run start:dev              # Development mode
npm run build                  # Build for production
npm run test                   # Run tests

# Frontend
cd engines-admin  
npm run dev                    # Development mode
npm run build                  # Build for production
npm run preview                # Preview production build

# Database
psql -U pim_user -d pim_dev -p 5433   # Connect to Docker PostgreSQL
docker exec -it postgres-pim psql -U pim_user -d pim_dev  # Via Docker
docker exec postgres-pim pg_dump -U pim_user pim_dev > backup.sql  # Backup
```

---
*Last Updated: [Current Date]*
*For current issues, see the top of this document*
