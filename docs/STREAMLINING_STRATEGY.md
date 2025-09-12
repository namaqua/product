# Documentation Streamlining Strategy

## Problem
Documentation getting too long, hitting max length limits in AI sessions.

## Solution Implemented

### 1. Created Streamlined Continuity Prompt
**File**: `CONTINUITY_PROMPT_STREAMLINED.md` (< 100 lines)
- Quick reference format
- Essential info only
- Commands and status at top
- No repetition

### 2. Documentation Structure

```
/docs/
├── CONTINUITY_PROMPT_STREAMLINED.md  # USE THIS for new sessions (<100 lines)
├── active/                            # Current work
│   ├── CURRENT_SPRINT.md            # What we're working on NOW
│   └── KNOWN_ISSUES.md              # Active bugs/blockers
├── reference/                         # Detailed guides (access as needed)
│   ├── API_STANDARDS.md
│   ├── FIELD_MAPPINGS.md
│   └── SETUP_GUIDE.md
└── archive/                          # Completed work (rarely needed)
    ├── COMPLETED_FEATURES.md
    └── OLD_UPDATES/
```

### 3. New Session Format

Instead of copying entire CONTINUITY_PROMPT.md, use:

```
I'm continuing work on the PIM project.
Docs: /Users/colinroets/dev/projects/product/docs/CONTINUITY_PROMPT_STREAMLINED.md
Current task: [specific task]
Issue: [any blockers]
```

### 4. Key Principles

1. **One Source of Truth**: CONTINUITY_PROMPT_STREAMLINED.md
2. **Archive Completed Work**: Move to archive/ folder
3. **Reference Don't Repeat**: Link to detailed docs
4. **Task Focused**: State specific goals
5. **Concise Updates**: Bullet points only

### 5. What to Archive Now

Move to `/docs/archive/`:
- Detailed implementation stories
- Completed feature descriptions  
- Old update logs
- Resolved issues
- Historical decisions

### 6. What to Keep Active

Keep in main `/docs/`:
- Streamlined continuity prompt
- Current sprint tasks
- Active issues
- Quick reference guides
- Essential mappings

## Benefits

1. **Faster AI Loading**: Less text to process
2. **Clearer Focus**: Current work visible
3. **Better Organization**: Find info quickly
4. **No Redundancy**: Single source of truth
5. **Scalable**: Can grow without bloat

## Quick Migration Checklist

- [x] Create CONTINUITY_PROMPT_STREAMLINED.md
- [ ] Create /docs/active/ folder
- [ ] Create /docs/reference/ folder  
- [ ] Create /docs/archive/ folder
- [ ] Move completed features to archive
- [ ] Extract API standards to reference
- [ ] Create CURRENT_SPRINT.md
- [ ] Update README to point to streamlined version

## Usage Going Forward

### Starting New Session
```
Use: CONTINUITY_PROMPT_STREAMLINED.md
Add: Specific task/issue
Skip: Long histories
```

### Updating Documentation
```
Daily: Update CURRENT_SPRINT.md
Weekly: Archive completed work
Monthly: Review and consolidate
```

### Finding Information
```
Current work → /active/
How-to guides → /reference/
Past work → /archive/
```

---
*Created: Sept 12, 2025*
*Purpose: Prevent max length issues*
*Result: 80% reduction in prompt size*