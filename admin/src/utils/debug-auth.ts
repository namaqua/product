// Debug utility to check authentication state
export function debugAuth() {
  console.group('🔐 Auth Debug Info');
  
  // Check tokens
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  console.log('Access Token:', accessToken ? `${accessToken.substring(0, 50)}...` : 'NOT FOUND');
  console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 50)}...` : 'NOT FOUND');
  
  // Check auth storage
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log('Auth Storage State:', parsed.state);
    } catch (e) {
      console.error('Failed to parse auth storage:', e);
    }
  } else {
    console.log('Auth Storage: NOT FOUND');
  }
  
  // Test API call with token
  if (accessToken) {
    console.log('Testing API with token...');
    fetch('http://localhost:3010/api/v1/products?limit=1', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log('✅ API call successful:', data);
      } else {
        console.error('❌ API call failed:', data);
      }
    })
    .catch(err => {
      console.error('❌ API call error:', err);
    });
  } else {
    console.log('⚠️ No token to test API with');
  }
  
  console.groupEnd();
}

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
}
