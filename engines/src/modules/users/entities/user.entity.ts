import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  USER = 'user', // Temporary - for backward compatibility, maps to viewer
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

/**
 * User entity for authentication and authorization
 */
@Entity('users')
@Index(['email'], { unique: true })
@Index(['isActive'])
@Index(['role'])
export class User extends BaseEntity {
  @Column({ 
    type: 'varchar', 
    length: 255, 
    unique: true,
    comment: 'User email address' 
  })
  email: string;

  @Column({ 
    type: 'varchar', 
    length: 255,
    comment: 'Hashed password' 
  })
  @Exclude() // Exclude from JSON responses
  password: string;

  @Column({ 
    type: 'varchar', 
    length: 100,
    comment: 'User first name' 
  })
  firstName: string;

  @Column({ 
    type: 'varchar', 
    length: 100,
    comment: 'User last name' 
  })
  lastName: string;

  @Column({ 
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
    comment: 'User role for authorization' 
  })
  role: UserRole;

  @Column({ 
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    comment: 'User account status' 
  })
  status: UserStatus;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    comment: 'User phone number' 
  })
  phoneNumber: string | null;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    comment: 'User department' 
  })
  department: string | null;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    comment: 'User job title' 
  })
  jobTitle: string | null;

  @Column({ 
    type: 'timestamp with time zone', 
    nullable: true,
    comment: 'Last login timestamp' 
  })
  lastLoginAt: Date | null;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    comment: 'Refresh token for JWT' 
  })
  @Exclude()
  refreshToken: string | null;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    comment: 'Password reset token' 
  })
  @Exclude()
  resetPasswordToken: string | null;

  @Column({ 
    type: 'timestamp with time zone', 
    nullable: true,
    comment: 'Password reset token expiry' 
  })
  resetPasswordExpires: Date | null;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Email verification status' 
  })
  emailVerified: boolean;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true,
    comment: 'Email verification token' 
  })
  @Exclude()
  emailVerificationToken: string | null;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'User preferences and settings' 
  })
  preferences: Record<string, any> | null;

  /**
   * Hash password before saving
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      // Only hash if password is not already hashed
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  /**
   * Validate password
   */
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Get full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Check if user is active
   */
  isActiveUser(): boolean {
    return this.isActive && this.status === UserStatus.ACTIVE;
  }

  /**
   * Update last login
   */
  updateLastLogin(): void {
    this.lastLoginAt = new Date();
  }
}
