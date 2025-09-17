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

  static create<T>(item: T, message?: string): ActionResponseDto<T> {
    return new ActionResponseDto(item, message || 'Created successfully');
  }

  static update<T>(item: T, message?: string): ActionResponseDto<T> {
    return new ActionResponseDto(item, message || 'Updated successfully');
  }

  static delete<T>(item: T, message?: string): ActionResponseDto<T> {
    return new ActionResponseDto(item, message || 'Deleted successfully');
  }
}
