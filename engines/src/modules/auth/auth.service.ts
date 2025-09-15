import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../users/entities/user.entity';
import { CreateUserDto, LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '../users/dto/user.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { randomBytes } from 'crypto';
import { ActionResponseDto, ApiResponse } from '../../common/dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthData extends AuthTokens {
  user: Partial<User>;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(createUserDto: CreateUserDto): Promise<ApiResponse<AuthData>> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      ...createUserDto,
      status: UserStatus.ACTIVE, // Set to ACTIVE for development (change to PENDING in production)
      emailVerified: true, // Auto-verify for development
      emailVerificationToken: this.generateToken(),
    });

    await this.userRepository.save(user);

    // TODO: Send verification email

    // Generate tokens
    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return ApiResponse.success({
      ...tokens,
      user: this.sanitizeUser(user),
    }, 'User registered successfully');
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<ApiResponse<AuthData>> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActiveUser()) {
      throw new UnauthorizedException('Account is not active');
    }

    // Update last login
    user.updateLastLogin();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return ApiResponse.success({
      ...tokens,
      user: this.sanitizeUser(user),
    }, 'Login successful');
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<ActionResponseDto<{ message: string }>> {
    await this.userRepository.update(userId, {
      refreshToken: null,
    });
    
    return new ActionResponseDto(
      { message: 'Logged out successfully' },
      'Logged out successfully'
    );
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    // Verify refresh token
    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return ApiResponse.success(tokens, 'Tokens refreshed successfully');
  }

  /**
   * Change password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<ActionResponseDto<{ message: string }>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate current password
    const isPasswordValid = await user.validatePassword(changePasswordDto.currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    user.password = changePasswordDto.newPassword;
    await this.userRepository.save(user);
    
    return new ActionResponseDto(
      { message: 'Password changed successfully' },
      'Password changed successfully'
    );
  }

  /**
   * Request password reset
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ActionResponseDto<{ message: string }>> {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (user) {
      // Generate reset token
      const resetToken = this.generateToken();
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await this.userRepository.save(user);

      // TODO: Send password reset email
      console.log(`Password reset token for ${user.email}: ${resetToken}`);
    }
    
    // Always return the same message to prevent email enumeration
    return new ActionResponseDto(
      { message: 'If the email exists, a password reset link has been sent' },
      'If the email exists, a password reset link has been sent'
    );
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ActionResponseDto<{ message: string }>> {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: resetPasswordDto.token,
      },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    user.password = resetPasswordDto.newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);
    
    return new ActionResponseDto(
      { message: 'Password reset successfully' },
      'Password reset successfully'
    );
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<ActionResponseDto<{ message: string }>> {
    const user = await this.userRepository.findOne({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.status = UserStatus.ACTIVE;
    await this.userRepository.save(user);
    
    return new ActionResponseDto(
      { message: 'Email verified successfully' },
      'Email verified successfully'
    );
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Update refresh token in database
   */
  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  /**
   * Generate random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: User): Partial<User> {
    const { password, refreshToken, resetPasswordToken, emailVerificationToken, ...sanitized } = user;
    return sanitized;
  }
}
