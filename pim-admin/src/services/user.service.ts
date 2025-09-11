import api from './api';
import { ApiResponseParser } from '../utils/api-response-parser';
import {
  CollectionResponse,
  ActionResponse,
} from '../types/api-responses.types';
import {
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  ResetPasswordDto,
  UpdateRoleDto,
  UserQueryDto,
  UserProfileDto,
  UpdateProfileDto,
} from '../types/dto/users';

class UserService {
  /**
   * Get paginated list of users
   */
  async getUsers(query: UserQueryDto = {}): Promise<CollectionResponse<UserResponseDto>> {
    try {
      const response = await api.get('/users', { params: query });
      return ApiResponseParser.parseCollection<UserResponseDto>(response);
    } catch (error: any) {
      console.error('[UserService] Failed to get users:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get single user by ID
   */
  async getUser(id: string): Promise<UserResponseDto> {
    const response = await api.get(`/users/${id}`);
    return ApiResponseParser.parseSingle<UserResponseDto>(response);
  }

  /**
   * Create new user
   */
  async createUser(dto: CreateUserDto): Promise<ActionResponse<UserResponseDto>> {
    const response = await api.post('/users', dto);
    return ApiResponseParser.parseAction<UserResponseDto>(response);
  }

  /**
   * Update existing user
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<ActionResponse<UserResponseDto>> {
    const response = await api.patch(`/users/${id}`, dto);
    return ApiResponseParser.parseAction<UserResponseDto>(response);
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ActionResponse<UserResponseDto>> {
    const response = await api.delete(`/users/${id}`);
    return ApiResponseParser.parseAction<UserResponseDto>(response);
  }

  /**
   * Reset user password (admin action)
   */
  async resetPassword(id: string, dto: ResetPasswordDto): Promise<ActionResponse<{ message: string }>> {
    const response = await api.post(`/users/${id}/reset-password`, dto);
    return ApiResponseParser.parseAction<{ message: string }>(response);
  }

  /**
   * Update user role
   */
  async updateRole(id: string, dto: UpdateRoleDto): Promise<ActionResponse<UserResponseDto>> {
    const response = await api.patch(`/users/${id}/role`, dto);
    return ApiResponseParser.parseAction<UserResponseDto>(response);
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfileDto> {
    const response = await api.get('/users/profile');
    return ApiResponseParser.parseSingle<UserProfileDto>(response);
  }

  /**
   * Update current user profile
   */
  async updateProfile(dto: UpdateProfileDto): Promise<ActionResponse<UserProfileDto>> {
    const response = await api.patch('/users/profile', dto);
    return ApiResponseParser.parseAction<UserProfileDto>(response);
  }

  /**
   * Change current user password
   */
  async changePassword(dto: UpdatePasswordDto): Promise<ActionResponse<{ message: string }>> {
    const response = await api.post('/users/change-password', dto);
    return ApiResponseParser.parseAction<{ message: string }>(response);
  }

  /**
   * Activate user
   */
  async activateUser(id: string): Promise<ActionResponse<UserResponseDto>> {
    const response = await api.patch(`/users/${id}`, { isActive: true });
    return ApiResponseParser.parseAction<UserResponseDto>(response);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<ActionResponse<UserResponseDto>> {
    const response = await api.patch(`/users/${id}`, { isActive: false });
    return ApiResponseParser.parseAction<UserResponseDto>(response);
  }

  /**
   * Bulk delete users
   */
  async bulkDelete(ids: string[]): Promise<ActionResponse<any>> {
    const response = await api.post('/users/bulk-delete', { ids });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Bulk update user status
   */
  async bulkUpdateStatus(ids: string[], isActive: boolean): Promise<ActionResponse<any>> {
    const response = await api.post('/users/bulk-update-status', { ids, isActive });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Export users
   */
  async exportUsers(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await api.get(`/users/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Import users
   */
  async importUsers(file: File): Promise<ActionResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Get user activity history
   */
  async getUserActivity(id: string, days: number = 30): Promise<any[]> {
    const response = await api.get(`/users/${id}/activity`, {
      params: { days },
    });
    return ApiResponseParser.parseSingle<any[]>(response);
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(id: string): Promise<string[]> {
    const response = await api.get(`/users/${id}/permissions`);
    return ApiResponseParser.parseSingle<string[]>(response);
  }
}

export default new UserService();
