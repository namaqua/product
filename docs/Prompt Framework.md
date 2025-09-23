# PIM Project - Ultra-Streamlined Context
## Paths & Ports

/Users/colinroets/dev/projects/product/
├── engines/     # NestJS:3010
├── admin/       # React:5173  
├── docs/        # Active Documentation Markdowns for dev use
├── documentation/        # Docusaurus
└── shell-scripts/  # Local scripts only

DB: PostgreSQL Docker:5433 routes to 5432 | Login: admin@test.com/Admin123!

🚀 ACTIVE: Deploy to QA server on Digital Ocean 

## Critical Rules
1. Backend is sacrosanct - adapt frontend to match
2. Shell scripts → /shell-scripts/ (NOT tracked)
3. API pattern: {success, message, data, timestamp}
4. Fields: quantity, urlKey, isFeatured, variantAxes
5. Status: 'draft'|'published'|'archived' (lowercase)
6. Open source only, no over-engineering
7. TypeOrm standards /docs/TYPEORM_STANDARDIZATION_PLAN.md and TYPEORM_MIGRATIONS_LEARNINGS.md
8. API and DTOs backend /docs/API_STANDARDIZATION_PLAN
9. Ensure consistent case usage between /engines and /admin 

## Quick Start
bash
cd /Users/colinroets/dev/projects/product
#Backend: /engines  npm run start:dev
# Front end: /admin  npm run dev

## Key Docs
- Full Project instructions: /docs/PROJECT_INSTRUCTIONS.md
- Tasks: /docs/TASKS.md
- Variants: /docs/VARIANT_IMPLEMENTATION_CONTINUATION.md

## Shell Script Output Format
When creating shell scripts in /shell-scripts folder:
- Output just the filename: "script-name.sh" 
- Do NOT include path (/shell-scripts/ or ./shell-scripts/)
- Do NOT include chmod +x commands
- User has terminal open in /shell-scripts and will handle permissions
Example: "Created auth-quick-fix.sh" instead of "chmod +x /path/to/shell-scripts/auth-quick-fix.sh"

## This Chat tasks

- Digest above - but do not travers whole project for context.

- Continue with open tasks in /docs/SUBSCRIPTION_ENGINE_DEVELOPMENT_PLAN.md

Do not overthink  but do suggest features needed for a basic Subscription Engine - Inc Billing and Dunning?

  
- Await for input
- Do not assume, infer or "think ahead"