import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, IsUUID, IsBoolean, Length, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateMediaDto {
  @ApiPropertyOptional({ description: 'Alternative text for accessibility' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  alt?: string;

  @ApiPropertyOptional({ description: 'Media title' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  title?: string;

  @ApiPropertyOptional({ description: 'Media description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Sort order for display' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return 0;
    const num = parseInt(value, 10);
    return isNaN(num) ? 0 : num;
  })
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is this the primary media' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === '1') return true;
    if (value === '0') return false;
    return value === true;
  })
  isPrimary?: boolean;

  @ApiPropertyOptional({ 
    description: 'Product IDs to associate with this media',
    type: [String]
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value || [];
  })
  @IsArray()
  @IsUUID('4', { each: true })
  productIds?: string[];
}
