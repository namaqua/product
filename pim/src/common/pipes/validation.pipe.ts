import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Custom validation pipe with better error formatting
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    
    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
    
    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }
    
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): any {
    const formattedErrors = {};
    
    errors.forEach(error => {
      const constraints = error.constraints || {};
      const children = error.children || [];
      
      if (Object.keys(constraints).length > 0) {
        formattedErrors[error.property] = Object.values(constraints);
      }
      
      if (children.length > 0) {
        formattedErrors[error.property] = this.formatErrors(children);
      }
    });
    
    return {
      message: 'Validation failed',
      errors: formattedErrors,
    };
  }
}

/**
 * Factory function to create a configured validation pipe
 */
export function createValidationPipe(options?: {
  transform?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  skipMissingProperties?: boolean;
}): NestValidationPipe {
  return new NestValidationPipe({
    transform: options?.transform ?? true,
    whitelist: options?.whitelist ?? false, // Changed to false to allow extra fields
    forbidNonWhitelisted: options?.forbidNonWhitelisted ?? false, // Changed to false
    skipMissingProperties: options?.skipMissingProperties ?? false,
    transformOptions: {
      enableImplicitConversion: true, // This enables automatic type conversion
      exposeDefaultValues: true,
    },
    exceptionFactory: (errors: ValidationError[]) => {
      const messages = errors.reduce((acc, error) => {
        const property = error.property;
        const constraints = Object.values(error.constraints || {});
        acc[property] = constraints;
        return acc;
      }, {});
      
      console.error('Validation errors:', messages); // Add logging to see what's failing
      
      return new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    },
  });
}

/**
 * Sanitization pipe to clean input data
 */
@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (typeof value === 'string') {
      // Remove potential XSS vectors
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .trim();
    }
    
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }
    
    return value;
  }

  private sanitizeObject(obj: any): any {
    const sanitized = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = this.transform(obj[key], null);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    
    return sanitized;
  }
}
