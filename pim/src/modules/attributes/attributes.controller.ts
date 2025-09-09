import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaginatedResponseDto } from '../../common/dto';

@ApiTags('Attributes')
@Controller('attributes')
@UseGuards(JwtAuthGuard)
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new attribute' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute created successfully',
    type: AttributeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Attribute with this code already exists',
  })
  async create(
    @Body() createAttributeDto: CreateAttributeDto,
    @CurrentUser('id') userId: string,
  ): Promise<AttributeResponseDto> {
    return this.attributesService.create(createAttributeDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attributes with filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attributes retrieved successfully',
  })
  async findAll(
    @Query() query: AttributeQueryDto,
  ): Promise<PaginatedResponseDto<AttributeResponseDto>> {
    return this.attributesService.findAll(query);
  }

  @Get('filterable')
  @ApiOperation({ summary: 'Get filterable attributes for product listing' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Filterable attributes retrieved successfully',
    type: [AttributeResponseDto],
  })
  async getFilterableAttributes(): Promise<AttributeResponseDto[]> {
    return this.attributesService.getFilterableAttributes();
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get all attribute groups' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attribute groups retrieved successfully',
    type: [AttributeGroupResponseDto],
  })
  async findAllGroups(): Promise<AttributeGroupResponseDto[]> {
    return this.attributesService.findAllGroups();
  }

  @Post('groups')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new attribute group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute group created successfully',
    type: AttributeGroupResponseDto,
  })
  async createGroup(
    @Body() createGroupDto: CreateAttributeGroupDto,
    @CurrentUser('id') userId: string,
  ): Promise<AttributeGroupResponseDto> {
    return this.attributesService.createGroup(createGroupDto, userId);
  }

  @Get('groups/:groupId/attributes')
  @ApiOperation({ summary: 'Get attributes by group' })
  @ApiParam({ name: 'groupId', description: 'Attribute group ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attributes retrieved successfully',
    type: [AttributeResponseDto],
  })
  async getAttributesByGroup(
    @Param('groupId', ParseUUIDPipe) groupId: string,
  ): Promise<AttributeResponseDto[]> {
    return this.attributesService.getAttributesByGroup(groupId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get attribute by code' })
  @ApiParam({ name: 'code', description: 'Attribute code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attribute retrieved successfully',
    type: AttributeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute not found',
  })
  async findByCode(@Param('code') code: string): Promise<AttributeResponseDto> {
    return this.attributesService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attribute by ID' })
  @ApiParam({ name: 'id', description: 'Attribute ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attribute retrieved successfully',
    type: AttributeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AttributeResponseDto> {
    return this.attributesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an attribute' })
  @ApiParam({ name: 'id', description: 'Attribute ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attribute updated successfully',
    type: AttributeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
    @CurrentUser('id') userId: string,
  ): Promise<AttributeResponseDto> {
    return this.attributesService.update(id, updateAttributeDto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an attribute' })
  @ApiParam({ name: 'id', description: 'Attribute ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Attribute deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete attribute with existing values',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.attributesService.remove(id, userId);
  }

  // Product attribute value endpoints
  @Post('products/:productId/values')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set attribute value for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute value set successfully',
    type: AttributeValueResponseDto,
  })
  async setAttributeValue(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() setValueDto: SetAttributeValueDto,
    @CurrentUser('id') userId: string,
  ): Promise<AttributeValueResponseDto> {
    return this.attributesService.setAttributeValue(productId, setValueDto, userId);
  }

  @Post('products/values/bulk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk set attribute values for a product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute values set successfully',
    type: [AttributeValueResponseDto],
  })
  async bulkSetAttributeValues(
    @Body() bulkSetDto: BulkSetAttributeValuesDto,
    @CurrentUser('id') userId: string,
  ): Promise<AttributeValueResponseDto[]> {
    return this.attributesService.bulkSetAttributeValues(bulkSetDto, userId);
  }

  @Get('products/:productId/values')
  @ApiOperation({ summary: 'Get all attribute values for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attribute values retrieved successfully',
    type: [AttributeValueResponseDto],
  })
  async getProductAttributeValues(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('locale') locale?: string,
  ): Promise<AttributeValueResponseDto[]> {
    return this.attributesService.getProductAttributeValues(productId, locale);
  }

  @Delete('products/:productId/values/:attributeId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete attribute value for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiParam({ name: 'attributeId', description: 'Attribute ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Attribute value deleted successfully',
  })
  async deleteAttributeValue(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('attributeId', ParseUUIDPipe) attributeId: string,
    @Query('locale') locale: string = 'en',
  ): Promise<void> {
    return this.attributesService.deleteAttributeValue(productId, attributeId, locale);
  }
}
