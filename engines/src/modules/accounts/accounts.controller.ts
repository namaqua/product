import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import {
  AccountResponseDto,
  CreateAccountDto,
  UpdateAccountDto,
  AccountQueryDto,
  AccountStatsResponseDto,
} from './dto';
import {
  CollectionResponse as CollectionResponseDto,
  ActionResponseDto,
} from '../../common/dto';
import { AccountStatus, VerificationStatus } from './entities/account.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /**
   * Create a new account
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Account with registration number or tax ID already exists',
  })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<ActionResponseDto<AccountResponseDto>> {
    return this.accountsService.create(createAccountDto);
  }

  /**
   * Get all accounts
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all accounts with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Accounts retrieved successfully',
  })
  async findAll(@Query() query: AccountQueryDto): Promise<CollectionResponseDto<AccountResponseDto>> {
    return this.accountsService.findAll(query);
  }

  /**
   * Get account statistics
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get account statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(): Promise<AccountStatsResponseDto> {
    return this.accountsService.getStats();
  }

  /**
   * Get account by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiQuery({ 
    name: 'includeRelations', 
    required: false, 
    type: Boolean,
    description: 'Include related data (users, documents, etc.)'
  })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeRelations') includeRelations?: boolean,
  ): Promise<AccountResponseDto> {
    return this.accountsService.findOne(id, includeRelations !== false);
  }

  /**
   * Get subsidiary accounts
   */
  @Get(':id/subsidiaries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subsidiary accounts for a parent account' })
  @ApiParam({ name: 'id', description: 'Parent account ID' })
  @ApiResponse({
    status: 200,
    description: 'Subsidiary accounts retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Parent account not found',
  })
  async getSubsidiaries(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CollectionResponseDto<AccountResponseDto>> {
    return this.accountsService.getSubsidiaries(id);
  }

  /**
   * Update account
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Duplicate registration number or tax ID',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    return this.accountsService.update(id, updateAccountDto);
  }

  /**
   * Update account status
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update account status' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: AccountStatus,
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    return this.accountsService.updateStatus(id, status);
  }

  /**
   * Update verification status
   */
  @Patch(':id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update account verification status (admin only)' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Verification status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  async updateVerificationStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('verificationStatus') verificationStatus: VerificationStatus,
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    return this.accountsService.updateVerificationStatus(id, verificationStatus);
  }

  /**
   * Link users to account
   */
  @Post(':id/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link users to an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Users linked successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account or users not found',
  })
  async linkUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userIds') userIds: string[],
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    return this.accountsService.linkUsers(id, userIds);
  }

  /**
   * Unlink users from account
   */
  @Delete(':id/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink users from an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Users unlinked successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  async unlinkUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userIds') userIds: string[],
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    return this.accountsService.unlinkUsers(id, userIds);
  }

  /**
   * Add documents to account
   */
  @Post(':id/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add documents to an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Documents added successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account or documents not found',
  })
  async addDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('documentIds') documentIds: string[],
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    return this.accountsService.addDocuments(id, documentIds);
  }

  /**
   * Remove documents from account
   */
  @Delete(':id/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove documents from an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Documents removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  async removeDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('documentIds') documentIds: string[],
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    return this.accountsService.removeDocuments(id, documentIds);
  }

  /**
   * Delete account
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete account with subsidiaries',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ActionResponseDto<AccountResponseDto>> {
    return this.accountsService.remove(id);
  }
}
