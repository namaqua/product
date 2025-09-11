import { Expose } from 'class-transformer';
import { IsOptional, IsEnum, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { UserRole, UserStatus } from '../entities/user.entity';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role: UserRole;

  @Expose()
  status: UserStatus;

  @Expose()
  phoneNumber?: string;

  @Expose()
  department?: string;

  @Expose()
  jobTitle?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  preferences?: Record<string, any>;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  lastLoginAt?: Date;

  // Note: password, refreshToken, resetPasswordToken, emailVerificationToken are excluded
}

export class UserStatsResponseDto {
  @Expose()
  total: number;

  @Expose()
  active: number;

  @Expose()
  pending: number;

  @Expose()
  inactive: number;

  @Expose()
  byRole: Record<string, number>;
}

export class UserQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = parseInt(value, 10);
    return isNaN(num) ? 1 : num;
  })
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = parseInt(value, 10);
    return isNaN(num) ? 20 : num;
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search by name or email',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || '')
  search?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Filter by user role',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'Filter by user status',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['firstName', 'lastName', 'email', 'role', 'status', 'createdAt', 'updatedAt', 'lastLoginAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || 'createdAt')
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @Transform(({ value }) => {
    const upper = (value || 'DESC').toUpperCase();
    return upper === 'ASC' || upper === 'DESC' ? upper : 'DESC';
  })
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Sort order (alternative name)',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    const upper = (value || '').toUpperCase();
    return upper === 'ASC' || upper === 'DESC' ? upper : undefined;
  })
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  // Computed properties for pagination
  get skip(): number {
    const pageNum = typeof this.page === 'string' ? parseInt(this.page as any, 10) : this.page;
    const limitNum = typeof this.limit === 'string' ? parseInt(this.limit as any, 10) : this.limit;
    return ((pageNum || 1) - 1) * (limitNum || 20);
  }

  get take(): number {
    return typeof this.limit === 'string' ? parseInt(this.limit as any, 10) : this.limit || 20;
  }

  // Ensure page and limit are numbers for service consumption
  get pageNum(): number {
    return typeof this.page === 'string' ? parseInt(this.page as any, 10) || 1 : this.page || 1;
  }

  get limitNum(): number {
    return typeof this.limit === 'string' ? parseInt(this.limit as any, 10) || 20 : this.limit || 20;
  }

  // Handle both sortOrder and order
  get finalSortOrder(): 'ASC' | 'DESC' {
    return this.order || this.sortOrder || 'DESC';
  }
}
