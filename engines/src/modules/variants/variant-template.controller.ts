import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VariantTemplateService } from './variant-template.service';
import {
  CreateVariantTemplateDto,
  UpdateVariantTemplateDto,
  VariantTemplateResponseDto,
} from './dto/variant-template.dto';
import { ActionResponseDto, CollectionResponse } from '../../common/dto';

@ApiTags('Variant Templates')
@Controller('variant-templates')
export class VariantTemplateController {
  constructor(private readonly templateService: VariantTemplateService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new variant template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async create(
    @Body() dto: CreateVariantTemplateDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<VariantTemplateResponseDto>> {
    return this.templateService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all variant templates (global templates only for unauthenticated users)' })
  @ApiQuery({ name: 'isGlobal', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAll(
    @Query('isGlobal') isGlobal?: boolean,
  ): Promise<CollectionResponse<VariantTemplateResponseDto>> {
    // This endpoint returns only global templates for unauthenticated users
    // Authenticated users should use /my-templates for their personal templates
    return this.templateService.findAll(undefined, isGlobal !== undefined ? isGlobal : true);
  }

  @Get('my-templates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user templates and global templates' })
  @ApiResponse({ status: 200, description: 'User templates retrieved successfully' })
  async findMyTemplates(
    @CurrentUser('id') userId: string,
  ): Promise<CollectionResponse<VariantTemplateResponseDto>> {
    // This returns both user's templates and global templates
    return this.templateService.findAll(userId, undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(
    @Param('id') id: string,
  ): Promise<ActionResponseDto<VariantTemplateResponseDto>> {
    return this.templateService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update variant template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVariantTemplateDto,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<VariantTemplateResponseDto>> {
    return this.templateService.update(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete variant template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<void>> {
    return this.templateService.remove(id, userId);
  }

  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duplicate a template' })
  @ApiResponse({ status: 201, description: 'Template duplicated successfully' })
  async duplicate(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ActionResponseDto<VariantTemplateResponseDto>> {
    return this.templateService.duplicate(id, userId);
  }

  @Post('seed-defaults')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed default templates (admin only)' })
  @ApiResponse({ status: 201, description: 'Default templates seeded' })
  async seedDefaults(): Promise<ActionResponseDto<void>> {
    await this.templateService.seedDefaultTemplates();
    return new ActionResponseDto(undefined, 'Default templates seeded successfully');
  }
}
