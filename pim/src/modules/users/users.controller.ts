import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UserResponseDto, UserStatsResponseDto, UserQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { 
  CollectionResponse as CollectionResponseDto,
  ActionResponseDto 
} from '../../common/dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  findAll(@Query() query: UserQueryDto): Promise<CollectionResponseDto<UserResponseDto>> {
    return this.usersService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    type: UserStatsResponseDto,
  })
  getStats(): Promise<UserStatsResponseDto> {
    return this.usersService.getStats();
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(@CurrentUser('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ActionResponseDto<UserResponseDto>> {
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ActionResponseDto<UserResponseDto>> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ): Promise<ActionResponseDto<UserResponseDto>> {
    return this.usersService.updateRole(id, role);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user status' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ): Promise<ActionResponseDto<UserResponseDto>> {
    return this.usersService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id') id: string): Promise<ActionResponseDto<UserResponseDto>> {
    return this.usersService.remove(id);
  }
}
