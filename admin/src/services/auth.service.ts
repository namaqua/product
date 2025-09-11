import api, { tokenManager } from './api';
import { ApiResponseParser } from '../utils/api-response-parser';
import {
  AuthResponse,
  ActionResponse,
  UserResponseDto,
} from '../types/api-responses.types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // The backend returns tokens directly, not wrapped
      const authData = response.data;
      
      // Validate response structure
      if (!authData.accessToken || !authData.refreshToken) {
        throw new Error('Invalid authentication response from server');
      }
      
      // Store tokens
      tokenManager.setTokens(authData.accessToken, authData.refreshToken);
      
      return authData;
    } catch (error: any) {
      console.error('[AuthService] Login failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const authData = response.data;
    
    // Store tokens
    if (authData.accessToken && authData.refreshToken) {
      tokenManager.setTokens(authData.accessToken, authData.refreshToken);
    }
    
    return authData;
  }

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post('/auth/refresh', { refreshToken });
    const authData = response.data;
    
    // Update tokens
    if (authData.accessToken && authData.refreshToken) {
      tokenManager.setTokens(authData.accessToken, authData.refreshToken);
    }
    
    return authData;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if it exists
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors - we'll clear tokens anyway
    } finally {
      // Clear tokens
      tokenManager.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserResponseDto> {
    const response = await api.get('/auth/profile');
    return ApiResponseParser.parseSingle<UserResponseDto>(response);
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<UserResponseDto>): Promise<ActionResponse<UserResponseDto>> {
    const response = await api.put('/auth/profile', data);
    return ApiResponseParser.parseAction<UserResponseDto>(response);
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordDto): Promise<ActionResponse<any>> {
    const response = await api.post('/auth/change-password', data);
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ActionResponse<any>> {
    const response = await api.post('/auth/forgot-password', { email });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ActionResponse<any>> {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.getAccessToken() !== null;
  }

  /**
   * Get stored tokens
   */
  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: tokenManager.getAccessToken(),
      refreshToken: tokenManager.getRefreshToken(),
    };
  }
}

export default new AuthService();
