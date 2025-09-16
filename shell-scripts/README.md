# PIM Project Shell Scripts

This directory contains shell scripts for various development, debugging, and deployment tasks for the PIM project.

## 📁 Directory Structure

```
shell-scripts/
├── category-filtering/     # Category filter debugging and fixes
├── frontend-debug/         # Frontend troubleshooting scripts
└── *.sh                   # Main utility scripts
```

## 🚀 Quick Start

```bash
# Make all scripts executable
chmod +x *.sh

# Or use the setup script
./_setup.sh
```

## 📋 Category Filtering Scripts

### Main Solution Scripts

#### `complete-category-fix.sh` ⭐
**Purpose:** Complete guided implementation of hierarchical filtering with counts  
**Usage:** `./complete-category-fix.sh`  
**Action:** Guides you through the entire fix process step-by-step

#### `show-implementation-code.sh`
**Purpose:** Displays all implementation code for easy copying  
**Usage:** `./show-implementation-code.sh`  
**Output:** Shows exact code changes needed for both services

### Implementation Scripts

#### `setup-hierarchical-filter.sh`
**Purpose:** Implements hierarchical category filtering  
**Changes:** Updates ProductsService to include child categories when filtering  
**Usage:** `./setup-hierarchical-filter.sh`

#### `implement-category-counts.sh`
**Purpose:** Adds product count methods to categories  
**Changes:** Implements getCategoriesWithCounts() and related methods  
**Usage:** `./implement-category-counts.sh`

### Testing & Debugging Scripts

#### `test-hierarchical-filter.sh`
**Purpose:** Tests the hierarchical filtering implementation  
**Actions:** Assigns products to categories and verifies filtering  
**Usage:** `./test-hierarchical-filter.sh`

#### `diagnose-category-filter.sh`
**Purpose:** Comprehensive diagnostic of the category filter system  
**Checks:** Environment, database, API endpoints, frontend  
**Usage:** `./diagnose-category-filter.sh`

#### `quick-category-check.sh`
**Purpose:** Quick status check of categories in the system  
**Output:** Category count and first few categories  
**Usage:** `./quick-category-check.sh`

### Fix & Utility Scripts

#### `quick-fix-category-filter.sh`
**Purpose:** Frontend workaround to show categories (already applied)  
**Note:** This was the initial fix that got categories displaying

#### `create-sample-categories.sh`
**Purpose:** Creates comprehensive sample category hierarchy  
**Creates:** 10+ root categories with subcategories  
**Usage:** `./create-sample-categories.sh`

#### `debug-categories.sh`
**Purpose:** Full debug process with automatic fixes  
**Actions:** Checks all endpoints, creates categories if needed  
**Usage:** `./debug-categories.sh`

## 📚 Documentation Files

### `SOLUTION_SUMMARY.md`
Complete summary of the category filtering solution with checklist

### `HIERARCHICAL_FILTERING_GUIDE.md`
Detailed guide for implementing hierarchical category filtering

### `README-CATEGORY-DEBUG.md`
Documentation for all category debugging scripts

## 🎯 Common Tasks

### Fix Category Filtering (Complete Solution)
```bash
./complete-category-fix.sh
```

### Check Category Status
```bash
./quick-category-check.sh
```

### Create Test Data
```bash
./create-sample-categories.sh
```

### Test Implementation
```bash
./test-hierarchical-filter.sh
```

### See All Code Changes Needed
```bash
./show-implementation-code.sh
```

## 💡 Implementation Status

### ✅ Completed
- Categories now show in filter dropdown
- Basic filtering works
- Frontend UI is functional

### 🔴 Needs Implementation
- Hierarchical filtering (parent includes children)
- Product counts display
- Backend methods for counts

## 📝 Notes

- All scripts are idempotent (safe to run multiple times)
- Scripts create backups before modifying files
- Implementation requires manual code changes (scripts provide the code)
- Frontend automatically works once backend is implemented

## 🔧 Troubleshooting

If scripts don't run:
```bash
chmod +x *.sh
```

If categories don't show:
```bash
./diagnose-category-filter.sh
```

If you need the implementation code:
```bash
./show-implementation-code.sh
```

## 🚦 Next Steps

1. Run `./complete-category-fix.sh` for guided implementation
2. Apply the code changes as instructed
3. Restart the backend
4. Test with `./test-hierarchical-filter.sh`

---

*Last Updated: December 2024*
