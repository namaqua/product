import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/**
 * DTO for updating a category
 * All fields are optional except parentId is omitted
 * (use move operation to change parent)
 */
export class UpdateCategoryDto extends PartialType(
  OmitType(CreateCategoryDto, ['parentId'] as const)
) {}
