# PIM Project Shell Scripts

This directory contains automation scripts for the PIM project.

## Git Management Scripts

### 🚀 Main Push Script
```bash
./push-to-github.sh
```
The main script to push all changes to GitHub. This runs `update-all-repos.sh` internally.

### 📊 Check Status
```bash
./pre-commit-check.sh
```
Shows what changes will be committed across all repositories.

### 📤 Update All Repositories
```bash
./update-all-repos.sh
```
Updates backend, frontend, and root project repositories with detailed commit messages.

### ⚡ Quick Push
```bash
./quick-push.sh
```
Fast commit and push with auto-generated timestamp message.

### 📝 Detailed Update
```bash
./update-github.sh
```
Comprehensive update with detailed commit messages and full status reporting.

### 🔍 Git Status Check
```bash
./check-git-status.sh
```
Shows detailed git status, recent commits, and repository information.

## Project Management Scripts

### 🏃 Start Everything
```bash
./start-all.sh
```
Starts PostgreSQL, backend, and frontend in the correct order.

### 🛑 Stop Everything
```bash
./stop-all.sh
```
Stops all running services cleanly.

### 🔄 Restart Backend
```bash
./restart-backend.sh
```
Quick backend restart for applying changes.

### 🧪 Test System
```bash
./test-system.sh
```
Comprehensive system test - checks all services and endpoints.

### 🔍 Quick Test
```bash
./test-now.sh
```
Quick validation that everything is working.

## Fix Scripts

### 🔧 Fix Validation
```bash
./fix-validation-complete.sh
```
Applies validation fixes to the backend.

### 🌱 Seed Database
```bash
./seed-database.sh
```
Seeds the database with initial data including admin user.

## Usage Examples

### Daily Development Workflow
```bash
# Start your day
./start-all.sh

# Check system status
./test-system.sh

# Make changes, then push to GitHub
./pre-commit-check.sh  # Review what will be committed
./push-to-github.sh     # Push everything

# End of day
./stop-all.sh
```

### Quick Updates
```bash
# After making changes
./quick-push.sh
```

### Troubleshooting
```bash
# If validation errors occur
./fix-validation-complete.sh

# If login fails
./seed-database.sh

# Check what's running
./test-system.sh
```

## Important Notes

1. **Make scripts executable**: First time setup:
   ```bash
   chmod +x *.sh
   ```

2. **GitHub Setup**: Ensure your repositories have remotes configured:
   ```bash
   git remote add origin YOUR_GITHUB_URL
   ```

3. **Credentials**: You may need to set up GitHub credentials or SSH keys for pushing.

## Color Codes in Scripts
- 🟢 Green: Success
- 🟡 Yellow: Warning or info
- 🔵 Blue: Process or step indicator
- 🔴 Red: Error or failure

## Recent Updates
- Fixed validation errors in backend
- Replaced all indigo colors with blue throughout UI
- Added comprehensive automation scripts
- Improved error handling and user experience
