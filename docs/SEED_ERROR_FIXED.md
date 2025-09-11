# ✅ SOLVED: npm run seed Error

## The Problem
You were getting `Missing script: "seed"` error because you were in the wrong directory!

## The Solution

The `seed` script is in the **backend** directory (`pim`), not in the root or shell-scripts directory.

### ✅ Correct Way to Seed Database

#### Option 1: Direct Command
```bash
# Navigate to backend directory first!
cd /Users/colinroets/dev/projects/product/pim
npm run seed
```

#### Option 2: Use Helper Script
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x seed-database.sh
./seed-database.sh
```

#### Option 3: Use the Universal Runner
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x run.sh
./run.sh seed
```

## 📁 Directory Structure Reminder

```
/Users/colinroets/dev/projects/product/
├── pim/              ← Backend - npm commands work HERE!
│   └── package.json  ← Contains "seed" script
├── pim-admin/        ← Frontend
├── pimdocs/          ← Documentation
└── shell-scripts/    ← Helper scripts
    ├── full-start.sh     ← Complete setup
    ├── seed-database.sh  ← Just seeding
    └── run.sh           ← Universal runner
```

## 🚀 Complete Setup & Start (Recommended)

This script does everything for you:

```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x full-start.sh
./full-start.sh
```

It will:
1. ✅ Navigate to correct directory automatically
2. ✅ Install dependencies
3. ✅ Check database connection
4. ✅ Ask if you want to seed data
5. ✅ Start the server

## 📝 Quick Commands Reference

### From Anywhere:
```bash
# Make scripts executable (one time only)
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x *.sh

# Then use the runner:
./run.sh start    # Start server
./run.sh seed     # Seed database
./run.sh build    # Build TypeScript
./run.sh test-api # Test API endpoints
```

### From Backend Directory:
```bash
cd /Users/colinroets/dev/projects/product/pim
npm install       # Install dependencies
npm run build     # Build TypeScript
npm run start:dev # Start server
npm run seed      # Seed database
```

## 🎯 What the Seed Command Does

Creates 6 sample products:
- Professional Laptop ($1,299.99)
- SmartPhone X Pro ($899.99)
- Wireless Headphones ($349.99)
- Digital Tablet ($599.99)
- Smart Watch ($399.99)
- DSLR Camera ($2,499.99)

Plus an admin user:
- Email: `admin@example.com`
- Password: `Admin123!`

## ✨ Success!

Now you know:
- ✅ NPM commands must be run in the directory with `package.json`
- ✅ The backend is in `/engines/` directory
- ✅ Shell scripts can handle navigation for you
- ✅ The `full-start.sh` script is the easiest way

---

**Pro Tip:** Always check your current directory with `pwd` before running npm commands!
