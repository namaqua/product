import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  ForbiddenException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { 
  Account, 
  AccountStatus, 
  VerificationStatus 
} from './entities/account.entity';
import { User } from '../users/entities/user.entity';
import { Media } from '../media/entities/media.entity';
import {
  AccountResponseDto,
  CreateAccountDto,
  UpdateAccountDto,
  AccountQueryDto,
  AccountStatsResponseDto,
} from './dto';
import {
  CollectionResponse,
  ResponseHelpers,
  ActionResponseDto,
} from '../../common/dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  /**
   * Create a new account
   */
  async create(createAccountDto: CreateAccountDto): Promise<ActionResponseDto<AccountResponseDto>> {
    // Check for duplicates
    const existingByRegNumber = await this.accountRepository.findOne({
      where: { registrationNumber: createAccountDto.registrationNumber },
    });
    if (existingByRegNumber) {
      throw new ConflictException(`Account with registration number ${createAccountDto.registrationNumber} already exists`);
    }

    const existingByTaxId = await this.accountRepository.findOne({
      where: { taxId: createAccountDto.taxId },
    });
    if (existingByTaxId) {
      throw new ConflictException(`Account with tax ID ${createAccountDto.taxId} already exists`);
    }

    // Create new account
    const account = this.accountRepository.create({
      ...createAccountDto,
      status: createAccountDto.status || AccountStatus.PENDING_VERIFICATION,
      verificationStatus: VerificationStatus.PENDING,
      preferredCurrency: createAccountDto.preferredCurrency || 'USD',
    });

    // Handle relationships
    if (createAccountDto.parentAccountId) {
      const parentAccount = await this.accountRepository.findOne({
        where: { id: createAccountDto.parentAccountId },
      });
      if (!parentAccount) {
        throw new NotFoundException(`Parent account with ID ${createAccountDto.parentAccountId} not found`);
      }
      account.parentAccount = parentAccount;
    }

    if (createAccountDto.linkedUserIds && createAccountDto.linkedUserIds.length > 0) {
      const users = await this.userRepository.findBy({
        id: In(createAccountDto.linkedUserIds),
      });
      account.linkedUsers = users;
    }

    if (createAccountDto.documentIds && createAccountDto.documentIds.length > 0) {
      const documents = await this.mediaRepository.findBy({
        id: In(createAccountDto.documentIds),
      });
      account.documents = documents;
    }

    if (createAccountDto.recordOwnerId) {
      const owner = await this.userRepository.findOne({
        where: { id: createAccountDto.recordOwnerId },
      });
      if (!owner) {
        throw new NotFoundException(`Record owner with ID ${createAccountDto.recordOwnerId} not found`);
      }
      account.recordOwner = owner;
    }

    const savedAccount = await this.accountRepository.save(account);
    
    // Load with relations for response
    const accountWithRelations = await this.findEntityById(savedAccount.id);
    return ActionResponseDto.create(this.toResponseDto(accountWithRelations));
  }

  /**
   * Find all accounts with filtering and pagination
   */
  async findAll(query: AccountQueryDto = new AccountQueryDto()): Promise<CollectionResponse<AccountResponseDto>> {
    const queryBuilder = this.accountRepository.createQueryBuilder('account');

    // Apply relations based on query parameters
    if (query.includeChildren) {
      queryBuilder.leftJoinAndSelect('account.childAccounts', 'childAccounts');
    }
    if (query.includeParent) {
      queryBuilder.leftJoinAndSelect('account.parentAccount', 'parentAccount');
    }
    if (query.includeUsers) {
      queryBuilder.leftJoinAndSelect('account.linkedUsers', 'linkedUsers');
    }
    if (query.includeDocuments) {
      queryBuilder.leftJoinAndSelect('account.documents', 'documents');
    }
    queryBuilder.leftJoinAndSelect('account.recordOwner', 'recordOwner');

    // Apply filters
    this.applyFilters(queryBuilder, query);

    // Apply sorting
    const sortField = `account.${query.sortBy || 'createdAt'}`;
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
   * Find account by ID
   */
  async findOne(id: string, includeRelations: boolean = true): Promise<AccountResponseDto> {
    const account = await this.findEntityById(id, includeRelations);
    return this.toResponseDto(account);
  }

  /**
   * Update account
   */
  async update(
    id: string, 
    updateAccountDto: UpdateAccountDto
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    const account = await this.findEntityById(id);

    // Check for duplicate registration number if being updated
    if (updateAccountDto.registrationNumber && updateAccountDto.registrationNumber !== account.registrationNumber) {
      const existing = await this.accountRepository.findOne({
        where: { registrationNumber: updateAccountDto.registrationNumber },
      });
      if (existing) {
        throw new ConflictException(`Account with registration number ${updateAccountDto.registrationNumber} already exists`);
      }
    }

    // Check for duplicate tax ID if being updated
    if (updateAccountDto.taxId && updateAccountDto.taxId !== account.taxId) {
      const existing = await this.accountRepository.findOne({
        where: { taxId: updateAccountDto.taxId },
      });
      if (existing) {
        throw new ConflictException(`Account with tax ID ${updateAccountDto.taxId} already exists`);
      }
    }

    // Handle relationship updates
    if (updateAccountDto.linkedUserIds !== undefined) {
      const users = updateAccountDto.linkedUserIds.length > 0
        ? await this.userRepository.findBy({ id: In(updateAccountDto.linkedUserIds) })
        : [];
      account.linkedUsers = users;
    }

    if (updateAccountDto.documentIds !== undefined) {
      const documents = updateAccountDto.documentIds.length > 0
        ? await this.mediaRepository.findBy({ id: In(updateAccountDto.documentIds) })
        : [];
      account.documents = documents;
    }

    // Update fields
    Object.assign(account, updateAccountDto);

    // Update activity date
    account.lastActivityDate = new Date();

    const savedAccount = await this.accountRepository.save(account);
    const accountWithRelations = await this.findEntityById(savedAccount.id);
    return ActionResponseDto.update(this.toResponseDto(accountWithRelations));
  }

  /**
   * Update account status
   */
  async updateStatus(
    id: string, 
    status: AccountStatus
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    const account = await this.findEntityById(id);
    account.status = status;
    account.lastActivityDate = new Date();
    const savedAccount = await this.accountRepository.save(account);
    return ActionResponseDto.update(this.toResponseDto(savedAccount));
  }

  /**
   * Update verification status (admin action)
   */
  async updateVerificationStatus(
    id: string, 
    verificationStatus: VerificationStatus
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    const account = await this.findEntityById(id);
    account.verificationStatus = verificationStatus;
    
    // If verified, activate the account
    if (verificationStatus === VerificationStatus.VERIFIED && account.status === AccountStatus.PENDING_VERIFICATION) {
      account.status = AccountStatus.ACTIVE;
      account.onboardingDate = new Date();
    }
    
    account.lastActivityDate = new Date();
    const savedAccount = await this.accountRepository.save(account);
    return ActionResponseDto.update(this.toResponseDto(savedAccount));
  }

  /**
   * Link users to account
   */
  async linkUsers(
    id: string, 
    userIds: string[]
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    const account = await this.findEntityById(id, true);
    const users = await this.userRepository.findBy({ id: In(userIds) });
    
    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    // Merge with existing users
    const existingUserIds = account.linkedUsers?.map(u => u.id) || [];
    const newUserIds = userIds.filter(uid => !existingUserIds.includes(uid));
    
    if (newUserIds.length > 0) {
      const newUsers = users.filter(u => newUserIds.includes(u.id));
      account.linkedUsers = [...(account.linkedUsers || []), ...newUsers];
      account.lastActivityDate = new Date();
      const savedAccount = await this.accountRepository.save(account);
      const accountWithRelations = await this.findEntityById(savedAccount.id);
      return ActionResponseDto.update(this.toResponseDto(accountWithRelations), 'Users linked successfully');
    }

    return ActionResponseDto.update(this.toResponseDto(account), 'Users already linked');
  }

  /**
   * Unlink users from account
   */
  async unlinkUsers(
    id: string, 
    userIds: string[]
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    const account = await this.findEntityById(id, true);
    
    if (account.linkedUsers && account.linkedUsers.length > 0) {
      account.linkedUsers = account.linkedUsers.filter(u => !userIds.includes(u.id));
      account.lastActivityDate = new Date();
      const savedAccount = await this.accountRepository.save(account);
      const accountWithRelations = await this.findEntityById(savedAccount.id);
      return ActionResponseDto.update(this.toResponseDto(accountWithRelations), 'Users unlinked successfully');
    }

    return ActionResponseDto.update(this.toResponseDto(account), 'No users to unlink');
  }

  /**
   * Add documents to account
   */
  async addDocuments(
    id: string, 
    documentIds: string[]
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    const account = await this.findEntityById(id, true);
    const documents = await this.mediaRepository.findBy({ id: In(documentIds) });
    
    if (documents.length !== documentIds.length) {
      throw new NotFoundException('One or more documents not found');
    }

    // Merge with existing documents
    const existingDocIds = account.documents?.map(d => d.id) || [];
    const newDocIds = documentIds.filter(did => !existingDocIds.includes(did));
    
    if (newDocIds.length > 0) {
      const newDocs = documents.filter(d => newDocIds.includes(d.id));
      account.documents = [...(account.documents || []), ...newDocs];
      account.lastActivityDate = new Date();
      const savedAccount = await this.accountRepository.save(account);
      const accountWithRelations = await this.findEntityById(savedAccount.id);
      return ActionResponseDto.update(this.toResponseDto(accountWithRelations), 'Documents added successfully');
    }

    return ActionResponseDto.update(this.toResponseDto(account), 'Documents already linked');
  }

  /**
   * Remove documents from account
   */
  async removeDocuments(
    id: string, 
    documentIds: string[]
  ): Promise<ActionResponseDto<AccountResponseDto>> {
    const account = await this.findEntityById(id, true);
    
    if (account.documents && account.documents.length > 0) {
      account.documents = account.documents.filter(d => !documentIds.includes(d.id));
      account.lastActivityDate = new Date();
      const savedAccount = await this.accountRepository.save(account);
      const accountWithRelations = await this.findEntityById(savedAccount.id);
      return ActionResponseDto.update(this.toResponseDto(accountWithRelations), 'Documents removed successfully');
    }

    return ActionResponseDto.update(this.toResponseDto(account), 'No documents to remove');
  }

  /**
   * Soft delete account
   */
  async remove(id: string): Promise<ActionResponseDto<AccountResponseDto>> {
    const account = await this.findEntityById(id);
    
    // Check if account has child accounts
    const childCount = await this.accountRepository.count({
      where: { parentAccountId: id },
    });
    
    if (childCount > 0) {
      throw new BadRequestException('Cannot delete account with subsidiary accounts');
    }

    account.isActive = false;
    account.status = AccountStatus.INACTIVE;
    const deletedAccount = await this.accountRepository.save(account);
    return ActionResponseDto.delete(this.toResponseDto(deletedAccount));
  }

  /**
   * Get account statistics
   */
  async getStats(): Promise<AccountStatsResponseDto> {
    const total = await this.accountRepository.count();
    const active = await this.accountRepository.count({
      where: { status: AccountStatus.ACTIVE },
    });
    const inactive = await this.accountRepository.count({
      where: { status: AccountStatus.INACTIVE },
    });
    const pendingVerification = await this.accountRepository.count({
      where: { status: AccountStatus.PENDING_VERIFICATION },
    });
    const verified = await this.accountRepository.count({
      where: { verificationStatus: VerificationStatus.VERIFIED },
    });
    const blacklisted = await this.accountRepository.count({
      where: { status: AccountStatus.BLACKLISTED },
    });

    // Group by account type
    const byType = await this.accountRepository
      .createQueryBuilder('account')
      .select('account.accountType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('account.accountType')
      .getRawMany();

    // Group by business size
    const bySize = await this.accountRepository
      .createQueryBuilder('account')
      .select('account.businessSize', 'size')
      .addSelect('COUNT(*)', 'count')
      .where('account.businessSize IS NOT NULL')
      .groupBy('account.businessSize')
      .getRawMany();

    // Group by industry
    const byIndustry = await this.accountRepository
      .createQueryBuilder('account')
      .select('account.industry', 'industry')
      .addSelect('COUNT(*)', 'count')
      .where('account.industry IS NOT NULL')
      .groupBy('account.industry')
      .getRawMany();

    // Group by ownership type
    const byOwnership = await this.accountRepository
      .createQueryBuilder('account')
      .select('account.ownershipType', 'ownership')
      .addSelect('COUNT(*)', 'count')
      .where('account.ownershipType IS NOT NULL')
      .groupBy('account.ownershipType')
      .getRawMany();

    // Count parent and subsidiary accounts
    const parentAccounts = await this.accountRepository.count({
      where: { parentAccountId: null },
    });
    const subsidiaryAccounts = total - parentAccounts;

    // Calculate averages - simplified approach
    // First get counts per account
    const userCounts = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoin('account_users', 'au', 'au.account_id = account.id')
      .leftJoin('users', 'users', 'users.id = au.user_id')
      .select('account.id', 'id')
      .addSelect('COUNT(users.id)', 'count')
      .groupBy('account.id')
      .getRawMany();

    const docCounts = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoin('account_documents', 'ad', 'ad.account_id = account.id')
      .leftJoin('media', 'documents', 'documents.id = ad.media_id')
      .select('account.id', 'id')
      .addSelect('COUNT(documents.id)', 'count')
      .groupBy('account.id')
      .getRawMany();

    // Calculate averages in JavaScript
    const avgLinkedUsers = userCounts.length > 0 
      ? userCounts.reduce((sum, item) => sum + parseInt(item.count), 0) / userCounts.length
      : 0;
    
    const avgDocuments = docCounts.length > 0
      ? docCounts.reduce((sum, item) => sum + parseInt(item.count), 0) / docCounts.length
      : 0;

    return {
      total,
      active,
      inactive,
      pendingVerification,
      verified,
      blacklisted,
      byType: this.transformGroupedData(byType, 'type'),
      bySize: this.transformGroupedData(bySize, 'size'),
      byIndustry: this.transformGroupedData(byIndustry, 'industry'),
      byOwnership: this.transformGroupedData(byOwnership, 'ownership'),
      parentAccounts,
      subsidiaryAccounts,
      avgLinkedUsers: avgLinkedUsers,
      avgDocuments: avgDocuments,
    };
  }

  /**
   * Get subsidiary accounts for a parent account
   */
  async getSubsidiaries(parentId: string): Promise<CollectionResponse<AccountResponseDto>> {
    const parent = await this.findEntityById(parentId);
    
    const [subsidiaries, total] = await this.accountRepository.findAndCount({
      where: { parentAccountId: parentId },
      relations: ['recordOwner'],
    });

    const dtos = subsidiaries.map(sub => this.toResponseDto(sub));
    return ResponseHelpers.wrapCollection(dtos, {
      totalItems: total,
      itemCount: dtos.length
    });
  }

  /**
   * Helper: Find account entity by ID
   */
  private async findEntityById(id: string, includeRelations: boolean = false): Promise<Account> {
    const query: any = { where: { id } };
    
    if (includeRelations) {
      query.relations = [
        'parentAccount',
        'childAccounts',
        'linkedUsers',
        'documents',
        'recordOwner',
      ];
    }

    const account = await this.accountRepository.findOne(query);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  /**
   * Helper: Apply filters to query builder
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<Account>, query: AccountQueryDto): void {
    // Active filter
    if (query.isActive !== undefined) {
      queryBuilder.andWhere('account.isActive = :isActive', { isActive: query.isActive });
    }

    // Search filter
    if (query.search) {
      queryBuilder.andWhere(
        '(account.legalName ILIKE :search OR account.tradeName ILIKE :search OR ' +
        'account.registrationNumber ILIKE :search OR account.taxId ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Specific filters
    if (query.accountType) {
      queryBuilder.andWhere('account.accountType = :accountType', { accountType: query.accountType });
    }

    if (query.status) {
      queryBuilder.andWhere('account.status = :status', { status: query.status });
    }

    if (query.verificationStatus) {
      queryBuilder.andWhere('account.verificationStatus = :verificationStatus', { 
        verificationStatus: query.verificationStatus 
      });
    }

    if (query.businessSize) {
      queryBuilder.andWhere('account.businessSize = :businessSize', { businessSize: query.businessSize });
    }

    if (query.ownershipType) {
      queryBuilder.andWhere('account.ownershipType = :ownershipType', { ownershipType: query.ownershipType });
    }

    if (query.industry) {
      queryBuilder.andWhere('account.industry = :industry', { industry: query.industry });
    }

    if (query.parentAccountId) {
      queryBuilder.andWhere('account.parentAccountId = :parentAccountId', { 
        parentAccountId: query.parentAccountId 
      });
    }

    if (query.recordOwnerId) {
      queryBuilder.andWhere('account.recordOwnerId = :recordOwnerId', { recordOwnerId: query.recordOwnerId });
    }

    if (query.linkedUserId) {
      queryBuilder
        .innerJoin('account.linkedUsers', 'linkedUser')
        .andWhere('linkedUser.id = :linkedUserId', { linkedUserId: query.linkedUserId });
    }
  }

  /**
   * Helper: Convert entity to response DTO
   */
  private toResponseDto(account: Account): AccountResponseDto {
    return plainToInstance(AccountResponseDto, account, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Helper: Transform grouped data for statistics
   */
  private transformGroupedData(data: any[], key: string): Record<string, number> {
    return data.reduce((acc, item) => {
      acc[item[key]] = parseInt(item.count);
      return acc;
    }, {});
  }
}
