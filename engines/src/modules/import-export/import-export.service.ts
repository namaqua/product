import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiResponse } from '../../common/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { ImportJob, ImportJobStatus, ImportType } from './entities/import-job.entity';
import { ExportJob, ExportJobStatus, ExportType, ExportFormat } from './entities/export-job.entity';
import { ImportMapping } from './entities/import-mapping.entity';
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
import { CollectionResponse, ResponseHelpers } from '../../common/dto/collection-response.dto';

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(ImportJob)
    private importJobRepository: Repository<ImportJob>,
    @InjectRepository(ExportJob)
    private exportJobRepository: Repository<ExportJob>,
    @InjectRepository(ImportMapping)
    private importMappingRepository: Repository<ImportMapping>,
    @InjectQueue('import-queue')
    private importQueue: Queue,
    @InjectQueue('export-queue')
    private exportQueue: Queue,
  ) {}

  // ========== IMPORT METHODS ==========

  async createImportJob(
    file: Express.Multer.File,
    createImportDto: CreateImportDto,
    userId?: string,
  ): Promise<ActionResponseDto<ImportJob>> {
    // Validate file
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Parse file to get row count
    const rowCount = await this.getFileRowCount(file.path, createImportDto.type);

    // Create import job
    const importJob = this.importJobRepository.create({
      type: createImportDto.type,
      filename: file.filename,
      originalFilename: file.originalname,
      filepath: file.path,
      mapping: createImportDto.mapping,
      options: createImportDto.options,
      totalRows: rowCount,
      userId,
      status: ImportJobStatus.PENDING,
      errors: [],
    });

    const savedJob = await this.importJobRepository.save(importJob);

    // Add to processing queue if not validate-only
    if (!createImportDto.options?.validateOnly) {
      await this.importQueue.add('process-import', {
        jobId: savedJob.id,
        userId,
      });
    }

    return ActionResponseDto.create(savedJob);
  }

  async previewImport(
    file: Express.Multer.File,
    previewDto: PreviewImportDto,
  ): Promise<ApiResponse> {
    const rows = previewDto.rows || 10;
    const fileContent = await fs.promises.readFile(file.path, 'utf-8');
    
    let data: any[] = [];
    let headers: string[] = [];

    if (file.originalname.endsWith('.csv')) {
      const parsed = Papa.parse(fileContent, {
        header: true,
        preview: rows + 1, // +1 for header
        skipEmptyLines: true,
      });
      data = parsed.data;
      headers = parsed.meta.fields || [];
    } else if (file.originalname.match(/\.(xlsx|xls)$/)) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.worksheets[0];
      
      headers = [];
      const firstRow = worksheet.getRow(1);
      firstRow.eachCell((cell, colNumber) => {
        headers.push(cell.value?.toString() || `Column ${colNumber}`);
      });

      data = [];
      for (let i = 2; i <= Math.min(rows + 1, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = row.getCell(index + 1).value;
        });
        data.push(rowData);
      }
    }

    // Clean up preview file
    await fs.promises.unlink(file.path);

    return ApiResponse.success({
      headers,
      rows: data,
      totalRows: data.length,
      suggestedMapping: this.suggestMapping(headers, previewDto.type),
    }, 'Preview generated successfully');
  }

  async validateImport(
    file: Express.Multer.File,
    validateDto: ValidateImportDto,
  ): Promise<ApiResponse> {
    const errors: any[] = [];
    const warnings: any[] = [];
    let validRows = 0;
    let invalidRows = 0;

    // Parse file
    const fileContent = await fs.promises.readFile(file.path, 'utf-8');
    let data: any[] = [];

    if (file.originalname.endsWith('.csv')) {
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });
      data = parsed.data;
    } else if (file.originalname.match(/\.(xlsx|xls)$/)) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.worksheets[0];
      
      const headers: string[] = [];
      const firstRow = worksheet.getRow(1);
      firstRow.eachCell((cell, colNumber) => {
        headers.push(cell.value?.toString() || `Column ${colNumber}`);
      });

      data = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = row.getCell(index + 1).value;
        });
        data.push(rowData);
      });
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowErrors = this.validateRow(row, validateDto.mapping, validateDto.type);
      if (rowErrors.length > 0) {
        errors.push({
          row: index + 2, // +2 for 1-based index and header row
          errors: rowErrors,
        });
        invalidRows++;
      } else {
        validRows++;
      }
    });

    // Clean up validation file
    await fs.promises.unlink(file.path);

    return ApiResponse.success({
      valid: errors.length === 0,
      totalRows: data.length,
      validRows,
      invalidRows,
      errors: errors.slice(0, 100), // Limit errors to 100
      warnings,
    }, errors.length === 0 ? 'Validation successful' : 'Validation completed with errors');
  }

  async processImportJob(processDto: ProcessImportDto): Promise<ActionResponseDto<ImportJob>> {
    const job = await this.importJobRepository.findOne({
      where: { id: processDto.jobId },
    });

    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    if (job.status !== ImportJobStatus.PENDING) {
      throw new BadRequestException('Job is already being processed or completed');
    }

    // Update job status
    job.status = ImportJobStatus.PROCESSING;
    job.startedAt = new Date();
    await this.importJobRepository.save(job);

    // Add to processing queue
    await this.importQueue.add('process-import', {
      jobId: job.id,
      startRow: processDto.startRow,
      batchSize: processDto.batchSize,
    });

    return ActionResponseDto.create(job);
  }

  async getImportJobs(query: ImportJobQueryDto, userId?: string): Promise<CollectionResponse<ImportJob>> {
    const qb = this.importJobRepository.createQueryBuilder('job');

    if (userId) {
      qb.where('job.userId = :userId', { userId });
    }

    if (query.type) {
      qb.andWhere('job.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('job.status = :status', { status: query.status });
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    qb.orderBy(`job.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    return ResponseHelpers.wrapPaginated([items, total], page, limit);
  }

  async getImportJob(id: string): Promise<ApiResponse<ImportJob>> {
    const job = await this.importJobRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    return ApiResponse.success(job, 'Import job retrieved successfully');
  }

  async cancelImportJob(id: string): Promise<ActionResponseDto<ImportJob>> {
    const job = await this.importJobRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    if (job.status === ImportJobStatus.COMPLETED || job.status === ImportJobStatus.FAILED) {
      throw new BadRequestException('Cannot cancel completed or failed job');
    }

    job.status = ImportJobStatus.CANCELLED;
    job.completedAt = new Date();
    await this.importJobRepository.save(job);

    // Remove from queue if pending
    const jobs = await this.importQueue.getJobs(['waiting', 'delayed']);
    for (const queueJob of jobs) {
      if (queueJob.data.jobId === id) {
        await queueJob.remove();
      }
    }

    return ActionResponseDto.delete(job);
  }

  // ========== EXPORT METHODS ==========

  async createExportJob(
    createExportDto: CreateExportDto,
    userId?: string,
  ): Promise<ActionResponseDto<ExportJob>> {
    // Create export job
    const exportJob = this.exportJobRepository.create({
      type: createExportDto.type,
      format: createExportDto.format,
      filters: createExportDto.filters,
      fields: createExportDto.fields,
      options: createExportDto.options,
      userId,
      status: ExportJobStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const savedJob = await this.exportJobRepository.save(exportJob);

    // Add to processing queue
    await this.exportQueue.add('process-export', {
      jobId: savedJob.id,
      userId,
    });

    return ActionResponseDto.create(savedJob);
  }

  async getExportJobs(query: ExportJobQueryDto, userId?: string): Promise<CollectionResponse<ExportJob>> {
    const qb = this.exportJobRepository.createQueryBuilder('job');

    if (userId) {
      qb.where('job.userId = :userId', { userId });
    }

    if (query.type) {
      qb.andWhere('job.type = :type', { type: query.type });
    }

    if (query.format) {
      qb.andWhere('job.format = :format', { format: query.format });
    }

    if (query.status) {
      qb.andWhere('job.status = :status', { status: query.status });
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    qb.orderBy(`job.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    return ResponseHelpers.wrapPaginated([items, total], page, limit);
  }

  async getExportJob(id: string): Promise<ApiResponse<ExportJob>> {
    const job = await this.exportJobRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!job) {
      throw new NotFoundException('Export job not found');
    }

    return ApiResponse.success(job, 'Export job retrieved successfully');
  }

  async downloadExport(id: string): Promise<{ filepath: string; filename: string }> {
    const job = await this.exportJobRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException('Export job not found');
    }

    if (job.status !== ExportJobStatus.COMPLETED) {
      throw new BadRequestException('Export is not ready for download');
    }

    if (job.isExpired) {
      throw new BadRequestException('Export has expired');
    }

    if (!job.filepath || !fs.existsSync(job.filepath)) {
      throw new NotFoundException('Export file not found');
    }

    return {
      filepath: job.filepath,
      filename: job.filename || `export-${job.id}.${job.format}`,
    };
  }

  async cancelExportJob(id: string): Promise<ActionResponseDto<ExportJob>> {
    const job = await this.exportJobRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException('Export job not found');
    }

    if (job.status === ExportJobStatus.COMPLETED || job.status === ExportJobStatus.FAILED) {
      throw new BadRequestException('Cannot cancel completed or failed job');
    }

    job.status = ExportJobStatus.CANCELLED;
    job.completedAt = new Date();
    await this.exportJobRepository.save(job);

    // Remove from queue if pending
    const jobs = await this.exportQueue.getJobs(['waiting', 'delayed']);
    for (const queueJob of jobs) {
      if (queueJob.data.jobId === id) {
        await queueJob.remove();
      }
    }

    return ActionResponseDto.delete(job);
  }

  // ========== MAPPING METHODS ==========

  async createImportMapping(mappingDto: ImportMappingDto, userId?: string): Promise<ActionResponseDto<ImportMapping>> {
    // If setting as default, unset other defaults for this type
    if (mappingDto.isDefault) {
      await this.importMappingRepository.update(
        { type: mappingDto.type, userId },
        { isDefault: false },
      );
    }

    const mapping = this.importMappingRepository.create({
      ...mappingDto,
      userId,
    });

    const saved = await this.importMappingRepository.save(mapping);
    return ActionResponseDto.create(saved);
  }

  async getImportMappings(type?: ImportType, userId?: string): Promise<CollectionResponse<ImportMapping>> {
    const where: any = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const mappings = await this.importMappingRepository.find({
      where,
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });

    return ResponseHelpers.wrapCollection(mappings);
  }

  async getImportMapping(id: string): Promise<ApiResponse<ImportMapping>> {
    const mapping = await this.importMappingRepository.findOne({ where: { id } });

    if (!mapping) {
      throw new NotFoundException('Import mapping not found');
    }

    return ApiResponse.success(mapping, 'Import mapping retrieved successfully');
  }

  async updateImportMapping(
    id: string,
    mappingDto: Partial<ImportMappingDto>,
  ): Promise<ActionResponseDto<ImportMapping>> {
    const mapping = await this.importMappingRepository.findOne({ where: { id } });

    if (!mapping) {
      throw new NotFoundException('Import mapping not found');
    }

    // If setting as default, unset other defaults
    if (mappingDto.isDefault) {
      await this.importMappingRepository.update(
        { type: mapping.type, userId: mapping.userId, id: { not: id } as any },
        { isDefault: false },
      );
    }

    Object.assign(mapping, mappingDto);
    const updated = await this.importMappingRepository.save(mapping);

    return ActionResponseDto.update(updated);
  }

  async deleteImportMapping(id: string): Promise<ActionResponseDto<ImportMapping>> {
    const mapping = await this.importMappingRepository.findOne({ where: { id } });

    if (!mapping) {
      throw new NotFoundException('Import mapping not found');
    }

    await this.importMappingRepository.remove(mapping);
    return ActionResponseDto.delete(mapping);
  }

  // ========== TEMPLATE METHODS ==========

  async downloadTemplate(templateDto: DownloadTemplateDto): Promise<{ filepath: string; filename: string }> {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateDto.type}-template.${templateDto.format}`,
    );

    // Generate template if it doesn't exist
    if (!fs.existsSync(templatePath)) {
      await this.generateTemplate(templateDto);
    }

    return {
      filepath: templatePath,
      filename: `${templateDto.type}-template.${templateDto.format}`,
    };
  }

  // ========== HELPER METHODS ==========

  private async getFileRowCount(filepath: string, type: ImportType): Promise<number> {
    const fileContent = await fs.promises.readFile(filepath, 'utf-8');
    
    if (filepath.endsWith('.csv')) {
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });
      return parsed.data.length;
    } else if (filepath.match(/\.(xlsx|xls)$/)) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filepath);
      const worksheet = workbook.worksheets[0];
      return worksheet.rowCount - 1; // Subtract header row
    }

    return 0;
  }

  private suggestMapping(headers: string[], type: ImportType): Record<string, string> {
    const mapping: Record<string, string> = {};
    const fieldMappings = this.getFieldMappings(type);

    headers.forEach(header => {
      const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [field, variations] of Object.entries(fieldMappings)) {
        if (variations.some((v: string) => normalized.includes(v))) {
          mapping[header] = field;
          break;
        }
      }
    });

    return mapping;
  }

  private getFieldMappings(type: ImportType): Record<string, string[]> {
    switch (type) {
      case ImportType.PRODUCTS:
        return {
          name: ['name', 'title', 'productname'],
          sku: ['sku', 'code', 'productcode'],
          description: ['description', 'desc', 'details'],
          price: ['price', 'cost', 'amount'],
          quantity: ['quantity', 'qty', 'stock', 'inventory'],
          category: ['category', 'categories'],
          brand: ['brand', 'manufacturer'],
          urlKey: ['url', 'slug', 'urlkey'],
          metaTitle: ['metatitle', 'seotitle'],
          metaDescription: ['metadescription', 'seodescription'],
        };
      case ImportType.VARIANTS:
        return {
          sku: ['sku', 'variantsku', 'code'],
          name: ['name', 'variantname', 'title'],
          price: ['price', 'variantprice'],
          quantity: ['quantity', 'stock', 'inventory'],
          color: ['color', 'colour'],
          size: ['size', 'dimension'],
          weight: ['weight'],
        };
      default:
        return {};
    }
  }

  private validateRow(row: any, mapping: Record<string, string>, type: ImportType): string[] {
    const errors: string[] = [];
    const requiredFields = this.getRequiredFields(type);

    // Check required fields
    requiredFields.forEach(field => {
      const sourceField = Object.keys(mapping).find(key => mapping[key] === field);
      if (!sourceField || !row[sourceField]) {
        errors.push(`Required field '${field}' is missing or empty`);
      }
    });

    // Validate specific field types
    Object.entries(mapping).forEach(([source, target]) => {
      const value = row[source];
      if (value) {
        // Validate numeric fields
        if (['price', 'quantity', 'weight'].includes(target)) {
          if (isNaN(Number(value))) {
            errors.push(`Field '${target}' must be a number`);
          }
        }
        // Validate SKU format
        if (target === 'sku' && !/^[A-Za-z0-9-_]+$/.test(value)) {
          errors.push(`SKU must contain only letters, numbers, hyphens, and underscores`);
        }
      }
    });

    return errors;
  }

  private getRequiredFields(type: ImportType): string[] {
    switch (type) {
      case ImportType.PRODUCTS:
        return ['name', 'sku'];
      case ImportType.VARIANTS:
        return ['sku'];
      case ImportType.CATEGORIES:
        return ['name'];
      case ImportType.ATTRIBUTES:
        return ['name', 'code'];
      default:
        return [];
    }
  }

  private async generateTemplate(templateDto: DownloadTemplateDto): Promise<void> {
    const templateDir = path.join(__dirname, 'templates');
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }

    const filepath = path.join(templateDir, `${templateDto.type}-template.${templateDto.format}`);
    
    // Get template headers and sample data
    const { headers, sampleData } = this.getTemplateData(templateDto.type as unknown as ImportType, templateDto.sampleRows || 5);

    if (templateDto.format === ExportFormat.CSV) {
      const csv = Papa.unparse({
        fields: headers,
        data: templateDto.includeSampleData ? sampleData : [],
      });
      await fs.promises.writeFile(filepath, csv);
    } else if (templateDto.format === ExportFormat.EXCEL) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Template');
      
      // Add headers
      worksheet.addRow(headers);
      
      // Add sample data if requested
      if (templateDto.includeSampleData) {
        sampleData.forEach(row => worksheet.addRow(row));
      }
      
      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      
      await workbook.xlsx.writeFile(filepath);
    }
  }

  private getTemplateData(type: ImportType, sampleRows: number): { headers: string[]; sampleData: any[] } {
    switch (type) {
      case ImportType.PRODUCTS:
        return {
          headers: [
            'name',
            'sku',
            'description',
            'price',
            'compareAtPrice',
            'quantity',
            'category',
            'brand',
            'urlKey',
            'metaTitle',
            'metaDescription',
            'status',
            'isFeatured',
          ],
          sampleData: Array(sampleRows).fill(0).map((_, i) => [
            `Sample Product ${i + 1}`,
            `SKU-${1000 + i}`,
            `This is a sample product description for product ${i + 1}`,
            `${(Math.random() * 100 + 10).toFixed(2)}`,
            `${(Math.random() * 150 + 20).toFixed(2)}`,
            `${Math.floor(Math.random() * 100)}`,
            'Electronics',
            'Sample Brand',
            `sample-product-${i + 1}`,
            `Sample Product ${i + 1} - Buy Online`,
            `High quality sample product ${i + 1} available at great prices`,
            'published',
            i === 0 ? 'true' : 'false',
          ]),
        };
      case ImportType.VARIANTS:
        return {
          headers: [
            'productSku',
            'variantSku',
            'name',
            'price',
            'quantity',
            'color',
            'size',
            'weight',
            'dimensions',
          ],
          sampleData: Array(sampleRows).fill(0).map((_, i) => [
            'PARENT-SKU-001',
            `VAR-SKU-${1000 + i}`,
            `Variant ${i + 1}`,
            `${(Math.random() * 100 + 10).toFixed(2)}`,
            `${Math.floor(Math.random() * 50)}`,
            ['Red', 'Blue', 'Green', 'Black', 'White'][i % 5],
            ['S', 'M', 'L', 'XL', 'XXL'][i % 5],
            `${(Math.random() * 5 + 0.5).toFixed(2)}`,
            '10x10x10',
          ]),
        };
      default:
        return { headers: [], sampleData: [] };
    }
  }
}
