import { validate as validateUUID } from 'uuid';

/**
 * Validation utility functions
 */

/**
 * Check if a string is a valid email
 */
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid URL
 */
export function isURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid UUID
 */
export function isUUID(uuid: string): boolean {
  return validateUUID(uuid);
}

/**
 * Check if a string is a valid phone number
 */
export function isPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if it's a valid phone number (between 10 and 15 digits)
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Check if a string is a valid slug
 */
export function isSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Check if a string is a valid SKU
 */
export function isSKU(sku: string): boolean {
  return /^[A-Z0-9\-_]+$/i.test(sku);
}

/**
 * Check if a string is alphanumeric
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Check if a string contains only letters
 */
export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * Check if a string contains only numbers
 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

/**
 * Validate password strength
 */
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
}

export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {},
): PasswordStrength {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options;

  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (password.length >= minLength) {
    score++;
  } else {
    feedback.push(`Password must be at least ${minLength} characters long`);
  }

  // Check for uppercase
  if (/[A-Z]/.test(password)) {
    score++;
  } else if (requireUppercase) {
    feedback.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase
  if (/[a-z]/.test(password)) {
    score++;
  } else if (requireLowercase) {
    feedback.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (/[0-9]/.test(password)) {
    score++;
  } else if (requireNumbers) {
    feedback.push('Password must contain at least one number');
  }

  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else if (requireSpecialChars) {
    feedback.push('Password must contain at least one special character');
  }

  return {
    isValid: feedback.length === 0,
    score: Math.min(score, 4),
    feedback,
  };
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate credit card number using Luhn algorithm
 */
export function isValidCreditCard(cardNumber: string): boolean {
  // Remove spaces and hyphens
  const digits = cardNumber.replace(/[\s-]/g, '');
  
  // Check if it's all digits and has valid length
  if (!/^\d+$/.test(digits) || digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Check if a value is within a range
 */
export function isInRange(
  value: number,
  min: number,
  max: number,
  inclusive = true,
): boolean {
  if (inclusive) {
    return value >= min && value <= max;
  }
  return value > min && value < max;
}

/**
 * Validate file extension
 */
export function hasValidExtension(
  filename: string,
  allowedExtensions: string[],
): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return false;
  }
  
  return allowedExtensions
    .map(ext => ext.toLowerCase().replace('.', ''))
    .includes(extension);
}

/**
 * Validate file size
 */
export function isValidFileSize(
  sizeInBytes: number,
  maxSizeInMB: number,
): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
}
