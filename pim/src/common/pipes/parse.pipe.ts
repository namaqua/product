import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate as isUUID } from 'uuid';

/**
 * Pipe to validate UUID format
 */
@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isUUID(value)) {
      throw new BadRequestException(`Invalid UUID format for ${metadata.data || 'parameter'}`);
    }
    return value;
  }
}

/**
 * Pipe to parse and validate integers
 */
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  constructor(
    private readonly options: {
      min?: number;
      max?: number;
      optional?: boolean;
    } = {},
  ) {}

  transform(value: string, metadata: ArgumentMetadata): number {
    if (!value && this.options.optional) {
      return undefined;
    }
    
    const val = parseInt(value, 10);
    
    if (isNaN(val)) {
      throw new BadRequestException(`${metadata.data || 'Value'} must be a valid integer`);
    }
    
    if (this.options.min !== undefined && val < this.options.min) {
      throw new BadRequestException(
        `${metadata.data || 'Value'} must be at least ${this.options.min}`,
      );
    }
    
    if (this.options.max !== undefined && val > this.options.max) {
      throw new BadRequestException(
        `${metadata.data || 'Value'} must be at most ${this.options.max}`,
      );
    }
    
    return val;
  }
}

/**
 * Pipe to parse boolean values
 */
@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
  transform(value: string | boolean, metadata: ArgumentMetadata): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'string') {
      const lowercased = value.toLowerCase();
      if (lowercased === 'true' || lowercased === '1' || lowercased === 'yes') {
        return true;
      }
      if (lowercased === 'false' || lowercased === '0' || lowercased === 'no') {
        return false;
      }
    }
    
    throw new BadRequestException(`${metadata.data || 'Value'} must be a boolean`);
  }
}

/**
 * Pipe to trim string values
 */
@Injectable()
export class TrimPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (typeof value !== 'string') {
      return value;
    }
    
    const trimmed = value.trim();
    
    if (trimmed.length === 0) {
      throw new BadRequestException(`${metadata.data || 'Value'} cannot be empty`);
    }
    
    return trimmed;
  }
}

/**
 * Pipe to convert string to lowercase
 */
@Injectable()
export class LowercasePipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (typeof value !== 'string') {
      return value;
    }
    return value.toLowerCase();
  }
}

/**
 * Pipe to validate enum values
 */
@Injectable()
export class ParseEnumPipe<T = any> implements PipeTransform<string, T> {
  constructor(
    private readonly enumType: object,
    private readonly optional = false,
  ) {}

  transform(value: string, metadata: ArgumentMetadata): T {
    if (!value && this.optional) {
      return undefined;
    }
    
    const enumValues = Object.values(this.enumType);
    
    if (!enumValues.includes(value)) {
      const validValues = enumValues.join(', ');
      throw new BadRequestException(
        `${metadata.data || 'Value'} must be one of: ${validValues}`,
      );
    }
    
    return value as T;
  }
}

/**
 * Pipe to validate array of strings
 */
@Injectable()
export class ParseArrayPipe implements PipeTransform<string, string[]> {
  constructor(
    private readonly options: {
      separator?: string;
      unique?: boolean;
      min?: number;
      max?: number;
    } = {},
  ) {}

  transform(value: string | string[], metadata: ArgumentMetadata): string[] {
    let array: string[];
    
    if (Array.isArray(value)) {
      array = value;
    } else if (typeof value === 'string') {
      array = value.split(this.options.separator || ',').map(item => item.trim());
    } else {
      throw new BadRequestException(`${metadata.data || 'Value'} must be an array or string`);
    }
    
    if (this.options.unique) {
      array = [...new Set(array)];
    }
    
    if (this.options.min !== undefined && array.length < this.options.min) {
      throw new BadRequestException(
        `${metadata.data || 'Array'} must have at least ${this.options.min} items`,
      );
    }
    
    if (this.options.max !== undefined && array.length > this.options.max) {
      throw new BadRequestException(
        `${metadata.data || 'Array'} must have at most ${this.options.max} items`,
      );
    }
    
    return array;
  }
}
