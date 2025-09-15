# TypeORM Save Method - Array Return Fix

## Issue
TypeScript error when casting the result of `repository.save()`:
```
Conversion of type 'Product[]' to type 'Product' may be a mistake
```

## Root Cause
TypeORM's `save()` method has an overloaded signature:
- When passed a single entity: returns `Promise<T>`
- When passed an array: returns `Promise<T[]>`

TypeScript cannot determine which overload is being used at compile time, so it assumes the return type could be either `T | T[]`.

## Solution
Instead of forcing a type cast, we handle both possible return types:

```typescript
// BEFORE (causes TypeScript error)
const savedProduct = await this.productRepository.save(product);
return savedProduct as Product; // Error: Product[] cannot be cast to Product

// AFTER (handles both cases)
const savedProduct = await this.productRepository.save(product);
return Array.isArray(savedProduct) ? savedProduct[0] : savedProduct;
```

## Files Fixed
1. `src/modules/import-export/processors/product-import.processor.ts` - Line 231-233
2. `src/modules/import-export/processors/variant-import.processor.ts` - Line 287-289

## Why This Works
- If TypeORM returns a single entity (expected case), we return it directly
- If TypeORM returns an array (edge case), we return the first element
- No type casting needed - TypeScript can infer the correct type

## Alternative Solutions (Not Used)
1. **Force double cast**: `savedProduct as unknown as Product` - Less safe
2. **Use findOne after save**: Requires additional database query
3. **Use save with array**: `save([product])[0]` - Less readable

## Verification
Run TypeScript compiler to verify no errors:
```bash
cd /Users/colinroets/dev/projects/product/engines
npx tsc --noEmit
```

This fix ensures type safety while handling TypeORM's polymorphic return type correctly.
