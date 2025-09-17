# Credit Limit and Currency Configuration

## Overview
Credit limits and other monetary values in the PIM system are now dynamically linked to each account's selected currency. This ensures consistency and clarity in financial data management.

## Key Features

### Dynamic Currency Symbol
- The credit limit input field automatically displays the appropriate currency symbol
- Symbol updates immediately when the currency selection is changed
- Proper formatting for each currency (e.g., €, £, $, R, CHF)

### Currency-Linked Fields
The following monetary fields use the account's selected currency:
- **Credit Limit** - Maximum credit extended to the account
- **Annual Revenue** - Account's yearly revenue

### Behavior

#### When Creating an Account
1. Default currency is initially selected (configured in `currencies.json`)
2. All monetary fields display the default currency symbol
3. When currency is changed, symbols update immediately
4. Values entered are stored in the selected currency

#### When Editing an Account
1. Account's existing currency is pre-selected
2. Monetary fields display the account's currency symbol
3. Changing currency updates the display but does NOT convert values
4. A notice warns users that changing currency doesn't convert values

## Important Notes

### No Automatic Conversion
⚠️ **Important**: The system does NOT perform currency conversion. If you change an account's currency:
- Existing monetary values remain the same numerically
- Only the currency designation changes
- Example: €1,000 becomes $1,000 (not converted to actual USD equivalent)

### Display Format
The system formats monetary values based on currency conventions:
- **EUR**: €1,234.56
- **GBP**: £1,234.56
- **USD**: $1,234.56
- **ZAR**: R 1,234.56
- **CHF**: CHF 1,234.56

## Implementation Details

### Components

#### CurrencyInput Component
A reusable component (`/admin/src/components/common/CurrencyInput.tsx`) that:
- Displays the appropriate currency symbol
- Adjusts input padding based on symbol length
- Shows currency code in the label
- Handles formatting and validation

#### Usage Example
```tsx
<CurrencyInput
  id="creditLimit"
  label="Credit Limit"
  value={formData.creditLimit}
  onChange={(value) => handleNumberChange('creditLimit', value)}
  currency={formData.currency || defaultCurrency}
  placeholder="0.00"
/>
```

### Files Modified
1. **AccountCreate.tsx** - Uses CurrencyInput for credit limit and annual revenue
2. **AccountEdit.tsx** - Uses CurrencyInput for credit limit and annual revenue
3. **AccountDetails.tsx** - Displays values with proper currency formatting

## User Interface

### Visual Indicators
- Currency code displayed in field labels (e.g., "Credit Limit (EUR)")
- Currency symbol shown as prefix in input fields
- Info notice in Commercial Info tab explaining currency behavior

### Info Notice Text
> "All monetary values (Credit Limit, Annual Revenue) will be displayed and stored in the selected currency. Changing the currency will not convert existing values."

## Best Practices

### For Users
1. Select the correct currency before entering monetary values
2. Be aware that changing currency doesn't convert values
3. If currency conversion is needed, calculate and enter new values manually

### For Developers
1. Always use the CurrencyInput component for monetary fields
2. Pass the account's currency to the component
3. Use formatCurrency helper for display-only values
4. Consider implementing a currency converter tool if needed

## Future Enhancements

Potential improvements to consider:
1. **Currency Converter Tool** - Calculate conversions when changing currency
2. **Exchange Rates** - Store and display exchange rate information
3. **Multi-Currency Support** - Allow accounts to have limits in multiple currencies
4. **Conversion History** - Track when currency changes occur
5. **Automated Conversion Option** - Optional automatic conversion using exchange rates

## Configuration

To modify available currencies or default currency:
1. Edit `/admin/src/config/currencies.json`
2. No code changes required
3. Changes take effect immediately

## Testing

To verify currency behavior:
1. Create a new account and observe default currency
2. Change currency selection and verify symbol updates
3. Enter values and save
4. Edit the account and verify currency is preserved
5. Change currency and verify the warning message appears

## Support

For issues or questions about currency configuration:
- Check `/docs/CURRENCY_CONFIGURATION.md` for currency setup
- Review `/docs/CURRENCY_QUICK_REFERENCE.md` for quick tasks
- Use management script: `bash /shell-scripts/manage-currencies.sh`
