# PIM Authentication Issue - Diagnosis & Resolution

## Problem Summary
Authentication is failing in the PIM project. The system cannot verify login credentials for the admin user.

## Root Causes Identified

### 1. **Database Connection Issues**
- PostgreSQL running on Docker port 5433 (mapped to internal 5432)
- Connection parameters in `.env` must match Docker configuration

### 2. **Password Hashing Mismatch**
- The User entity uses bcrypt for password hashing
- Password must be hashed with bcryptjs before storing in database
- The hash validation occurs in `User.validatePassword()` method

### 3. **Admin User Configuration**
- Seed file creates: `admin@example.com` with password `Admin123!`
- You mentioned needing: `admin@test.com` or `admin@pim.com`
- User must have:
  - `role: 'admin'`
  - `status: 'active'`
  - `isActive: true`
  - `emailVerified: true`

### 4. **TypeORM Configuration**
- `synchronize: false` - Database schema is managed by migrations
- Entities must match database column names exactly
- Case-sensitive column names like `"firstName"`, `"isActive"`

## Solution Scripts Created

I've created several diagnostic and fix scripts in `/Users/colinroets/dev/projects/product/shell-scripts/`:

### 1. **auth-quick-fix.sh** (RECOMMENDED - START HERE)
```bash
./shell-scripts/auth-quick-fix.sh
```
- One-click solution that diagnoses and fixes most issues
- Checks all components and auto-fixes problems
- Shows clear status with colored output

### 2. **diagnose-auth.sh**
```bash
./shell-scripts/diagnose-auth.sh
```
- Comprehensive diagnostic tool
- Checks PostgreSQL, database connection, users, backend server
- Tests login with multiple email variations
- Shows detailed troubleshooting recommendations

### 3. **reset-admin-password.sh**
```bash
./shell-scripts/reset-admin-password.sh
```
- Specifically resets the admin user password
- Creates admin user if it doesn't exist
- Updates any existing admin accounts

### 4. **fix-auth-all-in-one.sh**
```bash
./shell-scripts/fix-auth-all-in-one.sh
```
- Complete fix that handles all components
- Starts PostgreSQL, runs migrations, creates admin user
- Verifies the entire authentication flow

### 5. **verify-typeorm-schema.sh**
```bash
./shell-scripts/verify-typeorm-schema.sh
```
- Checks TypeORM entity mapping vs database schema
- Verifies password hash format
- Tests TypeORM connection independently

## Quick Resolution Steps

1. **Make scripts executable:**
```bash
chmod +x /Users/colinroets/dev/projects/product/shell-scripts/*.sh
```

2. **Run the quick fix:**
```bash
cd /Users/colinroets/dev/projects/product
./shell-scripts/auth-quick-fix.sh
```

3. **Start the backend if needed:**
```bash
cd engines
npm run start:dev
```

4. **Test login:**
- Email: `admin@test.com`
- Password: `Admin123!`

## Authentication Flow

1. **Login Request** → `/api/auth/login`
2. **AuthService.login()** validates:
   - User exists with given email
   - Password matches (bcrypt comparison)
   - User is active (`isActive: true` and `status: 'active'`)
3. **JWT Generation** with payload:
   - `sub`: user.id
   - `email`: user.email
   - `role`: user.role
4. **Response** includes:
   - `accessToken`: JWT for API calls
   - `refreshToken`: For token renewal
   - `user`: Sanitized user object

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Invalid credentials" | Password hash mismatch - run `reset-admin-password.sh` |
| "User not found or inactive" | User `isActive` is false - check database |
| Connection refused on :3010 | Backend not running - `npm run start:dev` |
| Cannot connect to database | PostgreSQL not running - check Docker |
| JWT_SECRET not configured | Add to `.env` file |

## Database Verification

Check admin user status:
```sql
SELECT email, role, status, "isActive", "emailVerified" 
FROM users 
WHERE email LIKE 'admin@%';
```

## API Testing

Test login with curl:
```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
```

## Final Configuration

After running the fix scripts, your system will have:
- **Admin Email**: `admin@test.com`
- **Admin Password**: `Admin123!`
- **Backend API**: http://localhost:3010
- **Frontend**: http://localhost:5173
- **Database**: PostgreSQL on port 5433

## Next Steps

1. Run `auth-quick-fix.sh` to resolve the issue
2. Verify backend is running
3. Test login via API or frontend
4. Check `backend.log` if issues persist
