# PIM Project - Ultra-Streamlined Context

## Paths & Ports
```
/Users/colinroets/dev/projects/product/
├── engines/     # NestJS:3010
├── admin/       # React:5173  
├── docs/        # Documentation
└── shell-scripts/  # Local scripts only
```
DB: PostgreSQL Docker:5433 | Login: admin@test.com/Admin123!

## Current Status
✅ COMPLETE: Auth, Products(66 endpoints), Categories, Attributes(13 types), Media, Users, Dashboards, Variants
🚀 ACTIVE: Import/Export System (Week 1: Dec 12-19)
📋 QUEUE: Search→Bulk Ops→Workflow

## Critical Rules
1. Backend is sacrosanct - adapt frontend to match
2. Shell scripts → `/shell-scripts/` (NOT tracked)
3. API pattern: `{success, message, data, timestamp}`
4. Fields: `quantity`, `urlKey`, `isFeatured`, `variantAxes`
5. Status: `'draft'|'published'|'archived'` (lowercase)
6. Open source only, no over-engineering

## Quick Start
```bash
cd /Users/colinroets/dev/projects/product
docker-compose up -d && cd engines && npm run start:dev
# New terminal: cd admin && npm run dev
```

## Key Docs
- Full instructions: `/docs/PROJECT_INSTRUCTIONS.md`
- Tasks: `/docs/TASKS.md`
- Variants: `/docs/VARIANT_IMPLEMENTATION_CONTINUATION.md`

## Shell Script Output Format
When creating shell scripts in /shell-scripts folder:
- Output just the filename: "script-name.sh" 
- Do NOT include path (/shell-scripts/ or ./shell-scripts/)
- Do NOT include chmod +x commands
- User has terminal open in /shell-scripts and will handle permissions

Example: "Created auth-quick-fix.sh" instead of "chmod +x /path/to/shell-scripts/auth-quick-fix.sh"
