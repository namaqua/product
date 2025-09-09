import { IsOptional, IsString, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';
import { AttributeType } from '../entities/attribute.entity';

export class AttributeQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by code or name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by attribute type', enum: AttributeType })
  @IsEnum(AttributeType)
  @IsOptional()
  type?: AttributeType;

  @ApiPropertyOptional({ description: 'Filter by group ID' })
  @IsUUID()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Filter by required status' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Filter by searchable status' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isSearchable?: boolean;

  @ApiPropertyOptional({ description: 'Filter by filterable status' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFilterable?: boolean;

  @ApiPropertyOptional({ description: 'Include deleted attributes' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeDeleted?: boolean = false;
}
