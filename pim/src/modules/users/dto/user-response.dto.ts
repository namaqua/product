import { Expose } from 'class-transformer';
import { IsOptional, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
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
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search by name or email',
    example: 'john',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Filter by user role',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'Filter by user status',
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['firstName', 'lastName', 'email', 'role', 'status', 'createdAt', 'updatedAt', 'lastLoginAt'],
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  // Computed properties for pagination
  get skip(): number {
    const pageNum = typeof this.page === 'string' ? parseInt(this.page, 10) : this.page;
    const limitNum = typeof this.limit === 'string' ? parseInt(this.limit, 10) : this.limit;
    return (pageNum - 1) * limitNum;
  }

  get take(): number {
    return typeof this.limit === 'string' ? parseInt(this.limit, 10) : this.limit;
  }

  // Ensure page and limit are numbers for service consumption
  get pageNum(): number {
    return typeof this.page === 'string' ? parseInt(this.page, 10) || 1 : this.page || 1;
  }

  get limitNum(): number {
    return typeof this.limit === 'string' ? parseInt(this.limit, 10) || 20 : this.limit || 20;
  }
}
