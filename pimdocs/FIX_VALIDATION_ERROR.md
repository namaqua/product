# Fixing "Validation Failed" Error

## Current Status
✅ Page loads (React is mounting successfully)
❌ Getting "Validation failed" error
❓ Need to identify where validation is failing

## Quick Diagnosis

Run this first to identify the issue:
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x diagnose-validation-quick.sh
./diagnose-validation-quick.sh
```

## Most Likely Causes

### 1. Admin User Doesn't Exist in Database
**Solution:** Seed the database
```bash
./seed-database.sh
```

### 2. Backend Validation Too Strict
**Solution:** Test the backend directly
```bash
./test-backend-auth.sh
```

### 3. Wrong API Endpoint or Request Format
**Solution:** Check what the frontend is sending
- Open Browser DevTools (F12)
- Go to Network tab
- Try to login
- Look for the failed request (will be red)
- Click on it and check:
  - Request URL
  - Request Headers
  - Request Payload
  - Response

## Complete Fix Process

### Step 1: Run Complete Validation Fix
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x fix-validation-complete.sh
./fix-validation-complete.sh
```

This script will:
1. Ensure PostgreSQL is running
2. Ensure Backend is running
3. Test the login endpoint
4. Attempt to fix common issues
5. Provide specific guidance based on the error

### Step 2: Check Backend Logs
The backend terminal (where `npm run start:dev` is running) will show validation errors in detail.

Look for messages like:
- `ValidationPipe: Request validation failed`
- `Bad Request Exception`
- Specific field validation errors

### Step 3: Manual Login Test
Test the login endpoint directly:
```bash
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
```

Expected successful response:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {...}
}
```

## If Login Works But App Still Shows "Validation Failed"

This means the error is happening AFTER login, likely when fetching data.

1. **Check Browser Console**
   - Press F12
   - Look for red error messages
   - They will show which API call is failing

2. **Common Post-Login Validation Issues**
   - `/api/v1/auth/profile` - Getting user profile
   - `/api/v1/products` - Loading products list
   - `/api/v1/categories` - Loading categories

3. **Check Network Tab**
   - F12 → Network tab
   - Look for requests with status 400 (Bad Request)
   - Click on them to see the validation error details

## Alternative Credentials to Try

```
admin@test.com / Admin123!
admin@example.com / Admin123!
product-test@example.com / Admin123!
```

## Emergency Database Reset

If nothing else works, reset and seed the database:
```bash
cd /Users/colinroets/dev/projects/product

# Reset database
docker-compose down
docker volume rm product_postgres_data
docker-compose up -d

# Wait for PostgreSQL to start
sleep 5

# Run migrations and seed
cd pim
npm run typeorm migration:run
npm run seed
```

## What "Validation Failed" Means

This error typically means:
1. **Request validation failed** - The data sent to the API doesn't match what's expected
2. **Response validation failed** - The API response doesn't match what the frontend expects
3. **Form validation failed** - Frontend form validation is rejecting the input

## To Get More Details

The most important thing is to check:
1. **Browser DevTools → Network tab** - Shows exactly which request is failing
2. **Backend terminal** - Shows detailed validation errors
3. **Browser Console** - Shows JavaScript errors

## Status Check Commands

```bash
# Check if backend is running
curl http://localhost:3010/api/v1/health

# Check if PostgreSQL is running
lsof -ti:5433

# Test login endpoint
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'

# Check if admin user exists (requires psql)
psql -h localhost -p 5433 -U pim_user -d pim_dev -c "SELECT email FROM users WHERE role='admin';"
# Password: pim_password
```

## Next Steps

1. Run `./diagnose-validation-quick.sh` to identify the specific issue
2. Follow the suggested fix based on the diagnosis
3. Check browser DevTools for more details
4. Report back with:
   - Where you see "Validation failed" (login page or after login?)
   - What the Network tab shows for failed requests
   - Any errors in the backend terminal
