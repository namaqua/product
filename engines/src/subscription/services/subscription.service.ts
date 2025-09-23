import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, Like, Between, LessThan, MoreThan, In, IsNull, Not } from 'typeorm';
import { 
  Subscription, 
  SubscriptionProduct, 
  SubscriptionInvoice, 
  SubscriptionEvent 
} from '../entities';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionQueryDto,
  SubscriptionResponseDto,
  SubscriptionListResponseDto,
  StandardizedSubscriptionResponseDto,
  StandardizedSubscriptionListResponseDto,
} from '../dto';
import { SubscriptionStatus, BillingCycle, SubscriptionEventType } from '../enums';
import { Product } from '../../modules/products/entities/product.entity';
import { Account } from '../../modules/accounts/entities/account.entity';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionProduct)
    private readonly subscriptionProductRepository: Repository<SubscriptionProduct>,
    @InjectRepository(SubscriptionEvent)
    private readonly subscriptionEventRepository: Repository<SubscriptionEvent>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /**
   * Create a new subscription
   */
  async create(createDto: CreateSubscriptionDto): Promise<StandardizedSubscriptionResponseDto> {
    try {
      // Validate account exists
      const account = await this.accountRepository.findOne({
        where: { id: createDto.accountId },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${createDto.accountId} not found`);
      }

      // Validate parent subscription if provided
      if (createDto.parentSubscriptionId) {
        const parentSubscription = await this.subscriptionRepository.findOne({
          where: { id: createDto.parentSubscriptionId },
        });

        if (!parentSubscription) {
          throw new NotFoundException(`Parent subscription with ID ${createDto.parentSubscriptionId} not found`);
        }

        // Ensure parent is not a child itself (prevent deep nesting)
        if (parentSubscription.parentSubscriptionId) {
          throw new BadRequestException('Cannot create subscription under a child subscription. Only one level of hierarchy is allowed.');
        }
      }

      // Calculate total amount
      const taxAmount = createDto.taxPercentage 
        ? (createDto.baseAmount - (createDto.discountAmount || 0)) * (createDto.taxPercentage / 100)
        : 0;
      
      const totalAmount = createDto.baseAmount - (createDto.discountAmount || 0) + taxAmount;

      // Create subscription entity
      const subscription = this.subscriptionRepository.create({
        ...createDto,
        taxAmount,
        totalAmount,
        status: createDto.status || SubscriptionStatus.PENDING,
        currency: createDto.currency || 'USD',
        billingDayOfMonth: createDto.billingDayOfMonth || 1,
        autoRenew: createDto.autoRenew !== false,
        maxRetryAttempts: createDto.maxRetryAttempts || 3,
        noticePeriodDays: createDto.noticePeriodDays || 30,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        nextBillingDate: this.calculateNextBillingDate(
          new Date(createDto.startDate),
          createDto.billingCycle,
          createDto.billingDayOfMonth || 1,
          createDto.customBillingDays,
        ),
        trialEndDate: createDto.hasTrial && createDto.trialDays
          ? new Date(Date.now() + createDto.trialDays * 24 * 60 * 60 * 1000)
          : null,
        totalPausedDays: 0,
      });

      // Save subscription
      const savedSubscription = await this.subscriptionRepository.save(subscription);

      // Add products if provided
      if (createDto.products && createDto.products.length > 0) {
        await this.addProductsToSubscription(savedSubscription.id, createDto.products);
      }

      // Create initial event
      await this.createSubscriptionEvent(savedSubscription.id, SubscriptionEventType.CREATED, {
        createdBy: 'system',
        initialData: createDto,
      });

      // If this is a child subscription, create hierarchy event
      if (createDto.parentSubscriptionId) {
        await this.createSubscriptionEvent(savedSubscription.id, SubscriptionEventType.CHILD_ADDED, {
          parentSubscriptionId: createDto.parentSubscriptionId,
        });
        
        await this.createSubscriptionEvent(createDto.parentSubscriptionId, SubscriptionEventType.CHILD_ADDED, {
          childSubscriptionId: savedSubscription.id,
        });
      }

      // Fetch complete subscription with relations
      const completeSubscription = await this.findOne(savedSubscription.id);

      this.logger.log(`Subscription created successfully: ${savedSubscription.id}`);

      return {
        success: true,
        message: 'Subscription created successfully',
        data: completeSubscription.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error creating subscription: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all subscriptions with pagination and filtering
   */
  async findAll(queryDto: SubscriptionQueryDto): Promise<StandardizedSubscriptionListResponseDto> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        includeDeleted = false,
        include = [],
        ...filters
      } = queryDto;

      // Build where conditions
      const where: FindOptionsWhere<Subscription> = {};

      // Basic filters
      if (filters.accountId) where.accountId = filters.accountId;
      if (filters.parentSubscriptionId) where.parentSubscriptionId = filters.parentSubscriptionId;
      if (filters.currency) where.currency = filters.currency;
      if (filters.autoRenew !== undefined) where.autoRenew = filters.autoRenew;
      if (filters.hasTrial !== undefined) where.hasTrial = filters.hasTrial;

      // Status filter (array)
      if (filters.status && filters.status.length > 0) {
        where.status = In(filters.status);
      }

      // Billing cycle filter (array)
      if (filters.billingCycle && filters.billingCycle.length > 0) {
        where.billingCycle = In(filters.billingCycle);
      }

      // Search by name
      if (filters.search) {
        where.name = Like(`%${filters.search}%`);
      }

      // Parent/Child filters
      if (filters.isParent) {
        where.parentSubscriptionId = IsNull();
      } else if (filters.isChild) {
        where.parentSubscriptionId = Not(IsNull());
      }

      // Date range filters
      if (filters.startDateFrom || filters.startDateTo) {
        where.startDate = Between(
          filters.startDateFrom ? new Date(filters.startDateFrom) : new Date('1900-01-01'),
          filters.startDateTo ? new Date(filters.startDateTo) : new Date('2100-12-31')
        );
      }

      if (filters.nextBillingDateFrom || filters.nextBillingDateTo) {
        where.nextBillingDate = Between(
          filters.nextBillingDateFrom ? new Date(filters.nextBillingDateFrom) : new Date('1900-01-01'),
          filters.nextBillingDateTo ? new Date(filters.nextBillingDateTo) : new Date('2100-12-31')
        );
      }

      // Amount range filters
      if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
        if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
          where.totalAmount = Between(filters.minAmount, filters.maxAmount);
        } else if (filters.minAmount !== undefined) {
          where.totalAmount = MoreThan(filters.minAmount);
        } else if (filters.maxAmount !== undefined) {
          where.totalAmount = LessThan(filters.maxAmount);
        }
      }

      // Special filters
      if (filters.expiringInDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + filters.expiringInDays);
        where.endDate = Between(new Date(), expiryDate);
      }

      if (filters.billingInDays) {
        const billingDate = new Date();
        billingDate.setDate(billingDate.getDate() + filters.billingInDays);
        where.nextBillingDate = Between(new Date(), billingDate);
      }

      // Include deleted records if requested
      if (!includeDeleted) {
        where.isDeleted = false;
      }

      // Build relations
      const relations: string[] = [];
      if (include.includes('products')) relations.push('subscriptionProducts', 'subscriptionProducts.product');
      if (include.includes('invoices')) relations.push('invoices');
      if (include.includes('events')) relations.push('events');
      if (include.includes('children')) relations.push('childSubscriptions');
      if (include.includes('parent')) relations.push('parentSubscription');
      if (include.includes('account')) relations.push('account');

      // Build find options
      const findOptions: FindManyOptions<Subscription> = {
        where,
        relations,
        order: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      };

      // Execute query
      const [items, total] = await this.subscriptionRepository.findAndCount(findOptions);

      // Transform to response DTOs
      const responseItems = items.map(item => this.mapToResponseDto(item));

      const totalPages = Math.ceil(total / limit);

      const listResponse: SubscriptionListResponseDto = {
        items: responseItems,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };

      return {
        success: true,
        message: 'Subscriptions retrieved successfully',
        data: listResponse,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching subscriptions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a single subscription by ID
   */
  async findOne(id: string): Promise<StandardizedSubscriptionResponseDto> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { id, isDeleted: false },
        relations: [
          'subscriptionProducts',
          'subscriptionProducts.product',
          'childSubscriptions',
          'parentSubscription',
          'account',
        ],
      });

      if (!subscription) {
        throw new NotFoundException(`Subscription with ID ${id} not found`);
      }

      const responseDto = this.mapToResponseDto(subscription);

      return {
        success: true,
        message: 'Subscription retrieved successfully',
        data: responseDto,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching subscription ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a subscription
   */
  async update(id: string, updateDto: UpdateSubscriptionDto): Promise<StandardizedSubscriptionResponseDto> {
    try {
      // Find existing subscription
      const subscription = await this.subscriptionRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!subscription) {
        throw new NotFoundException(`Subscription with ID ${id} not found`);
      }

      // Store previous state for event tracking
      const previousState = { ...subscription };

      // Validate status transitions
      if (updateDto.status) {
        this.validateStatusTransition(subscription.status, updateDto.status);
      }

      // Recalculate amounts if pricing changed
      if (updateDto.baseAmount !== undefined || 
          updateDto.discountAmount !== undefined || 
          updateDto.taxPercentage !== undefined) {
        
        const baseAmount = updateDto.baseAmount ?? subscription.baseAmount;
        const discountAmount = updateDto.discountAmount ?? subscription.discountAmount;
        const taxPercentage = updateDto.taxPercentage ?? subscription.taxPercentage;
        
        const taxAmount = (baseAmount - discountAmount) * (taxPercentage / 100);
        const totalAmount = baseAmount - discountAmount + taxAmount;
        
        updateDto = {
          ...updateDto,
          taxAmount,
          totalAmount,
        } as any;
      }

      // Handle billing cycle change
      if (updateDto.billingCycle || updateDto.billingDayOfMonth) {
        const nextBillingDate = this.calculateNextBillingDate(
          subscription.startDate,
          updateDto.billingCycle || subscription.billingCycle,
          updateDto.billingDayOfMonth || subscription.billingDayOfMonth,
          updateDto.customBillingDays || subscription.customBillingDays,
        );
        updateDto.nextBillingDate = nextBillingDate.toISOString();
      }

      // Update subscription
      Object.assign(subscription, updateDto);
      
      if (updateDto.endDate) {
        subscription.endDate = new Date(updateDto.endDate);
      }
      if (updateDto.nextBillingDate) {
        subscription.nextBillingDate = new Date(updateDto.nextBillingDate);
      }

      const updatedSubscription = await this.subscriptionRepository.save(subscription);

      // Create update event
      await this.createSubscriptionEvent(id, SubscriptionEventType.UPGRADED, {
        previousState,
        newState: updatedSubscription,
        changes: updateDto,
      });

      // Fetch complete subscription with relations
      const completeSubscription = await this.findOne(id);

      this.logger.log(`Subscription ${id} updated successfully`);

      return completeSubscription;
    } catch (error) {
      this.logger.error(`Error updating subscription ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a subscription
   */
  async remove(id: string): Promise<StandardizedSubscriptionResponseDto> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['childSubscriptions'],
      });

      if (!subscription) {
        throw new NotFoundException(`Subscription with ID ${id} not found`);
      }

      // Check if subscription can be deleted
      if (subscription.status === SubscriptionStatus.ACTIVE) {
        throw new BadRequestException('Cannot delete an active subscription. Please cancel it first.');
      }

      // Check for child subscriptions
      if (subscription.childSubscriptions && subscription.childSubscriptions.length > 0) {
        throw new BadRequestException('Cannot delete a subscription with active child subscriptions.');
      }

      // Perform soft delete
      subscription.isDeleted = true;
      subscription.deletedAt = new Date();
      await this.subscriptionRepository.save(subscription);

      // Create deletion event
      await this.createSubscriptionEvent(id, SubscriptionEventType.CANCELLED, {
        reason: 'Subscription deleted',
        deletedAt: subscription.deletedAt,
      });

      this.logger.log(`Subscription ${id} soft deleted successfully`);

      const responseDto = this.mapToResponseDto(subscription);

      return {
        success: true,
        message: 'Subscription deleted successfully',
        data: responseDto,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error deleting subscription ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get child subscriptions
   */
  async getChildren(parentId: string): Promise<StandardizedSubscriptionListResponseDto> {
    try {
      const parent = await this.subscriptionRepository.findOne({
        where: { id: parentId, isDeleted: false },
      });

      if (!parent) {
        throw new NotFoundException(`Parent subscription with ID ${parentId} not found`);
      }

      const children = await this.subscriptionRepository.find({
        where: { parentSubscriptionId: parentId, isDeleted: false },
        relations: ['subscriptionProducts', 'subscriptionProducts.product'],
        order: { createdAt: 'DESC' },
      });

      const responseItems = children.map(child => this.mapToResponseDto(child));

      const listResponse: SubscriptionListResponseDto = {
        items: responseItems,
        total: children.length,
        page: 1,
        limit: children.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      return {
        success: true,
        message: `Retrieved ${children.length} child subscription(s)`,
        data: listResponse,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching child subscriptions for ${parentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get parent subscription
   */
  async getParent(childId: string): Promise<StandardizedSubscriptionResponseDto> {
    try {
      const child = await this.subscriptionRepository.findOne({
        where: { id: childId, isDeleted: false },
        relations: ['parentSubscription'],
      });

      if (!child) {
        throw new NotFoundException(`Subscription with ID ${childId} not found`);
      }

      if (!child.parentSubscriptionId) {
        throw new BadRequestException(`Subscription ${childId} is not a child subscription`);
      }

      const parent = await this.subscriptionRepository.findOne({
        where: { id: child.parentSubscriptionId, isDeleted: false },
        relations: ['subscriptionProducts', 'subscriptionProducts.product', 'childSubscriptions'],
      });

      if (!parent) {
        throw new NotFoundException(`Parent subscription not found`);
      }

      const responseDto = this.mapToResponseDto(parent);

      return {
        success: true,
        message: 'Parent subscription retrieved successfully',
        data: responseDto,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching parent subscription for ${childId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Link a child subscription to a parent
   */
  async linkChildSubscription(parentId: string, childId: string): Promise<StandardizedSubscriptionResponseDto> {
    try {
      // Validate both subscriptions exist
      const parent = await this.subscriptionRepository.findOne({
        where: { id: parentId, isDeleted: false },
      });

      if (!parent) {
        throw new NotFoundException(`Parent subscription with ID ${parentId} not found`);
      }

      const child = await this.subscriptionRepository.findOne({
        where: { id: childId, isDeleted: false },
      });

      if (!child) {
        throw new NotFoundException(`Child subscription with ID ${childId} not found`);
      }

      // Prevent circular references
      if (parent.parentSubscriptionId === childId) {
        throw new BadRequestException('Circular reference detected. Cannot link these subscriptions.');
      }

      // Prevent deep nesting
      if (parent.parentSubscriptionId) {
        throw new BadRequestException('Cannot add child to a subscription that is already a child. Only one level of hierarchy is allowed.');
      }

      if (child.parentSubscriptionId) {
        throw new BadRequestException('This subscription already has a parent. Remove existing parent first.');
      }

      // Check if child has children (prevent deep nesting)
      const childChildren = await this.subscriptionRepository.count({
        where: { parentSubscriptionId: childId, isDeleted: false },
      });

      if (childChildren > 0) {
        throw new BadRequestException('Cannot link a subscription that has its own children. Only one level of hierarchy is allowed.');
      }

      // Link the subscriptions
      child.parentSubscriptionId = parentId;
      await this.subscriptionRepository.save(child);

      // Create events
      await this.createSubscriptionEvent(childId, SubscriptionEventType.PARENT_ASSIGNED, {
        parentSubscriptionId: parentId,
      });

      await this.createSubscriptionEvent(parentId, SubscriptionEventType.CHILD_ADDED, {
        childSubscriptionId: childId,
      });

      // Return updated child
      const updatedChild = await this.findOne(childId);

      this.logger.log(`Subscription ${childId} linked to parent ${parentId}`);

      return updatedChild;
    } catch (error) {
      this.logger.error(`Error linking subscriptions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Unlink a child subscription from its parent
   */
  async unlinkChildSubscription(childId: string): Promise<StandardizedSubscriptionResponseDto> {
    try {
      const child = await this.subscriptionRepository.findOne({
        where: { id: childId, isDeleted: false },
      });

      if (!child) {
        throw new NotFoundException(`Subscription with ID ${childId} not found`);
      }

      if (!child.parentSubscriptionId) {
        throw new BadRequestException(`Subscription ${childId} is not a child subscription`);
      }

      const parentId = child.parentSubscriptionId;

      // Unlink the subscription
      child.parentSubscriptionId = null;
      await this.subscriptionRepository.save(child);

      // Create events
      await this.createSubscriptionEvent(childId, SubscriptionEventType.PARENT_ASSIGNED, {
        previousParentId: parentId,
        parentSubscriptionId: null,
      });

      await this.createSubscriptionEvent(parentId, SubscriptionEventType.CHILD_REMOVED, {
        childSubscriptionId: childId,
      });

      // Return updated child
      const updatedChild = await this.findOne(childId);

      this.logger.log(`Subscription ${childId} unlinked from parent ${parentId}`);

      return updatedChild;
    } catch (error) {
      this.logger.error(`Error unlinking subscription ${childId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate hierarchy depth (prevent deep nesting)
   */
  async validateHierarchy(subscriptionId: string): Promise<{ valid: boolean; depth: number; message?: string }> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { id: subscriptionId, isDeleted: false },
        relations: ['parentSubscription', 'childSubscriptions'],
      });

      if (!subscription) {
        return { valid: false, depth: 0, message: 'Subscription not found' };
      }

      // Check upward hierarchy (parents)
      let upwardDepth = 0;
      let current = subscription;
      while (current.parentSubscriptionId) {
        upwardDepth++;
        if (upwardDepth > 1) {
          return { valid: false, depth: upwardDepth, message: 'Hierarchy exceeds maximum depth of 1' };
        }
        current = await this.subscriptionRepository.findOne({
          where: { id: current.parentSubscriptionId },
          relations: ['parentSubscription'],
        });
      }

      // Check downward hierarchy (children)
      let downwardDepth = 0;
      if (subscription.childSubscriptions && subscription.childSubscriptions.length > 0) {
        downwardDepth = 1;
        // Check if any child has children
        for (const child of subscription.childSubscriptions) {
          const childrenCount = await this.subscriptionRepository.count({
            where: { parentSubscriptionId: child.id, isDeleted: false },
          });
          if (childrenCount > 0) {
            return { valid: false, depth: 2, message: 'Child subscriptions cannot have their own children' };
          }
        }
      }

      const totalDepth = upwardDepth + downwardDepth;
      return { 
        valid: totalDepth <= 1, 
        depth: totalDepth,
        message: totalDepth <= 1 ? 'Hierarchy is valid' : 'Hierarchy exceeds maximum depth'
      };
    } catch (error) {
      this.logger.error(`Error validating hierarchy for ${subscriptionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Add products to a subscription
   */
  private async addProductsToSubscription(
    subscriptionId: string,
    products: Array<{
      productId: string;
      quantity: number;
      unitPrice?: number;
      discountAmount?: number;
      isRecurring?: boolean;
    }>,
  ): Promise<void> {
    for (const productDto of products) {
      // Validate product exists
      const product = await this.productRepository.findOne({
        where: { id: productDto.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productDto.productId} not found`);
      }

      // Create subscription product
      const subscriptionProduct = this.subscriptionProductRepository.create({
        subscriptionId,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: productDto.quantity,
        unitPrice: productDto.unitPrice || product.price || 0,
        discountAmount: productDto.discountAmount || 0,
        discountPercentage: 0,
        totalPrice: ((productDto.unitPrice || product.price || 0) - (productDto.discountAmount || 0)) * productDto.quantity,
        isRecurring: productDto.isRecurring !== false,
        isSetupFee: false,
        addedDate: new Date(),
        metadata: {
          addedAt: new Date().toISOString(),
          productDescription: product.description,
        },
      });

      await this.subscriptionProductRepository.save(subscriptionProduct);
    }
  }

  /**
   * Create a subscription event for audit trail
   */
  private async createSubscriptionEvent(
    subscriptionId: string,
    eventType: SubscriptionEventType,
    metadata: Record<string, any>,
  ): Promise<void> {
    const event = this.subscriptionEventRepository.create({
      subscriptionId,
      eventType,
      description: `Subscription ${eventType}`,
      details: JSON.stringify(metadata),
      eventSource: 'api',
      ipAddress: null,
      userAgent: null,
      metadata,
      isProcessed: true,
      processedAt: new Date(),
    });

    await this.subscriptionEventRepository.save(event);
  }

  /**
   * Calculate next billing date based on cycle and settings
   */
  private calculateNextBillingDate(
    startDate: Date,
    billingCycle: BillingCycle,
    billingDayOfMonth: number,
    customDays?: number,
  ): Date {
    const nextDate = new Date(startDate);
    
    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(billingDayOfMonth);
        break;
      case BillingCycle.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        nextDate.setDate(billingDayOfMonth);
        break;
      case BillingCycle.ANNUAL:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        nextDate.setDate(billingDayOfMonth);
        break;
      case BillingCycle.CUSTOM:
        nextDate.setDate(nextDate.getDate() + (customDays || 30));
        break;
    }

    // Ensure date is in the future
    if (nextDate <= new Date()) {
      return this.calculateNextBillingDate(new Date(), billingCycle, billingDayOfMonth, customDays);
    }

    return nextDate;
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(currentStatus: SubscriptionStatus, newStatus: SubscriptionStatus): void {
    const validTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
      [SubscriptionStatus.PENDING]: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED],
      [SubscriptionStatus.ACTIVE]: [SubscriptionStatus.PAUSED, SubscriptionStatus.CANCELLED, SubscriptionStatus.EXPIRED],
      [SubscriptionStatus.PAUSED]: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED],
      [SubscriptionStatus.CANCELLED]: [],
      [SubscriptionStatus.EXPIRED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Get event category based on event type
   */
  private getEventCategory(eventType: SubscriptionEventType): string {
    const lifecycleEvents = [
      SubscriptionEventType.CREATED,
      SubscriptionEventType.ACTIVATED,
      SubscriptionEventType.PAUSED,
      SubscriptionEventType.RESUMED,
      SubscriptionEventType.CANCELLED,
      SubscriptionEventType.EXPIRED,
    ];

    const billingEvents = [
      SubscriptionEventType.INVOICE_GENERATED,
      SubscriptionEventType.PAYMENT_SUCCEEDED,
      SubscriptionEventType.PAYMENT_FAILED,
      SubscriptionEventType.PAYMENT_RETRY,
    ];

    const modificationEvents = [
      SubscriptionEventType.UPGRADED,
      SubscriptionEventType.DOWNGRADED,
      SubscriptionEventType.PRODUCT_ADDED,
      SubscriptionEventType.PRODUCT_REMOVED,
    ];

    if (lifecycleEvents.includes(eventType)) return 'lifecycle';
    if (billingEvents.includes(eventType)) return 'billing';
    if (modificationEvents.includes(eventType)) return 'modification';
    return 'hierarchy';
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(subscription: Subscription): SubscriptionResponseDto {
    const dto: SubscriptionResponseDto = {
      id: subscription.id,
      accountId: subscription.accountId,
      parentSubscriptionId: subscription.parentSubscriptionId,
      status: subscription.status,
      name: subscription.name,
      description: subscription.description,
      billingCycle: subscription.billingCycle,
      customBillingDays: subscription.customBillingDays,
      billingDayOfMonth: subscription.billingDayOfMonth,
      currency: subscription.currency,
      baseAmount: subscription.baseAmount,
      discountAmount: subscription.discountAmount,
      discountPercentage: subscription.discountPercentage,
      taxAmount: subscription.taxAmount,
      taxPercentage: subscription.taxPercentage,
      totalAmount: subscription.totalAmount,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      nextBillingDate: subscription.nextBillingDate,
      lastBillingDate: subscription.lastBillingDate,
      hasTrial: subscription.hasTrial,
      trialDays: subscription.trialDays,
      trialEndDate: subscription.trialEndDate,
      pausedAt: subscription.pausedAt,
      resumedAt: subscription.resumedAt,
      totalPausedDays: subscription.totalPausedDays,
      cancellationDate: subscription.cancellationDate,
      cancellationEffectiveDate: subscription.cancellationEffectiveDate,
      cancellationReason: subscription.cancellationReason,
      cancellationNotes: subscription.cancellationNotes,
      noticePeriodDays: subscription.noticePeriodDays,
      paymentMethodLast4: subscription.paymentMethodLast4,
      paymentMethodType: subscription.paymentMethodType,
      paymentProvider: subscription.paymentProvider,
      autoRenew: subscription.autoRenew,
      maxRetryAttempts: subscription.maxRetryAttempts,
      metadata: subscription.metadata,
      settings: subscription.settings,
      usageLimits: subscription.usageLimits,
      currentUsage: subscription.currentUsage,
      isActive: subscription.isCurrentlyActive(),
      isInTrial: subscription.isInTrial(),
      isPaused: subscription.status === SubscriptionStatus.PAUSED,
      isCancelled: subscription.status === SubscriptionStatus.CANCELLED,
      hasChildren: subscription.childSubscriptions?.length > 0,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };

    // Add relations if loaded
    if (subscription.subscriptionProducts) {
      dto.products = subscription.subscriptionProducts.map(sp => ({
        id: sp.id,
        subscriptionId: sp.subscriptionId,
        productId: sp.productId,
        productName: sp.productName,
        productSku: sp.productSku,
        quantity: sp.quantity,
        unitPrice: sp.unitPrice,
        discountAmount: sp.discountAmount,
        totalAmount: sp.totalPrice,
        isRecurring: sp.isRecurring,
        createdAt: sp.createdAt,
        updatedAt: sp.updatedAt,
      }));
    }

    if (subscription.childSubscriptions) {
      dto.children = subscription.childSubscriptions.map(child => 
        this.mapToResponseDto(child)
      );
    }

    if (subscription.invoices) {
      dto.invoiceCount = subscription.invoices.length;
      const lastInvoice = subscription.invoices
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      if (lastInvoice) {
        dto.lastInvoiceDate = lastInvoice.createdAt;
      }
      dto.totalRevenue = subscription.invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    }

    return dto;
  }
}
