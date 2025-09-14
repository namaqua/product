# ⚠️ QUICK REFERENCE: Database Access

## 🔴 CRITICAL: PostgreSQL is in Docker, NOT installed locally!

### Container Details
- **Container Name**: `postgres-pim`
- **Port**: 5433
- **Database**: `pim_dev`
- **User**: `pim_user`
- **Password**: `secure_password_change_me`

## How to Access Database

### ✅ ALWAYS USE THIS METHOD:
```bash
# Interactive access
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# Run a query
docker exec postgres-pim psql -U pim_user -d pim_dev -c "SELECT * FROM users;"

# Run SQL file
docker exec -i postgres-pim psql -U pim_user -d pim_dev < script.sql
```

### ❌ THIS WON'T WORK (unless psql is installed locally):
```bash
psql -h localhost -p 5433 -U pim_user -d pim_dev
# Error: psql: command not found
```

## Common Tasks

### List all tables
```bash
docker exec postgres-pim psql -U pim_user -d pim_dev -c "\dt"
```

### Describe a table
```bash
docker exec postgres-pim psql -U pim_user -d pim_dev -c "\d variant_templates"
```

### Check if table exists
```bash
docker exec postgres-pim psql -U pim_user -d pim_dev -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'variant_templates');"
```

### Drop a table
```bash
docker exec postgres-pim psql -U pim_user -d pim_dev -c "DROP TABLE IF EXISTS variant_templates CASCADE;"
```

### Create table from SQL file
```bash
docker exec -i postgres-pim psql -U pim_user -d pim_dev < create-table.sql
```

## If Container Not Running

```bash
# Check if running
docker ps | grep postgres-pim

# Start it
cd /Users/colinroets/dev/projects/product
docker-compose up -d

# View logs if issues
docker logs postgres-pim --tail=20
```

## Want to Install psql Locally? (Optional)

```bash
# Install PostgreSQL client tools
brew install postgresql@15

# Or just the client
brew install libpq
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

**Remember**: All our scripts use `docker exec` so psql local installation is NOT required!
