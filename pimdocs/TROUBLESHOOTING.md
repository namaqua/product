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

## Common Issues & Solutions

### Issue: NestJS CLI not found
**Error:** `command not found: nest`

**Solution:**
```bash
npm install -g @nestjs/cli
```

### Issue: Port 3000 already in use
**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
1. Find what's using port 3000:
   ```bash
   lsof -i :3000
   ```
2. Kill the process or change the port in .env:
   ```env
   PORT=3001
   ```

### Issue: Database connection failed
**Error:** `error: password authentication failed for user "pim_user"`

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   brew services list | grep postgresql
   ```
2. Check user exists:
   ```sql
   psql -U postgres
   \du
   ```
3. Reset password if needed:
   ```sql
   ALTER USER pim_user WITH PASSWORD 'new_password';
   ```
4. Update .env file with correct password

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
cd /Users/colinroets/dev/pim

# 1. Check files exist
ls package.json src/ 

# 2. Check dependencies installed
ls node_modules/

# 3. Test startup
npm run start:dev

# 4. Check API response
curl http://localhost:3000
```

### Frontend Health Check
```bash
cd /Users/colinroets/dev/pim-admin

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
# 1. Connect to PostgreSQL
psql -U pim_user -d pim_dev

# 2. If that fails, try as postgres user
psql -U postgres

# 3. List databases
\l

# 4. Check user exists
\du

# 5. Exit
\q
```

---

## Complete Reset Instructions

If everything is broken, here's how to start over:

### 1. Clean Up
```bash
# Remove existing projects
rm -rf /Users/colinroets/dev/pim
rm -rf /Users/colinroets/dev/pim-admin

# Drop databases (optional)
psql -U postgres
DROP DATABASE IF EXISTS pim_dev;
DROP DATABASE IF EXISTS pim_test;
DROP USER IF EXISTS pim_user;
\q
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
# Backend
cd /Users/colinroets/dev/pim
npm run start:dev        # Development mode
npm run build           # Build for production
npm run test            # Run tests

# Frontend
cd /Users/colinroets/dev/pim-admin  
npm run dev             # Development mode
npm run build           # Build for production
npm run preview         # Preview production build

# Database
psql -U pim_user -d pim_dev    # Connect to database
pg_dump pim_dev > backup.sql   # Backup database
```

---
*Last Updated: [Current Date]*
*For current issues, see the top of this document*
