# Currency Configuration Documentation

## Overview
The currency configuration has been externalized into a JSON file for easy management and modification without requiring code changes.

## File Structure

### Configuration Files

1. **`/admin/src/config/currencies.json`** - Main currency data file
   - Contains the list of available currencies
   - Defines the default currency
   - Easy to edit without touching code

2. **`/admin/src/config/currency.config.ts`** - TypeScript configuration module
   - Provides type definitions for TypeScript support
   - Exports helper functions for currency operations
   - Handles currency formatting logic

## Currency JSON Structure

```json
{
  "currencies": [
    {
      "code": "EUR",           // ISO 4217 currency code
      "name": "Euro",          // Full currency name
      "symbol": "€",           // Currency symbol
      "displayName": "EUR - Euro"  // Display text for dropdowns
    },
    // ... more currencies
  ],
  "defaultCurrency": "EUR"    // Default currency code
}
```

## Adding a New Currency

To add a new currency, simply edit the `currencies.json` file:

1. Open `/admin/src/config/currencies.json`
2. Add a new currency object to the `currencies` array:

```json
{
  "code": "CAD",
  "name": "Canadian Dollar",
  "symbol": "C$",
  "displayName": "CAD - Canadian Dollar"
}
```

3. Save the file - no code changes required!
4. The new currency will automatically appear in all dropdowns

## Changing Currency Order

To change the order of currencies in dropdowns:

1. Open `/admin/src/config/currencies.json`
2. Reorder the objects in the `currencies` array
3. Save the file - the new order will be reflected immediately

## Changing Default Currency

To change the default currency:

1. Open `/admin/src/config/currencies.json`
2. Change the `defaultCurrency` value to your desired currency code
3. Save the file

## Available Helper Functions

The `currency.config.ts` module provides several helper functions:

### `getCurrencyByCode(code: string)`
Returns the complete currency object for a given code.

```typescript
const euro = getCurrencyByCode('EUR');
// Returns: { code: 'EUR', name: 'Euro', symbol: '€', displayName: 'EUR - Euro' }
```

### `getCurrencySymbol(code: string)`
Returns just the symbol for a currency code.

```typescript
const symbol = getCurrencySymbol('USD');
// Returns: '$'
```

### `formatCurrency(amount: number, currencyCode: string)`
Formats an amount with the appropriate currency symbol and formatting.

```typescript
const formatted = formatCurrency(1234.56, 'EUR');
// Returns: '€1,234.56'
```

## Using in Components

### Import the configuration:

```typescript
import { currencies, defaultCurrency, formatCurrency } from '../../config/currency.config';
```

### Display in a dropdown:

```jsx
<select value={selectedCurrency} onChange={handleChange}>
  {currencies.map((currency) => (
    <option key={currency.code} value={currency.code}>
      {currency.displayName}
    </option>
  ))}
</select>
```

### Format currency values:

```typescript
const display = formatCurrency(1500.00, 'GBP');
// Returns: '£1,500.00'
```

## Components Using Currency Configuration

The following components have been updated to use the external configuration:

1. **AccountCreate.tsx** - Uses currency dropdown for new accounts
2. **AccountEdit.tsx** - Uses currency dropdown for editing accounts
3. **AccountDetails.tsx** - Uses formatCurrency helper for display

## Benefits of This Approach

1. **Easy Maintenance** - Update currencies without touching code
2. **Type Safety** - TypeScript interfaces ensure type checking
3. **Centralized Configuration** - Single source of truth for all currency data
4. **Consistent Formatting** - Helper functions ensure consistent display
5. **Flexible** - Easy to add new currencies or change order
6. **No Compilation Required** - JSON changes don't require rebuilding (just refresh)

## Current Currency List (in order)

1. EUR - Euro
2. CHF - Swiss Franc
3. GBP - British Pound
4. USD - US Dollar
5. ZAR - South African Rand

## Troubleshooting

If currencies don't appear after making changes:

1. Ensure the JSON file is valid (no syntax errors)
2. Check that the TypeScript module is importing correctly
3. Restart the development server if necessary
4. Check browser console for any import errors

## Future Enhancements

Consider these potential improvements:

1. Add locale-specific formatting rules
2. Include decimal places configuration per currency
3. Add exchange rate support
4. Include currency position preferences (prefix/suffix)
5. Add more detailed currency metadata (country, etc.)
