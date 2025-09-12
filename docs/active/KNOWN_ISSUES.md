# Known Issues & Blockers

## 🔴 Critical Issues

### 1. Refresh Token Endpoint Failure
- **Endpoint**: `/auth/refresh`
- **Error**: Returns 401 Unauthorized
- **Impact**: Session expires after token timeout
- **Workaround**: Re-login when session expires
- **Fix**: Need to implement proper refresh token handling in backend

### 2. Product API Response Incomplete
- **Endpoint**: `GET /products/{id}`
- **Issue**: Categories and attributes return null
- **Impact**: Can't display product relationships
- **Workaround**: Separate API calls for categories/attributes
- **Fix**: Backend needs to populate relations in response

## 🟡 Minor Issues

### 3. Status Filtering Limited
- **Issue**: Product status filtering may not work on all endpoints
- **Impact**: Can't filter by draft/published/archived
- **Workaround**: Filter in frontend from full list

### 4. Media Response Wrapping Inconsistent
- **Issue**: Media endpoints wrap responses differently
- **Impact**: Frontend needs multiple response handlers
- **Workaround**: Check for both response.data and direct response

## ✅ Recently Fixed
- ~~Black square images~~ (Fixed Sept 11)
- ~~Routing issues~~ (Fixed Sept 10)
- ~~Field mapping mismatches~~ (Fixed Sept 9)

## 📝 Notes
- Backend DTOs are SACROSANCT - don't change them
- Frontend must adapt to backend structure
- Always test in incognito for auth issues

---
*Updated: Sept 12, 2025*