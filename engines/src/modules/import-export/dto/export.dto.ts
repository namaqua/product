import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExportType, ExportFormat } from '../entities/export-job.entity';

export class ExportFiltersDto {
  @ApiPropertyOptional({ description: 'Filter by status', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @ApiPropertyOptional({ description: 'Filter by categories', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Filter by brands', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brands?: string[];

  @ApiPropertyOptional({ description: 'Price range filter' })
  @IsOptional()
  @IsObject()
  priceRange?: { min: number; max: number };

  @ApiPropertyOptional({ description: 'Stock range filter' })
  @IsOptional()
  @IsObject()
  stockRange?: { min: number; max: number };

  @ApiPropertyOptional({ description: 'Date range filter' })
  @IsOptional()
  @IsObject()
  dateRange?: { from: Date; to: Date };

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ExportOptionsDto {
  @ApiPropertyOptional({ description: 'Include product variants' })
  @IsOptional()
  @IsBoolean()
  includeVariants?: boolean;

  @ApiPropertyOptional({ description: 'Include product images' })
  @IsOptional()
  @IsBoolean()
  includeImages?: boolean;

  @ApiPropertyOptional({ description: 'Include categories' })
  @IsOptional()
  @IsBoolean()
  includeCategories?: boolean;

  @ApiPropertyOptional({ description: 'Include attributes' })
  @IsOptional()
  @IsBoolean()
  includeAttributes?: boolean;

  @ApiPropertyOptional({ description: 'CSV delimiter', default: ',' })
  @IsOptional()
  @IsString()
  delimiter?: string;

  @ApiPropertyOptional({ description: 'File encoding', default: 'utf-8' })
  @IsOptional()
  @IsString()
  encoding?: string;
}

export class CreateExportDto {
  @ApiProperty({ enum: ExportType })
  @IsEnum(ExportType)
  type: ExportType;

  @ApiProperty({ enum: ExportFormat })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiPropertyOptional({ type: ExportFiltersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExportFiltersDto)
  filters?: ExportFiltersDto;

  @ApiPropertyOptional({ description: 'Fields to export', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiPropertyOptional({ type: ExportOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExportOptionsDto)
  options?: ExportOptionsDto;
}

export class ExportJobQueryDto {
  @ApiPropertyOptional({ enum: ExportType })
  @IsOptional()
  @IsEnum(ExportType)
  type?: ExportType;

  @ApiPropertyOptional({ enum: ExportFormat })
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat;

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

export class DownloadTemplateDto {
  @ApiProperty({ enum: ExportType })
  @IsEnum(ExportType)
  type: ExportType;

  @ApiProperty({ enum: ExportFormat })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiPropertyOptional({ description: 'Include sample data' })
  @IsOptional()
  @IsBoolean()
  includeSampleData?: boolean;

  @ApiPropertyOptional({ description: 'Number of sample rows', default: 5 })
  @IsOptional()
  @IsNumber()
  sampleRows?: number;
}

export class ExportVariantsDto {
  @ApiProperty({ description: 'Product ID or SKU' })
  @IsString()
  productIdentifier: string;

  @ApiPropertyOptional({ description: 'Use SKU instead of ID' })
  @IsOptional()
  @IsBoolean()
  useSku?: boolean;

  @ApiProperty({ enum: ExportFormat })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiPropertyOptional({ description: 'Fields to export', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiPropertyOptional({ type: ExportOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExportOptionsDto)
  options?: ExportOptionsDto;
}
