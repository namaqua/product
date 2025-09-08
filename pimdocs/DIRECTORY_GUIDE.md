# 📁 Directory Guide - Where to Run Commands

## Important: Commands Must Be Run in the Correct Directory!

### Project Structure
```
/Users/colinroets/dev/projects/product/
├── pim/              ← Backend (NestJS) - npm commands here!
├── pim-admin/        ← Frontend (React)
├── pimdocs/          ← Documentation
└── shell-scripts/    ← Helper scripts
```

## 🎯 Quick Reference

### Backend Commands (Run in `pim/` directory)
```bash
cd /Users/colinroets/dev/projects/product/pim

# Available npm scripts:
npm install           # Install dependencies
npm run build        # Compile TypeScript
npm run start:dev    # Start development server
npm run seed         # Seed database with sample products
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

### Shell Scripts (Run in `shell-scripts/` directory)
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts

# Make executable first:
chmod +x *.sh

# Available scripts:
./full-start.sh      # Complete setup and start (RECOMMENDED)
./quick-start.sh     # Quick server start
./seed-database.sh   # Just seed the database
./test-products.sh   # Test all API endpoints
./troubleshoot.sh    # Diagnose issues
./test-build.sh      # Test TypeScript compilation
```

## 🚀 Correct Way to Start

### Option 1: Use Shell Script (Easiest)
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x full-start.sh
./full-start.sh
```
This script handles everything automatically!

### Option 2: Manual Commands
```bash
# 1. Go to backend directory
cd /Users/colinroets/dev/projects/product/pim

# 2. Install dependencies
npm install

# 3. Start server (auto-creates tables)
npm run start:dev

# 4. In another terminal, seed database
cd /Users/colinroets/dev/projects/product/pim
npm run seed
```

## ❌ Common Mistakes

### Wrong: Running npm commands in wrong directory
```bash
# WRONG - This won't work:
cd /Users/colinroets/dev/projects/product
npm run seed  # ❌ No package.json here!

cd /Users/colinroets/dev/projects/product/shell-scripts
npm run seed  # ❌ No package.json here either!
```

### Right: Running npm commands in backend directory
```bash
# CORRECT:
cd /Users/colinroets/dev/projects/product/pim
npm run seed  # ✅ Works!
```

## 📝 Important Notes

1. **NPM commands** only work in directories with `package.json`
   - Backend: `/pim/package.json`
   - Frontend: `/pim-admin/package.json`

2. **Shell scripts** work from anywhere but are in:
   - `/shell-scripts/*.sh`

3. **The seed script** is specifically in:
   - `/pim/package.json` → `npm run seed`

## 🎉 TL;DR - Just Do This:

```bash
# The easiest way:
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x full-start.sh
./full-start.sh

# It will:
# 1. Navigate to correct directory
# 2. Install dependencies
# 3. Check database
# 4. Optionally seed data
# 5. Start the server
```

---

**Remember:** Always check which directory you're in with `pwd` command!
