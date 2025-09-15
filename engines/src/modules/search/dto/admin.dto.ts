import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum IndexAction {
  CREATE = 'create',
  DELETE = 'delete',
  REBUILD = 'rebuild',
  REFRESH = 'refresh',
  OPTIMIZE = 'optimize',
}

export class ReindexOptionsDto {
  @ApiPropertyOptional({
    description: 'Batch size for reindexing',
    example: 100,
    default: 100,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  batchSize?: number = 100;

  @ApiPropertyOptional({
    description: 'Include deleted products',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include inactive products',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean = false;

  @ApiPropertyOptional({
    description: 'Clear index before reindexing',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  clearBeforeReindex?: boolean = true;
}

export class IndexHealthDto {
  @ApiProperty({ description: 'Cluster status' })
  status: string;

  @ApiProperty({ description: 'Index name' })
  index: string;

  @ApiProperty({ description: 'Number of documents' })
  docs: number;

  @ApiProperty({ description: 'Index size' })
  size: string;

  @ApiProperty({ description: 'Number of shards' })
  shards: number;

  @ApiProperty({ description: 'Number of replicas' })
  replicas: number;

  @ApiProperty({ description: 'Index health status' })
  health: string;
}

export class IndexStatsDto {
  @ApiProperty({ description: 'Total documents' })
  totalDocs: number;

  @ApiProperty({ description: 'Total size in bytes' })
  totalSizeBytes: number;

  @ApiProperty({ description: 'Human readable size' })
  totalSize: string;

  @ApiProperty({ description: 'Last indexed at' })
  lastIndexedAt?: Date;

  @ApiProperty({ description: 'Index creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Number of searches performed' })
  searchCount?: number;

  @ApiProperty({ description: 'Average search time in ms' })
  avgSearchTime?: number;
}

export class ReindexResultDto {
  @ApiProperty({ description: 'Number of products indexed' })
  indexed: number;

  @ApiProperty({ description: 'Number of products failed' })
  failed: number;

  @ApiProperty({ description: 'Total time taken in ms' })
  timeTaken: number;

  @ApiPropertyOptional({ description: 'Error messages', isArray: true })
  errors?: string[];
}
