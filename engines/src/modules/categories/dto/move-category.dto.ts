import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MovePosition {
  FIRST = 'first',
  LAST = 'last',
}

/**
 * DTO for moving a category to a new parent
 */
export class MoveCategoryDto {
  @ApiPropertyOptional({
    description: 'New parent category ID (null to move to root)',
    example: 'uuid-of-new-parent',
  })
  @IsUUID()
  @IsOptional()
  newParentId?: string | null;

  @ApiPropertyOptional({
    description: 'Position within the new parent (first or last)',
    enum: MovePosition,
    default: MovePosition.LAST,
  })
  @IsEnum(MovePosition)
  @IsOptional()
  position?: MovePosition = MovePosition.LAST;
}
