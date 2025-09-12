# AI Assistant Prompt - Product Types Clarification

## CRITICAL CONTEXT - Copy this entire section to AI assistants:

```
I'm working on a PIM (Product Information Management) system that handles TWO DISTINCT product models that must NEVER be conflated:

### 1. MASTER-VARIANT PRODUCTS (Current Focus)
- Simple inventory variations of the same product
- Example: T-shirt in different sizes (S,M,L) and colors (Red,Blue,Green)  
- Parent-child relationship where variants are just SKU variations
- Each variant has its own stock level and possibly different price
- Customer simply selects from available options (dropdown/buttons)
- Currently implementing: Quick templates, multi-axis wizard, matrix view
- Database: Uses parentId to link variants to master product
- Status: ACTIVELY DEVELOPING THIS

### 2. CONFIGURABLE PRODUCTS (Future Feature) 
- Complex products built from component selections
- Example: PC Builder where you choose CPU, RAM, GPU, Storage
- Each component may be a separate product
- Price calculated from selected components
- Requires compatibility rules and validation
- Customer builds/configures the product
- Status: NOT YET IMPLEMENTED - FUTURE PHASE

### CURRENT TASK CONTEXT:
We are working ONLY on Master-Variant products. The backend has some scaffolding for configurable products but it's not active. When I mention "variants", I mean simple inventory variations, NOT configurable product components.

### KEY RULES:
1. NEVER suggest using "configurable" product type for simple size/color variants
2. NEVER conflate variant management with product configuration
3. Use correct terminology:
   - For variants: "variations", "options", "SKUs", "variant axes"  
   - For configurable: "components", "builder", "configuration options"
4. The isConfigurable flag and configurable type are reserved for FUTURE use
5. Current variants use simple parent-child relationships via parentId field

Please acknowledge you understand this distinction before we proceed.
```

## Usage Instructions:

1. **At the start of any new session**, copy the above prompt to establish context
2. **If the AI conflates the concepts**, remind it:
   - "Remember: We're working on master-variant products (like t-shirt sizes), NOT configurable products (like PC builders)"
3. **When discussing new features**, always specify:
   - "This is for master-variant products" OR
   - "This would be for configurable products (future feature)"

## Quick Reference Commands:

- "We're doing VARIANTS not CONFIGURABLES"
- "This is simple inventory management, not product building"  
- "Think t-shirt sizes, not PC builder"
- "Parent-child SKUs, not component assembly"

## Example Corrections:

❌ WRONG: "Let's make the product configurable to add size variants"
✅ RIGHT: "Let's add size variants to the master product"

❌ WRONG: "Configure the product with different colors"  
✅ RIGHT: "Create color variants of the master product"

❌ WRONG: "The variant configuration options"
✅ RIGHT: "The variant axes/attributes"

---

Save this file and reference it whenever working on product-related features in the PIM system.
