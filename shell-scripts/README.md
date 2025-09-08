# Shell Scripts for PIM Project

## 🚨 Database Fix Scripts

### Primary Solution: `fix-database-schema.sh`
**Purpose:** Complete database reset and rebuild to fix schema issues
- Drops and recreates the database
- Lets TypeORM create correct table structure
- Seeds with sample data
- Verifies everything works

**Usage:**
```bash
./fix-database-schema.sh
```

### Quick Fix: `quick-db-reset.sh`
**Purpose:** Emergency database reset (faster, less checks)
- Quick drop and recreate
- Minimal verification
- Use when the main script has issues

**Usage:**
```bash
./quick-db-reset.sh
```

### Diagnostic: `check-db-schema.sh`
**Purpose:** Check current database schema for problems
- Shows all tables and columns
- Identifies schema mismatches
- Counts data in tables

**Usage:**
```bash
./check-db-schema.sh
```

## 📝 Other Scripts

- `test-lint.sh` - Run linting tests
- `commit-lint-fixes.sh` - Commit linting fixes
- `make-executable.sh` - Make all scripts executable

## ⚠️ Important Notes

1. **These scripts are LOCAL ONLY** - not tracked in Git
2. **Database scripts will DELETE all data** - use carefully
3. **Default credentials:**
   - Database: `pim_dev`
   - User: `pim_user`
   - Password: `secure_password_change_me`

## Common Issues & Solutions

### Issue: "Database does not exist"
```bash
createdb -U pim_user pim_dev
```

### Issue: "Permission denied"
```bash
chmod +x *.sh
# or
./make-executable.sh
```

### Issue: "Port 3010 already in use"
```bash
lsof -ti:3010 | xargs kill -9
```

### Issue: Backend won't start
```bash
cd ../pim
npm install
npm run build
npm run start:dev
```
