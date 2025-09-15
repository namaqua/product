import { ApiResponse } from '../../common/dto';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ImportExportService } from './import-export.service';
import {
  CreateImportDto,
  PreviewImportDto,
  ValidateImportDto,
  ProcessImportDto,
  ImportMappingDto,
  ImportJobQueryDto,
  BulkVariantImportDto,
} from './dto/import.dto';
import {
  CreateExportDto,
  ExportJobQueryDto,
  DownloadTemplateDto,
  ExportVariantsDto,
} from './dto/export.dto';
import { ActionResponseDto } from '../../common/dto/action-response.dto';
import { CollectionResponseDto, CollectionResponse } from '../../common/dto/collection-response.dto';
import { ImportJob } from './entities/import-job.entity';
import { ExportJob } from './entities/export-job.entity';
import { ImportMapping } from './entities/import-mapping.entity';

@ApiTags('Import/Export')
@Controller('import-export')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  // ========== IMPORT ENDPOINTS ==========

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create a new import job' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['products', 'variants', 'categories', 'attributes'],
        },
        mapping: {
          type: 'object',
        },
        options: {
          type: 'object',
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Import job created successfully',
    type: ActionResponseDto,
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async createImport(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImportDto: CreateImportDto,
    @CurrentUser() user: any,
  ): Promise<ActionResponseDto<ImportJob>> {
    return this.importExportService.createImportJob(file, createImportDto, user.id);
  }

  @Post('import/preview')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Preview import file contents' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['products', 'variants', 'categories', 'attributes'],
        },
        rows: {
          type: 'number',
          default: 10,
        },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async previewImport(
    @UploadedFile() file: Express.Multer.File,
    @Body() previewDto: PreviewImportDto,
  ): Promise<ApiResponse> {
    return this.importExportService.previewImport(file, previewDto);
  }

  @Post('import/validate')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Validate import file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['products', 'variants', 'categories', 'attributes'],
        },
        mapping: {
          type: 'object',
        },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async validateImport(
    @UploadedFile() file: Express.Multer.File,
    @Body() validateDto: ValidateImportDto,
  ): Promise<ApiResponse> {
    return this.importExportService.validateImport(file, validateDto);
  }

  @Post('import/process')
  @ApiOperation({ summary: 'Process a pending import job' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Import job processing started',
    type: ActionResponseDto,
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async processImport(@Body() processDto: ProcessImportDto): Promise<ActionResponseDto<ImportJob>> {
    return this.importExportService.processImportJob(processDto);
  }

  @Get('import/jobs')
  @ApiOperation({ summary: 'Get list of import jobs' })
  @SwaggerApiResponse({
    status: 200,
    description: 'List of import jobs',
    type: CollectionResponseDto,
  })
  async getImportJobs(
    @Query() query: ImportJobQueryDto,
    @CurrentUser() user: any,
  ): Promise<CollectionResponse<ImportJob>> {
    return this.importExportService.getImportJobs(query, user.role === UserRole.ADMIN ? undefined : user.id);
  }

  @Get('import/jobs/:id')
  @ApiOperation({ summary: 'Get import job details' })
  async getImportJob(@Param('id') id: string): Promise<ApiResponse<ImportJob>> {
    return this.importExportService.getImportJob(id);
  }

  @Delete('import/jobs/:id')
  @ApiOperation({ summary: 'Cancel an import job' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Import job cancelled',
    type: ActionResponseDto,
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async cancelImportJob(@Param('id') id: string): Promise<ActionResponseDto<ImportJob>> {
    return this.importExportService.cancelImportJob(id);
  }

  @Post('import/variants/bulk')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk import variants for a product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        productIdentifier: {
          type: 'string',
        },
        useSku: {
          type: 'boolean',
        },
        mapping: {
          type: 'object',
        },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async bulkImportVariants(
    @UploadedFile() file: Express.Multer.File,
    @Body() bulkVariantDto: BulkVariantImportDto,
    @CurrentUser() user: any,
  ): Promise<ActionResponseDto<ImportJob>> {
    const importDto: CreateImportDto = {
      type: 'variants' as any,
      mapping: bulkVariantDto.mapping,
      options: {
        ...bulkVariantDto.options,
        // Store product identifier in options for processing
        productIdentifier: bulkVariantDto.productIdentifier,
        useSku: bulkVariantDto.useSku,
      } as any,
    };
    return this.importExportService.createImportJob(file, importDto, user.id);
  }

  // ========== EXPORT ENDPOINTS ==========

  @Post('export')
  @ApiOperation({ summary: 'Create a new export job' })
  @SwaggerApiResponse({
    status: 201,
    description: 'Export job created successfully',
    type: ActionResponseDto,
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
  async createExport(
    @Body() createExportDto: CreateExportDto,
    @CurrentUser() user: any,
  ): Promise<ActionResponseDto<ExportJob>> {
    return this.importExportService.createExportJob(createExportDto, user.id);
  }

  @Get('export/jobs')
  @ApiOperation({ summary: 'Get list of export jobs' })
  @SwaggerApiResponse({
    status: 200,
    description: 'List of export jobs',
    type: CollectionResponseDto,
  })
  async getExportJobs(
    @Query() query: ExportJobQueryDto,
    @CurrentUser() user: any,
  ): Promise<CollectionResponse<ExportJob>> {
    return this.importExportService.getExportJobs(query, user.role === UserRole.ADMIN ? undefined : user.id);
  }

  @Get('export/jobs/:id')
  @ApiOperation({ summary: 'Get export job details' })
  async getExportJob(@Param('id') id: string): Promise<ApiResponse<ExportJob>> {
    return this.importExportService.getExportJob(id);
  }

  @Get('export/download/:id')
  @ApiOperation({ summary: 'Download exported file' })
  async downloadExport(
    @Param('id') id: string,
    @Res() res: Response, // Changed to take full control of response
  ): Promise<void> {
    const { filepath, filename } = await this.importExportService.downloadExport(id);
    
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    const file = createReadStream(filepath);
    file.pipe(res); // Directly pipe the file to response, bypassing any interceptors
  }

  @Delete('export/jobs/:id')
  @ApiOperation({ summary: 'Cancel an export job' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Export job cancelled',
    type: ActionResponseDto,
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async cancelExportJob(@Param('id') id: string): Promise<ActionResponseDto<ExportJob>> {
    return this.importExportService.cancelExportJob(id);
  }

  @Post('export/variants')
  @ApiOperation({ summary: 'Export variants for a product' })
  @SwaggerApiResponse({
    status: 201,
    description: 'Variant export job created',
    type: ActionResponseDto,
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
  async exportVariants(
    @Body() exportVariantsDto: ExportVariantsDto,
    @CurrentUser() user: any,
  ): Promise<ActionResponseDto<ExportJob>> {
    const exportDto: CreateExportDto = {
      type: 'variants' as any,
      format: exportVariantsDto.format,
      fields: exportVariantsDto.fields,
      options: {
        ...exportVariantsDto.options,
        // Store product identifier in options for processing
        productIdentifier: exportVariantsDto.productIdentifier,
        useSku: exportVariantsDto.useSku,
      } as any,
    };
    return this.importExportService.createExportJob(exportDto, user.id);
  }

  // ========== MAPPING ENDPOINTS ==========

  @Post('mappings')
  @ApiOperation({ summary: 'Create import mapping template' })
  @SwaggerApiResponse({
    status: 201,
    description: 'Mapping created successfully',
    type: ActionResponseDto,
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async createMapping(
    @Body() mappingDto: ImportMappingDto,
    @CurrentUser() user: any,
  ): Promise<ActionResponseDto<ImportMapping>> {
    return this.importExportService.createImportMapping(mappingDto, user.id);
  }

  @Get('mappings')
  @ApiOperation({ summary: 'Get import mapping templates' })
  @SwaggerApiResponse({
    status: 200,
    description: 'List of mappings',
    type: CollectionResponseDto,
  })
  async getMappings(
    @Query('type') type?: string,
    @CurrentUser() user?: any,
  ): Promise<CollectionResponse<ImportMapping>> {
    return this.importExportService.getImportMappings(
      type as any,
      user?.role === UserRole.ADMIN ? undefined : user?.id,
    );
  }

  @Get('mappings/:id')
  @ApiOperation({ summary: 'Get import mapping details' })
  async getMapping(@Param('id') id: string): Promise<ApiResponse<ImportMapping>> {
    return this.importExportService.getImportMapping(id);
  }

  @Put('mappings/:id')
  @ApiOperation({ summary: 'Update import mapping' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Mapping updated successfully',
    type: ActionResponseDto,
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateMapping(
    @Param('id') id: string,
    @Body() mappingDto: Partial<ImportMappingDto>,
  ): Promise<ActionResponseDto<ImportMapping>> {
    return this.importExportService.updateImportMapping(id, mappingDto);
  }

  @Delete('mappings/:id')
  @ApiOperation({ summary: 'Delete import mapping' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Mapping deleted successfully',
    type: ActionResponseDto,
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async deleteMapping(@Param('id') id: string): Promise<ActionResponseDto<ImportMapping>> {
    return this.importExportService.deleteImportMapping(id);
  }

  // ========== TEMPLATE ENDPOINTS ==========

  @Get('templates/download')
  @ApiOperation({ summary: 'Download import template' })
  async downloadTemplate(
    @Query() templateDto: DownloadTemplateDto,
    @Res() res: Response, // Changed to take full control of response
  ): Promise<void> {
    const { filepath, filename } = await this.importExportService.downloadTemplate(templateDto);
    
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    const file = createReadStream(filepath);
    file.pipe(res); // Directly pipe the file to response, bypassing any interceptors
  }
}
