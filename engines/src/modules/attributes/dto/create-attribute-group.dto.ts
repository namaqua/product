import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsObject,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttributeGroupDto {
  @ApiProperty({ description: 'Unique group code', example: 'technical_specs' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: 'Group display name', example: 'Technical Specifications' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Group description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number = 0;

  @ApiPropertyOptional({ description: 'Is collapsible', example: true })
  @IsBoolean()
  @IsOptional()
  isCollapsible?: boolean = false;

  @ApiPropertyOptional({ description: 'Is collapsed by default', example: false })
  @IsBoolean()
  @IsOptional()
  isCollapsedByDefault?: boolean = false;

  @ApiPropertyOptional({ description: 'Icon name', example: 'cog' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ description: 'Additional configuration' })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
