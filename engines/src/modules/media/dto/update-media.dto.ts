import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, IsUUID, IsBoolean, Length, Min } from 'class-validator';

export class UpdateMediaDto {
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
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is this the primary media' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ 
    description: 'Product IDs to associate with this media',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  productIds?: string[];
}
