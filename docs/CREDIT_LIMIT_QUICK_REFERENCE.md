# Quick Reference: Credit Limit Currency

## 🎯 How It Works
Credit limit and annual revenue fields automatically use the currency selected for each account.

## 💱 Currency Behavior
- **Create Account**: Uses default currency initially (EUR)
- **Change Currency**: Symbol updates immediately
- **Edit Account**: Shows account's saved currency
- **No Conversion**: Values don't convert when currency changes

## 🖥️ User Interface
```
Currency: [EUR ▼]
Credit Limit (EUR): [€ ________]
                     ↑
              Dynamic symbol
```

## ⚠️ Important Note
Changing currency does NOT convert values:
- EUR €1,000 → USD $1,000 (same number, different currency)
- NOT EUR €1,000 → USD $1,100 (no conversion)

## 📍 Affected Fields
- Credit Limit
- Annual Revenue

## 🔧 Test the Feature
```bash
# Run validation test
bash /Users/colinroets/dev/projects/product/shell-scripts/test-credit-limit-currency.sh
```

## 📚 Full Documentation
See `/docs/CREDIT_LIMIT_CURRENCY.md` for complete details.
