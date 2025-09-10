import { ApiProperty } from '@nestjs/swagger';

/**
 * Response for create/update/delete actions
 */
export class ActionResponseDto<T> {
  @ApiProperty({ description: 'The affected item' })
  item: T;

  @ApiProperty({ description: 'Success message', required: false })
  message?: string;

  constructor(item: T, message?: string) {
    this.item = item;
    this.message = message;
  }

  static create<T>(item: T): ActionResponseDto<T> {
    return new ActionResponseDto(item, 'Created successfully');
  }

  static update<T>(item: T): ActionResponseDto<T> {
    return new ActionResponseDto(item, 'Updated successfully');
  }

  static delete<T>(item: T): ActionResponseDto<T> {
    return new ActionResponseDto(item, 'Deleted successfully');
  }
}
