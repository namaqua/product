import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validator for strong passwords
 */
@ValidatorConstraint({ async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    if (!password) return false;
    
    const minLength = args.constraints[0] || 8;
    const requireUppercase = args.constraints[1] !== false;
    const requireLowercase = args.constraints[2] !== false;
    const requireNumbers = args.constraints[3] !== false;
    const requireSpecialChars = args.constraints[4] !== false;
    
    if (password.length < minLength) return false;
    if (requireUppercase && !/[A-Z]/.test(password)) return false;
    if (requireLowercase && !/[a-z]/.test(password)) return false;
    if (requireNumbers && !/[0-9]/.test(password)) return false;
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const minLength = args.constraints[0] || 8;
    return `Password must be at least ${minLength} characters long and contain uppercase, lowercase, numbers, and special characters`;
  }
}

/**
 * Decorator for strong password validation
 */
export function IsStrongPassword(
  minLength = 8,
  options?: ValidationOptions & {
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  },
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options,
      constraints: [
        minLength,
        options?.requireUppercase,
        options?.requireLowercase,
        options?.requireNumbers,
        options?.requireSpecialChars,
      ],
      validator: IsStrongPasswordConstraint,
    });
  };
}

/**
 * Decorator to check if value is a valid slug
 */
export function IsSlug(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid slug (lowercase letters, numbers, and hyphens only)`;
        },
      },
    });
  };
}

/**
 * Decorator to check if value is a valid SKU
 */
export function IsSKU(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSKU',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return /^[A-Z0-9\-_]+$/i.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid SKU (alphanumeric, hyphens, and underscores only)`;
        },
      },
    });
  };
}

/**
 * Decorator to check if array has unique values
 */
export function ArrayUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'arrayUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!Array.isArray(value)) return false;
          return value.length === new Set(value).size;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must contain unique values`;
        },
      },
    });
  };
}

/**
 * Decorator to validate phone numbers
 */
export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          // Basic international phone number validation
          return /^\+?[1-9]\d{1,14}$/.test(value.replace(/[\s\-\(\)]/g, ''));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid phone number`;
        },
      },
    });
  };
}
