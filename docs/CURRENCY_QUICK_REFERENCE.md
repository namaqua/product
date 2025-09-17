# Quick Reference: Currency Configuration

## 📍 Main Configuration File
```
/admin/src/config/currencies.json
```

## ➕ To Add a Currency
Edit the JSON file and add to the `currencies` array:
```json
{
  "code": "CAD",
  "name": "Canadian Dollar", 
  "symbol": "C$",
  "displayName": "CAD - Canadian Dollar"
}
```

## 🔄 To Change Currency Order
Simply reorder the objects in the `currencies` array in the JSON file.

## 🎯 To Change Default Currency
Edit the JSON file and change:
```json
"defaultCurrency": "EUR"  // Change to desired code
```

## 🔧 Management Script
```bash
# Interactive currency manager
bash /Users/colinroets/dev/projects/product/shell-scripts/manage-currencies.sh
```

## ✅ Validate Configuration
```bash
# Test configuration
bash /Users/colinroets/dev/projects/product/shell-scripts/test-currency-config.sh
```

## 💡 No Code Changes Required!
After editing the JSON file, just refresh your browser - no compilation needed.
