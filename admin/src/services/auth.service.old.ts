import api, { tokenManager } from './api';
import { LoginDto, RegisterDto, AuthResponse, User } from '../types/api.types';

class AuthService {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    
    // Handle wrapped response structure from backend
    const data = response.data.data || response.data;
    const { accessToken, refreshToken, user } = data;
    
    // Store tokens
    tokenManager.setTokens(accessToken, refreshToken);
    
    return { accessToken, refreshToken, user };
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    
    // Handle wrapped response structure from backend
    const responseData = response.data.data || response.data;
    const { accessToken, refreshToken, user } = responseData;
    
    // Store tokens
    tokenManager.setTokens(accessToken, refreshToken);
    
    return { accessToken, refreshToken, user };
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      tokenManager.clearTokens();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    
    // Handle wrapped response structure from backend
    const data = response.data.data || response.data;
    const { accessToken, refreshToken: newRefreshToken } = data;
    
    tokenManager.setTokens(accessToken, newRefreshToken);
    
    return data;
  }

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/me');
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch('/auth/me', data);
    // Handle wrapped response structure from backend
    return response.data.data || response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  }
}

export default new AuthService();
