import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ImportType } from '../entities/import-job.entity';

export class ImportOptionsDto {
  @ApiPropertyOptional({ description: 'Skip the first row (header row)' })
  @IsOptional()
  @IsBoolean()
  skipHeader?: boolean;

  @ApiPropertyOptional({ description: 'Update existing records if found' })
  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean;

  @ApiPropertyOptional({ description: 'Only validate without importing' })
  @IsOptional()
  @IsBoolean()
  validateOnly?: boolean;

  @ApiPropertyOptional({ description: 'CSV delimiter', default: ',' })
  @IsOptional()
  @IsString()
  delimiter?: string;

  @ApiPropertyOptional({ description: 'File encoding', default: 'utf-8' })
  @IsOptional()
  @IsString()
  encoding?: string;

  @ApiPropertyOptional({ description: 'Use saved mapping template' })
  @IsOptional()
  @IsString()
  mappingId?: string;
}

export class CreateImportDto {
  @ApiProperty({ enum: ImportType })
  @IsEnum(ImportType)
  type: ImportType;

  @ApiPropertyOptional({ type: 'object', description: 'Field mapping configuration' })
  @IsOptional()
  @IsObject()
  mapping?: Record<string, string>;

  @ApiPropertyOptional({ type: ImportOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImportOptionsDto)
  options?: ImportOptionsDto;
}

export class PreviewImportDto {
  @ApiProperty({ enum: ImportType })
  @IsEnum(ImportType)
  type: ImportType;

  @ApiPropertyOptional({ description: 'Number of rows to preview', default: 10 })
  @IsOptional()
  rows?: number;
}

export class ValidateImportDto {
  @ApiProperty({ enum: ImportType })
  @IsEnum(ImportType)
  type: ImportType;

  @ApiProperty({ type: 'object', description: 'Field mapping configuration' })
  @IsObject()
  mapping: Record<string, string>;

  @ApiPropertyOptional({ type: ImportOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImportOptionsDto)
  options?: ImportOptionsDto;
}

export class ProcessImportDto {
  @ApiProperty({ description: 'Import job ID to process' })
  @IsString()
  jobId: string;

  @ApiPropertyOptional({ description: 'Start processing from specific row' })
  @IsOptional()
  startRow?: number;

  @ApiPropertyOptional({ description: 'Process specific number of rows' })
  @IsOptional()
  batchSize?: number;
}

export class ImportMappingDto {
  @ApiProperty({ description: 'Mapping template name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Mapping description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ImportType })
  @IsEnum(ImportType)
  type: ImportType;

  @ApiProperty({ type: 'object', description: 'Field mapping configuration' })
  @IsObject()
  mapping: Record<string, string>;

  @ApiPropertyOptional({ type: 'object', description: 'Field transformations' })
  @IsOptional()
  @IsObject()
  transformations?: Record<string, any>;

  @ApiPropertyOptional({ type: 'object', description: 'Default values' })
  @IsOptional()
  @IsObject()
  defaults?: Record<string, any>;

  @ApiPropertyOptional({ type: 'object', description: 'Validation rules' })
  @IsOptional()
  @IsObject()
  validation?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Set as default mapping for this type' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class ImportJobQueryDto {
  @ApiPropertyOptional({ enum: ImportType })
  @IsOptional()
  @IsEnum(ImportType)
  type?: ImportType;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class BulkVariantImportDto {
  @ApiProperty({ description: 'Product ID or SKU' })
  @IsString()
  productIdentifier: string;

  @ApiPropertyOptional({ description: 'Use SKU instead of ID' })
  @IsOptional()
  @IsBoolean()
  useSku?: boolean;

  @ApiProperty({ type: 'object', description: 'Field mapping configuration' })
  @IsObject()
  mapping: Record<string, string>;

  @ApiPropertyOptional({ type: ImportOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImportOptionsDto)
  options?: ImportOptionsDto;
}
