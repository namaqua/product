import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import {
  Attribute,
  AttributeGroup,
  AttributeOption,
  AttributeValue,
} from './entities';
import {
  CreateAttributeDto,
  UpdateAttributeDto,
  CreateAttributeGroupDto,
  SetAttributeValueDto,
  BulkSetAttributeValuesDto,
  AttributeQueryDto,
  AttributeResponseDto,
  AttributeGroupResponseDto,
  AttributeValueResponseDto,
} from './dto';
import { PaginatedResponseDto, createPaginatedResponse } from '../../common/dto';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeGroup)
    private readonly groupRepository: Repository<AttributeGroup>,
    @InjectRepository(AttributeOption)
    private readonly optionRepository: Repository<AttributeOption>,
    @InjectRepository(AttributeValue)
    private readonly valueRepository: Repository<AttributeValue>,
  ) {}

  /**
   * Create a new attribute
   */
  async create(
    createAttributeDto: CreateAttributeDto,
    userId: string,
  ): Promise<AttributeResponseDto> {
    // Check if code already exists
    const existing = await this.attributeRepository.findOne({
      where: { code: createAttributeDto.code },
    });

    if (existing) {
      throw new ConflictException(`Attribute with code "${createAttributeDto.code}" already exists`);
    }

    // Create attribute
    const attribute = this.attributeRepository.create({
      ...createAttributeDto,
      createdBy: userId,
      updatedBy: userId,
    });

    // Handle options for select/multiselect types
    if (
      (attribute.type === 'select' || attribute.type === 'multiselect') &&
      createAttributeDto.options
    ) {
      attribute.options = createAttributeDto.options.map((opt) =>
        this.optionRepository.create(opt),
      );
    }

    const saved = await this.attributeRepository.save(attribute);
    return this.toResponseDto(saved);
  }

  /**
   * Get all attributes with filtering and pagination
   */
  async findAll(
    query: AttributeQueryDto,
  ): Promise<PaginatedResponseDto<AttributeResponseDto>> {
    const queryBuilder = this.attributeRepository
      .createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.group', 'group')
      .leftJoinAndSelect('attribute.options', 'options');

    // Apply filters
    if (!query.includeDeleted) {
      queryBuilder.andWhere('attribute.isDeleted = :isDeleted', { isDeleted: false });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(attribute.code ILIKE :search OR attribute.name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.type) {
      queryBuilder.andWhere('attribute.type = :type', { type: query.type });
    }

    if (query.groupId) {
      queryBuilder.andWhere('attribute.groupId = :groupId', { groupId: query.groupId });
    }

    if (query.isRequired !== undefined) {
      queryBuilder.andWhere('attribute.isRequired = :isRequired', {
        isRequired: query.isRequired,
      });
    }

    if (query.isSearchable !== undefined) {
      queryBuilder.andWhere('attribute.isSearchable = :isSearchable', {
        isSearchable: query.isSearchable,
      });
    }

    if (query.isFilterable !== undefined) {
      queryBuilder.andWhere('attribute.isFilterable = :isFilterable', {
        isFilterable: query.isFilterable,
      });
    }

    // Apply sorting
    const sortBy = query.sortBy || 'sortOrder';
    const sortOrder = query.sortOrder || 'ASC';
    queryBuilder.orderBy(`attribute.${sortBy}`, sortOrder);

    // Apply pagination
    const [items, total] = await queryBuilder
      .skip(query.skip)
      .take(query.take)
      .getManyAndCount();

    const data = items.map((item) => this.toResponseDto(item));
    return createPaginatedResponse(data, query.page, query.limit, total);
  }

  /**
   * Get a single attribute by ID
   */
  async findOne(id: string): Promise<AttributeResponseDto> {
    const attribute = await this.attributeRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['group', 'options'],
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID "${id}" not found`);
    }

    return this.toResponseDto(attribute);
  }

  /**
   * Get attribute by code
   */
  async findByCode(code: string): Promise<AttributeResponseDto> {
    const attribute = await this.attributeRepository.findOne({
      where: { code, isDeleted: false },
      relations: ['group', 'options'],
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with code "${code}" not found`);
    }

    return this.toResponseDto(attribute);
  }

  /**
   * Update an attribute
   */
  async update(
    id: string,
    updateAttributeDto: UpdateAttributeDto,
    userId: string,
  ): Promise<AttributeResponseDto> {
    const attribute = await this.attributeRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['options'],
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID "${id}" not found`);
    }

    // Update basic fields
    Object.assign(attribute, {
      ...updateAttributeDto,
      updatedBy: userId,
    });

    // Handle options update for select/multiselect
    if (
      (attribute.type === 'select' || attribute.type === 'multiselect') &&
      updateAttributeDto.options
    ) {
      // Remove existing options
      await this.optionRepository.delete({ attributeId: id });

      // Add new options
      attribute.options = updateAttributeDto.options.map((opt) =>
        this.optionRepository.create({
          ...opt,
          attributeId: id,
        }),
      );
    }

    const saved = await this.attributeRepository.save(attribute);
    return this.toResponseDto(saved);
  }

  /**
   * Soft delete an attribute
   */
  async remove(id: string, userId: string): Promise<void> {
    const attribute = await this.attributeRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID "${id}" not found`);
    }

    // Check if attribute has values
    const valueCount = await this.valueRepository.count({
      where: { attributeId: id },
    });

    if (valueCount > 0) {
      throw new BadRequestException(
        `Cannot delete attribute with existing values. Found ${valueCount} values.`,
      );
    }

    attribute.softDelete(userId);
    await this.attributeRepository.save(attribute);
  }

  /**
   * Create an attribute group
   */
  async createGroup(
    createGroupDto: CreateAttributeGroupDto,
    userId: string,
  ): Promise<AttributeGroupResponseDto> {
    // Check if code exists
    const existing = await this.groupRepository.findOne({
      where: { code: createGroupDto.code },
    });

    if (existing) {
      throw new ConflictException(`Group with code "${createGroupDto.code}" already exists`);
    }

    const group = this.groupRepository.create({
      ...createGroupDto,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.groupRepository.save(group);
    return this.toGroupResponseDto(saved);
  }

  /**
   * Get all attribute groups
   */
  async findAllGroups(): Promise<AttributeGroupResponseDto[]> {
    const groups = await this.groupRepository.find({
      where: { isDeleted: false },
      relations: ['attributes'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return groups.map((group) => this.toGroupResponseDto(group));
  }

  /**
   * Set attribute value for a product
   */
  async setAttributeValue(
    productId: string,
    setValueDto: SetAttributeValueDto,
    userId: string,
  ): Promise<AttributeValueResponseDto> {
    // Get attribute
    const attribute = await this.attributeRepository.findOne({
      where: { id: setValueDto.attributeId, isDeleted: false },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID "${setValueDto.attributeId}" not found`);
    }

    // Validate value
    const validation = attribute.validateValue(setValueDto.value);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Find or create attribute value
    let attributeValue = await this.valueRepository.findOne({
      where: {
        productId,
        attributeId: setValueDto.attributeId,
        locale: setValueDto.locale || 'en',
      },
    });

    if (!attributeValue) {
      attributeValue = this.valueRepository.create({
        productId,
        attributeId: setValueDto.attributeId,
        locale: setValueDto.locale || 'en',
        createdBy: userId,
      });
    }

    // Set value based on attribute type
    attributeValue.setValue(setValueDto.value, attribute.type);
    attributeValue.updatedBy = userId;

    const saved = await this.valueRepository.save(attributeValue);
    return this.toValueResponseDto(saved, attribute);
  }

  /**
   * Bulk set attribute values for a product
   */
  async bulkSetAttributeValues(
    bulkSetDto: BulkSetAttributeValuesDto,
    userId: string,
  ): Promise<AttributeValueResponseDto[]> {
    const results: AttributeValueResponseDto[] = [];

    for (const valueDto of bulkSetDto.values) {
      const result = await this.setAttributeValue(
        bulkSetDto.productId,
        valueDto,
        userId,
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Get all attribute values for a product
   */
  async getProductAttributeValues(
    productId: string,
    locale?: string,
  ): Promise<AttributeValueResponseDto[]> {
    const queryBuilder = this.valueRepository
      .createQueryBuilder('value')
      .leftJoinAndSelect('value.attribute', 'attribute')
      .where('value.productId = :productId', { productId });

    if (locale) {
      queryBuilder.andWhere('value.locale = :locale', { locale });
    }

    const values = await queryBuilder.getMany();

    return values.map((value) => this.toValueResponseDto(value, value.attribute));
  }

  /**
   * Delete attribute value
   */
  async deleteAttributeValue(
    productId: string,
    attributeId: string,
    locale: string = 'en',
  ): Promise<void> {
    const result = await this.valueRepository.delete({
      productId,
      attributeId,
      locale,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Attribute value not found');
    }
  }

  /**
   * Get attributes by group
   */
  async getAttributesByGroup(groupId: string): Promise<AttributeResponseDto[]> {
    const attributes = await this.attributeRepository.find({
      where: { groupId, isDeleted: false },
      relations: ['options'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return attributes.map((attr) => this.toResponseDto(attr));
  }

  /**
   * Get filterable attributes for product listing
   */
  async getFilterableAttributes(): Promise<AttributeResponseDto[]> {
    const attributes = await this.attributeRepository.find({
      where: { isFilterable: true, isDeleted: false, isActive: true },
      relations: ['options'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return attributes.map((attr) => this.toResponseDto(attr));
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(attribute: Attribute): AttributeResponseDto {
    return {
      id: attribute.id,
      code: attribute.code,
      name: attribute.name,
      description: attribute.description,
      type: attribute.type,
      groupId: attribute.groupId,
      groupName: attribute.group?.name,
      options: attribute.options?.map((opt) => ({
        id: opt.id,
        value: opt.value,
        label: opt.label,
        sortOrder: opt.sortOrder,
        color: opt.color,
        icon: opt.icon,
        isDefault: opt.isDefault,
        metadata: opt.metadata,
      })),
      isRequired: attribute.isRequired,
      isUnique: attribute.isUnique,
      validationRules: attribute.validationRules,
      defaultValue: attribute.defaultValue,
      sortOrder: attribute.sortOrder,
      isVisibleInListing: attribute.isVisibleInListing,
      isVisibleInDetail: attribute.isVisibleInDetail,
      isComparable: attribute.isComparable,
      isSearchable: attribute.isSearchable,
      isFilterable: attribute.isFilterable,
      isLocalizable: attribute.isLocalizable,
      helpText: attribute.helpText,
      placeholder: attribute.placeholder,
      unit: attribute.unit,
      uiConfig: attribute.uiConfig,
      isActive: attribute.isActive,
      createdAt: attribute.createdAt,
      updatedAt: attribute.updatedAt,
    };
  }

  /**
   * Convert group entity to response DTO
   */
  private toGroupResponseDto(group: AttributeGroup): AttributeGroupResponseDto {
    return {
      id: group.id,
      code: group.code,
      name: group.name,
      description: group.description,
      sortOrder: group.sortOrder,
      isCollapsible: group.isCollapsible,
      isCollapsedByDefault: group.isCollapsedByDefault,
      icon: group.icon,
      config: group.config,
      attributes: group.attributes?.map((attr) => this.toResponseDto(attr)),
      isActive: group.isActive,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  /**
   * Convert value entity to response DTO
   */
  private toValueResponseDto(
    value: AttributeValue,
    attribute: Attribute,
  ): AttributeValueResponseDto {
    return {
      id: value.id,
      productId: value.productId,
      attributeId: value.attributeId,
      attributeCode: attribute.code,
      attributeName: attribute.name,
      value: value.getValue(),
      displayValue: value.getDisplayValue(),
      locale: value.locale,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    };
  }
}
