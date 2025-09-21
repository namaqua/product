## Category Update - JSON Parsing Error Fix

### Problem
When updating a category through the UI, the backend receives malformed JSON with an unterminated string.

### Debug Steps

1. **Open Browser DevTools** (F12)
2. **Go to Network Tab**
3. **Try editing a category in the UI**
4. **Look for the PATCH request** to `/api/categories/...`
5. **Check the Request Payload tab** for malformed JSON

### Common Causes

The error usually happens when:
- Description contains unescaped quotes (")
- Text has newline characters that aren't escaped
- Copy-pasted content has hidden characters

### Quick Test
Run `test-category-update-simple.sh` to verify the API works:
```bash
test-category-update-simple.sh
```

This tests with:
- Simple description (no special chars)
- Boolean fields
- Escaped special characters

### Frontend Console
The CategoryForm logs data before sending:
```javascript
console.log('Form data before cleaning:', submitData);
console.log('Form data after cleaning:', submitData);
```

Check the Console tab to see what's being sent.

### Temporary Workaround
When editing categories:
1. Avoid quotes (") in descriptions
2. Don't paste content from other sources
3. Type descriptions manually
4. Avoid line breaks (Enter key)

### Permanent Fix Needed
The CategoryForm should escape special characters before sending:
- Replace `"` with `\"`
- Replace newlines with `\n`
- Strip any non-printable characters

### Manual Test via API
If the UI fails, test the API directly:
```bash
# Simple update that should work
curl -X PATCH "http://localhost:3010/api/categories/4213ee59-568c-4cfa-881f-aec45b03323e" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Simple test without special characters"}'
```

### Root Cause
The issue is that the frontend isn't properly escaping special characters in text fields before sending to the API. The axios library should handle this automatically, but something in the form data might be bypassing normal JSON serialization.
