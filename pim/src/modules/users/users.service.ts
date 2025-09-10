import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { UpdateUserDto, UserResponseDto, UserStatsResponseDto, UserQueryDto } from './dto';
import { 
  CollectionResponse, 
  ResponseHelpers,
  ActionResponseDto 
} from '../../common/dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Find all users with filtering and pagination
   */
  async findAll(query: UserQueryDto = new UserQueryDto()): Promise<CollectionResponse<UserResponseDto>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply filters
    queryBuilder.where('user.isActive = :isActive', { isActive: true });

    if (query.search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.role) {
      queryBuilder.andWhere('user.role = :role', { role: query.role });
    }

    if (query.status) {
      queryBuilder.andWhere('user.status = :status', { status: query.status });
    }

    // Apply sorting
    const sortField = `user.${query.sortBy}`;
    queryBuilder.orderBy(sortField, query.sortOrder);

    // Apply pagination
    const [items, total] = await queryBuilder
      .skip(query.skip)
      .take(query.take)
      .getManyAndCount();

    // Transform to DTOs
    const dtos = items.map(item => this.toResponseDto(item));

    // Return standardized response
    return ResponseHelpers.wrapPaginated([dtos, total], query.pageNum, query.limitNum);
  }

  /**
   * Find user by ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toResponseDto(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<ActionResponseDto<UserResponseDto>> {
    const user = await this.findEntityById(id);
    
    Object.assign(user, updateUserDto);
    const savedUser = await this.userRepository.save(user);
    return ActionResponseDto.update(this.toResponseDto(savedUser));
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: UserRole): Promise<ActionResponseDto<UserResponseDto>> {
    const user = await this.findEntityById(id);
    user.role = role;
    const savedUser = await this.userRepository.save(user);
    return ActionResponseDto.update(this.toResponseDto(savedUser));
  }

  /**
   * Update user status
   */
  async updateStatus(id: string, status: UserStatus): Promise<ActionResponseDto<UserResponseDto>> {
    const user = await this.findEntityById(id);
    user.status = status;
    const savedUser = await this.userRepository.save(user);
    return ActionResponseDto.update(this.toResponseDto(savedUser));
  }

  /**
   * Soft delete user
   */
  async remove(id: string): Promise<ActionResponseDto<UserResponseDto>> {
    const user = await this.findEntityById(id);
    user.isActive = false;
    user.status = UserStatus.INACTIVE;
    const deletedUser = await this.userRepository.save(user);
    return ActionResponseDto.delete(this.toResponseDto(deletedUser));
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStatsResponseDto> {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });
    const pending = await this.userRepository.count({
      where: { status: UserStatus.PENDING },
    });
    const byRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return {
      total,
      active,
      pending,
      inactive: total - active - pending,
      byRole: byRole.reduce((acc, item) => {
        acc[item.role] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  /**
   * Helper: Find user entity by ID (for internal use)
   */
  private async findEntityById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Helper: Convert entity to response DTO
   */
  private toResponseDto(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
