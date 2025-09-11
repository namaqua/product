# 📁 Directory Structure Migration Notice

## Important: Directory Names Have Changed

As of September 2025, we've refactored the project directory structure for better clarity and consistency:

### Directory Mapping

| Old Name | New Name | Description |
|----------|----------|-------------|
| `pim` | `engines` | Backend NestJS application |
| `pim-admin` | `admin` | Frontend React application |
| `pimdocs` | `docs` | Project documentation |

### Why These Changes?

1. **Clarity**: More intuitive naming conventions
2. **Consistency**: Removes redundant "pim" prefix from subdirectories
3. **Standards**: Aligns with common industry patterns
4. **Scalability**: "engines" allows for multiple backend services if needed

### For Existing Users

If you have an existing clone of the repository, you'll need to:

1. **Pull the latest changes**:
```bash
git pull origin main
```

2. **Clean install dependencies**:
```bash
# From project root
rm -rf node_modules engines/node_modules admin/node_modules
npm install
```

3. **Update your IDE/editor bookmarks** to the new paths

4. **Update any custom scripts** that reference the old directory names

### Updated Commands

All commands in documentation have been updated. Key changes:

```bash
# Old
cd pim && npm run start:dev
cd pim-admin && npm run dev

# New
cd engines && npm run start:dev
cd admin && npm run dev
```

### Shell Scripts

All shell scripts in `/shell-scripts` have been updated to use the new directory names. If you have custom scripts, update paths from:
- `/pim/` → `/engines/`
- `/pim-admin/` → `/admin/`
- `/pimdocs/` → `/docs/`

### No Functional Changes

This is purely a directory structure refactoring. All features, APIs, and functionality remain exactly the same. Only the folder names have changed.

### Questions?

If you encounter any issues with the migration, please open an issue on GitHub.