// User DTOs following backend structure

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  USER = 'user', // Temporary - backward compatibility
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  lastLoginAt?: string | null;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  avatar?: string;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  preferences?: Record<string, any>;
}

export interface UpdatePasswordDto {
  currentPassword?: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  newPassword: string;
}

export interface UpdateRoleDto {
  role: UserRole;
}

export interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface UserProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string | null;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  avatar?: string;
  preferences?: Record<string, any>;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

// Role permissions matrix
export interface RolePermission {
  role: UserRole;
  permissions: {
    products: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
      archive: boolean;
    };
    categories: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    };
    attributes: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    };
    media: {
      view: boolean;
      upload: boolean;
      delete: boolean;
    };
    users: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
      changeRole: boolean;
    };
    settings: {
      view: boolean;
      update: boolean;
    };
  };
}

// Default role permissions
export const defaultRolePermissions: Record<UserRole, RolePermission['permissions']> = {
  [UserRole.ADMIN]: {
    products: { view: true, create: true, update: true, delete: true, archive: true },
    categories: { view: true, create: true, update: true, delete: true },
    attributes: { view: true, create: true, update: true, delete: true },
    media: { view: true, upload: true, delete: true },
    users: { view: true, create: true, update: true, delete: true, changeRole: true },
    settings: { view: true, update: true },
  },
  [UserRole.MANAGER]: {
    products: { view: true, create: true, update: true, delete: false, archive: true },
    categories: { view: true, create: true, update: true, delete: false },
    attributes: { view: true, create: true, update: true, delete: false },
    media: { view: true, upload: true, delete: false },
    users: { view: true, create: false, update: false, delete: false, changeRole: false },
    settings: { view: true, update: false },
  },
  [UserRole.EDITOR]: {
    products: { view: true, create: true, update: true, delete: false, archive: false },
    categories: { view: true, create: false, update: true, delete: false },
    attributes: { view: true, create: false, update: false, delete: false },
    media: { view: true, upload: true, delete: false },
    users: { view: false, create: false, update: false, delete: false, changeRole: false },
    settings: { view: false, update: false },
  },
  [UserRole.VIEWER]: {
    products: { view: true, create: false, update: false, delete: false, archive: false },
    categories: { view: true, create: false, update: false, delete: false },
    attributes: { view: true, create: false, update: false, delete: false },
    media: { view: true, upload: false, delete: false },
    users: { view: false, create: false, update: false, delete: false, changeRole: false },
    settings: { view: false, update: false },
  },
  // USER role is same as VIEWER for backward compatibility
  [UserRole.USER]: {
    products: { view: true, create: false, update: false, delete: false, archive: false },
    categories: { view: true, create: false, update: false, delete: false },
    attributes: { view: true, create: false, update: false, delete: false },
    media: { view: true, upload: false, delete: false },
    users: { view: false, create: false, update: false, delete: false, changeRole: false },
    settings: { view: false, update: false },
  },
};
