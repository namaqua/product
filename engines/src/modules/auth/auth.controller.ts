import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '../users/dto/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ActionResponseDto, ApiResponse } from '../../common/dto';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
  async register(@Body() createUserDto: CreateUserDto): Promise<ApiResponse> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
  })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out successfully',
  })
  async logout(@CurrentUser('id') userId: string): Promise<ActionResponseDto<{ message: string }>> {
    return this.authService.logout(userId);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
  })
  async refreshTokens(@CurrentUser() user: any): Promise<ApiResponse> {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ActionResponseDto<{ message: string }>> {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent if email exists',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<ActionResponseDto<{ message: string }>> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ActionResponseDto<{ message: string }>> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify email address' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
  })
  async verifyEmail(@Param('token') token: string): Promise<ActionResponseDto<{ message: string }>> {
    return this.authService.verifyEmail(token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Current user profile retrieved successfully',
  })
  async getCurrentUser(@CurrentUser() user: User): Promise<ApiResponse> {
    const { password, refreshToken, resetPasswordToken, emailVerificationToken, ...sanitizedUser } = user;
    return ApiResponse.success(sanitizedUser, 'User profile retrieved successfully');
  }
}
