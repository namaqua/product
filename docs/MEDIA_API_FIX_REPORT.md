# Media Library API Fix - Debug Report

## Issue Identified
The frontend was calling `/api/media/stats` instead of `/api/v1/media/stats`, causing 404 errors.

## Root Cause
The media service was using `axios` directly instead of the centralized API instance configured in `services/api.ts`. This meant it wasn't using the correct base URL with the `/api/v1` prefix.

## Solution Applied

### 1. Updated Media Service (`admin/src/services/media.service.ts`)
- Changed from importing `axios` directly to importing the centralized `api` instance
- Removed hardcoded API_URL in favor of using the baseURL from the api instance
- All endpoints now use relative paths (e.g., `/media/stats` instead of full URLs)
- The centralized API instance automatically prepends the base URL

### 2. Key Changes Made:
```typescript
// BEFORE:
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010/api/v1';
const response = await axios.get(`${API_URL}/media/stats`, ...);

// AFTER:
import api from './api';
const response = await api.get('/media/stats');
```

### 3. Benefits of This Fix:
- **Consistency**: All services now use the same API configuration
- **Automatic Auth**: The centralized API adds auth headers automatically
- **Error Handling**: Centralized error handling and token refresh
- **Maintainability**: Single source of truth for API configuration

## Files Modified
1. `/admin/src/services/media.service.ts` - Updated to use centralized API
2. Created debug scripts in `/shell-scripts/`:
   - `fix-media-api.sh` - Complete fix and restart script
   - `test-api-endpoints.sh` - Test backend endpoints
   - `debug-frontend-env.sh` - Debug environment variables
   - `restart-frontend-clean.sh` - Clean restart with cache clearing

## Verification Steps
1. Backend endpoint works: `curl http://localhost:3010/api/v1/media/stats` returns 200
2. Frontend uses correct URL: Check browser console for API calls
3. Media Library loads without errors

## Additional Notes
- The centralized API configuration is in `admin/src/services/api.ts`
- Environment variable `VITE_API_URL` should be `http://localhost:3010/api/v1`
- All other services (products, categories) already use the centralized API
- Authentication tokens are handled automatically by the API interceptor

## Status
✅ **FIXED** - Media service now uses the correct API paths through the centralized API instance.

---

*Debug completed: September 13, 2025*
