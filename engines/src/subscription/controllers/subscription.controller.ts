import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  ParseUUIDPipe,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SubscriptionService } from '../services';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionQueryDto,
  SubscriptionResponseDto,
  SubscriptionListResponseDto,
  StandardizedSubscriptionResponseDto,
  StandardizedSubscriptionListResponseDto,
} from '../dto';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * Get child subscriptions
   */
  @Get(':id/children')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get child subscriptions',
    description: 'Retrieves all child subscriptions of a parent subscription',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Parent subscription UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Child subscriptions retrieved successfully',
    type: StandardizedSubscriptionListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent subscription not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getChildren(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StandardizedSubscriptionListResponseDto> {
    try {
      this.logger.log(`Fetching child subscriptions for parent: ${id}`);
      const result = await this.subscriptionService.getChildren(id);
      this.logger.log(`Retrieved ${result.data.items.length} child subscriptions`);
      return result;
    } catch (error) {
      this.logger.error(`Error fetching child subscriptions for ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get parent subscription
   */
  @Get(':id/parent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get parent subscription',
    description: 'Retrieves the parent subscription of a child subscription',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Child subscription UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Parent subscription retrieved successfully',
    type: StandardizedSubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Subscription is not a child',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getParent(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StandardizedSubscriptionResponseDto> {
    try {
      this.logger.log(`Fetching parent subscription for child: ${id}`);
      const result = await this.subscriptionService.getParent(id);
      this.logger.log(`Parent subscription retrieved: ${result.data.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error fetching parent subscription for ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Link a child subscription to a parent
   */
  @Post(':parentId/children/:childId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Link child subscription',
    description: 'Links a child subscription to a parent subscription',
  })
  @ApiParam({
    name: 'parentId',
    type: String,
    description: 'Parent subscription UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'childId',
    type: String,
    description: 'Child subscription UUID to link',
    example: '987f6543-e21c-34b5-a987-543210987654',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscriptions linked successfully',
    type: StandardizedSubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid hierarchy or circular reference',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async linkChild(
    @Param('parentId', ParseUUIDPipe) parentId: string,
    @Param('childId', ParseUUIDPipe) childId: string,
  ): Promise<StandardizedSubscriptionResponseDto> {
    try {
      this.logger.log(`Linking child ${childId} to parent ${parentId}`);
      const result = await this.subscriptionService.linkChildSubscription(parentId, childId);
      this.logger.log(`Subscriptions linked successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Error linking subscriptions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Unlink a child subscription from its parent
   */
  @Delete(':id/parent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Unlink from parent',
    description: 'Removes the parent-child relationship for a subscription',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Child subscription UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription unlinked successfully',
    type: StandardizedSubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Subscription is not a child',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async unlinkFromParent(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StandardizedSubscriptionResponseDto> {
    try {
      this.logger.log(`Unlinking subscription ${id} from parent`);
      const result = await this.subscriptionService.unlinkChildSubscription(id);
      this.logger.log(`Subscription unlinked successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Error unlinking subscription ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate subscription hierarchy
   */
  @Get(':id/validate-hierarchy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validate hierarchy',
    description: 'Validates the subscription hierarchy to prevent deep nesting',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Subscription UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hierarchy validation result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Hierarchy validation completed' },
        data: {
          type: 'object',
          properties: {
            valid: { type: 'boolean', example: true },
            depth: { type: 'number', example: 1 },
            message: { type: 'string', example: 'Hierarchy is valid' },
          },
        },
        timestamp: { type: 'string', example: '2025-01-01T00:00:00Z' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  async validateHierarchy(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<any> {
    try {
      this.logger.log(`Validating hierarchy for subscription: ${id}`);
      const validation = await this.subscriptionService.validateHierarchy(id);
      
      return {
        success: true,
        message: 'Hierarchy validation completed',
        data: validation,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error validating hierarchy for ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new subscription
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new subscription',
    description: 'Creates a new subscription with optional products, trial period, and payment information',
  })
  @ApiBody({ 
    type: CreateSubscriptionDto,
    description: 'Subscription creation data',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription created successfully',
    type: StandardizedSubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or business rule violation',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account or parent subscription not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createDto: CreateSubscriptionDto,
  ): Promise<StandardizedSubscriptionResponseDto> {
    try {
      this.logger.log(`Creating new subscription for account: ${createDto.accountId}`);
      const result = await this.subscriptionService.create(createDto);
      this.logger.log(`Subscription created successfully: ${result.data.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating subscription: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all subscriptions with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all subscriptions',
    description: 'Retrieves a paginated list of subscriptions with optional filtering and sorting',
  })
  @ApiQuery({ 
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({ 
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({ 
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'name', 'status', 'startDate', 'endDate', 'nextBillingDate', 'totalAmount', 'billingCycle'],
    description: 'Sort field (default: createdAt)',
  })
  @ApiQuery({ 
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (default: DESC)',
  })
  @ApiQuery({ 
    name: 'status',
    required: false,
    isArray: true,
    enum: ['pending', 'active', 'paused', 'cancelled', 'expired'],
    description: 'Filter by subscription status',
  })
  @ApiQuery({ 
    name: 'billingCycle',
    required: false,
    isArray: true,
    enum: ['monthly', 'quarterly', 'annual', 'custom'],
    description: 'Filter by billing cycle',
  })
  @ApiQuery({ 
    name: 'accountId',
    required: false,
    type: String,
    description: 'Filter by account ID',
  })
  @ApiQuery({ 
    name: 'parentSubscriptionId',
    required: false,
    type: String,
    description: 'Filter by parent subscription ID',
  })
  @ApiQuery({ 
    name: 'search',
    required: false,
    type: String,
    description: 'Search by subscription name',
  })
  @ApiQuery({ 
    name: 'currency',
    required: false,
    type: String,
    description: 'Filter by currency code',
  })
  @ApiQuery({ 
    name: 'autoRenew',
    required: false,
    type: Boolean,
    description: 'Filter by auto-renewal status',
  })
  @ApiQuery({ 
    name: 'hasTrial',
    required: false,
    type: Boolean,
    description: 'Filter by trial status',
  })
  @ApiQuery({ 
    name: 'isParent',
    required: false,
    type: Boolean,
    description: 'Filter to only show parent subscriptions',
  })
  @ApiQuery({ 
    name: 'isChild',
    required: false,
    type: Boolean,
    description: 'Filter to only show child subscriptions',
  })
  @ApiQuery({ 
    name: 'startDateFrom',
    required: false,
    type: String,
    description: 'Filter by start date from (ISO 8601)',
  })
  @ApiQuery({ 
    name: 'startDateTo',
    required: false,
    type: String,
    description: 'Filter by start date to (ISO 8601)',
  })
  @ApiQuery({ 
    name: 'nextBillingDateFrom',
    required: false,
    type: String,
    description: 'Filter by next billing date from (ISO 8601)',
  })
  @ApiQuery({ 
    name: 'nextBillingDateTo',
    required: false,
    type: String,
    description: 'Filter by next billing date to (ISO 8601)',
  })
  @ApiQuery({ 
    name: 'minAmount',
    required: false,
    type: Number,
    description: 'Filter by minimum total amount',
  })
  @ApiQuery({ 
    name: 'maxAmount',
    required: false,
    type: Number,
    description: 'Filter by maximum total amount',
  })
  @ApiQuery({ 
    name: 'expiringInDays',
    required: false,
    type: Number,
    description: 'Filter subscriptions expiring in N days',
  })
  @ApiQuery({ 
    name: 'billingInDays',
    required: false,
    type: Number,
    description: 'Filter subscriptions with billing in N days',
  })
  @ApiQuery({ 
    name: 'hasPaymentFailures',
    required: false,
    type: Boolean,
    description: 'Filter subscriptions with payment failures',
  })
  @ApiQuery({ 
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted subscriptions (default: false)',
  })
  @ApiQuery({ 
    name: 'include',
    required: false,
    isArray: true,
    description: 'Include related entities (products, invoices, events, children, parent, account)',
    example: ['products', 'children'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscriptions retrieved successfully',
    type: StandardizedSubscriptionListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    queryDto: SubscriptionQueryDto,
  ): Promise<StandardizedSubscriptionListResponseDto> {
    try {
      this.logger.log('Fetching subscriptions with filters', queryDto);
      const result = await this.subscriptionService.findAll(queryDto);
      this.logger.log(`Retrieved ${result.data.items.length} subscriptions`);
      return result;
    } catch (error) {
      this.logger.error(`Error fetching subscriptions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a single subscription by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get subscription by ID',
    description: 'Retrieves a single subscription with all related entities',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Subscription UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription retrieved successfully',
    type: StandardizedSubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StandardizedSubscriptionResponseDto> {
    try {
      this.logger.log(`Fetching subscription: ${id}`);
      const result = await this.subscriptionService.findOne(id);
      this.logger.log(`Subscription retrieved: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error fetching subscription ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a subscription
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update subscription',
    description: 'Updates subscription details with partial data',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Subscription UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ 
    type: UpdateSubscriptionDto,
    description: 'Subscription update data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription updated successfully',
    type: StandardizedSubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or status transition',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateDto: UpdateSubscriptionDto,
  ): Promise<StandardizedSubscriptionResponseDto> {
    try {
      this.logger.log(`Updating subscription: ${id}`, updateDto);
      const result = await this.subscriptionService.update(id, updateDto);
      this.logger.log(`Subscription updated successfully: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating subscription ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a subscription
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete subscription',
    description: 'Soft deletes a subscription (marks as deleted without removing from database)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Subscription UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription deleted successfully',
    type: StandardizedSubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete active subscription or subscription with children',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StandardizedSubscriptionResponseDto> {
    try {
      this.logger.log(`Soft deleting subscription: ${id}`);
      const result = await this.subscriptionService.remove(id);
      this.logger.log(`Subscription deleted successfully: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting subscription ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get subscription statistics
   */
  @Get('stats/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get subscription statistics',
    description: 'Returns summary statistics for subscriptions',
  })
  @ApiQuery({ 
    name: 'accountId',
    required: false,
    type: String,
    description: 'Filter statistics by account ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Statistics retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            totalSubscriptions: { type: 'number', example: 150 },
            activeSubscriptions: { type: 'number', example: 120 },
            pausedSubscriptions: { type: 'number', example: 10 },
            cancelledSubscriptions: { type: 'number', example: 15 },
            expiredSubscriptions: { type: 'number', example: 5 },
            totalRevenue: { type: 'number', example: 15000.00 },
            averageSubscriptionValue: { type: 'number', example: 125.00 },
            subscriptionsWithTrial: { type: 'number', example: 30 },
            parentSubscriptions: { type: 'number', example: 25 },
            childSubscriptions: { type: 'number', example: 50 },
          },
        },
        timestamp: { type: 'string', example: '2025-01-01T00:00:00Z' },
      },
    },
  })
  async getStatistics(
    @Query('accountId') accountId?: string,
  ): Promise<any> {
    try {
      this.logger.log('Fetching subscription statistics', { accountId });
      
      // This is a placeholder for statistics
      // In a real implementation, you would create a dedicated method in the service
      const stats = {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        pausedSubscriptions: 0,
        cancelledSubscriptions: 0,
        expiredSubscriptions: 0,
        totalRevenue: 0,
        averageSubscriptionValue: 0,
        subscriptionsWithTrial: 0,
        parentSubscriptions: 0,
        childSubscriptions: 0,
      };

      return {
        success: true,
        message: 'Statistics retrieved successfully',
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  @Get('health/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Check if the subscription module is healthy',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Subscription module is healthy' },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'healthy' },
            module: { type: 'string', example: 'subscription' },
            timestamp: { type: 'string', example: '2025-01-01T00:00:00Z' },
          },
        },
        timestamp: { type: 'string', example: '2025-01-01T00:00:00Z' },
      },
    },
  })
  async healthCheck(): Promise<any> {
    return {
      success: true,
      message: 'Subscription module is healthy',
      data: {
        status: 'healthy',
        module: 'subscription',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
