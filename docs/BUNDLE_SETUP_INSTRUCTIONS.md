# Bundle Tables Setup - Quick Start

## ✅ Script Created Successfully!

The bundle tables setup script has been saved to:
```
/Users/colinroets/dev/projects/product/docs/scripts/setup-bundle-tables.sh
```

## 🚀 How to Use

### Step 1: Make Script Executable
```bash
chmod +x /Users/colinroets/dev/projects/product/docs/scripts/setup-bundle-tables.sh
```

### Step 2: Run the Script
```bash
cd /Users/colinroets/dev/projects/product/docs/scripts
./setup-bundle-tables.sh
```

### Step 3: Follow the Prompts
The script will:
1. Ask for your database password
2. Check PostgreSQL connection
3. Create bundle tables
4. Optionally create test data
5. Show next steps

## 📋 Script Options

### Basic Usage
```bash
# Use default settings (localhost:5433, pim_db database)
./setup-bundle-tables.sh

# Create with test data automatically
./setup-bundle-tables.sh --test-data

# Drop existing tables first
./setup-bundle-tables.sh --drop

# Custom database settings
./setup-bundle-tables.sh -d mydb -u myuser -p 5432

# Show help
./setup-bundle-tables.sh --help
```

### Environment Variables
You can also set these before running:
```bash
export DB_PASSWORD="your_password"
export DB_NAME="pim_db"
export DB_USER="postgres"
export DB_PORT="5433"
./setup-bundle-tables.sh
```

## 🔧 What the Script Does

1. **Checks Database Connection** - Verifies PostgreSQL is accessible
2. **Updates Product Entity** - Adds BUNDLE to ProductType enum
3. **Creates 4 Tables**:
   - `product_bundles` - Bundle configurations
   - `bundle_component_groups` - Component categories
   - `bundle_components` - Products in each group
   - `bundle_configurations` - Saved customer configs
4. **Creates Indexes** - For optimal performance
5. **Sets Up Triggers** - Auto-update timestamps
6. **Optional Test Data** - Sample computer bundle with components

## 🧪 Test Data Created

If you choose to create test data, you'll get:
- **Bundle Product**: Custom Desktop PC (DESKTOP-001)
- **Component Groups**:
  - Processor: AMD Ryzen 5, Intel i5
  - Memory: 16GB DDR4
  - Storage: 512GB SSD

## ✅ Verification

After running, verify tables exist:
```bash
psql -U postgres -d pim_db -c "\dt *bundle*"
```

Expected output:
```
                List of relations
 Schema |          Name           | Type  
--------+------------------------+-------
 public | bundle_component_groups | table
 public | bundle_components       | table
 public | bundle_configurations   | table
 public | product_bundles         | table
```

## 🔍 Troubleshooting

### "Permission denied"
```bash
chmod +x setup-bundle-tables.sh
```

### "psql: command not found"
Install PostgreSQL client:
```bash
brew install postgresql
```

### "Database does not exist"
Create the database first:
```bash
createdb pim_db
```

### "Cannot connect to PostgreSQL"
Check Docker is running:
```bash
docker ps | grep postgres
```

## 📚 Next Steps

After tables are created:

1. **Copy Bundle Module Files**
   ```bash
   cp -r bundle-module-files/* engines/src/modules/bundles/
   ```

2. **Register Module**
   Add to `engines/src/app.module.ts`:
   ```typescript
   import { BundlesModule } from './modules/bundles/bundles.module';
   
   @Module({
     imports: [
       // ... other modules
       BundlesModule,
     ],
   })
   ```

3. **Restart Server**
   ```bash
   cd engines
   npm run start:dev
   ```

4. **Test API**
   ```bash
   curl http://localhost:3010/products/11111111-1111-1111-1111-111111111111/bundle
   ```

## 🎉 Success!

Once the script completes successfully, your bundle tables are ready and you can start using the configurable products feature!