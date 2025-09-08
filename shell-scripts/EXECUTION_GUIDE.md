# Shell Script Execution Reference

## ✅ Standard Execution Format

Navigate to the shell-scripts directory first, then execute:

```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x script-name.sh
./script-name.sh
```

## 📋 Common Scripts

### Setup & Configuration
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x setup-code-quality.sh
./setup-code-quality.sh
```

### Testing
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x test-lint.sh
./test-lint.sh
```

### Git Operations
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts

# Commit lint fixes
chmod +x commit-lint-fixes.sh
./commit-lint-fixes.sh

# Quick commit and push (with message parameter)
chmod +x git-commit-push.sh
./git-commit-push.sh "your commit message"

# Remove scripts from git
chmod +x remove-scripts-from-git.sh
./remove-scripts-from-git.sh
```

### Frontend Debug Scripts
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts/frontend-debug
chmod +x diagnose.sh
./diagnose.sh
```

## 🎯 One-Time Setup

You only need to make a script executable once:
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x *.sh                    # Make all scripts executable
chmod +x frontend-debug/*.sh     # Make all frontend debug scripts executable
```

After that, you can just run them:
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
./script-name.sh
```

## 📝 Notes

- The `cd` command gets you to the right directory
- `chmod +x` only needs to be run once per script
- `./` tells the system to execute the script in the current directory
- Scripts are local only and not tracked in Git
- No more escaping spaces or using quotes!
